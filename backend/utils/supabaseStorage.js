const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = 'images';

async function uploadImage(fileBuffer, mimetype, originalName) {
  const ext = originalName.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, fileBuffer, { contentType: mimetype, upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

async function deleteImage(publicUrl) {
  const url = new URL(publicUrl);
  const parts = url.pathname.split(`/object/public/${BUCKET}/`);
  if (parts.length < 2) return;
  const filePath = parts[1];
  await supabase.storage.from(BUCKET).remove([filePath]);
}

module.exports = { uploadImage, deleteImage };
