/**
 * Extract the first image URL from a post's contentHtml string.
 * Returns null if no image is found.
 */
export default function getFirstPostImage(discussion) {
  try {
    const firstPost = discussion.firstPost();
    if (!firstPost) return null;

    const html = firstPost.contentHtml();
    if (!html) return null;

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const img = doc.querySelector('img');

    return img ? img.src : null;
  } catch (e) {
    return null;
  }
}
