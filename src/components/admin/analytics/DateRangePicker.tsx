import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronDown, RefreshCw, Download } from "lucide-react";

export type DateRange = "7d" | "30d" | "90d" | "custom";

interface DateRangePickerProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  onRefresh?: () => void;
  onExport?: (format: "csv" | "pdf") => void;
  isLoading?: boolean;
}

const DateRangePicker = ({ 
  selectedRange, 
  onRangeChange, 
  onRefresh,
  onExport,
  isLoading 
}: DateRangePickerProps) => {
  const rangeLabels: Record<DateRange, string> = {
    "7d": "7 ימים",
    "30d": "30 יום",
    "90d": "90 יום",
    "custom": "מותאם אישית",
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Date Range Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            {rangeLabels[selectedRange]}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onRangeChange("7d")}>
            7 ימים אחרונים
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRangeChange("30d")}>
            30 יום אחרונים
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onRangeChange("90d")}>
            90 יום אחרונים
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Refresh Button */}
      {onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      )}

      {/* Export Button */}
      {onExport && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              ייצוא
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport("csv")}>
              ייצוא ל-CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport("pdf")}>
              ייצוא ל-PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};

export default DateRangePicker;
