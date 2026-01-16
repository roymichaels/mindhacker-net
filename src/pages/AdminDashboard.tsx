import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/Header";
import { useTranslation } from "@/hooks/useTranslation";

const AdminDashboard = () => {
  const { isRTL } = useTranslation();

  return (
    <div className="min-h-screen bg-background relative z-10" dir={isRTL ? "rtl" : "ltr"}>
      <Header variant="admin" />
      <div className="flex">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        {/* Main content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
