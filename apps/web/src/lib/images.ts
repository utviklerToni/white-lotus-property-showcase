// Unsplash resizes on the fly, so we can offer the browser several widths (srcset).
// Any other image URL is used as-is.
const WIDTHS = [400, 640, 800, 1200, 1600];

export function imageSources(url: string, aspect: number): { src: string; srcSet?: string } {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { src: url };
  }
  if (parsed.hostname !== 'images.unsplash.com') return { src: url };

  const at = (width: number) => {
    const sized = new URL(parsed);
    sized.searchParams.set('auto', 'format');
    sized.searchParams.set('fit', 'crop');
    sized.searchParams.set('w', String(width));
    sized.searchParams.set('h', String(Math.round(width / aspect)));
    return sized.toString();
  };
  return { src: at(800), srcSet: WIDTHS.map((w) => `${at(w)} ${w}w`).join(', ') };
}
