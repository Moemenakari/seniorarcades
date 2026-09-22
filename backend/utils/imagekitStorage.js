/**
 * ============================================================
 * IMAGE STORAGE — IMAGEKIT
 * ============================================================
 * Same two functions the upload routes already call, so nothing
 * else in the codebase had to change:
 *
 *   uploadImage(buffer, mimetype, originalName) -> public URL
 *   deleteImage(publicUrl)                      -> void
 * ============================================================
 */

const ImageKit = require('imagekit');
const {
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT,
} = require('../config/env');

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

const FOLDER = '/nlg';

async function uploadImage(fileBuffer, mimetype, originalName) {
  const ext = (originalName.split('.').pop() || 'jpg').toLowerCase();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const result = await imagekit.upload({
    file: fileBuffer,
    fileName,
    folder: FOLDER,
    useUniqueFileName: false,
  });

  return result.url;
}

async function deleteImage(publicUrl) {
  // ImageKit deletes by file id, so the name from the URL has to be looked up.
  const name = decodeURIComponent(new URL(publicUrl).pathname.split('/').pop() || '');
  if (!name) return;

  const matches = await imagekit.listFiles({ name, limit: 1 });
  if (!matches.length) return;

  await imagekit.deleteFile(matches[0].fileId);
}

module.exports = { uploadImage, deleteImage };
