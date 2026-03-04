import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'source', '_posts');
const TARGET_DIR = path.join(ROOT, 'src', 'content', 'essay');

const FRONTMATTER_DELIMITER = /^---\s*$/;

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
};

const toYamlQuoted = (value) => `'${String(value).replace(/'/g, "''")}'`;

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (value == null) return [];

  const text = String(value).trim();
  if (!text) return [];

  if (text.startsWith('[') && text.endsWith(']')) {
    return text
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [text];
};

const parseFrontmatter = (raw, filePath) => {
  const lines = raw.split(/\r?\n/);
  if (lines.length === 0 || !FRONTMATTER_DELIMITER.test(lines[0])) {
    throw new Error(`missing frontmatter start delimiter in ${filePath}`);
  }

  let endIndex = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (FRONTMATTER_DELIMITER.test(lines[i])) {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    throw new Error(`missing frontmatter end delimiter in ${filePath}`);
  }

  const fmLines = lines.slice(1, endIndex);
  const body = lines.slice(endIndex + 1).join('\n');

  const data = {};
  let currentArrayKey = null;

  for (const rawLine of fmLines) {
    const line = rawLine.replace(/\r$/, '');
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const arrayItem = line.match(/^\s*-\s*(.*)$/);
    if (arrayItem && currentArrayKey) {
      const value = arrayItem[1].trim();
      if (!Array.isArray(data[currentArrayKey])) {
        data[currentArrayKey] = [];
      }
      if (value) {
        data[currentArrayKey].push(value);
      }
      continue;
    }

    const keyMatch = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (!keyMatch) {
      currentArrayKey = null;
      continue;
    }

    const [, key, rawValue] = keyMatch;
    const value = rawValue.trim();

    if (!value) {
      data[key] = [];
      currentArrayKey = key;
      continue;
    }

    data[key] = value;
    currentArrayKey = null;
  }

  return { data, body };
};

const stripWrappingQuotes = (value) => {
  if (typeof value !== 'string') return value;
  const text = value.trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  return text;
};

const sanitizeSlug = (fileNameWithoutExt) =>
  fileNameWithoutExt
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const serializeFrontmatter = (entry) => {
  const lines = ['---'];

  lines.push(`title: ${toYamlQuoted(entry.title)}`);
  lines.push(`date: ${toYamlQuoted(entry.date)}`);

  if (entry.tags.length === 0) {
    lines.push('tags: []');
  } else {
    lines.push('tags:');
    for (const tag of entry.tags) {
      lines.push(`  - ${toYamlQuoted(tag)}`);
    }
  }

  if (entry.categories.length === 0) {
    lines.push('categories: []');
  } else {
    lines.push('categories:');
    for (const category of entry.categories) {
      lines.push(`  - ${toYamlQuoted(category)}`);
    }
  }

  if (entry.description) {
    lines.push(`description: ${toYamlQuoted(entry.description)}`);
  }

  lines.push(`slug: ${toYamlQuoted(entry.slug)}`);
  lines.push('---');

  return lines.join('\n');
};

const removeHexoMoreTag = (body) => body.replace(/^\s*<!--\s*more\s*-->\s*$/gim, '').trimStart();

const cleanTargetMarkdownFiles = async () => {
  await ensureDir(TARGET_DIR);
  const files = await fs.readdir(TARGET_DIR, { withFileTypes: true });
  await Promise.all(
    files
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => fs.rm(path.join(TARGET_DIR, entry.name), { force: true }))
  );
};

const migrateOne = async (fileName) => {
  const sourcePath = path.join(SOURCE_DIR, fileName);
  const targetPath = path.join(TARGET_DIR, fileName);
  const fileNameWithoutExt = fileName.replace(/\.md$/i, '');

  const raw = await fs.readFile(sourcePath, 'utf8');
  const { data, body } = parseFrontmatter(raw, sourcePath);

  const title = stripWrappingQuotes(data.title ?? '');
  const date = stripWrappingQuotes(data.date ?? '');
  const description = stripWrappingQuotes(data.description ?? '');

  if (!title) {
    throw new Error(`missing title in ${fileName}`);
  }
  if (!date) {
    throw new Error(`missing date in ${fileName}`);
  }

  const slug = sanitizeSlug(fileNameWithoutExt);
  if (!slug) {
    throw new Error(`failed to build slug for ${fileName}`);
  }

  const tags = normalizeList(data.tags).map(stripWrappingQuotes);
  const categories = normalizeList(data.categories).map(stripWrappingQuotes);

  const frontmatter = serializeFrontmatter({
    title,
    date,
    tags,
    categories,
    description,
    slug
  });

  const content = `${frontmatter}\n\n${removeHexoMoreTag(body).trimEnd()}\n`;
  await fs.writeFile(targetPath, content, 'utf8');

  return {
    fileName,
    slug,
    tagsCount: tags.length,
    categoriesCount: categories.length
  };
};

const main = async () => {
  const exists = await fs
    .stat(SOURCE_DIR)
    .then((st) => st.isDirectory())
    .catch(() => false);

  if (!exists) {
    throw new Error(`source directory not found: ${SOURCE_DIR}`);
  }

  await cleanTargetMarkdownFiles();

  const entries = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const migrated = [];
  const failed = [];

  for (const fileName of markdownFiles) {
    try {
      const result = await migrateOne(fileName);
      migrated.push(result);
    } catch (error) {
      failed.push({
        fileName,
        reason: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const report = {
    sourceDir: SOURCE_DIR,
    targetDir: TARGET_DIR,
    total: markdownFiles.length,
    migrated: migrated.length,
    failed: failed.length,
    failedFiles: failed,
    sample: migrated.slice(0, 5)
  };

  console.log(JSON.stringify(report, null, 2));

  if (failed.length > 0) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
