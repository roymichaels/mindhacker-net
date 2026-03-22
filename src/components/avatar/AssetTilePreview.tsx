/**
 * AssetTilePreview — Shows the asset's thumbnail image.
 * Uses static thumbnail images (same approach as the original
 * r3f-ultimate-character-configurator project).
 * No WebGL — avoids browser context limits.
 */

interface AssetTilePreviewProps {
  assetUrl: string;
  category: { name: string; colorPalette?: string[] };
  assetColor?: string;
  skinColor?: string;
  thumbnail?: string;
}

export const AssetTilePreview = ({
  thumbnail,
}: AssetTilePreviewProps) => {
  if (!thumbnail) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-md">
        <span className="text-muted-foreground text-xs">—</span>
      </div>
    );
  }

  return (
    <img
      src={thumbnail}
      alt=""
      className="w-full h-full object-cover rounded-md"
      loading="lazy"
    />
  );
};
