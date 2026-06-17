const db = require('../config/db');
const { logAction } = require('../utils/logger');

const formatAvailability = (status) => (status === 'active' ? 'available' : 'unavailable');

const toProductResponse = (product) => ({
  ...product,
  title: product.name,
  power_usage: product.electricity_amount,
  price: { min: product.min_price, max: product.max_price, average: product.average_price },
  images: [product.image_url, product.image_url2, product.image_url3].filter(Boolean),
  availability: formatAvailability(product.status)
});

exports.getProducts = async (req, res) => {
  try {
    const { category, suitability, popular } = req.query;
    let query = "SELECT *, name as title, electricity_amount as power_usage FROM products WHERE status = 'active'";
    const params = [];
    if (category && category !== 'all') { query += " AND category = ?"; params.push(category); }
    if (suitability && suitability !== 'all') { query += " AND event_suitability = ?"; params.push(suitability); }
    if (popular === 'true') { query += " AND popularity_score >= 70"; }
    query += " ORDER BY is_featured DESC, created_at DESC";
    const products = await db.prepare(query).all(...params);
    res.json(products.map(toProductResponse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await db.prepare("SELECT * FROM products WHERE status = 'active' AND is_featured = 1 ORDER BY created_at DESC LIMIT 9").all();
    const total = await db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'active'").get();
    res.json({ featured: featured.map(toProductResponse), total: parseInt(total.count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleFeatured = async (req, res) => {
  try {
    const product = await db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const newVal = product.is_featured ? 0 : 1;
    if (newVal === 1) {
      const count = await db.prepare("SELECT COUNT(*) as c FROM products WHERE is_featured = 1").get();
      if (parseInt(count.c) >= 9) return res.status(400).json({ error: 'Maximum 9 featured games allowed. Unfeature one first.' });
    }
    await db.prepare("UPDATE products SET is_featured = ? WHERE id = ?").run(newVal, req.params.id);
    res.json({ success: true, is_featured: newVal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await db.prepare("SELECT * FROM products WHERE id = ? AND status = 'active'").get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(toProductResponse(product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, min_price, max_price, category, space_required, needs_electricity, electricity_amount, has_coins, extra_features, image_url, badge, image_url2, image_url3, status } = req.body;
  const parsedMin = parseFloat(min_price);
  const parsedMax = parseFloat(max_price);
  if (!name || Number.isNaN(parsedMin) || Number.isNaN(parsedMax) || parsedMin < 0 || parsedMax < 0 || parsedMin > parsedMax) {
    return res.status(400).json({ error: 'Invalid pricing. Ensure min price is less than or equal to max price.' });
  }
  const average_price = (parsedMin + parsedMax) / 2;
  const derivedRentPrice = parsedMin === parsedMax ? `$${parsedMin}` : `$${parsedMin} - $${parsedMax}`;

  try {
    const result = await db.prepare(
      "INSERT INTO products (name, description, min_price, max_price, average_price, category, space_required, needs_electricity, electricity_amount, has_coins, extra_features, image_url, badge, rent_price, image_url2, image_url3, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(name, description || '', parsedMin, parsedMax, average_price, category || 'General', space_required || '2 m³', needs_electricity ? 1 : 0, electricity_amount || '', has_coins ? 1 : 0, extra_features || '', image_url || '', badge || 'None', derivedRentPrice, image_url2 || '', image_url3 || '', status || 'active');

    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, 'Machines', 'New Machine Added', `${name} added`, `New machine '${name}' added. Category: ${category || 'General'}`, 0, name);

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, description, min_price, max_price, category, space_required, needs_electricity, electricity_amount, has_coins, extra_features, image_url, badge, image_url2, image_url3, status } = req.body;
  const hasBothPrices = min_price !== undefined && max_price !== undefined && min_price !== '' && max_price !== '';
  if (hasBothPrices) {
    const parsedMin = parseFloat(min_price);
    const parsedMax = parseFloat(max_price);
    if (Number.isNaN(parsedMin) || Number.isNaN(parsedMax) || parsedMin < 0 || parsedMax < 0 || parsedMin > parsedMax) {
      return res.status(400).json({ error: 'Invalid pricing.' });
    }
  }
  const average_price = hasBothPrices ? ((parseFloat(min_price) + parseFloat(max_price)) / 2) : undefined;
  const rent_price = hasBothPrices ? (parseFloat(min_price) === parseFloat(max_price) ? `$${parseFloat(min_price)}` : `$${parseFloat(min_price)} - $${parseFloat(max_price)}`) : undefined;

  try {
    await db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name), description = COALESCE(?, description),
        min_price = COALESCE(?, min_price), max_price = COALESCE(?, max_price),
        average_price = COALESCE(?, average_price), category = COALESCE(?, category),
        space_required = COALESCE(?, space_required), needs_electricity = COALESCE(?, needs_electricity),
        electricity_amount = COALESCE(?, electricity_amount), has_coins = COALESCE(?, has_coins),
        extra_features = COALESCE(?, extra_features), image_url = COALESCE(?, image_url),
        badge = COALESCE(?, badge), rent_price = COALESCE(?, rent_price),
        image_url2 = COALESCE(?, image_url2), image_url3 = COALESCE(?, image_url3),
        status = COALESCE(?, status)
      WHERE id = ?
    `).run(name, description, min_price, max_price, average_price, category, space_required,
      needs_electricity !== undefined ? (needs_electricity ? 1 : 0) : null,
      electricity_amount, has_coins !== undefined ? (has_coins ? 1 : 0) : null,
      extra_features, image_url, badge, rent_price, image_url2, image_url3, status, req.params.id);

    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, 'Machines', 'Machine Updated', `${name || 'Machine'} details changed`, `Machine updated. Status: ${status || 'active'}`, 0, name || 'General');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const archiveTransaction = db.transaction(async () => {
      await db.prepare("INSERT INTO archive_financials (original_id, table_name, data, archive_type) VALUES (?, 'products', ?, 'deleted')")
        .run(product.id, JSON.stringify(product));
      await db.prepare("UPDATE products SET status = 'archived' WHERE id = ?").run(req.params.id);
    });
    await archiveTransaction();

    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, 'Machines', 'Machine Archived', `${product.name} archived`, `Machine '${product.name}' moved to archive`, 0, product.name);

    res.json({ success: true, message: 'Product moved to system archive' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
