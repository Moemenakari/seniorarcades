/**
 * Alt text for a product photo.
 *
 * Uses the description written in the admin when there is one. Otherwise
 * falls back to the product name plus the service and the location, which
 * is what people search for ("Boxing Machine rental in Lebanon"), rather
 * than the bare name.
 */
export function productAlt(
  product: { name?: string; title?: string; alt_text?: string | null },
  photoNumber?: number,
): string {
  const base = product.alt_text?.trim() || `${product.name || product.title || 'Arcade game'} rental in Lebanon`;
  return photoNumber && photoNumber > 1 ? `${base} — photo ${photoNumber}` : base;
}
