import fs from "node:fs";
import path from "node:path";

const outDir = path.join(process.cwd(), "out");
const toolsDir = path.join(outDir, "tools");

if (!fs.existsSync(toolsDir)) {
  console.error("out/tools directory not found. Run next build first.");
  process.exit(1);
}

const entries = fs.readdirSync(toolsDir, { withFileTypes: true });
const slugs = entries
  .filter((e) => e.isDirectory() && e.name !== "_next")
  .map((e) => e.name)
  .sort();

const now = new Date().toISOString();
const urls = [
  "https://www.zerosuniverse.com/tools/",
  ...slugs.map((s) => `https://www.zerosuniverse.com/tools/${s}/`),
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.endsWith("/tools/") ? "0.9" : "0.8"}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemapXml, "utf8");
fs.writeFileSync(path.join(toolsDir, "sitemap.xml"), sitemapXml, "utf8");
console.log(`Generated sitemap.xml with ${urls.length} URLs.`);
