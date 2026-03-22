/**
 * AvatarConfiguratorPage — /avatar route.
 * Full-page avatar configurator.
 */

import { AvatarConfigurator } from "@/components/avatar/AvatarConfigurator";
import { useConfiguratorStore } from "@/components/avatar/avatarStore";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";
import { toast } from "sonner";

const AvatarConfiguratorPage = () => {
  const { user } = useAuth();
  const getCustomizationData = useConfiguratorStore((state) => state.getCustomizationData);

  const handleSave = useCallback(async () => {
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
    } else {
      toast.success("Avatar saved!");
    }
  }, [user, getCustomizationData]);

  return (
    <div className="w-screen h-screen">
      <AvatarConfigurator onSave={handleSave} showSaveButton />
    </div>
  );
};

export default AvatarConfiguratorPage;
