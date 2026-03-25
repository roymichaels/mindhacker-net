/**
 * AvatarConfiguratorPage — /avatar route.
 * Full-page avatar configurator. Loads saved data and saves on exit.
 */

import { AvatarConfigurator } from "@/components/avatar/AvatarConfigurator";
import { useConfiguratorStore } from "@/components/avatar/avatarStore";
import { useAuth } from "@/contexts/AuthContext";
import { useUserAvatarData } from "@/hooks/useUserAvatarData";
import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const AvatarConfiguratorPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const getCustomizationData = useConfiguratorStore((state) => state.getCustomizationData);
  const loadCustomizationData = useConfiguratorStore((state) => state.loadCustomizationData);
  const loading = useConfiguratorStore((state) => state.loading);
  const { avatarData, hasAvatar } = useUserAvatarData();
  const hasLoadedRef = useRef(false);
  const queryClient = useQueryClient();

  // Load saved avatar data into store once categories are initialized
  useEffect(() => {
    if (!loading && hasAvatar && avatarData && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCustomizationData(avatarData);
    }
  }, [loading, hasAvatar, avatarData, loadCustomizationData]);

  const handleSave = useCallback(async () => {
    if (!user) return;
    const data = getCustomizationData();

    const { error } = await supabase
      .from("avatar_customizations" as any)
      .upsert({
        user_id: user.id,
        customization_data: data,
      } as any, { onConflict: "user_id" });

    if (error) {
      toast.error("Failed to save avatar");
      console.error(error);
    } else {
      toast.success("Avatar saved!");
      queryClient.invalidateQueries({ queryKey: ['avatar-customization', user.id] });
      navigate('/mindos/tactics');
    }
  }, [user, getCustomizationData, queryClient]);

  return (
    <div className="w-screen h-screen">
      <AvatarConfigurator onSave={handleSave} showSaveButton />
    </div>
  );
};

export default AvatarConfiguratorPage;
