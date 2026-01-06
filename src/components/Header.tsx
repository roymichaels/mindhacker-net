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
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut, Menu, Settings, ShoppingBag, Sparkles, User } from "lucide-react";
// Use the icon from public folder which has transparent background
const logo = "/icons/icon-96x96.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";
import { UserNotificationBell } from "./UserNotificationBell";
import { NotificationBell } from "./admin/NotificationBell";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";
import StartChangeModal from "./StartChangeModal";

const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const { t, isRTL } = useTranslation();

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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src={logo} alt={t('header.brandName')} className="h-8 w-8" width={32} height={32} loading="eager" decoding="async" />
            <span className="font-black text-lg cyber-glow">
              {t('header.brandName')}
            </span>
          </Link>

          {/* Center CTA Button - Desktop */}
          <Button
            onClick={() => setStartModalOpen(true)}
            className="hidden md:flex gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
          >
            <Sparkles className="h-4 w-4" />
            {t('header.startChangeNow')}
          </Button>

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
                  {/* Mobile CTA Button */}
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setStartModalOpen(true);
                    }}
                    className="w-full gap-2 bg-primary hover:bg-primary/90"
                  >
                    <Sparkles className="h-4 w-4" />
                    {t('header.startChangeNow')}
                  </Button>

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

      <StartChangeModal open={startModalOpen} onOpenChange={setStartModalOpen} />
    </>
  );
};

export default Header;