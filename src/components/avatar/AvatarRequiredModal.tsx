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
        .from("avatar_customizations")
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
      .from("avatar_customizations")
      .upsert({
        user_id: user.id,
        customization_data: data,
      }, { onConflict: "user_id" });

    if (error) {
      toast.error("Failed to save avatar");
      console.error(error);
      return;
    }

    toast.success("Avatar saved!");
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
    <div className="fixed inset-0 z-[9999] bg-black">
      {isAdmin && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-[10000] bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg pointer-events-auto"
        >
          Skip (Admin)
        </button>
      )}
      <div className="w-full h-full">
        <AvatarConfigurator onSave={handleSave} showSaveButton />
      </div>
    </div>
  );
};
