import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const MOJIBAKE_MARKERS = [
  '\u00e2\u0153', '\u00e2\u0161', '\u00e2\u2020', '\u00f0\u0178',
  'Ti\u00e1\u00ba', 'D\u00e1\u00bb', '\u00c4\u2018', '\u00c6\u00b0',
  '\u00c3', '\u00c2\u00a9', '\uFFFD',
];
const VIETNAMESE_PATTERN = /[\u0102\u0103\u0110\u0111\u0128\u0129\u0168\u0169\u01A0-\u01B0\u1EA0-\u1EF9]/u;
const TEXT_EXTENSIONS = new Set([
  '.cjs', '.cs', '.csproj', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mjs',
  '.py', '.scss', '.sln', '.toml', '.ts', '.tsx', '.txt', '.vue', '.xml', '.yaml', '.yml',
]);
const TEXT_FILENAMES = new Set(['.env.example', '.gitignore', 'Dockerfile', 'LICENSE']);

export function inspectText(file, text, { allowVietnamese = false } = {}) {
  const violations = [];
  if (MOJIBAKE_MARKERS.some((marker) => text.includes(marker))) violations.push({ file, rule: 'mojibake' });
  if (!allowVietnamese && VIETNAMESE_PATTERN.test(text)) violations.push({ file, rule: 'english-only' });
  return violations;
}

function normalize(relativePath) {
  return relativePath.split(path.sep).join('/');
}

async function collect(root, relativePath, excludePrefixes, output) {
  const normalized = normalize(relativePath);
  if (excludePrefixes.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) return;

  const absolutePath = path.join(root, relativePath);
  const entries = await readdir(absolutePath, { withFileTypes: true });
  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      await collect(root, child, excludePrefixes, output);
    } else if (
      entry.isFile() &&
      (TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) || TEXT_FILENAMES.has(entry.name))
    ) {
      output.push(normalize(child));
    }
  }
}

export async function scanPolicy({ root, roots, excludePrefixes = [], vietnameseLocaleFiles = [] }) {
  const files = [];
  for (const rootPath of roots) {
    const absolutePath = path.join(root, rootPath);
    const parent = path.dirname(rootPath);
    const name = path.basename(rootPath);
    const entries = await readdir(path.join(root, parent), { withFileTypes: true });
    const entry = entries.find((candidate) => candidate.name === name);
    if (!entry) throw new Error(`Policy root does not exist: ${rootPath}`);
    if (entry.isDirectory()) await collect(root, rootPath, excludePrefixes, files);
    else files.push(normalize(rootPath));
  }

  const localeSet = new Set(vietnameseLocaleFiles);
  const violations = [];
  for (const file of [...new Set(files)].sort()) {
    const text = await readFile(path.join(root, file), 'utf8');
    violations.push(...inspectText(file, text, { allowVietnamese: localeSet.has(file) }));
  }
  return violations;
}
