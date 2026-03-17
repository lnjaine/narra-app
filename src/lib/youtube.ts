const VIDEO_ID_REGEX =
  /(?:v=|\/embed\/|\/v\/|youtu\.be\/|\/live\/|\/shorts\/)([a-zA-Z0-9_-]{11})/;

export function extractVideoId(url: string): string | null {
  const match = url.match(VIDEO_ID_REGEX);
  return match?.[1] ?? null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

export function getEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&rel=0`;
}
