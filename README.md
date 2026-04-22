# Blog Cards for Flarum

A [Flarum](https://flarum.org) extension by **Resofire** that displays discussions as blog-style cards, complete with hero images, participant avatars, read/unread states, and a moonlit alpine placeholder for posts without images.

---

## Features

### Card layout
- Discussions are rendered as cards with a **hero image**, tag labels, title, excerpt, author, reply count, and a participant avatar strip
- The hero image is extracted automatically from the first `<img>` tag in the first post — no manual configuration required
- Cards without a post image display a built-in SVG landscape illustration as the placeholder
- Cards respect Flarum's native **read/unread styles** — unread discussions show a bold title and prominent reply count; read discussions are visually receded using `--discussion-title-color`

### Participant avatar strip
- Each card displays up to **6 participant avatars** in a strip at the bottom, showing users who have replied to the discussion
- Avatars are shown in chronological order of first post
- An overflow badge (`+N`) appears when there are more than 7 total participants (6 repliers + the OP)
- Clicking the overflow badge opens a **paginated participant modal** listing all participants with their avatars and usernames
- The strip updates optimistically when the current user posts a reply, without requiring a page refresh
- Participant data is maintained in a bounded preview table (`discussion_participant_previews`, max 6 rows per discussion) for efficient loading

### Admin settings
| Setting | Description |
|---|---|
| **Use on Discussion List** | When enabled, cards appear on the main index page (`/`) as well as tag pages |
| **Restrict to Tags** | Select specific tags to show cards on. If none are selected, cards appear on all tag pages |
| **Full Width Cards** | When enabled, each card spans the full width instead of two per row. Full-width cards use a taller hero image (420px vs 250px) |

### Tools
The admin panel includes a **Recalculate Participants** button that rebuilds the participant preview table for all discussions. A chunked progress modal shows real-time progress and timing per batch. Run this once after installing on an existing forum.

### Sidebar behaviour
When viewing a discussion, Flarum shows a discussion list in the sidebar. Cards in the sidebar are automatically displayed **single column** with a reduced image height. Cards only appear in the sidebar when the discussion list is filtered to a tag that has cards enabled — the sidebar respects the same tag restrictions as the main list.

---

## Installation

```sh
composer require resofire/blog-cards
php flarum migrate
php flarum cache:clear
```

After installing on an existing forum with existing discussions, run the participant backfill:

```sh
php flarum participants:populate
```

Or use the **Recalculate Participants** button in the admin panel.

---

## Updating

```sh
composer update resofire/blog-cards
php flarum migrate
php flarum cache:clear
```

---

## Compatibility

- Requires **Flarum 1.0** or later
- Requires **flarum/tags**
- Compatible with **resofire/discussion-participants** — both extensions can be enabled simultaneously without conflict. Blog Cards is fully self-contained and does not require Discussion Participants to be installed.

---

## Technical notes

- First post content is included in the discussion list API response to enable image extraction. The `DOMParser` result is cached on the discussion object for the session so parsing only runs once per discussion per page load.
- Participant preview data is stored in a dedicated `discussion_participant_previews` table (max 6 rows per discussion) with a `participant_count` column on the discussions table. This means the list page never issues a `COUNT(DISTINCT)` subquery — all data is pre-computed at write time.
- The extension keeps its preview table in sync automatically via post `Posted`, `Hidden`, `Restored`, and `Deleted` events.

---

## License

MIT
