import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  console.warn("⚠️  Supabase env vars missing. Auth will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnon);

/**
 * Upload a file to Supabase Storage and return its public URL.
 * @param {string} bucket  - Storage bucket name (e.g. "avatars", "project-avatars", "forum-files")
 * @param {string} path    - Path inside the bucket (e.g. "user-id/avatar.jpg")
 * @param {File}   file    - The File object to upload
 */
export async function uploadToStorage(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error("Upload failed: " + error.message);

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
