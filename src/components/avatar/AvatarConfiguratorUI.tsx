/**
 * AvatarConfiguratorUI — Sidebar with 3 vertical columns:
 * Column 1: Category list (narrow)
 * Column 2: Asset grid for selected category
 * Column 3: Color palette for selected category
 */

import { useState } from "react";
import { useConfiguratorStore } from "./avatarStore";
import { ChevronLeft, ChevronRight, Shuffle, X } from "lucide-react";

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
  const [collapsed, setCollapsed] = useState(false);

  const hasColors = currentCategory?.colorPalette && customization[currentCategory.name]?.asset;

  return (
    <div className="pointer-events-none fixed z-10 inset-0 select-none">
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 bg-black z-20 pointer-events-none transition-opacity duration-1000 ${
          loading ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Top bar: Save + Randomize */}
      <div className="pointer-events-auto absolute top-4 right-4 z-10 flex gap-2">
        <button
          className="rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors text-white p-2.5"
          onClick={randomize}
          title="Randomize"
        >
          <Shuffle className="w-5 h-5" />
        </button>
        {showSaveButton && onSave && (
          <button
            className="rounded-lg bg-green-500 hover:bg-green-600 transition-colors text-white font-medium px-5 py-2.5 text-sm"
            onClick={onSave}
          >
            Save
          </button>
        )}
      </div>

      {/* Sidebar: 3 vertical columns */}
      <div
        className={`pointer-events-auto absolute right-0 top-0 bottom-0 z-10 flex transition-transform duration-300 ${
          collapsed ? "translate-x-[calc(100%-32px)]" : "translate-x-0"
        }`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="self-center w-8 h-14 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-l-lg text-white hover:bg-black/70 transition-colors"
        >
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Column 1: Categories */}
        <div className="w-20 h-full bg-black/50 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-y-auto noscrollbar py-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(category)}
              className={`px-2 py-3 text-[11px] font-medium text-center transition-all duration-200 border-r-2 ${
                currentCategory?.name === category.name
                  ? "bg-white/15 text-white border-r-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border-r-transparent"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Column 2: Assets */}
        <div className="w-48 h-full bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col overflow-hidden">
          {currentCategory && (
            <>
              <div className="px-3 pt-3 pb-1 shrink-0">
                <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold">
                  {currentCategory.name}
                </p>
              </div>

              {lockedGroups[currentCategory.name] && (
                <p className="text-red-400 text-[10px] px-3 pb-1">
                  Hidden by{" "}
                  {lockedGroups[currentCategory.name]
                    .map((a) => `${a.name}`)
                    .join(", ")}
                </p>
              )}

              <div className="flex-1 overflow-y-auto noscrollbar px-2 pb-3">
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {currentCategory.removable && (
                    <button
                      onClick={() => changeAsset(currentCategory.name, null)}
                      className={`aspect-square rounded-lg overflow-hidden transition-all border-2 duration-200 bg-gradient-to-tr ${
                        !customization[currentCategory.name]?.asset
                          ? "border-white from-white/20 to-white/30"
                          : "from-black/60 to-black/20 border-transparent hover:border-white/30"
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center bg-black/40 text-white">
                        <X className="w-4 h-4" />
                      </div>
                    </button>
                  )}
                  {currentCategory.assets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => changeAsset(currentCategory.name, asset)}
                      className={`aspect-square rounded-lg overflow-hidden transition-all border-2 duration-200 bg-gradient-to-tr ${
                        customization[currentCategory.name]?.asset?.id === asset.id
                          ? "border-white from-white/20 to-white/30"
                          : "from-black/60 to-black/20 border-transparent hover:border-white/30"
                      }`}
                    >
                      <img
                        className="object-cover w-full h-full"
                        src={asset.thumbnail}
                        alt={asset.name}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Column 3: Colors (only if palette exists) */}
        {hasColors && (
          <div className="w-12 h-full bg-black/30 backdrop-blur-xl flex flex-col items-center overflow-y-auto noscrollbar py-3 gap-1.5">
            {currentCategory!.colorPalette!.map((color, i) => (
              <button
                key={`${i}-${color}`}
                className={`w-8 h-8 p-0.5 rounded-md shrink-0 transition-all duration-200 border-2 ${
                  customization[currentCategory!.name]?.color === color
                    ? "border-white scale-110"
                    : "border-transparent hover:border-white/40"
                }`}
                onClick={() => updateColor(color)}
              >
                <div className="w-full h-full rounded" style={{ backgroundColor: color }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
