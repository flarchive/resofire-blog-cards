/**
 * Returns the best image URL for a card:
 * 1. First <img> found in the first post's contentHtml
 * 2. Tag default image (first tag on the discussion that has one configured)
 * 3. null (renders placeholder bar)
 */
export default function getFirstPostImage(discussion) {
  // 1. First post image
  try {
    const firstPost = discussion.firstPost();
    if (firstPost) {
      const html = firstPost.contentHtml() || '';
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const img = doc.querySelector('img');
      if (img && img.src) return img.src;
    }
  } catch (e) {}

  // 2. Tag default image — check each tag on this discussion
  try {
    const tags = discussion.tags ? discussion.tags() : null;
    if (tags && tags.length) {
      for (const tag of tags) {
        if (!tag) continue;
        const tagId = tag.id();
        const url = app.forum.attribute('resofireBlogCardsTagImage_' + tagId);
        if (url) return url;
      }
    }
  } catch (e) {}

  return null;
}
