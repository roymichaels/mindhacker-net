/**
 * AssetTilePreview — Simple styled preview tile (no WebGL).
 * Using text + color badges instead of 3D canvases to avoid
 * exceeding browser WebGL context limits.
 */

interface AssetTilePreviewProps {
  assetUrl: string;
  category: { name: string; colorPalette?: string[] };
  assetColor?: string;
  skinColor?: string;
}

export const AssetTilePreview = ({
  assetColor,
  skinColor,
  category,
}: AssetTilePreviewProps) => {
  // Show a color swatch representing the current asset color or skin color
  const displayColor = assetColor || skinColor || '#888';

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-md"
      style={{ backgroundColor: displayColor + '22' }}
    >
      <div
        className="w-8 h-8 rounded-full border-2 border-border/50"
        style={{ backgroundColor: displayColor }}
      />
    </div>
  );
};
