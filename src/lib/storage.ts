import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a signed URL for private storage files
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 */
export const getSignedUrl = async (
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error creating signed URL:", error);
    return null;
  }
};

/**
 * Get public URL for public storage files (thumbnails)
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Generate signed URLs for multiple files
 * @param bucket - Storage bucket name
 * @param paths - Array of file paths
 * @param expiresIn - Expiration time in seconds
 */
export const getSignedUrls = async (
  bucket: string,
  paths: string[],
  expiresIn: number = 3600
): Promise<Record<string, string>> => {
  const urls: Record<string, string> = {};

  await Promise.all(
    paths.map(async (path) => {
      const url = await getSignedUrl(bucket, path, expiresIn);
      if (url) {
        urls[path] = url;
      }
    })
  );

  return urls;
};

/**
 * Delete a file from storage
 * @param bucket - Storage bucket name
 * @param path - File path to delete
 */
export const deleteFile = async (
  bucket: string,
  path: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error("Error deleting file:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

/**
 * Delete multiple files from storage
 * @param bucket - Storage bucket name
 * @param paths - Array of file paths to delete
 */
export const deleteFiles = async (
  bucket: string,
  paths: string[]
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      console.error("Error deleting files:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting files:", error);
    return false;
  }
};
