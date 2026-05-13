/**
 * ChromeLayer — minimal top bar. The only persistent chrome.
 *
 * Holds three things and nothing else:
 *  - left: drawer trigger (history/account/nav). Wired in Phase 5.
 *  - center: ambient AION status (mood pulse / current room name).
 *  - right: history button (opens ChatHistorySheet). Wired in Phase 3.
 *
 * No dropdowns, no world-switcher, no breadcrumbs. If something feels like
 * it belongs here, it probably belongs in the composer plus-menu instead.
 */
/**
 * ChromeLayer — intentionally empty.
 *
 * The outer app header is the only persistent chrome. The previous inner
 * hamburger + history icons were removed per product direction; menu/history
 * are reachable via the outer header and composer actions instead.
 */
export default function ChromeLayer() {
  return null;
}