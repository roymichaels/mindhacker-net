import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus } from "lucide-react";

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      toast({
        title: "שגיאה",
        description: "עליך לאשר את התנאים וההגבלות",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "שגיאה",
        description: "הסיסמאות אינן תואמות",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "שגיאה ברישום",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data.user) {
      toast({
        title: "חשבון נוצר בהצלחה!",
        description: "ברוך הבא ל-Consciousness Hacker",
      });

      const redirect = searchParams.get("redirect");
      if (redirect === "/checkout") {
        const packageParam = searchParams.get("package");
        navigate(packageParam ? `/checkout?package=${packageParam}` : "/checkout");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="glass-panel p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <UserPlus className="h-12 w-12 text-primary cyber-glow" />
            </div>
            <h1 className="text-3xl font-black cyber-glow">הרשמה</h1>
            <p className="text-muted-foreground">
              צור חשבון חדש כדי להתחיל את המסע שלך
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">שם מלא</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="הכנס שם מלא"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input
                id="password"
                type="password"
                placeholder="לפחות 6 תווים"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">אימות סיסמה</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="הכנס סיסמה שוב"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeTerms: checked as boolean })
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal cursor-pointer"
              >
                אני מסכים לתנאים וההגבלות
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  יוצר חשבון...
                </>
              ) : (
                "הרשם"
              )}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              יש לך כבר חשבון?{" "}
              <Link
                to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
                className="text-primary hover:underline font-medium"
              >
                התחבר
              </Link>
            </p>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground block"
            >
              חזור לעמוד הראשי
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
