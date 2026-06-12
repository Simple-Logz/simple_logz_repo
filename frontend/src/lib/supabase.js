import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn("⚠️  Supabase env vars missing. Auth will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnon);

/**
 * Upload an image file to Supabase Storage and return its public URL.
 * @param {"avatars"|"project-avatars"} bucket - bucket name
 * @param {string} path - storage path, e.g. "user-id/avatar.png"
 * @param {File} file - the File object from an <input type="file">
 */
export async function uploadToStorage(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return publicUrl;
}
