// Dependency-free static file server for the Next static export in `out/`.
// Used as Playwright's webServer so e2e tests don't need a `serve` dependency.
//
// Usage: node scripts/serve-out.mjs [port]   (default port 4173)
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";
import { createGzip } from "node:zlib";

const OUT_DIR = normalize(join(process.cwd(), "out"));
const PORT = Number(process.argv[2]) || 4173;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
};

// Resolve a request path to a file under OUT_DIR, guarding against traversal.
function safeFile(relativePath) {
  const full = normalize(join(OUT_DIR, relativePath));
  if (full !== OUT_DIR && !full.startsWith(OUT_DIR + sep)) return null;
  return existsSync(full) && statSync(full).isFile() ? full : null;
}

function resolveFile(requestUrl) {
  const pathname = decodeURIComponent(requestUrl.split("?")[0].split("#")[0]);
  const candidates = [];
  if (pathname === "/" || pathname === "") {
    candidates.push("index.html");
  } else if (pathname.endsWith("/")) {
    // Next `trailingSlash: true` export: /foo/ -> foo/index.html
    candidates.push(pathname.slice(1) + "index.html");
  } else {
    candidates.push(pathname.slice(1)); // exact file: /favicon.ico, /_next/static/...
    candidates.push(pathname.slice(1) + "/index.html"); // directory route missing the slash
  }
  for (const candidate of candidates) {
    const file = safeFile(candidate);
    if (file) return file;
  }
  return null;
}

const server = createServer((req, res) => {
  let file;
  try {
    file = resolveFile(req.url ?? "/");
  } catch {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request");
    return;
  }
  if (file) {
    const type = MIME_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream";
    const compressed =
      /gzip/.test(req.headers["accept-encoding"] ?? "") && /^(text\/|application\/(javascript|json|xml))/.test(type);
    res.writeHead(200, {
      "Content-Type": type,
      Vary: "Accept-Encoding",
      "Cache-Control": file.includes(`${sep}_next${sep}static${sep}`)
        ? "public, max-age=31536000, immutable"
        : "no-cache",
      ...(compressed ? { "Content-Encoding": "gzip" } : {}),
    });
    const stream = createReadStream(file);
    if (compressed) stream.pipe(createGzip()).pipe(res);
    else stream.pipe(res);
    return;
  }
  const notFound = join(OUT_DIR, "404.html");
  if (existsSync(notFound)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(notFound).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 not found");
  }
});

server.listen(PORT, () => {
  console.log(`serving out/ at http://localhost:${PORT}`);
});
