/**
 * ============================================================
 * PRODUCT (MACHINE) CONTROLLER
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Manages the inventory of arcade machines (products), 
 * including technical specs, pricing, and availability.
 * ============================================================
 */

const db = require('../config/db');
const { logAction } = require('../utils/logger');

const formatAvailability = (status) => (status === 'active' ? 'available' : 'unavailable');

const toProductResponse = (product) => ({
  // Legacy-safe fields
  ...product,
  title: product.name,
  power_usage: product.electricity_amount,
  // Normalized fields for modern frontend
  price: {
    min: product.min_price,
    max: product.max_price,
    average: product.average_price
  },
  images: [product.image_url, product.image_url2, product.image_url3].filter(Boolean),
  availability: formatAvailability(product.status)
});

/**
 * GET ALL PRODUCTS
 * ----------------
 * Fetches the list of all available arcade machines. 
 * Includes calculated compatibility fields for the frontend.
 */
exports.getProducts = (req, res) => {
  try {
    const { category, suitability, popular } = req.query;
    let query = "SELECT *, name as title, electricity_amount as power_usage FROM products WHERE status = 'active'";
    const params = [];
    if (category && category !== 'all') { query += " AND category = ?"; params.push(category); }
    if (suitability && suitability !== 'all') { query += " AND event_suitability = ?"; params.push(suitability); }
    if (popular === 'true') { query += " AND popularity_score >= 70"; }
    query += " ORDER BY is_featured DESC, created_at DESC";
    const products = db.prepare(query).all(...params);
    res.json(products.map(toProductResponse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeaturedProducts = (req, res) => {
  try {
    const featured = db.prepare("SELECT * FROM products WHERE status = 'active' AND is_featured = 1 ORDER BY created_at DESC LIMIT 9").all();
    const total = db.prepare("SELECT COUNT(*) as count FROM products WHERE status = 'active'").get();
    res.json({ featured: featured.map(toProductResponse), total: total.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleFeatured = (req, res) => {
  try {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const newVal = product.is_featured ? 0 : 1;
    // Enforce max 9 featured
    if (newVal === 1) {
      const count = db.prepare("SELECT COUNT(*) as c FROM products WHERE is_featured = 1").get();
      if (count.c >= 9) return res.status(400).json({ error: 'Maximum 9 featured games allowed. Unfeature one first.' });
    }
    db.prepare("UPDATE products SET is_featured = ? WHERE id = ?").run(newVal, req.params.id);
    res.json({ success: true, is_featured: newVal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET SINGLE PRODUCT
 * ------------------
 */
exports.getProduct = (req, res) => {
  try {
    const product = db.prepare("SELECT * FROM products WHERE id = ? AND status = 'active'").get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(toProductResponse(product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADD NEW PRODUCT
 * ---------------
 * Inserts a new arcade machine into the catalog and calculates 
 * its average rental price.
 */
exports.addProduct = (req, res) => {
  const { name, description, min_price, max_price, category, space_required, needs_electricity, electricity_amount, has_coins, extra_features, image_url, badge, image_url2, image_url3, status } = req.body;
  const parsedMin = parseFloat(min_price);
  const parsedMax = parseFloat(max_price);
  if (!name || Number.isNaN(parsedMin) || Number.isNaN(parsedMax) || parsedMin < 0 || parsedMax < 0 || parsedMin > parsedMax) {
    return res.status(400).json({ error: 'Invalid pricing. Ensure min price is less than or equal to max price.' });
  }
  const average_price = (parsedMin + parsedMax) / 2;
  const derivedRentPrice = parsedMin === parsedMax ? `$${parsedMin}` : `$${parsedMin} - $${parsedMax}`;

  try {
    const result = db.prepare(
      "INSERT INTO products (name, description, min_price, max_price, average_price, category, space_required, needs_electricity, electricity_amount, has_coins, extra_features, image_url, badge, rent_price, image_url2, image_url3, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(name, description || '', parsedMin, parsedMax, average_price, category || 'General', space_required || '2 m³', needs_electricity ? 1 : 0, electricity_amount || '', has_coins ? 1 : 0, extra_features || '', image_url || '', badge || 'None', derivedRentPrice, image_url2 || '', image_url3 || '', status || 'active');

    const id = result.lastInsertRowid;
    
    // Auditing
    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, 'Machines', 'New Machine Added', `${name} added`, `New machine '${name}' was added to the system. Category: ${category || 'General'}`, 0, name);

    res.status(201).json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE PRODUCT
 * --------------
 * Updates the specifications or status of an existing machine.
 */
exports.updateProduct = (req, res) => {
  const { name, description, min_price, max_price, category, space_required, needs_electricity, electricity_amount, has_coins, extra_features, image_url, badge, image_url2, image_url3, status } = req.body;
  const hasBothPrices = min_price !== undefined && max_price !== undefined && min_price !== '' && max_price !== '';
  if (hasBothPrices) {
    const parsedMin = parseFloat(min_price);
    const parsedMax = parseFloat(max_price);
    if (Number.isNaN(parsedMin) || Number.isNaN(parsedMax) || parsedMin < 0 || parsedMax < 0 || parsedMin > parsedMax) {
      return res.status(400).json({ error: 'Invalid pricing. Ensure min price is less than or equal to max price.' });
    }
  }
  const average_price = hasBothPrices ? ((parseFloat(min_price) + parseFloat(max_price)) / 2) : undefined;
  const rent_price = hasBothPrices ? (parseFloat(min_price) === parseFloat(max_price) ? `$${parseFloat(min_price)}` : `$${parseFloat(min_price)} - $${parseFloat(max_price)}`) : undefined;

  try {
    db.prepare(`
      UPDATE products SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        min_price = COALESCE(?, min_price),
        max_price = COALESCE(?, max_price),
        average_price = COALESCE(?, average_price),
        category = COALESCE(?, category),
        space_required = COALESCE(?, space_required),
        needs_electricity = COALESCE(?, needs_electricity),
        electricity_amount = COALESCE(?, electricity_amount),
        has_coins = COALESCE(?, has_coins),
        extra_features = COALESCE(?, extra_features),
        image_url = COALESCE(?, image_url),
        badge = COALESCE(?, badge),
        rent_price = COALESCE(?, rent_price),
        image_url2 = COALESCE(?, image_url2),
        image_url3 = COALESCE(?, image_url3),
        status = COALESCE(?, status)
      WHERE id = ?
    `).run(name, description, min_price, max_price, average_price, category, space_required, needs_electricity !== undefined ? (needs_electricity ? 1 : 0) : undefined, electricity_amount, has_coins !== undefined ? (has_coins ? 1 : 0) : undefined, extra_features, image_url, badge, rent_price, image_url2, image_url3, status, req.params.id);

    // Auditing
    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, 'Machines', 'Machine Updated', `${name || 'Machine'} details changed`, `Machine ${name || 'ID: ' + req.params.id} was updated. Status: ${status || 'active'}`, 0, name || 'General');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ARCHIVE PRODUCT
 * ---------------
 * Moves a machine to the archive to prevent its display while 
 * preserving historical references in old events.
 */
exports.deleteProduct = (req, res) => {
  try {
    const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const archiveTransaction = db.transaction(() => {
      // Store snapshot
      db.prepare(
        "INSERT INTO archive_financials (original_id, table_name, data, archive_type) VALUES (?, 'products', ?, 'deleted')"
      ).run(product.id, JSON.stringify(product));

      // Mark as archived
      db.prepare("UPDATE products SET status = 'archived' WHERE id = ?").run(req.params.id);
    });

    archiveTransaction();

    // Auditing
    const adminName = req.adminName || req.body.admin_name || 'Admin';
    logAction(adminName, 'Machines', 'Machine Archived', `${product.name} archived`, `Machine '${product.name}' was moved to system archive`, 0, product.name);

    res.json({ success: true, message: 'Product moved to system archive' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

