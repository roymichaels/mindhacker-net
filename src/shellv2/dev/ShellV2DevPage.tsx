/**
 * Dev-only mount for ShellV2 — visit `/__shellv2` to inspect the empty
 * skeleton without affecting any production route.
 */
import ShellV2 from '../ShellV2';

export default function ShellV2DevPage() {
  return <ShellV2 />;
}