/**
 * ChromeLayer — mounts the single ShellV2 header.
 *
 * The header is the only persistent chrome on ShellV2 routes. No legacy
 * dashboard chrome, no MindOSSheet, no OSDrawer, no hub bar.
 */
import ShellV2Header from '../ShellV2Header';

export default function ChromeLayer() {
  return <ShellV2Header />;
}