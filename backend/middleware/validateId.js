/**
 * ============================================================
 * ROUTE PARAM VALIDATION
 * ============================================================
 * Every primary key in the schema is BIGSERIAL. Without this
 * guard a URL like /api/products/abc reaches Postgres, which
 * rejects it with "invalid input syntax for type bigint" and
 * the route answers 500 while leaking the column type.
 * A bad id is a missing resource, so it answers 404 instead.
 * ============================================================
 */

const isPositiveInt = (value) => /^\d+$/.test(value) && Number(value) > 0;

const guard = (req, res, next, value) =>
  isPositiveInt(value) ? next() : res.status(404).json({ error: 'Not found' });

/** Registers the guard for the given param names on a router. */
exports.guardIdParams = (router, names = ['id']) => {
  names.forEach((name) => router.param(name, guard));
};
