## Bug

Runtime error: `cannot add postgres_changes callbacks for realtime:theme_settings_changes after subscribe()` — surfaces a full-screen "משהו השתבש" error.

## Root cause

`src/hooks/useThemeSettings.ts` (line 304) creates a Supabase realtime channel with a hard-coded name `'theme_settings_changes'`. The hook is mounted by multiple components (ThemeProvider, header, etc.). When a second instance mounts, `supabase.channel('theme_settings_changes')` returns the existing already-subscribed channel and `.on('postgres_changes', …)` is called after `.subscribe()` has already run → throw.

## Fix

In `src/hooks/useThemeSettings.ts`, give each mount its own channel by appending a unique suffix:

```ts
const channel = supabase
  .channel(`theme_settings_changes_${Math.random().toString(36).slice(2)}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'theme_settings' }, () => {
    cachedTheme = null;
    cacheTimestamp = 0;
    fetchTheme();
  })
  .subscribe();
```

That's the only change. Cleanup in the existing `return () => supabase.removeChannel(channel)` already handles teardown.

## Out of scope

No other files. No theme/UI behavior changes.
