/**
 * ============================================================
 * PRE-RENDER THE MARKETING PAGES
 * ============================================================
 * Create React App ships an empty <div id="root"></div> and
 * draws everything with JavaScript. Google mostly copes; the AI
 * crawlers (GPTBot, ClaudeBot, PerplexityBot) and WhatsApp's
 * link preview do not run JavaScript at all, so to them every
 * page looks blank.
 *
 * This runs after the normal build: it serves build/, opens each
 * route in a headless browser, waits for the content, and writes
 * the finished HTML to build/<route>/index.html. Static files win
 * over the SPA rewrite, so crawlers get real text and React still
 * hydrates for visitors.
 * ============================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const puppeteer = require('puppeteer');

const BUILD = path.join(__dirname, '..', 'build');
const PORT = 45678;

/** The build's index.html as react-scripts wrote it, before any pre-rendering. */
let SHELL;

/** Routes worth pre-rendering: the ones whose text should be indexable. */
const ROUTES = [
  '/',
  '/catalog',
  '/services',
  '/sponsorship',
  '/build-your-event',
  '/about',
  // Service pages — one search intent each
  '/services/arcade-rental',
  '/services/buy-arcade-machines',
  '/services/festival-supply',
  '/services/revenue-share',
  // Event-type pages — one audience each
  '/events/universities',
  '/events/schools',
  '/events/store-openings',
  '/events/birthdays',
  '/events/ngo',
];

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.woff2': 'font/woff2',
};

const SITE_URL = 'https://nlgarcadesforevents.vercel.app';
const API_URL = process.env.REACT_APP_API_URL || 'https://nlg-arcade-backend.onrender.com/api';

/**
 * One route per active game, read from the live API.
 *
 * Game pages are where searches like "rent a boxing machine in Lebanon"
 * land, so they need the same treatment as the marketing pages. The API
 * sleeps when idle and can take close to a minute to wake, hence the long
 * timeout and one retry. If it still does not answer, the marketing pages
 * are built anyway: a missing game page must not block a deploy.
 */
async function getProductRoutes() {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(`${API_URL}/products`, { signal: AbortSignal.timeout(90_000) });
      if (!res.ok) throw new Error(`API answered ${res.status}`);
      const products = await res.json();
      return products.map(p => `/product/${p.id}`);
    } catch (err) {
      console.warn(`  warn  product list attempt ${attempt} failed: ${err.message}`);
    }
  }
  console.warn('  warn  building without game pages');
  return [];
}

/** Adds the game pages to build/sitemap.xml; the static routes are already in it. */
function addToSitemap(routes) {
  if (routes.length === 0) return;
  const file = path.join(BUILD, 'sitemap.xml');
  const today = new Date().toISOString().slice(0, 10);
  const entries = routes.map(route =>
    `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n` +
    `    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`
  ).join('');
  const xml = fs.readFileSync(file, 'utf8').replace('</urlset>', `${entries}</urlset>`);
  fs.writeFileSync(file, xml);
}

/** Minimal static server that falls back to index.html, like Vercel does. */
function serve() {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    const file = path.join(BUILD, url);
    // Every route gets the untouched shell. Reading build/index.html from
    // disk here would hand later routes the already pre-rendered home page,
    // whose head tags then pile up underneath each page's own.
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory() || file.endsWith('index.html')) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(SHELL);
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(PORT);
}

(async () => {
  if (!fs.existsSync(path.join(BUILD, 'index.html'))) {
    console.error('No build found. Run react-scripts build first.');
    process.exit(1);
  }

  SHELL = fs.readFileSync(path.join(BUILD, 'index.html'));
  const server = serve();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('\nPre-rendering\n');
  let failures = 0;

  const productRoutes = await getProductRoutes();
  const renderedProducts = [];

  for (const route of [...ROUTES, ...productRoutes]) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 45_000,
      });

      // The API can be slow or asleep; the marketing copy is already
      // painted by then, so a missing product list must not fail the build.
      await page.waitForSelector('#root > *', { timeout: 15_000 }).catch(() => {});

      // Keep react-helmet-async's data-rh markers. They are how Helmet
      // recognises these tags after hydration and replaces them; without
      // them the browser (and Google's renderer) ends up with two copies.
      const html = await page.content();

      const words = (await page.evaluate(() => document.getElementById('root')?.innerText || '')).trim().split(/\s+/).length;
      const title = await page.title();

      const dir = route === '/' ? BUILD : path.join(BUILD, route);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html);
      if (route.startsWith('/product/')) renderedProducts.push(route);

      console.log(`  ok    ${route.padEnd(20)} ${String(words).padStart(5)} words  |  ${title.slice(0, 52)}`);
    } catch (err) {
      // A game page depends on the API answering in time. If one does not
      // render, skip it — it stays reachable as a normal client-side page
      // and simply stays out of the sitemap until the next build. Only the
      // marketing pages are allowed to fail the deploy.
      if (route.startsWith('/product/')) {
        console.warn(`  warn  ${route.padEnd(20)} skipped: ${err.message.split('\n')[0]}`);
        continue;
      }
      failures += 1;
      console.log(`  FAIL  ${route.padEnd(20)} ${err.message.split('\n')[0]}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  // Only pages that actually rendered go into the sitemap.
  addToSitemap(renderedProducts);

  if (failures) {
    console.error(`\n${failures} route(s) failed to pre-render.\n`);
    process.exit(1);
  }
  console.log('\nDone.\n');
})();
