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
import { Brain, LogOut, Menu, Settings, ShoppingBag, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/lib/errorHandling";

const Header = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
        handleError(error, "לא ניתן לבדוק הרשאות", "Header");
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "התנתקת בהצלחה",
      description: "להתראות!",
    });
    navigate("/");
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Brain className="h-6 w-6 text-primary cyber-glow" />
          <span className="font-black text-lg cyber-glow">
            MIND-HACKER
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={() => scrollToSection("what")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            מה זה
          </button>
          <button
            onClick={() => scrollToSection("how")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            איך זה עובד
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            מחירים
          </button>
          <button
            onClick={() => navigate("/courses")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            מוצרים דיגיטליים
          </button>
          <button
            onClick={() => navigate("/subscriptions")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            מנויים
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            שאלות נפוצות
          </button>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded" />
          ) : user ? (
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">חשבון</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              <ShoppingBag className="ml-2 h-4 w-4" />
              דאשבורד
            </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Settings className="ml-2 h-4 w-4" />
                    פאנל ניהול
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  התנתק
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex"
              >
                התחבר
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/signup")}
              >
                הרשמה
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
            <SheetContent side="right" dir="rtl">
              <SheetHeader>
                <SheetTitle>תפריט ניווט</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <button
                  onClick={() => scrollToSection("what")}
                  className="text-right text-sm font-medium hover:text-primary transition-colors"
                >
                  מה זה
                </button>
                <button
                  onClick={() => scrollToSection("how")}
                  className="text-right text-sm font-medium hover:text-primary transition-colors"
                >
                  איך זה עובד
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-right text-sm font-medium hover:text-primary transition-colors"
                >
                  מחירים
                </button>
                <button
                  onClick={() => {
                    navigate("/courses");
                    setMobileMenuOpen(false);
                  }}
                  className="text-right text-sm font-medium hover:text-primary transition-colors"
                >
                  מוצרים דיגיטליים
                </button>
                <button
                  onClick={() => {
                    navigate("/subscriptions");
                    setMobileMenuOpen(false);
                  }}
                  className="text-right text-sm font-medium hover:text-primary transition-colors"
                >
                  מנויים
                </button>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-right text-sm font-medium hover:text-primary transition-colors"
                >
                  שאלות נפוצות
                </button>

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
                      <ShoppingBag className="ml-2 h-4 w-4" />
                      דאשבורד
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
                        <Settings className="ml-2 h-4 w-4" />
                        פאנל ניהול
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
                      <LogOut className="ml-2 h-4 w-4" />
                      התנתק
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
                      התחבר
                    </Button>
                    <Button
                      onClick={() => {
                        navigate("/signup");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      הרשמה
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
