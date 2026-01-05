import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut, Menu, Settings, ShoppingBag, User } from "lucide-react";
// Use the icon from public folder which has transparent background
const logo = "/icons/icon-96x96.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";
import { UserNotificationBell } from "./UserNotificationBell";
import { NotificationBell } from "./admin/NotificationBell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

interface MenuItem {
  id: string;
  label: string;
  label_en: string | null;
  action_type: string;
  action_value: string;
  order_index: number;
  is_visible: boolean;
}

const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { t, language, isRTL } = useTranslation();

  const { data: menuItems = [] } = useQuery({
    queryKey: ["menu-items-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_visible", true)
        .order("order_index");
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data: hasAdminRole } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        setIsAdmin(hasAdminRole || false);
      } catch (error) {
        handleError(error, t('common.error'), "Header");
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, t]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('messages.logoutSuccess'),
      description: t('messages.goodbye'),
    });
    navigate("/");
  };

  const handleMenuAction = (item: MenuItem) => {
    if (item.action_type === "scroll") {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(item.action_value);
          if (element) element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const element = document.getElementById(item.action_value);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }
    } else if (item.action_type === "navigate") {
      // Ensure path starts with / for internal navigation
      const path = item.action_value.startsWith("/") ? item.action_value : `/${item.action_value}`;
      navigate(path);
    }
    setMobileMenuOpen(false);
  };

  const getMenuLabel = (item: MenuItem) => {
    return language === 'en' && item.label_en ? item.label_en : item.label;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={logo} alt={t('header.brandName')} className="h-8 w-8" width={32} height={32} loading="eager" decoding="async" />
          <span className="font-black text-lg cyber-glow">
            {t('header.brandName')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuAction(item)}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {getMenuLabel(item)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {loading ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded" />
          ) : user ? (
            <>
              {isAdmin ? <NotificationBell /> : <UserNotificationBell />}
              <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{t('common.account')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <ShoppingBag className={isRTL ? "ml-2" : "mr-2"} />
                    {t('common.dashboard')}
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Settings className={isRTL ? "ml-2" : "mr-2"} />
                      {t('header.adminPanel')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className={isRTL ? "ml-2" : "mr-2"} />
                    {t('common.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex"
              >
                {t('common.login')}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/signup")}
              >
                {t('common.signup')}
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={isRTL ? "right" : "left"} dir={isRTL ? "rtl" : "ltr"}>
              <SheetHeader>
                <SheetTitle>{t('header.navigationMenu')}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuAction(item)}
                    className={`${isRTL ? 'text-right' : 'text-left'} text-sm font-medium hover:text-primary transition-colors`}
                  >
                    {getMenuLabel(item)}
                  </button>
                ))}

                {user ? (
                  <>
                    <div className="border-t my-4" />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/dashboard");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      <ShoppingBag className={isRTL ? "ml-2" : "mr-2"} />
                      {t('common.dashboard')}
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate("/admin");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <Settings className={isRTL ? "ml-2" : "mr-2"} />
                        {t('header.adminPanel')}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-destructive hover:text-destructive"
                    >
                      <LogOut className={isRTL ? "ml-2" : "mr-2"} />
                      {t('common.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate("/login");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      {t('common.login')}
                    </Button>
                    <Button
                      onClick={() => {
                        navigate("/signup");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      {t('common.signup')}
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;