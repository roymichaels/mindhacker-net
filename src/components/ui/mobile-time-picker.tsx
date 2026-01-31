/**
 * Mobile-style time picker with scrollable wheels
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface MobileTimePickerProps {
  value?: string; // Format: "HH:MM" e.g. "03:00"
  onChange: (time: string) => void;
  label?: string;
  placeholder?: string;
  minHour?: number;
  maxHour?: number;
  minuteStep?: number;
  disabled?: boolean;
  className?: string;
  showVaries?: boolean;
  variesLabel?: string;
  isVaries?: boolean;
  onVariesChange?: (isVaries: boolean) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export function MobileTimePicker({
  value,
  onChange,
  label,
  placeholder = "בחר שעה",
  minHour = 0,
  maxHour = 23,
  minuteStep = 15,
  disabled = false,
  className,
  showVaries = false,
  variesLabel = "משתנה",
  isVaries = false,
  onVariesChange,
}: MobileTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState(() => {
    if (value && value !== 'varies') {
      const [h] = value.split(':');
      return parseInt(h, 10);
    }
    return 7; // Default
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (value && value !== 'varies') {
      const [, m] = value.split(':');
      return parseInt(m, 10);
    }
    return 0;
  });

  const hours = Array.from(
    { length: maxHour - minHour + 1 },
    (_, i) => minHour + i
  );
  const minutes = Array.from(
    { length: 60 / minuteStep },
    (_, i) => i * minuteStep
  );

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  const scrollToSelected = useCallback(() => {
    if (hourRef.current) {
      const hourIndex = hours.indexOf(selectedHour);
      hourRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
    }
    if (minuteRef.current) {
      const minuteIndex = minutes.indexOf(selectedMinute);
      minuteRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
    }
  }, [selectedHour, selectedMinute, hours, minutes]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToSelected, 50);
    }
  }, [isOpen, scrollToSelected]);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, items: number[], setter: (val: number) => void) => {
    if (!ref.current) return;
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    setter(items[clampedIndex]);
  };

  const handleConfirm = () => {
    const timeStr = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onChange(timeStr);
    setIsOpen(false);
  };

  const formatDisplay = () => {
    if (isVaries) return variesLabel;
    if (!value || value === 'varies') return placeholder;
    return value;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-3 p-4 rounded-xl",
          "bg-card/50 border border-border/50 backdrop-blur-sm",
          "transition-all duration-200",
          "hover:border-primary/50 hover:bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-primary ring-2 ring-primary/20"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div className="text-start">
            {label && <p className="text-xs text-muted-foreground">{label}</p>}
            <p className={cn(
              "text-lg font-medium tabular-nums",
              (!value || value === 'varies') && !isVaries ? "text-muted-foreground" : "text-foreground"
            )}>
              {formatDisplay()}
            </p>
          </div>
        </div>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Picker Panel */}
          <div className="relative w-full max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ביטול
              </button>
              <span className="font-medium">{label || 'בחר שעה'}</span>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 text-primary font-medium hover:text-primary/80 transition-colors"
              >
                אישור
              </button>
            </div>

            {/* Varies Option */}
            {showVaries && (
              <div className="p-4 border-b border-border">
                <button
                  onClick={() => {
                    onVariesChange?.(!isVaries);
                    if (!isVaries) {
                      onChange('varies');
                      setIsOpen(false);
                    }
                  }}
                  className={cn(
                    "w-full p-3 rounded-xl text-center transition-all",
                    isVaries 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted/50 hover:bg-muted text-muted-foreground"
                  )}
                >
                  {variesLabel}
                </button>
              </div>
            )}

            {/* Time Wheels */}
            {!isVaries && (
              <div className="flex items-center justify-center p-4 gap-4">
                {/* Hours Wheel */}
                <div className="relative">
                  <div 
                    ref={hourRef}
                    onScroll={() => handleScroll(hourRef, hours, setSelectedHour)}
                    className="h-[220px] w-20 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
                    style={{ scrollSnapType: 'y mandatory' }}
                  >
                    {/* Padding for centering */}
                    <div style={{ height: ITEM_HEIGHT * 2 }} />
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className={cn(
                          "h-[44px] flex items-center justify-center text-2xl tabular-nums snap-center transition-all",
                          hour === selectedHour 
                            ? "text-foreground font-bold scale-110" 
                            : "text-muted-foreground/50"
                        )}
                        onClick={() => {
                          setSelectedHour(hour);
                          if (hourRef.current) {
                            const index = hours.indexOf(hour);
                            hourRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
                          }
                        }}
                      >
                        {String(hour).padStart(2, '0')}
                      </div>
                    ))}
                    <div style={{ height: ITEM_HEIGHT * 2 }} />
                  </div>
                  {/* Selection highlight */}
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[44px] border-t-2 border-b-2 border-primary/30 pointer-events-none rounded-lg bg-primary/5" />
                </div>

                {/* Separator */}
                <span className="text-3xl font-bold text-muted-foreground">:</span>

                {/* Minutes Wheel */}
                <div className="relative">
                  <div 
                    ref={minuteRef}
                    onScroll={() => handleScroll(minuteRef, minutes, setSelectedMinute)}
                    className="h-[220px] w-20 overflow-y-auto scrollbar-hide snap-y snap-mandatory"
                    style={{ scrollSnapType: 'y mandatory' }}
                  >
                    <div style={{ height: ITEM_HEIGHT * 2 }} />
                    {minutes.map((minute) => (
                      <div
                        key={minute}
                        className={cn(
                          "h-[44px] flex items-center justify-center text-2xl tabular-nums snap-center transition-all",
                          minute === selectedMinute 
                            ? "text-foreground font-bold scale-110" 
                            : "text-muted-foreground/50"
                        )}
                        onClick={() => {
                          setSelectedMinute(minute);
                          if (minuteRef.current) {
                            const index = minutes.indexOf(minute);
                            minuteRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
                          }
                        }}
                      >
                        {String(minute).padStart(2, '0')}
                      </div>
                    ))}
                    <div style={{ height: ITEM_HEIGHT * 2 }} />
                  </div>
                  <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[44px] border-t-2 border-b-2 border-primary/30 pointer-events-none rounded-lg bg-primary/5" />
                </div>
              </div>
            )}

            {/* Safe area padding for mobile */}
            <div className="h-6 sm:h-4" />
          </div>
        </div>
      )}
    </div>
  );
}
