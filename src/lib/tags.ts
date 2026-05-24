import type { EssayEntry } from './content';

export type TagSummary = {
  name: string;
  slug: string;
  count: number;
  entries: EssayEntry[];
};

export const getEntryTags = (entry: EssayEntry) =>
  (entry.data.tags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean);

export const getTagSlug = (tag: string) => {
  const slug = tag
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, ' plus ')
    .replace(/#/g, ' sharp ')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || encodeURIComponent(tag.trim()).toLowerCase();
};

export const getTagPath = (tag: string) => `/tags/${getTagSlug(tag)}/`;

export const getTagSummaries = (entries: EssayEntry[]) => {
  const bySlug = new Map<string, TagSummary>();

  entries.forEach((entry) => {
    getEntryTags(entry).forEach((tag) => {
      const slug = getTagSlug(tag);
      const existing = bySlug.get(slug);

      if (existing && existing.name !== tag) {
        throw new Error(`Tag slug collision: "${existing.name}" and "${tag}" both map to "${slug}".`);
      }

      if (existing) {
        existing.entries.push(entry);
        existing.count = existing.entries.length;
        return;
      }

      bySlug.set(slug, {
        name: tag,
        slug,
        count: 1,
        entries: [entry]
      });
    });
  });

  return Array.from(bySlug.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'en')
  );
};
