import AtmoArtifact, { AtmoArtifactKind } from "@/components/aion/artifacts/AtmoArtifact";
import { ReactNode } from "react";

/**
 * AionArtifactCard — single canonical artifact shell.
 * Thin alias over AtmoArtifact so all future migrations import from one place.
 */
export function AionArtifactCard(props: {
  kind?: AtmoArtifactKind;
  className?: string;
  children: ReactNode;
  breathing?: boolean;
  title?: ReactNode;
  source?: ReactNode;
  artifactId?: string;
}) {
  return <AtmoArtifact {...props} />;
}

export default AionArtifactCard;