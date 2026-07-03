export function firstLoadJsPaths(html: string): string[] {
  const out = new Set<string>();
  for (const m of html.matchAll(/<script([^>]*)\bsrc="([^"]+\.js)"([^>]*)>/g)) {
    if (/noModule/i.test(m[1] + m[3])) continue;
    out.add(m[2]);
  }
  return [...out];
}
