import { useAnalytics } from "@/hooks/useAnalytics";

// Wrapper component that initializes analytics
const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
};

export default AnalyticsProvider;
