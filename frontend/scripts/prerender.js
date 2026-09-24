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

/** Routes worth pre-rendering: the ones whose text should be indexable. */
const ROUTES = [
  '/',
  '/catalog',
  '/services',
  '/sponsorship',
  '/build-your-event',
  '/about',
];

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.woff2': 'font/woff2',
};

/** Minimal static server that falls back to index.html, like Vercel does. */
function serve() {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(BUILD, url);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(BUILD, 'index.html');
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

  const server = serve();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  console.log('\nPre-rendering\n');
  let failures = 0;

  for (const route of ROUTES) {
    const page = await browser.newPage();
    try {
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 45_000,
      });

      // The API can be slow or asleep; the marketing copy is already
      // painted by then, so a missing product list must not fail the build.
      await page.waitForSelector('#root > *', { timeout: 15_000 }).catch(() => {});

      let html = await page.content();

      // react-helmet-async marks the tags it manages. Those attributes are
      // only meaningful at runtime and confuse nothing, but stripping them
      // keeps the served HTML clean.
      html = html.replace(/ data-rh="true"/g, '');

      const words = (await page.evaluate(() => document.getElementById('root')?.innerText || '')).trim().split(/\s+/).length;
      const title = await page.title();

      const dir = route === '/' ? BUILD : path.join(BUILD, route);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.html'), html);

      console.log(`  ok    ${route.padEnd(20)} ${String(words).padStart(5)} words  |  ${title.slice(0, 52)}`);
    } catch (err) {
      failures += 1;
      console.log(`  FAIL  ${route.padEnd(20)} ${err.message.split('\n')[0]}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  if (failures) {
    console.error(`\n${failures} route(s) failed to pre-render.\n`);
    process.exit(1);
  }
  console.log('\nDone.\n');
})();
