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
import { LogOut, Globe, Home, PanelLeft, Sun, Moon, User, Menu, Settings } from "lucide-react";
import { useSidebarSafe } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";
import { NotificationBell } from "./admin/NotificationBell";
import { useTheme } from "next-themes";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useUserRoles } from "@/hooks/useUserRoles";
import { AuroraOrbIcon } from "@/components/icons/AuroraOrbIcon";

import { AuthModal } from "./AuthModal";
import AdminSidebar from "./admin/AdminSidebar";
import { ProductColorClasses } from "@/lib/productColors";

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

  // Get brand name from theme settings based on language
  const brandName = isRTL ? brandTheme.brand_name : brandTheme.brand_name_en;

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

  // Guest Avatar Dropdown Component
  const GuestAvatarDropdown = () => (
    <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/50 transition-all">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-primary/30 shadow-lg shadow-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 via-accent/20 to-primary/30 text-primary">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-56 bg-card dark:bg-card border border-border shadow-xl z-50">
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
  );

  // Logo Component - Uses AuroraOrbIcon consistently across the app
  const LogoBrand = () => (
    <Link to={isAdminMode ? "/admin" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      <AuroraOrbIcon size={40} className="text-foreground flex-shrink-0" />
      <span className={`font-bold text-sm sm:text-base md:text-lg truncate max-w-[120px] sm:max-w-none ${brandColors?.text || 'text-foreground'}`}>
        {isAdminMode ? t('admin.panelTitle') : brandName}
      </span>
    </Link>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-6">
          {/* Left side - Logo + Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              // Logged in: Show logo + admin controls
              <>
                <LogoBrand />
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
              </>
            ) : (
              // Logged out: Logo + Brand on left
              <LogoBrand />
            )}
          </div>

          {/* Right side - Avatar/Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              // Logged in: Show menu controls + notifications
              <>
                {loading ? (
                  <div className="h-8 w-8 sm:h-9 sm:w-9 animate-pulse bg-muted rounded-full" />
                ) : (
                  isAdmin && <NotificationBell />
                )}
                {onMenuClick && (
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      requestAnimationFrame(() => onMenuClick());
                    }}
                    aria-label={t('header.navigationMenu')}
                    className="h-9 w-9 md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
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
              </>
            ) : (
              // Logged out: Avatar dropdown on right
              <GuestAvatarDropdown />
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
