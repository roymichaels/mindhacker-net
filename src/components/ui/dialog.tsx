import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean;
  }
>(({ className, children, hideCloseButton = false, ...props }, ref) => {
  const swipeHandlers = useSwipeable({
    onSwipedDown: (eventData) => {
      if (eventData.velocity > 0.5 && window.innerWidth < 640) {
        const closeButton = document.querySelector('[data-dialog-close]') as HTMLButtonElement;
        closeButton?.click();
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: false,
  });

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        {...swipeHandlers}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4",
          "border border-border/50 p-6 text-foreground",
          "bg-white dark:bg-gradient-to-br dark:from-gray-950 dark:via-gray-900 dark:to-gray-950",
          "shadow-2xl ring-1 ring-border/20 rounded-lg",
          "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "max-sm:max-w-[calc(100%-2rem)] max-sm:max-h-[calc(100%-2rem)]",
          className,
        )}
        {...props}
      >
        {children}
        {/* Hidden close button for swipe-to-close functionality */}
        {!hideCloseButton && (
          <DialogPrimitive.Close data-dialog-close className="sr-only">
            <span>Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface DialogHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  showBackArrow?: boolean;
  onBack?: () => void;
}

const DialogHeader = ({ className, title, icon, showBackArrow = true, onBack, children, ...props }: DialogHeaderProps) => {
  // Detect RTL from document direction
  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
  
  // If title is provided, use the new standardized layout
  if (title) {
    // In RTL: Back arrow (pointing left) on left, X on right
    // In LTR: X on left, Back arrow (pointing right) on right
    const BackArrowIcon = isRTL ? ArrowLeft : ArrowRight;
    
    return (
      <div 
        className={cn(
          "flex items-center justify-between gap-2 pb-4 border-b border-border/30",
          className
        )} 
        {...props}
      >
        {/* Start side - Close button (LTR) or Back arrow (RTL) */}
        {isRTL ? (
          showBackArrow ? (
            <button 
              onClick={onBack}
              className="p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <BackArrowIcon className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </button>
          ) : (
            <div className="w-9" />
          )
        ) : (
          <DialogPrimitive.Close 
            data-dialog-close
            className="p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}

        {/* Center - Title with optional icon */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          {icon && <span className="text-primary">{icon}</span>}
          <DialogPrimitive.Title className="text-lg font-semibold leading-none tracking-tight">
            {title}
          </DialogPrimitive.Title>
        </div>

        {/* End side - Back arrow (LTR) or Close button (RTL) */}
        {isRTL ? (
          <DialogPrimitive.Close 
            data-dialog-close
            className="p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : (
          showBackArrow ? (
            <button 
              onClick={onBack}
              className="p-2 rounded-full opacity-70 hover:opacity-100 hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <BackArrowIcon className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </button>
          ) : (
            <div className="w-9" />
          )
        )}
      </div>
    );
  }

  // Legacy fallback - original behavior for backward compatibility
  return (
    <div 
      className={cn(
        "relative flex flex-col space-y-1.5 text-center sm:text-start",
        className
      )} 
      {...props}
    >
      {/* Close button positioned at start (left in LTR, right in RTL) */}
      <DialogPrimitive.Close 
        data-dialog-close
        className="absolute start-0 top-0 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
      {children}
    </div>
  );
};
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
