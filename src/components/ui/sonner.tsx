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
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "group-[.toaster]:!bg-destructive group-[.toaster]:!text-destructive-foreground group-[.toaster]:!border-destructive/50",
          success: "group-[.toaster]:!bg-primary/15 group-[.toaster]:!text-foreground group-[.toaster]:!border-primary/30 dark:group-[.toaster]:!bg-primary/20",
          warning: "group-[.toaster]:!bg-amber-500/15 group-[.toaster]:!text-foreground group-[.toaster]:!border-amber-500/30 dark:group-[.toaster]:!bg-amber-500/20",
          info: "group-[.toaster]:!bg-blue-500/15 group-[.toaster]:!text-foreground group-[.toaster]:!border-blue-500/30 dark:group-[.toaster]:!bg-blue-500/20",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
