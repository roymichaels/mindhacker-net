

# Move Identity/Direction/Insights Buttons & Add Translation Keys

## Layout Change

The Identity, Direction, and Insights buttons currently sit at the bottom of the center column (Col 2). They need to move into the HUD column (Col 1), directly below the "Start Session" button -- on both mobile and desktop.

### Mobile (lines 176-188 in MobileHeroGrid.tsx)
After the existing "Start Session" button (inside the `lg:hidden` mobile block), insert the 3-button grid that's currently at lines 327-350.

### Desktop (lines 252-264 in MobileHeroGrid.tsx)
After the desktop "Start Session" button, insert a copy of the same 3-button grid.

### Remove from Col 2
Delete the original button grid and its separator (lines 325-350) from the center column.

## Translation Keys

Add proper translation keys instead of inline `language === 'he' ? ... : ...` for all affected strings. New keys to add in both `he.ts` and `en.ts`:

| Key | Hebrew | English |
|-----|--------|---------|
| `dashboard.identity` | זהות | Identity |
| `dashboard.direction` | כיוון | Direction |
| `dashboard.insights` | תובנות | Insights |
| `dashboard.startSession` | התחל סשן | Start Session |
| `dashboard.minutes` | דק׳ | min |

These will replace all inline ternaries for these labels in MobileHeroGrid.tsx.

## Technical Details

### Files Modified

**`src/i18n/translations/he.ts`**
- Add `identity`, `direction`, `insights`, `startSession`, `minutes` under the `dashboard` section.

**`src/i18n/translations/en.ts`**
- Add the same keys with English values.

**`src/components/dashboard/MobileHeroGrid.tsx`**
1. **Mobile block** (~line 188): After the "Start Session" button, add a separator and the 3-button grid.
2. **Desktop block** (~line 264): Same -- add separator + 3-button grid after the desktop "Start Session" button.
3. **Col 2 bottom** (lines 325-350): Remove the original button grid and its separator.
4. Replace all `language === 'he' ? 'זהות' : 'Identity'` patterns with `t('dashboard.identity')` (and similarly for direction, insights, startSession, minutes).

