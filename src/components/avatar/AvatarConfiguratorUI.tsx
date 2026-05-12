import { useEffect, useState } from "react";
import { ChevronUp, Download, Save, Shuffle, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/useTranslation";
import { useCommunityUsername } from "@/hooks/useCommunityUsername";
import { useIsMobile } from "@/hooks/use-mobile";
import { useConfiguratorStore } from "./avatarStore";
import { AssetTilePreview } from "./AssetTilePreview";
import { toast } from "sonner";

interface AvatarConfiguratorUIProps {
  onSave?: () => void | Promise<void>;
  showSaveButton?: boolean;
}

export const AvatarConfiguratorUI = ({ onSave, showSaveButton }: AvatarConfiguratorUIProps) => {
  const { language } = useTranslation();
  const isHe = language === "he";
  const isMobile = useIsMobile();
  const loading = useConfiguratorStore((state) => state.loading);
  const randomize = useConfiguratorStore((state) => state.randomize);
  const { username, setUsername } = useCommunityUsername();
  const {
    categories,
    currentCategory,
    setCurrentCategory,
    changeAsset,
    customization,
    lockedGroups,
    updateColor,
  } = useConfiguratorStore();

  const [usernameInput, setUsernameInput] = useState("");
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const [usernameOpen, setUsernameOpen] = useState(false);

  useEffect(() => {
    if (username && !usernameInput) {
      setUsernameInput(username);
    }
  }, [username, usernameInput]);

  const hasColors = currentCategory?.colorPalette && currentCategory.colorPalette.length > 0;
  const normalizedUsername = usernameInput.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
  const usernameChanged = normalizedUsername !== (username || "");
  const usernameIsValid = normalizedUsername.length >= 3 && normalizedUsername.length <= 20;

  const categoryLabels: Record<string, string> = {
    Head: "ראש",
    Hair: "שיער",
    Face: "פנים",
    Eyes: "עיניים",
    Eyebrow: "גבות",
    Nose: "אף",
    "Facial Hair": "זקן",
    Top: "עליון",
    Bottom: "תחתון",
    Shoes: "נעליים",
    Glasses: "משקפיים",
    Hat: "כובע",
    Earring: "עגיל",
    Bow: "פפיון",
    Outfit: "לבוש",
  };

  const handleSave = async () => {
    if (usernameChanged) {
      if (!usernameIsValid) {
        toast.error(isHe ? "שם המשתמש חייב להכיל 3-20 תווים" : "Username must be 3-20 characters");
        return;
      }

      try {
        await setUsername.mutateAsync(normalizedUsername);
      } catch (err: any) {
        toast.error(err?.message || (isHe ? "שגיאה בשמירת שם המשתמש" : "Failed to save username"));
        return;
      }
    }

    await onSave?.();
  };

  const downloadAvatar = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.setAttribute("download", `avatar-${Date.now()}.png`);
    link.setAttribute("href", canvas.toDataURL("image/png"));
    link.click();
  };

  const usernameCard = (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {isHe ? "קהילה" : "Community"}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {isHe ? "שם משתמש" : "Username"}
          </p>
        </div>
      </div>
      <Input
        value={usernameInput}
        onChange={(e) =>
          setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))
        }
        placeholder="your_username"
        dir="ltr"
        className="h-10 bg-card"
      />
      <p className="mt-2 text-[10px] text-muted-foreground">
        {isHe
          ? "השם הזה יופיע בקהילה, בדירוגים ובפרופיל שלך."
          : "This name will appear in community threads, rankings, and your profile."}
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <div className="pointer-events-none fixed inset-0 z-10 select-none" dir={isHe ? "rtl" : "ltr"}>
        <div
          className={`absolute inset-0 z-20 bg-background pointer-events-none transition-opacity duration-1000 ${
            loading ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Top username chip */}
        <div className="pointer-events-auto absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2">
          <button
            onClick={() => setUsernameOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-xl"
          >
            <User className="h-3.5 w-3.5 text-primary" />
            <span className="max-w-[140px] truncate" dir="ltr">
              {usernameInput || (isHe ? "שם משתמש" : "username")}
            </span>
          </button>
          {showSaveButton && onSave && (
            <button
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg disabled:opacity-60"
              onClick={() => void handleSave()}
              disabled={setUsername.isPending || (!username && !usernameIsValid)}
            >
              <Save className="h-3.5 w-3.5" />
              {setUsername.isPending ? "..." : isHe ? "שמירה" : "Save"}
            </button>
          )}
        </div>

        {/* Username editor popover */}
        {usernameOpen && (
          <div className="pointer-events-auto absolute top-14 inset-x-3 z-30 rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl">
            {usernameCard}
          </div>
        )}

        {/* Floating action dock (randomize / download) */}
        <div className="pointer-events-auto absolute bottom-[calc(var(--sheet-h,42vh)+12px)] inset-x-0 z-20 flex justify-center gap-3 transition-all">
          <button
            className="rounded-full bg-secondary/90 p-3 text-secondary-foreground shadow-lg backdrop-blur-xl"
            onClick={randomize}
            title={isHe ? "ערבוב" : "Randomize"}
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            className="rounded-full bg-secondary/90 p-3 text-secondary-foreground shadow-lg backdrop-blur-xl"
            onClick={downloadAvatar}
            title={isHe ? "הורדה" : "Download"}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom sheet */}
        <div
          className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-3xl border-t border-border bg-card/95 backdrop-blur-xl shadow-2xl transition-[height] duration-300 ease-out"
          style={{
            height: sheetExpanded ? "62vh" : "112px",
            paddingBottom: "env(safe-area-inset-bottom)",
            // expose height for action dock positioning
            ['--sheet-h' as any]: sheetExpanded ? "62vh" : "112px",
          }}
        >
          {/* Drag handle */}
          <button
            onClick={() => setSheetExpanded((v) => !v)}
            className="mx-auto mt-2 mb-1 flex h-6 w-full items-center justify-center"
            aria-label={sheetExpanded ? "Collapse" : "Expand"}
          >
            <span className="block h-1.5 w-12 rounded-full bg-muted-foreground/40" />
          </button>

          {/* Category tabs (horizontal) */}
          <div className="shrink-0 overflow-x-auto noscrollbar">
            <div className="flex min-w-max gap-1.5 px-3 pb-2">
              {categories.map((category) => {
                const active = currentCategory?.name === category.name;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setCurrentCategory(category);
                      setSheetExpanded(true);
                    }}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-all ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {categoryLabels[category.name] || category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {currentCategory && sheetExpanded && (
            <>
              {lockedGroups[currentCategory.name] && (
                <p className="px-4 pb-1 text-[10px] text-destructive">
                  {isHe ? "חסום עם" : "Locked with"}{" "}
                  {lockedGroups[currentCategory.name].map((asset) => asset.name).join(", ")}
                </p>
              )}

              {hasColors && (
                <div className="shrink-0 px-3 pb-2">
                  <div className="flex gap-1.5 overflow-x-auto noscrollbar">
                    {currentCategory.colorPalette!.map((color, i) => (
                      <button
                        key={`${i}-${color}`}
                        onClick={() => updateColor(color)}
                        className={`h-8 w-8 shrink-0 rounded-lg border-2 p-0.5 transition-all ${
                          customization[currentCategory.name]?.color === color
                            ? "scale-110 border-primary"
                            : "border-transparent"
                        }`}
                      >
                        <div className="h-full w-full rounded-md" style={{ backgroundColor: color }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-3 pb-4 noscrollbar">
                <div className="grid grid-cols-3 gap-2">
                  {currentCategory.removable && (
                    <button
                      onClick={() => changeAsset(currentCategory.name, null)}
                      className={`flex flex-col items-center gap-1 overflow-hidden rounded-2xl border-2 p-1.5 transition-all ${
                        !customization[currentCategory.name]?.asset
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-muted"
                      }`}
                    >
                      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-card/70 text-muted-foreground">
                        <X className="h-4 w-4" />
                      </div>
                      <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                        {isHe ? "ללא" : "None"}
                      </span>
                    </button>
                  )}

                  {currentCategory.assets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => changeAsset(currentCategory.name, asset)}
                      className={`flex flex-col items-center gap-1 overflow-hidden rounded-2xl border-2 p-1.5 transition-all ${
                        customization[currentCategory.name]?.asset?.id === asset.id
                          ? "border-primary bg-primary/10"
                          : "border-transparent bg-muted"
                      }`}
                    >
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-card/70">
                        <AssetTilePreview
                          assetUrl={asset.url}
                          category={currentCategory}
                          assetColor={customization[currentCategory.name]?.color}
                          skinColor={customization.Head?.color}
                          thumbnail={asset.thumbnail}
                        />
                      </div>
                      <span className="w-full truncate text-center text-[10px] text-muted-foreground">{asset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {!sheetExpanded && (
            <button
              onClick={() => setSheetExpanded(true)}
              className="pointer-events-auto absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary"
            >
              <ChevronUp className="h-3 w-3" />
              {isHe ? "פתח" : "Expand"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-10 select-none">
      <div
        className={`absolute inset-0 z-20 bg-background pointer-events-none transition-opacity duration-1000 ${
          loading ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="pointer-events-auto absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-3">
        <button
          className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
          onClick={randomize}
          title={isHe ? "ערבוב" : "Randomize"}
        >
          <Shuffle className="h-5 w-5" />
        </button>
        <button
          className="rounded-2xl bg-secondary p-3 text-secondary-foreground shadow-lg transition-colors hover:bg-secondary/90"
          onClick={downloadAvatar}
          title={isHe ? "הורדה" : "Download"}
        >
          <Download className="h-5 w-5" />
        </button>
        {showSaveButton && onSave && (
          <button
            className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => {
              void handleSave();
            }}
            disabled={setUsername.isPending || (!username && !usernameIsValid)}
          >
            <Save className="h-4 w-4" />
            {setUsername.isPending ? "..." : isHe ? "שמירה" : "Save"}
          </button>
        )}
      </div>

      <div className="pointer-events-auto absolute right-0 top-0 bottom-0 z-10 flex flex-col">
        <div className="w-[304px] border-b border-border bg-card/95 px-3 py-3 backdrop-blur-xl">
          {usernameCard}
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="flex h-full w-20 flex-col overflow-y-auto border-r border-border bg-card/90 py-2 backdrop-blur-xl noscrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(category)}
                className={`border-r-2 px-2 py-3 text-center text-[11px] font-medium transition-all duration-200 ${
                  currentCategory?.name === category.name
                    ? "border-r-primary bg-primary/10 text-primary"
                    : "border-r-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {categoryLabels[category.name] || category.name}
              </button>
            ))}
          </div>

          <div className="flex h-full w-56 flex-col overflow-hidden border-r border-border bg-card/80 backdrop-blur-xl">
            {currentCategory && (
              <>
                <div className="shrink-0 px-3 pt-3 pb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {categoryLabels[currentCategory.name] || currentCategory.name}
                  </p>
                </div>

                {lockedGroups[currentCategory.name] && (
                  <p className="px-3 pb-1 text-[10px] text-destructive">
                    {isHe ? "חסום עם" : "Locked with"}{" "}
                    {lockedGroups[currentCategory.name].map((asset) => asset.name).join(", ")}
                  </p>
                )}

                {hasColors && (
                  <div className="shrink-0 px-3 pb-2">
                    <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {isHe ? "צבע" : "Color"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentCategory.colorPalette!.map((color, i) => (
                        <button
                          key={`${i}-${color}`}
                          className={`h-7 w-7 shrink-0 rounded-lg border-2 p-0.5 transition-all duration-200 ${
                            customization[currentCategory.name]?.color === color
                              ? "scale-110 border-primary"
                              : "border-transparent hover:border-primary/40"
                          }`}
                          onClick={() => updateColor(color)}
                        >
                          <div className="h-full w-full rounded-md" style={{ backgroundColor: color }} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto px-2 pb-3 noscrollbar">
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {currentCategory.removable && (
                      <button
                        onClick={() => changeAsset(currentCategory.name, null)}
                        className={`flex flex-col items-center gap-1 overflow-hidden rounded-xl border-2 p-1.5 transition-all duration-200 ${
                          !customization[currentCategory.name]?.asset
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted hover:border-primary/30"
                        }`}
                      >
                        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-card/70 text-muted-foreground">
                          <X className="h-4 w-4" />
                        </div>
                        <span className="w-full truncate text-center text-[9px] text-muted-foreground">
                          {isHe ? "ללא" : "None"}
                        </span>
                      </button>
                    )}

                    {currentCategory.assets.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => changeAsset(currentCategory.name, asset)}
                        className={`flex flex-col items-center gap-1 overflow-hidden rounded-xl border-2 p-1.5 transition-all duration-200 ${
                          customization[currentCategory.name]?.asset?.id === asset.id
                            ? "border-primary bg-primary/10"
                            : "border-transparent bg-muted hover:border-primary/30"
                        }`}
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-lg bg-card/70">
                          <AssetTilePreview
                            assetUrl={asset.url}
                            category={currentCategory}
                            assetColor={customization[currentCategory.name]?.color}
                            skinColor={customization.Head?.color}
                            thumbnail={asset.thumbnail}
                          />
                        </div>
                        <span className="w-full truncate text-center text-[9px] text-muted-foreground">{asset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
