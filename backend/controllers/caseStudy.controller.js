/**
 * ============================================================
 * CASE STUDIES
 * ============================================================
 * An event becomes a public case study once the admin gives it
 * three things: a public place name, an attendance figure, and at
 * least one game that was used. Until then it stays private.
 *
 * The public list returns only those three things plus dates. The
 * event name, client, phone, notes and every financial column stay
 * out: event names in the records carry client names, and the
 * location field is internal free text.
 * ============================================================
 */

const db = require('../config/db');
const { logAction } = require('../utils/logger');

const isPositiveInt = (value) => Number.isInteger(value) && value > 0;

/** Admin: the case-study fields of one event. */
exports.getCaseStudy = async (req, res) => {
  try {
    const event = await db.prepare(
      'SELECT id, attendance, case_study_place FROM events WHERE id = ?'
    ).get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const games = await db.prepare(
      'SELECT product_id FROM event_games WHERE event_id = ?'
    ).all(req.params.id);

    res.json({
      attendance: event.attendance,
      case_study_place: event.case_study_place || '',
      product_ids: games.map(g => Number(g.product_id)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Admin: saves attendance, the public place name and the games used.
 * The game list is replaced as a whole, inside one transaction, so a
 * failure half-way never leaves a mix of old and new games.
 */
exports.saveCaseStudy = async (req, res) => {
  const attendance = req.body.attendance === '' || req.body.attendance == null
    ? null
    : Number(req.body.attendance);
  const place = typeof req.body.case_study_place === 'string' ? req.body.case_study_place.trim() : '';
  const productIds = Array.isArray(req.body.product_ids) ? [...new Set(req.body.product_ids.map(Number))] : [];

  if (attendance !== null && !isPositiveInt(attendance)) {
    return res.status(400).json({ error: 'Attendance must be a whole number above zero, or empty.' });
  }
  if (!productIds.every(isPositiveInt)) {
    return res.status(400).json({ error: 'Invalid game selection.' });
  }
  if (place.length > 80) {
    return res.status(400).json({ error: 'Keep the place name under 80 characters.' });
  }

  try {
    const event = await db.prepare('SELECT event_name FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const save = db.transaction(async () => {
      await db.prepare('UPDATE events SET attendance = ?, case_study_place = ? WHERE id = ?')
        .run(attendance, place, req.params.id);
      await db.prepare('DELETE FROM event_games WHERE event_id = ?').run(req.params.id);
      for (const productId of productIds) {
        // Explicit RETURNING: run() otherwise appends "RETURNING id", and
        // this table has no id column.
        await db.prepare('INSERT INTO event_games (event_id, product_id) VALUES (?, ?) RETURNING event_id')
          .run(req.params.id, productId);
      }
    });
    await save();

    const isPublic = attendance !== null && place !== '' && productIds.length > 0;
    logAction(req.adminName || 'Admin', 'Events', 'Case Study Updated', `${event.event_name} case study`,
      isPublic
        ? `Case study published: ${place}, ${attendance} attendees, ${productIds.length} game(s).`
        : 'Case study saved but not public (needs place, attendance and at least one game).',
      0, event.event_name);

    res.json({ success: true, public: isPublic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Public: every complete case study, newest first, with safe fields only. */
exports.listPublic = async (req, res) => {
  try {
    const rows = await db.prepare(`
      SELECT e.id, e.case_study_place AS place, e.date, e.end_date, e.attendance,
             json_agg(json_build_object('id', p.id, 'name', p.name) ORDER BY p.name) AS games
      FROM events e
      JOIN event_games eg ON eg.event_id = e.id
      JOIN products p ON p.id = eg.product_id AND p.status = 'active'
      WHERE e.attendance > 0
        AND COALESCE(e.case_study_place, '') <> ''
        AND COALESCE(e.manual_status, '') <> 'cancelled'
      GROUP BY e.id
      ORDER BY e.date DESC
      LIMIT 50
    `).all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not load case studies' });
  }
};
