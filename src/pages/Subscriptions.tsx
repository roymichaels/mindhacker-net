import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscriptionsModal } from "@/contexts/SubscriptionsModalContext";

/** Route handler: opens the subscriptions modal and redirects back */
const Subscriptions = () => {
  const navigate = useNavigate();
  const { openSubscriptions } = useSubscriptionsModal();

  useEffect(() => {
    openSubscriptions();
    navigate(-1); // go back to wherever they came from
  }, []);

  return null;
};

export default Subscriptions;
