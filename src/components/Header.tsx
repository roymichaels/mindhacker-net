import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, ShoppingBag, Sparkles, Globe, Home, PanelLeft, Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";
import { UserNotificationBell } from "./UserNotificationBell";
import { NotificationBell } from "./admin/NotificationBell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTheme } from "next-themes";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import StartChangeModal from "./StartChangeModal";
import { AuthModal } from "./AuthModal";
import AdminSidebar from "./admin/AdminSidebar";
import { ProductColorClasses } from "@/lib/productColors";

// Default logo from public folder
const defaultLogo = "/icons/icon-96x96.png";

export interface HeaderProps {
  variant?: "public" | "admin";
  brandColors?: ProductColorClasses;
}

const Header = ({ variant = "public", brandColors }: HeaderProps) => {
  const isAdminMode = variant === "admin";
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminMode);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const { t, isRTL } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { theme: brandTheme } = useThemeSettings();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Get brand name from theme settings based on language
  const brandName = isRTL ? brandTheme.brand_name : brandTheme.brand_name_en;
  const logoUrl = brandTheme.logo_url || defaultLogo;

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    const email = user.email;
    return email.charAt(0).toUpperCase();
  };

  useEffect(() => {
    // If admin mode is forced via prop, skip the check
    if (isAdminMode) {
      setIsAdmin(true);
      return;
    }

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
  }, [user, t, isAdminMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: t('messages.logoutSuccess'),
      description: t('messages.goodbye'),
    });
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
        <div className="container grid grid-cols-3 h-16 items-center px-4">
          {/* Left side: Logo and Admin panel title */}
          <div className="flex items-center gap-3 justify-start">
            {/* Mobile Admin Sidebar Trigger */}
            {isAdminMode && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" aria-label={t('header.navigationMenu')}>
                    <PanelLeft className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "right" : "left"} className="p-0 w-72" dir={isRTL ? "rtl" : "ltr"}>
                  <AdminSidebar isMobile onNavigate={() => setMobileMenuOpen(false)} />
                </SheetContent>
              </Sheet>
            )}

            <Link to={isAdminMode ? "/admin" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src={logoUrl} alt={brandName} className="h-8 w-8" width={32} height={32} loading="eager" decoding="async" />
              <span className={`hidden sm:inline font-black text-lg ${brandColors?.text || 'text-foreground'}`}>
                {isAdminMode ? t('admin.panelTitle') : brandName}
              </span>
            </Link>
          </div>

          {/* Center CTA Button - Only for public mode */}
          <div className="flex justify-center">
            {!isAdminMode && (
              <Button
                onClick={() => setStartModalOpen(true)}
                className={`flex gap-2 transition-all ${brandColors ? `${brandColors.button} ${brandColors.buttonText} ${brandColors.shadow}` : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40'}`}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">{t('header.startChangeNow')}</span>
                <span className="sm:hidden">{t('header.startShort')}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3 justify-end">
            {/* Home button - Only for admin mode */}
            {isAdminMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                aria-label={t('common.home')}
                className="hidden sm:flex"
              >
                <Home className="h-5 w-5" />
              </Button>
            )}

            {/* Language switcher only shown for non-logged in users */}
            {!user && !isAdminMode && <LanguageSwitcher />}
            
            {loading ? (
              <div className="h-9 w-9 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              <>
                {isAdmin ? <NotificationBell /> : <UserNotificationBell />}
                <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/50 transition-all">
                      <Avatar className="h-9 w-9 border-2 border-primary/30">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card dark:bg-card border border-border shadow-xl z-50">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{t('common.account')}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <ShoppingBag className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                      {t('common.dashboard')}
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <Settings className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                        {t('header.adminPanel')}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    {/* Language Switcher Sub-menu */}
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Globe className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                        {t('common.language')}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="bg-card dark:bg-card border border-border shadow-xl z-50">
                          <DropdownMenuItem 
                            onClick={() => setLanguage('he')}
                            className={language === 'he' ? 'bg-primary/10 text-primary' : ''}
                          >
                            <span className={isRTL ? "ml-2" : "mr-2"}>🇮🇱</span>
                            עברית
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => setLanguage('en')}
                            className={language === 'en' ? 'bg-primary/10 text-primary' : ''}
                          >
                            <span className={isRTL ? "ml-2" : "mr-2"}>🇺🇸</span>
                            English
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    {/* Theme Toggle in dropdown */}
                    <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                      {isDark ? (
                        <Sun className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                      ) : (
                        <Moon className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                      )}
                      {isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
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
                  onClick={() => {
                    setAuthModalMode("login");
                    setAuthModalOpen(true);
                  }}
                  className="hidden sm:inline-flex"
                >
                  {t('common.login')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthModalMode("signup");
                    setAuthModalOpen(true);
                  }}
                >
                  {t('common.signup')}
                </Button>
              </>
            )}

          </div>
        </div>
      </header>

      <StartChangeModal open={startModalOpen} onOpenChange={setStartModalOpen} />
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultMode={authModalMode}
      />
    </>
  );
};

export default Header;
