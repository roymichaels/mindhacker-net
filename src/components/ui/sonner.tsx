import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-none",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground group-[.toaster]:border-destructive",
          success: "group-[.toaster]:bg-emerald-950 group-[.toaster]:text-emerald-100 group-[.toaster]:border-emerald-800",
          warning: "group-[.toaster]:bg-amber-950 group-[.toaster]:text-amber-100 group-[.toaster]:border-amber-800",
          info: "group-[.toaster]:bg-blue-950 group-[.toaster]:text-blue-100 group-[.toaster]:border-blue-800",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
