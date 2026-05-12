/**
 * ============================================================
 * SPONSORSHIP GALLERY CONTROLLER
 * ============================================================
 * Purpose: Manages the Human Claw Machine photo gallery
 * displayed on the Sponsorship page. Supports full CRUD
 * operations and is controlled entirely via the Admin Panel.
 *
 * Routes:
 *   GET    /api/sponsorship/gallery         - Fetch all images (public)
 *   POST   /api/sponsorship/gallery         - Add new image (admin)
 *   PUT    /api/sponsorship/gallery/:id     - Update image/description (admin)
 *   DELETE /api/sponsorship/gallery/:id     - Delete image (admin)
 *   PUT    /api/sponsorship/gallery/:id/main - Set as main hero image (admin)
 * ============================================================
 */

const db = require('../config/db');

/**
 * GET ALL GALLERY IMAGES
 * ----------------------
 * Returns all images sorted by: main first, then sort_order ASC.
 * Used by the public Sponsorship page to render the gallery.
 */
exports.getGallery = (req, res) => {
  try {
    const images = db.prepare(
      'SELECT * FROM sponsorship_gallery ORDER BY is_main DESC, sort_order ASC, id ASC'
    ).all();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ADD NEW IMAGE
 * -------------
 * Inserts a new gallery image with optional description and sort order.
 * Body: { image_url, description, sort_order, is_main }
 */
exports.addImage = (req, res) => {
  const { image_url, description, sort_order, is_main } = req.body;

  if (!image_url || !image_url.trim()) {
    return res.status(400).json({ error: 'image_url is required' });
  }

  try {
    // If this is being set as main, clear the existing main flag first
    if (is_main) {
      db.prepare('UPDATE sponsorship_gallery SET is_main = 0').run();
    }

    const result = db.prepare(
      'INSERT INTO sponsorship_gallery (image_url, description, sort_order, is_main) VALUES (?, ?, ?, ?)'
    ).run(
      image_url.trim(),
      description || '',
      sort_order !== undefined ? parseInt(sort_order) : 0,
      is_main ? 1 : 0
    );

    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE IMAGE
 * ------------
 * Updates an existing gallery image's URL, description, or sort order.
 * Body: { image_url, description, sort_order, is_main }
 */
exports.updateImage = (req, res) => {
  const { id } = req.params;
  const { image_url, description, sort_order, is_main } = req.body;

  try {
    const existing = db.prepare('SELECT * FROM sponsorship_gallery WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // If setting this as main, clear existing main flag
    if (is_main) {
      db.prepare('UPDATE sponsorship_gallery SET is_main = 0').run();
    }

    db.prepare(`
      UPDATE sponsorship_gallery SET
        image_url   = COALESCE(?, image_url),
        description = COALESCE(?, description),
        sort_order  = COALESCE(?, sort_order),
        is_main     = COALESCE(?, is_main)
      WHERE id = ?
    `).run(
      image_url ? image_url.trim() : null,
      description !== undefined ? description : null,
      sort_order !== undefined ? parseInt(sort_order) : null,
      is_main !== undefined ? (is_main ? 1 : 0) : null,
      id
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE IMAGE
 * ------------
 * Permanently removes a gallery image by ID.
 */
exports.deleteImage = (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM sponsorship_gallery WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Image not found' });
    }

    db.prepare('DELETE FROM sponsorship_gallery WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * SET AS MAIN IMAGE
 * -----------------
 * Marks a specific image as the main hero image.
 * Clears the is_main flag from all other images first.
 */
exports.setMainImage = (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM sponsorship_gallery WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Clear all main flags, then set the selected one
    db.prepare('UPDATE sponsorship_gallery SET is_main = 0').run();
    db.prepare('UPDATE sponsorship_gallery SET is_main = 1 WHERE id = ?').run(req.params.id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
