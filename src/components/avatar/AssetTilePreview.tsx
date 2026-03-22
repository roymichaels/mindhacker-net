/**
 * AssetTilePreview — Shows a static thumbnail for each asset.
 * Uses the thumbnail image from the asset data.
 */

interface AssetTilePreviewProps {
  assetUrl: string;
  category: { name: string; colorPalette?: string[] };
  assetColor?: string;
  skinColor?: string;
  thumbnail?: string;
}

export const AssetTilePreview = ({
  assetUrl,
  thumbnail,
  assetColor,
}: AssetTilePreviewProps) => {
  // Use the GLB URL itself to render a quick snapshot via an offscreen approach
  // For now, show the thumbnail or a colored placeholder based on asset URL
  if (thumbnail) {
    return (
      <img
        src={thumbnail}
        alt=""
        className="w-full h-full object-cover rounded-md"
        loading="lazy"
        draggable={false}
      />
    );
  }

  // Fallback: show a gradient placeholder with the asset color
  return (
    <div
      className="w-full h-full rounded-md flex items-center justify-center"
      style={{
        background: assetColor
          ? `linear-gradient(135deg, ${assetColor}44, ${assetColor}88)`
          : undefined,
      }}
    >
      <span className="text-muted-foreground text-xs">—</span>
    </div>
  );
};
