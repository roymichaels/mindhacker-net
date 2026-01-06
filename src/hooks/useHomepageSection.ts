import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "./useTranslation";

export interface HomepageSection {
  id: string;
  section_key: string;
  title_he: string | null;
  title_en: string | null;
  subtitle_he: string | null;
  subtitle_en: string | null;
  content_he: string | null;
  content_en: string | null;
  is_visible: boolean;
  order_index: number;
  metadata: Record<string, any>;
}

export const useHomepageSection = (sectionKey: string) => {
  const { language } = useTranslation();
  const [section, setSection] = useState<HomepageSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSection = async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .eq("section_key", sectionKey)
        .single();

      if (!error && data) {
        setSection(data as HomepageSection);
      }
      setLoading(false);
    };

    fetchSection();
  }, [sectionKey]);

  const getTitle = () => {
    if (!section) return "";
    return language === "en" ? (section.title_en || section.title_he || "") : (section.title_he || "");
  };

  const getSubtitle = () => {
    if (!section) return "";
    return language === "en" ? (section.subtitle_en || section.subtitle_he || "") : (section.subtitle_he || "");
  };

  const getContent = () => {
    if (!section) return "";
    return language === "en" ? (section.content_en || section.content_he || "") : (section.content_he || "");
  };

  return {
    section,
    loading,
    title: getTitle(),
    subtitle: getSubtitle(),
    content: getContent(),
    isVisible: section?.is_visible ?? true,
  };
};

export const useAllHomepageSections = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      const { data, error } = await supabase
        .from("homepage_sections")
        .select("*")
        .order("order_index");

      if (!error && data) {
        setSections(data as HomepageSection[]);
      }
      setLoading(false);
    };

    fetchSections();
  }, []);

  const refetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("order_index");

    if (!error && data) {
      setSections(data as HomepageSection[]);
    }
    setLoading(false);
  };

  return { sections, loading, refetch };
};
