const db = require('../config/db');

exports.getGallery = async (req, res) => {
  try {
    const images = await db.prepare('SELECT * FROM sponsorship_gallery ORDER BY is_main DESC, sort_order ASC, id ASC').all();
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addImage = async (req, res) => {
  const { image_url, description, sort_order, is_main } = req.body;
  if (!image_url || !image_url.trim()) return res.status(400).json({ error: 'image_url is required' });

  try {
    const addTx = db.transaction(async () => {
      if (is_main) await db.prepare('UPDATE sponsorship_gallery SET is_main = 0').run();
      return db.prepare('INSERT INTO sponsorship_gallery (image_url, description, sort_order, is_main) VALUES (?, ?, ?, ?)')
        .run(image_url.trim(), description || '', sort_order !== undefined ? parseInt(sort_order) : 0, is_main ? 1 : 0);
    });
    const result = await addTx();
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateImage = async (req, res) => {
  const { id } = req.params;
  const { image_url, description, sort_order, is_main } = req.body;
  try {
    const existing = await db.prepare('SELECT * FROM sponsorship_gallery WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Image not found' });

    const updateTx = db.transaction(async () => {
      if (is_main) await db.prepare('UPDATE sponsorship_gallery SET is_main = 0').run();
      await db.prepare(`
        UPDATE sponsorship_gallery SET
          image_url = COALESCE(?, image_url), description = COALESCE(?, description),
          sort_order = COALESCE(?, sort_order), is_main = COALESCE(?, is_main)
        WHERE id = ?
      `).run(
        image_url ? image_url.trim() : null,
        description !== undefined ? description : null,
        sort_order !== undefined ? parseInt(sort_order) : null,
        is_main !== undefined ? (is_main ? 1 : 0) : null,
        id
      );
    });
    await updateTx();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteImage = async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM sponsorship_gallery WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Image not found' });
    await db.prepare('DELETE FROM sponsorship_gallery WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setMainImage = async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM sponsorship_gallery WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Image not found' });

    const setMainTx = db.transaction(async () => {
      await db.prepare('UPDATE sponsorship_gallery SET is_main = 0').run();
      await db.prepare('UPDATE sponsorship_gallery SET is_main = 1 WHERE id = ?').run(req.params.id);
    });
    await setMainTx();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
