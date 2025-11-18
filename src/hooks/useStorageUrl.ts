import { useEffect, useState } from "react";
import { getSignedUrl, getPublicUrl } from "@/lib/storage";

/**
 * Hook to get a signed URL for a private storage file
 */
export const useSignedUrl = (bucket: string, path: string | null | undefined) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      setLoading(false);
      return;
    }

    const fetchUrl = async () => {
      setLoading(true);
      const signedUrl = await getSignedUrl(bucket, path);
      setUrl(signedUrl);
      setLoading(false);
    };

    fetchUrl();
  }, [bucket, path]);

  return { url, loading };
};

/**
 * Hook to get a public URL for a public storage file
 */
export const usePublicUrl = (bucket: string, path: string | null | undefined) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }

    const publicUrl = getPublicUrl(bucket, path);
    setUrl(publicUrl);
  }, [bucket, path]);

  return url;
};
