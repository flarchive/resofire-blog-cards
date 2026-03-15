/**
 * Returns the best image URL for a card:
 * 1. First <img> found in the first post's contentHtml (cached on discussion)
 * 2. Tag default image (first tag on the discussion that has one configured)
 * 3. null (renders placeholder bar)
 */
export default function getFirstPostImage(discussion) {
  // 1. First post image — parse once and cache on the discussion object
  if (!('_cardImageCache' in discussion)) {
    discussion._cardImageCache = null;
    try {
      const firstPost = discussion.firstPost();
      if (firstPost) {
        const html = firstPost.contentHtml() || '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const img = doc.querySelector('img');
        discussion._cardImageCache = (img && img.src) ? img.src : null;
      }
    } catch (e) {}
  }

  if (discussion._cardImageCache) return discussion._cardImageCache;

  // 2. Tag default image — single attribute lookup, one JSON blob
  try {
    const tagImages = app.forum.attribute('resofireBlogCardsTagImages') || {};
    const tags = discussion.tags ? discussion.tags() : null;
    if (tags && tags.length) {
      for (const tag of tags) {
        if (!tag) continue;
        const url = tagImages[tag.id()];
        if (url) return url;
      }
    }
  } catch (e) {}

  return null;
}
