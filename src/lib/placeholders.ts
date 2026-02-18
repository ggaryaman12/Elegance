function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

const suitPlaceholders = [
  "/images/suits/suit-01.svg",
  "/images/suits/suit-02.svg",
  "/images/suits/suit-03.svg",
  "/images/suits/suit-04.svg",
  "/images/suits/suit-05.svg",
  "/images/suits/suit-06.svg"
] as const;

export function suitPlaceholderForKey(key: string) {
  const idx = hashString(key) % suitPlaceholders.length;
  return suitPlaceholders[idx];
}

