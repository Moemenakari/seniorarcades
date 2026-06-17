const db = require('../config/db');

exports.rateGame = async (req, res) => {
  const { productId, rating, review } = req.body;
  const userId = req.user.id;
  if (!productId || !rating) return res.status(400).json({ error: 'Product ID and rating are required' });
  try {
    await db.prepare(`
      INSERT INTO game_ratings (user_id, product_id, rating, review)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, product_id)
      DO UPDATE SET rating = excluded.rating, review = excluded.review
    `).run(userId, productId, rating, review || null);
    res.json({ success: true, message: 'Game rated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.ratePlatform = async (req, res) => {
  const { rating, review } = req.body;
  const userId = req.user.id;
  if (!rating) return res.status(400).json({ error: 'Rating is required' });
  try {
    await db.prepare(`
      INSERT INTO platform_ratings (user_id, rating, review)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id)
      DO UPDATE SET rating = excluded.rating, review = excluded.review
    `).run(userId, rating, review || null);
    res.json({ success: true, message: 'Platform rated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGameRatings = async (req, res) => {
  try {
    const ratings = await db.prepare(`
      SELECT r.*, u.name as user_name
      FROM game_ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND COALESCE(r.is_hidden, 0) = 0
      ORDER BY r.created_at DESC
    `).all(req.params.productId);
    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPopularRatings = async (req, res) => {
  try {
    const ratings = await db.prepare(`
      SELECT r.*, u.name as user_name, p.name as game_name
      FROM game_ratings r
      JOIN users u ON r.user_id = u.id
      JOIN products p ON r.product_id = p.id
      WHERE r.rating >= 4 AND COALESCE(r.is_hidden, 0) = 0
      ORDER BY RANDOM() LIMIT 4
    `).all();
    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPublicPlatformRatings = async (req, res) => {
  try {
    const ratings = await db.prepare(`
      SELECT pr.*, u.name as user_name
      FROM platform_ratings pr
      JOIN users u ON pr.user_id = u.id
      WHERE COALESCE(pr.is_hidden, 0) = 0
      ORDER BY pr.created_at DESC LIMIT 6
    `).all();
    res.json({ success: true, ratings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRatingsAdmin = async (req, res) => {
  try {
    const [stats, ratings, platformRatings] = await Promise.all([
      db.prepare(`
        SELECT p.id as product_id, p.name as product_name,
          COUNT(r.id) as ratings_count, ROUND(AVG(r.rating)::numeric, 1) as average_rating
        FROM products p
        LEFT JOIN game_ratings r ON r.product_id = p.id
        WHERE p.status != 'archived'
        GROUP BY p.id, p.name
        ORDER BY ratings_count DESC, p.name ASC
      `).all(),
      db.prepare(`
        SELECT r.id, r.product_id, p.name as product_name, u.name as user_name,
          u.phone as user_phone, r.rating, r.review,
          COALESCE(r.is_hidden, 0) as is_hidden, r.created_at
        FROM game_ratings r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON p.id = r.product_id
        ORDER BY r.created_at DESC
      `).all(),
      db.prepare(`
        SELECT pr.id, u.name as user_name, u.phone as user_phone,
          pr.rating, pr.review, pr.created_at
        FROM platform_ratings pr
        JOIN users u ON pr.user_id = u.id
        ORDER BY pr.created_at DESC
      `).all(),
    ]);
    res.json({ success: true, stats, ratings, platformRatings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.hideRating = async (req, res) => {
  try {
    const rating = await db.prepare('SELECT id, is_hidden FROM game_ratings WHERE id = ?').get(req.params.id);
    if (!rating) return res.status(404).json({ error: 'Rating not found' });
    const nextHidden = rating.is_hidden ? 0 : 1;
    await db.prepare('UPDATE game_ratings SET is_hidden = ? WHERE id = ?').run(nextHidden, req.params.id);
    res.json({ success: true, is_hidden: nextHidden });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRating = async (req, res) => {
  try {
    const result = await db.prepare('DELETE FROM game_ratings WHERE id = ?').run(req.params.id);
    if (!result.changes) return res.status(404).json({ error: 'Rating not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
