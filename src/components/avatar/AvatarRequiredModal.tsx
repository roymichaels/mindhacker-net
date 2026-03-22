/**
 * AvatarRequiredModal — Mandatory modal for users without an avatar.
 * Cannot be closed unless user is admin or saves an avatar.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AvatarConfigurator } from "./AvatarConfigurator";
import { useConfiguratorStore } from "./avatarStore";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const AvatarRequiredModal = () => {
  const { user, isAdmin } = useAuth();
  const [hasAvatar, setHasAvatar] = useState<boolean | null>(null);
  const [show, setShow] = useState(false);
  const getCustomizationData = useConfiguratorStore((state) => state.getCustomizationData);

  useEffect(() => {
    if (!user) {
      setHasAvatar(null);
      setShow(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from("avatar_customizations" as any)
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const exists = !!data;
      setHasAvatar(exists);
      setShow(!exists);
    };

    check();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const data = getCustomizationData();

    const { error } = await supabase
      .from("avatar_customizations" as any)
      .upsert({
        user_id: user.id,
        customization_data: data,
      } as any, { onConflict: "user_id" });

    if (error) {
      toast.error("שגיאה בשמירת האווטאר");
      console.error(error);
      return;
    }

    toast.success("האווטאר נשמר!");
    setHasAvatar(true);
    setShow(false);
  };

  const handleDismiss = () => {
    if (isAdmin) {
      setShow(false);
    }
  };

  if (!show || !user) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background">
      {isAdmin && (
        <button
          onClick={handleDismiss}
          className="absolute bottom-6 left-4 z-[10000] bg-card/80 hover:bg-card text-muted-foreground px-3 py-1.5 rounded-2xl pointer-events-auto flex items-center gap-1.5 text-xs border border-border transition-colors backdrop-blur-md"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          דלג (מנהל)
        </button>
      )}
      <div className="w-full h-full">
        <AvatarConfigurator onSave={handleSave} showSaveButton />
      </div>
    </div>
  );
};
