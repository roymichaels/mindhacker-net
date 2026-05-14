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
import { LogOut, Globe, Home, PanelLeft, Sun, Moon, User, Menu, Settings, ChevronDown, FileText, BookOpen } from "lucide-react";
import { useSidebarSafe } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./admin/NotificationBell";
import { useTheme } from "next-themes";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeSettings } from "@/hooks/useThemeSettings";
import { useUserRoles } from "@/hooks/useUserRoles";
import { openInteractiveAION } from "@/components/aion/InteractiveAIONHost";
import aionOrb from "@/assets/aion-ring.png";

import { useAuthModal } from "@/contexts/AuthModalContext";
import AdminSidebar from "./panel/AdminSidebar";
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
  
  const { openAuthModal } = useAuthModal();
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
    try {
      await supabase.auth.signOut();
      toast({
        title: t('messages.logoutSuccess'),
        description: t('messages.goodbye'),
      });
      // Force a full page reload to clear all state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };


  // Wordmark — premium iOS-style center label
  const Wordmark = () => (
    <Link
      to={isAdminMode ? "/admin" : "/"}
      className={cn(
        "select-none font-semibold text-[20px] sm:text-[22px] tracking-[0.28em] leading-none",
        "hover:opacity-80 transition-opacity",
        brandColors?.text || 'text-foreground',
      )}
      aria-label={isAdminMode ? t('admin.panelTitle') : brandName}
    >
      {isAdminMode ? t('admin.panelTitle') : brandName}
    </Link>
  );

  // AION orb — visual anchor, opens Interactive AION
  const OrbAnchor = () => (
    <button
      type="button"
      onClick={openInteractiveAION}
      aria-label="פתח מצב AION"
      className="relative flex-shrink-0 active:scale-[0.97] transition-transform"
    >
      {/* subtle breathing glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 m-auto h-[88px] w-[88px] rounded-full blur-2xl opacity-50"
        style={{ background: 'radial-gradient(circle, hsl(220 90% 65% / 0.55), transparent 70%)' }}
      />
      <img
        src={aionOrb}
        alt=""
        width={88}
        height={88}
        draggable={false}
        className="relative block h-[88px] w-[88px] object-contain"
      />
    </button>
  );

  // Guest dropdown — triggered from the left menu icon
  const GuestMenu = ({ children }: { children: React.ReactNode }) => (
    <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "end" : "start"} className="w-56 bg-card dark:bg-card border border-border shadow-xl z-50">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium leading-none">{t('header.guestMenu')}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openAuthModal('login')}>
          <LogOut className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 rotate-180`} />
          {language === 'he' ? 'התחבר / הרשמה' : 'Sign In'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/blog')}>
          <BookOpen className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
          {language === 'he' ? 'בלוג' : 'Blog'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/docs')}>
          <FileText className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
          {language === 'he' ? 'ספר לבן' : 'White Paper'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/founding')}>
          <User className={isRTL ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"} />
          {language === 'he' ? 'הצטרף למייסדים' : 'Join Founding Members'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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

  return (
    <>
      <header
        className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-5 sm:px-8"
          style={{ minHeight: 96 }}
        >
          {/* LEFT — menu */}
          <div className="flex items-center justify-self-start">
            {user ? (
              <>
                {(onMenuClick || isAdminMode) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onMenuClick) requestAnimationFrame(() => onMenuClick());
                      else setMobileMenuOpen(true);
                    }}
                    aria-label={t('header.navigationMenu')}
                    className="h-11 w-11 rounded-full"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                {isAdminMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/now")}
                    aria-label={t('common.home')}
                    className="hidden sm:flex h-11 w-11 rounded-full"
                  >
                    <Home className="h-5 w-5" />
                  </Button>
                )}
              </>
            ) : (
              <GuestMenu>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('header.guestMenu')}
                  className="h-11 w-11 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </GuestMenu>
            )}
          </div>

          {/* CENTER — wordmark */}
          <div className="flex items-center justify-center min-w-0">
            <Wordmark />
          </div>

          {/* RIGHT — AION orb anchor */}
          <div className="flex items-center justify-self-end gap-2">
            {user && isAdmin && !loading && <NotificationBell />}
            <OrbAnchor />
          </div>
        </div>

        {isAdminMode && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side={isRTL ? "right" : "left"} className="p-0 w-[85vw] max-w-sm" dir={isRTL ? "rtl" : "ltr"}>
              <AdminSidebar isMobile onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
      </header>

    </>
  );
};

export default Header;
