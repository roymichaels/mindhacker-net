/**
 * AvatarConfiguratorUI — Sidebar-based customization panel.
 * Categories, colors, and assets all in a single vertical sidebar.
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

  return (
    <div className="pointer-events-none fixed z-10 inset-0 select-none">
      {/* Loading overlay */}
      <div
        className={`absolute inset-0 bg-black z-20 pointer-events-none flex items-center justify-center transition-opacity duration-1000 ${
          loading ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Sidebar */}
      <div
        className={`pointer-events-auto absolute right-0 top-0 bottom-0 z-10 flex transition-transform duration-300 ${
          collapsed ? "translate-x-[calc(100%-40px)]" : "translate-x-0"
        }`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="self-center w-10 h-16 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-l-xl text-white hover:bg-black/60 transition-colors"
        >
          {collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Panel */}
        <div className="w-72 h-full bg-gradient-to-b from-black/60 to-indigo-950/60 backdrop-blur-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10 shrink-0">
            <h2 className="text-white font-bold text-base">Customize</h2>
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors text-white p-2"
                onClick={randomize}
                title="Randomize"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              {showSaveButton && onSave && (
                <button
                  className="rounded-lg bg-green-500 hover:bg-green-600 transition-colors text-white font-medium px-4 py-2 text-sm"
                  onClick={onSave}
                >
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Single scrollable area: categories → colors → assets */}
          <div className="flex-1 overflow-y-auto noscrollbar py-2 flex flex-col gap-1">
            {/* Category tabs - horizontal scrollable row */}
            <div className="flex gap-1 overflow-x-auto noscrollbar px-3 pb-2 shrink-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCurrentCategory(category)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                    currentCategory?.name === category.name
                      ? "bg-white/20 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="h-px bg-white/10 mx-3 shrink-0" />

            {/* Locked warning */}
            {currentCategory && lockedGroups[currentCategory.name] && (
              <p className="text-red-400 text-xs px-3 py-1">
                Hidden by{" "}
                {lockedGroups[currentCategory.name]
                  .map((a) => `${a.name} (${a.categoryName})`)
                  .join(", ")}
              </p>
            )}

            {/* Color palette */}
            {currentCategory?.colorPalette && customization[currentCategory.name]?.asset && (
              <div className="px-3 py-2 shrink-0">
                <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold mb-1.5">Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentCategory.colorPalette.map((color, i) => (
                    <button
                      key={`${i}-${color}`}
                      className={`w-7 h-7 p-0.5 rounded-md transition-all duration-200 border-2 ${
                        customization[currentCategory.name]?.color === color
                          ? "border-white scale-110"
                          : "border-transparent hover:border-white/40"
                      }`}
                      onClick={() => updateColor(color)}
                    >
                      <div className="w-full h-full rounded" style={{ backgroundColor: color }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Assets grid */}
            {currentCategory && (
              <div className="px-3 py-2">
                <p className="text-white/50 text-[10px] uppercase tracking-wider font-semibold mb-1.5">
                  {currentCategory.name}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {currentCategory.removable && (
                    <button
                      onClick={() => changeAsset(currentCategory.name, null)}
                      className={`aspect-square rounded-xl overflow-hidden transition-all border-2 duration-200 bg-gradient-to-tr ${
                        !customization[currentCategory.name]?.asset
                          ? "border-white from-white/20 to-white/30"
                          : "from-black/70 to-black/20 border-black/50 hover:border-white/30"
                      }`}
                    >
                      <div className="w-full h-full flex items-center justify-center bg-black/40 text-white">
                        <X className="w-5 h-5" />
                      </div>
                    </button>
                  )}
                  {currentCategory.assets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => changeAsset(currentCategory.name, asset)}
                      className={`aspect-square rounded-xl overflow-hidden transition-all border-2 duration-200 bg-gradient-to-tr ${
                        customization[currentCategory.name]?.asset?.id === asset.id
                          ? "border-white from-white/20 to-white/30"
                          : "from-black/70 to-black/20 border-black/50 hover:border-white/30"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
