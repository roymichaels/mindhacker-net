import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface StartChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StartChangeModal = ({ open, onOpenChange }: StartChangeModalProps) => {
  const navigate = useNavigate();

  // When modal opens, immediately navigate to launchpad
  useEffect(() => {
    if (open) {
      onOpenChange(false);
      navigate('/launchpad');
    }
  }, [open, onOpenChange, navigate]);

  // No UI needed - we navigate directly
  return null;
};

export default StartChangeModal;
