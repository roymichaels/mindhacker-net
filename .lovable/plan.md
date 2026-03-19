

## Community Leaderboard Section

### Overview
Add a compact leaderboard strip at the top of the Community page (above Events/AI Match cards) showing the top community members ranked by points. No new database tables needed — `community_members` already has `total_points`, `posts_count`, `comments_count`, `likes_received`.

### Architecture

**Data source**: Query `community_members` joined with `profiles` (for `community_username`, `full_name`, `level`) ordered by `total_points DESC`, limit 10.

**Component**: `src/components/community/CommunityLeaderboard.tsx`
- Horizontal scrollable strip showing top 10 users
- Each entry: rank medal (🥇🥈🥉 for top 3, then number), avatar (via `PlayerAvatar`), username, points, level
- Current user highlighted if they appear in top 10
- If current user is NOT in top 10, show their rank at the end with a separator
- Tapping a user opens `CommunityMiniProfile`
- Compact card style with `backdrop-blur` background matching app aesthetic

**Layout options**:
1. **Horizontal scroll** (podium-style) — top 3 prominent, rest in a scrollable row
2. **Vertical mini-list** — numbered list, 3-5 visible with "See all" expand

**Integration**: Insert into `Community.tsx` inside the `isAll` block, above the Events/AI Match grid.

### Steps

1. **Create `CommunityLeaderboard.tsx`**
   - Query: `community_members` joined with `profiles` via `user_id`, ordered by `total_points DESC`, limit 10
   - Also fetch current user's rank with a separate count query (`total_points > currentUserPoints`)
   - Display as horizontal scroll strip with podium emphasis on top 3
   - Each item: rank indicator, PlayerAvatar, truncated username, points badge, level
   - Current user row highlighted with primary border
   - Click handler calls `onProfileClick(userId)`

2. **Integrate into `Community.tsx`**
   - Import and render `<CommunityLeaderboard onProfileClick={setProfileUserId} />` at the top of the `isAll` block
   - Section header: "🏆 Leaderboard" / "🏆 לוח מובילים"

### Technical Details

```
Query pseudocode:
  SELECT cm.user_id, cm.total_points, cm.posts_count, cm.likes_received,
         p.community_username, p.full_name, p.level
  FROM community_members cm
  JOIN profiles p ON p.id = cm.user_id
  ORDER BY cm.total_points DESC
  LIMIT 10
```

No migrations needed. Existing RLS on `community_members` and `profiles` allows authenticated reads.

