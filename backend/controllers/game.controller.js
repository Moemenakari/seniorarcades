/**
 * ============================================================
 * GAME CONTROLLER (LEGACY ALIAS)
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: Provides a legacy alias for the Machines (Products) 
 * management. Maintained for backward compatibility with 
 * older frontend versions. Uses better-sqlite3 (synchronous).
 * ============================================================
 */

const db = require('../config/db');

/**
 * GET ALL GAMES
 * -------------
 */
exports.getGames = (req, res) => {
  try {
    const games = db.prepare("SELECT * FROM products WHERE status != 'archived' ORDER BY created_at DESC").all();
    res.json(games);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/**
 * ADD NEW GAME
 * ------------
 */
exports.addGame = (req, res) => {
  const { title, description, min_price, max_price, category, power_usage, space_required, has_coins, popularity_score, image_url, extra_features } = req.body;
  const average_price = (parseFloat(min_price) + parseFloat(max_price)) / 2;
  
  try {
    const result = db.prepare(
      "INSERT INTO products (name, description, min_price, max_price, average_price, category, electricity_amount, space_required, has_coins, popularity_score, image_url, extra_features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).run(title, description, min_price, max_price, average_price, category, power_usage, space_required, has_coins, popularity_score || 50, image_url, extra_features);
    res.status(201).json({ success: true, id: result.lastInsertRowid });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/**
 * UPDATE GAME
 * -----------
 */
exports.updateGame = (req, res) => {
  const { id } = req.params;
  const { title, description, min_price, max_price, category, power_usage, space_required, has_coins, popularity_score, image_url, extra_features, status } = req.body;
  const average_price = min_price && max_price ? (parseFloat(min_price) + parseFloat(max_price)) / 2 : undefined;

  try {
    db.prepare(`
      UPDATE products SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        min_price = COALESCE(?, min_price),
        max_price = COALESCE(?, max_price),
        average_price = COALESCE(?, average_price),
        category = COALESCE(?, category),
        electricity_amount = COALESCE(?, electricity_amount),
        space_required = COALESCE(?, space_required),
        has_coins = COALESCE(?, has_coins),
        popularity_score = COALESCE(?, popularity_score),
        image_url = COALESCE(?, image_url),
        extra_features = COALESCE(?, extra_features),
        status = COALESCE(?, status)
      WHERE id = ?`
    ).run(title, description, min_price, max_price, average_price, category, power_usage, space_required, has_coins, popularity_score, image_url, extra_features, status, id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

/**
 * DELETE GAME
 * -----------
 */
exports.deleteGame = (req, res) => {
  try {
    db.prepare("UPDATE products SET status = 'archived' WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
