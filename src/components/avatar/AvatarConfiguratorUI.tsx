/**
 * AvatarConfiguratorUI — Sidebar with 3 vertical columns:
 * Column 1: Category list (narrow)
 * Column 2: Asset grid + color palette for selected category
 */

import { useState } from "react";
import { useConfiguratorStore } from "./avatarStore";
import { ChevronLeft, ChevronRight, Shuffle, Save, X } from "lucide-react";
import { AssetTilePreview } from "./AssetTilePreview";

interface AvatarConfiguratorUIProps {
  onSave?: () => void;
  showSaveButton?: boolean;
}

export const AvatarConfiguratorUI = ({ onSave, showSaveButton }: AvatarConfiguratorUIProps) => {
  const loading = useConfiguratorStore((state) => state.loading);
  const randomize = useConfiguratorStore((state) => state.randomize);
  const {
    categories,
    currentCategory,
    setCurrentCategory,
    changeAsset,
    customization,
    lockedGroups,
    updateColor,
  } = useConfiguratorStore();
  

  const hasColors = currentCategory?.colorPalette && currentCategory.colorPalette.length > 0;

  // Hebrew labels for categories
  const categoryLabels: Record<string, string> = {
    Head: "ראש",
    Hair: "שיער",
    Face: "פנים",
    Eyes: "עיניים",
    Eyebrow: "גבות",
    Nose: "אף",
    "Facial Hair": "זקן",
    Top: "חולצה",
    Bottom: "מכנסיים",
    Shoes: "נעליים",
    Glasses: "משקפיים",
    Hat: "כובע",
    Earring: "עגיל",
    Bow: "פפיון",
    Outfit: "תלבושת",
  };

  return (
    <div className="pointer-events-none fixed z-10 inset-0 select-none">
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 bg-background z-20 pointer-events-none transition-opacity duration-1000 ${
          loading ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom bar: Save + Randomize */}
      <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        <button
          className="rounded-2xl bg-primary hover:bg-primary/90 transition-colors text-primary-foreground p-3 shadow-lg"
          onClick={randomize}
          title="אקראי"
        >
          <Shuffle className="w-5 h-5" />
        </button>
        {showSaveButton && onSave && (
          <button
            className="rounded-2xl bg-primary hover:bg-primary/90 transition-colors text-primary-foreground font-medium px-6 py-3 text-sm flex items-center gap-2 shadow-lg"
            onClick={onSave}
          >
            <Save className="w-4 h-4" />
            שמירה
          </button>
        )}
      </div>

      {/* Sidebar */}
      <div
        className="pointer-events-auto absolute right-0 top-0 bottom-0 z-10 flex"
      >

        {/* Column 1: Categories */}
        <div className="w-20 h-full bg-card/90 backdrop-blur-xl border-r border-border flex flex-col overflow-y-auto noscrollbar py-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(category)}
              className={`px-2 py-3 text-[11px] font-medium text-center transition-all duration-200 border-r-2 ${
                currentCategory?.name === category.name
                  ? "bg-primary/10 text-primary border-r-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted border-r-transparent"
              }`}
            >
              {categoryLabels[category.name] || category.name}
            </button>
          ))}
        </div>

        {/* Column 2: Assets + Colors */}
        <div className="w-56 h-full bg-card/80 backdrop-blur-xl border-r border-border flex flex-col overflow-hidden">
          {currentCategory && (
            <>
              <div className="px-3 pt-3 pb-1 shrink-0">
                <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">
                  {categoryLabels[currentCategory.name] || currentCategory.name}
                </p>
              </div>

              {lockedGroups[currentCategory.name] && (
                <p className="text-destructive text-[10px] px-3 pb-1">
                  מוסתר על ידי{" "}
                  {lockedGroups[currentCategory.name]
                    .map((a) => `${a.name}`)
                    .join(", ")}
                </p>
              )}

              {hasColors && (
                <div className="px-3 pb-2 shrink-0">
                  <p className="text-muted-foreground text-[9px] uppercase tracking-wider font-semibold mb-1.5">
                    צבע
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCategory.colorPalette!.map((color, i) => (
                      <button
                        key={`${i}-${color}`}
                        className={`w-7 h-7 p-0.5 rounded-lg shrink-0 transition-all duration-200 border-2 ${
                          customization[currentCategory.name]?.color === color
                            ? "border-primary scale-110"
                            : "border-transparent hover:border-primary/40"
                        }`}
                        onClick={() => updateColor(color)}
                      >
                        <div className="w-full h-full rounded-md" style={{ backgroundColor: color }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto noscrollbar px-2 pb-3">
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {currentCategory.removable && (
                    <button
                      onClick={() => changeAsset(currentCategory.name, null)}
                      className={`flex flex-col items-center gap-1 rounded-xl overflow-hidden transition-all border-2 duration-200 p-1.5 ${
                        !customization[currentCategory.name]?.asset
                          ? "border-primary bg-primary/10"
                          : "bg-muted border-transparent hover:border-primary/30"
                      }`}
                    >
                      <div className="w-full aspect-square flex items-center justify-center text-muted-foreground bg-card/70 rounded-lg">
                        <X className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center">ללא</span>
                    </button>
                  )}

                  {currentCategory.assets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => changeAsset(currentCategory.name, asset)}
                      className={`flex flex-col items-center gap-1 rounded-xl overflow-hidden transition-all border-2 duration-200 p-1.5 ${
                        customization[currentCategory.name]?.asset?.id === asset.id
                          ? "border-primary bg-primary/10"
                          : "bg-muted border-transparent hover:border-primary/30"
                      }`}
                    >
                      <div className="w-full aspect-square overflow-hidden rounded-lg bg-card/70">
                        <AssetTilePreview
                          assetUrl={asset.url}
                          category={currentCategory}
                          assetColor={customization[currentCategory.name]?.color}
                          skinColor={customization.Head?.color}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                        {asset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
