// Every page the site publishes, read from its sitemap. Shared by the browser tests and the
// screenshot script, so a new project is covered without editing either.

/**
 * The site paths a sitemap lists. Throws when it lists none, so a missing or broken sitemap
 * can't make a route-driven check pass by checking nothing.
 * @param {string} xml
 * @returns {string[]}
 */
export function sitemapPaths(xml) {
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  if (paths.length === 0) throw new Error("sitemap lists no pages");
  return paths;
}
