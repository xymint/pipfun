import fs from "node:fs/promises";
import path from "node:path";

const configPath = process.argv[2] || path.join(process.cwd(), "figma-local-assets.json");

async function readConfig() {
  const raw = await fs.readFile(configPath, "utf8");
  const json = JSON.parse(raw);
  if (!Array.isArray(json.assets)) {
    throw new Error("Invalid config. Expect { assets: [{ url, out }] }");
  }
  return json.assets;
}

async function download(url, outRel) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const out = path.join(process.cwd(), "public", outRel);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, buf);
  console.log(`[mcp-export] Saved ${outRel}`);
}

async function main() {
  const assets = await readConfig();
  for (const a of assets) {
    // eslint-disable-next-line no-await-in-loop
    await download(a.url, a.out);
  }
  console.log(`[mcp-export] Done (${assets.length} assets).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
