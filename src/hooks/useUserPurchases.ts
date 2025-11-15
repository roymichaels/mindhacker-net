import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Purchase {
  id: string;
  package_type: string;
  sessions_total: number;
  sessions_remaining: number;
  price: number;
  payment_status: string;
  purchase_date: string;
}

export const useUserPurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPurchases, setHasPurchases] = useState(false);
  const [hasActiveSessions, setHasActiveSessions] = useState(false);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("purchases")
          .select("*")
          .eq("user_id", user.id)
          .order("purchase_date", { ascending: false });

        if (!error && data) {
          setPurchases(data);
          setHasPurchases(data.length > 0);
          setHasActiveSessions(data.some(p => p.sessions_remaining > 0));
        }
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();

    const channel = supabase
      .channel("purchases_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "purchases",
        },
        () => {
          fetchPurchases();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { purchases, loading, hasPurchases, hasActiveSessions };
};
