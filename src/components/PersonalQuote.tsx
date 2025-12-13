import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Quote } from "lucide-react";

interface PersonalQuoteProps {
  settingKey: string;
  defaultQuote?: string;
  className?: string;
}

const PersonalQuote = ({ settingKey, defaultQuote = "", className = "" }: PersonalQuoteProps) => {
  const [quote, setQuote] = useState(defaultQuote);

  useEffect(() => {
    const fetchQuote = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", settingKey)
        .single();
      
      if (data?.setting_value) {
        setQuote(data.setting_value);
      }
    };
    fetchQuote();
  }, [settingKey]);

  if (!quote) return null;

  return (
    <div className={`flex items-center justify-center gap-2 text-secondary italic ${className}`}>
      <Quote className="w-4 h-4 text-primary/60 rotate-180" />
      <span className="text-sm md:text-base">{quote}</span>
      <span className="text-primary font-bold not-italic">— דין</span>
      <Quote className="w-4 h-4 text-primary/60" />
    </div>
  );
};

export default PersonalQuote;
