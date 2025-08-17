
export function buildGalleryUrl(slug, selectionShareUrl) {
  const origin = window.location.origin;
  const currentDomain = origin.replace(/^https?:\/\//, '');

  return `http://${slug}.${currentDomain}${selectionShareUrl}`;
}