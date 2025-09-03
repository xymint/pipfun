// Utility functions for string formatting

/**
 * Compactly represent a long string by keeping the head and tail, separated by ellipsis.
 * @param text The input string (e.g., public key or signature)
 * @param head Number of characters to keep at the start (default: 4)
 * @param tail Number of characters to keep at the end (default: 4)
 */
export function shortenMiddle(text: string, head: number = 4, tail: number = 4): string {
  if (!text) return "";
  if (head < 0) head = 0;
  if (tail < 0) tail = 0;
  const min = head + tail + 3; // 3 for '...'
  if (text.length <= min) return text;
  const start = text.slice(0, head);
  const end = text.slice(-tail);
  return `${start}...${end}`;
}
