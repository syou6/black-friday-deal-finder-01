// Hands the Deal Beacon site in: copies app/ and screenshots/ into the output
// directory and writes dossier.json via the vendored makefun frontend helper.
// Deterministic: no timestamps or random values are written.
// Local run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const root = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const shotsSrc = join(root, 'screenshots');
const shotsOut = join(outDir, 'screenshots');

mkdirSync(outDir, { recursive: true });
mkdirSync(shotsOut, { recursive: true });

cpSync(join(root, 'app'), join(outDir, 'app'), { recursive: true });
if (existsSync(shotsSrc)) {
  cpSync(shotsSrc, shotsOut, { recursive: true });
}

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
