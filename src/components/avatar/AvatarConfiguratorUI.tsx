/**
 * AvatarConfiguratorUI — Sidebar-based customization panel.
 * Categories listed vertically on the left, assets + colors in a side panel.
 */

import { useState } from "react";
import { useConfiguratorStore } from "./avatarStore";
import { ChevronLeft, ChevronRight, Shuffle, X } from "lucide-react";

const CategoryList = () => {
  const { categories, currentCategory, setCurrentCategory } = useConfiguratorStore();

  return (
    <div className="flex flex-col gap-1 py-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setCurrentCategory(category)}
          className={`text-left px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg mx-2 ${
            currentCategory?.name === category.name
              ? "bg-white/20 text-white"
              : "text-gray-300 hover:text-white hover:bg-white/10"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

const AssetGrid = () => {
  const { currentCategory, changeAsset, customization, lockedGroups } = useConfiguratorStore();

  if (!currentCategory) return null;

  return (
    <div className="flex flex-col gap-3 px-3">
      <h3 className="text-white font-semibold text-sm px-1">{currentCategory.name}</h3>

      {lockedGroups[currentCategory.name] && (
        <p className="text-red-400 text-xs px-1">
          Hidden by{" "}
          {lockedGroups[currentCategory.name]
            .map((a) => `${a.name} (${a.categoryName})`)
            .join(", ")}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        {currentCategory.removable && (
          <button
            onClick={() => changeAsset(currentCategory.name, null)}
            className={`aspect-square rounded-xl overflow-hidden pointer-events-auto transition-all border-2 duration-300 bg-gradient-to-tr ${
              !customization[currentCategory.name]?.asset
                ? "border-white from-white/20 to-white/30"
                : "from-black/70 to-black/20 border-black/50"
            }`}
          >
            <div className="w-full h-full flex items-center justify-center bg-black/40 text-white">
              <X className="w-6 h-6" />
            </div>
          </button>
        )}
        {currentCategory.assets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => changeAsset(currentCategory.name, asset)}
            className={`aspect-square rounded-xl overflow-hidden pointer-events-auto transition-all border-2 duration-300 bg-gradient-to-tr ${
              customization[currentCategory.name]?.asset?.id === asset.id
                ? "border-white from-white/20 to-white/30"
                : "from-black/70 to-black/20 border-black/50"
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
  );
};

const ColorPicker = () => {
  const updateColor = useConfiguratorStore((state) => state.updateColor);
  const currentCategory = useConfiguratorStore((state) => state.currentCategory);
  const customization = useConfiguratorStore((state) => state.customization);

  if (!currentCategory || !customization[currentCategory.name]?.asset || !currentCategory.colorPalette) {
    return null;
  }

  return (
    <div className="px-3">
      <h4 className="text-white/70 text-xs font-medium mb-2 px-1">Color</h4>
      <div className="flex flex-wrap gap-1.5">
        {currentCategory.colorPalette.map((color, index) => (
          <button
            key={`${index}-${color}`}
            className={`w-8 h-8 p-1 rounded-lg overflow-hidden transition-all duration-300 border-2 ${
              customization[currentCategory.name]?.color === color
                ? "border-white"
                : "border-transparent"
            }`}
            onClick={() => updateColor(color)}
          >
            <div
              className="w-full h-full rounded-md"
              style={{ backgroundColor: color }}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

interface AvatarConfiguratorUIProps {
  onSave?: () => void;
  showSaveButton?: boolean;
}

export const AvatarConfiguratorUI = ({ onSave, showSaveButton }: AvatarConfiguratorUIProps) => {
  const loading = useConfiguratorStore((state) => state.loading);
  const randomize = useConfiguratorStore((state) => state.randomize);
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
          className="self-center -ml-0 w-10 h-16 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-l-xl text-white hover:bg-black/60 transition-colors"
        >
          {collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Panel */}
        <div className="w-72 h-full bg-gradient-to-b from-black/60 to-indigo-950/60 backdrop-blur-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-white font-bold text-lg">Customize</h2>
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors duration-300 text-white p-2 drop-shadow-md"
                onClick={randomize}
                title="Randomize"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              {showSaveButton && onSave && (
                <button
                  className="rounded-lg bg-green-500 hover:bg-green-600 transition-colors duration-300 text-white font-medium px-4 py-2 text-sm drop-shadow-md"
                  onClick={onSave}
                >
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto noscrollbar">
            {/* Categories */}
            <div className="border-b border-white/10">
              <CategoryList />
            </div>

            {/* Color picker */}
            <div className="py-3">
              <ColorPicker />
            </div>

            {/* Asset grid */}
            <div className="pb-6">
              <AssetGrid />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
