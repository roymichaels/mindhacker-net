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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Globe, Home, PanelLeft, Sun, Moon, User, Menu, Settings, ShoppingBag, Briefcase } from "lucide-react";
import { MultiThreadOrb } from "@/components/orb/MultiThreadOrb";
import { useMultiThreadOrbProfile } from "@/hooks/useMultiThreadOrbProfile";
import { useSidebarSafe } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";
import { UserNotificationBell } from "./UserNotificationBell";
import { NotificationBell } from "./admin/NotificationBell";
import { useTheme } from "next-themes";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useUserRoles } from "@/hooks/useUserRoles";

import { AuthModal } from "./AuthModal";
import AdminSidebar from "./admin/AdminSidebar";
import { ProductColorClasses } from "@/lib/productColors";


// Default logo from public folder - new orb logo
const defaultLogo = "/logo.png?v=7";

export interface HeaderProps {
  variant?: "public" | "admin";
  brandColors?: ProductColorClasses;
  onMenuClick?: () => void; // Optional callback for mobile menu
}

// Sidebar toggle component that safely uses the sidebar context
// NOTE: On mobile we open a Sheet from the parent layout. If we open it via state
// from an external button, the same click can be treated as an “outside click” and
// immediately close the Sheet. We prevent that by stopping propagation and opening
// on the next frame.
const SidebarToggle = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const sidebar = useSidebarSafe();
  
  // Handle click - prefer callback if provided (mobile), otherwise use sidebar context
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // Prevent Radix "click outside" from immediately closing the Sheet on mobile
    e.preventDefault();
    e.stopPropagation();

    // If we have a callback, use it (mobile sheet scenario)
    if (onMenuClick) {
      // Open on next frame so the Sheet doesn't process the same click as outside
      requestAnimationFrame(() => onMenuClick());
    } else if (sidebar) {
      // Desktop sidebar toggle
      sidebar.toggleSidebar();
    }
  };
  
  // Show if we have either sidebar context OR a callback
  if (!sidebar && !onMenuClick) return null;
  
  // Hide when sidebar is collapsed - the sidebar has its own toggle button
  const isCollapsed = sidebar?.state === 'collapsed';
  if (isCollapsed) return null;
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleClick}
      aria-label="Toggle sidebar"
      className="h-9 w-9"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

const Header = ({ variant = "public", brandColors, onMenuClick }: HeaderProps) => {
  const isAdminMode = variant === "admin";
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(isAdminMode);
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const { t, isRTL } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const { theme: brandTheme } = useThemeSettings();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  // Get user roles for panel access
  const { hasPanelAccess } = useUserRoles();
  
  // Get multi-thread orb profile for avatar
  const { profile: orbProfile, isPersonalized } = useMultiThreadOrbProfile();

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
        <div className="container grid grid-cols-3 h-14 sm:h-16 items-center px-2 sm:px-4">
          {/* Left side - Logo only (no hamburger - sidebar has its own toggle when collapsed) */}
          <div className="flex items-center gap-2 sm:gap-3 justify-start">
            <Link to={isAdminMode ? "/admin" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0 bg-primary/10">
                <img 
                  src={logoUrl} 
                  alt={brandName} 
                  className="w-full h-full object-cover" 
                  loading="eager" 
                  decoding="async"
                  onError={(e) => {
                    // Fallback if logo fails to load
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <span className={`font-bold text-sm sm:text-base md:text-lg truncate max-w-[120px] sm:max-w-none ${brandColors?.text || 'text-foreground'}`}>
                {isAdminMode ? t('admin.panelTitle') : brandName}
              </span>
            </Link>

            {/* Mobile Admin Sidebar Trigger - Admin pages only */}
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
          </div>

          {/* Center - Empty space to maintain grid layout */}
          <div className="flex justify-center">
            {/* Intentionally empty - CTA moved to avatar dropdown */}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 justify-end">
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

            {loading ? (
              <div className="h-8 w-8 sm:h-9 sm:w-9 animate-pulse bg-muted rounded-full" />
            ) : user ? (
              <>
                {isAdmin ? <NotificationBell /> : <UserNotificationBell />}
                {/* Mobile-only Avatar Dropdown */}
                <div className="md:hidden">
                  <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 p-0 hover:ring-2 hover:ring-primary/50 transition-all">
                        <MultiThreadOrb 
                          size={40}
                          showGlow={false}
                          profile={orbProfile}
                        />
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
                      {hasPanelAccess() && (
                        <DropdownMenuItem onClick={() => navigate("/panel")}>
                          <Briefcase className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                          {t('header.practitionerPanel')}
                        </DropdownMenuItem>
                      )}
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
                </div>
              </>
            ) : (
              /* Guest Avatar Dropdown with Language/Theme */
              <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/50 transition-all">
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-muted">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card dark:bg-card border border-border shadow-xl z-50">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium leading-none">{t('header.guestMenu')}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    setAuthModalMode("login");
                    setAuthModalOpen(true);
                  }}>
                    <LogOut className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 rotate-180`} />
                    {t('common.login')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    setAuthModalMode("signup");
                    setAuthModalOpen(true);
                  }}>
                    <User className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                    {t('common.signup')}
                  </DropdownMenuItem>
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
                  {/* Theme Toggle */}
                  <DropdownMenuItem onClick={() => setTheme(isDark ? "light" : "dark")}>
                    {isDark ? (
                      <Sun className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                    ) : (
                      <Moon className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                    )}
                    {isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultMode={authModalMode}
      />
    </>
  );
};

export default Header;
