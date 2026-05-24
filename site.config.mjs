const rawSiteUrl = (process.env.SITE_URL ?? 'https://paaatrick.com').trim();
const siteUrl = rawSiteUrl.replace(/\/+$/, '');
const hasSiteUrl = siteUrl.length > 0;

export const site = {
  url: siteUrl,
  title: "Patrick's Blog",
  brandTitle: "Patrick's Blog",
  author: 'Patrick',
  authorAvatar: '/author/avatar.jpg',
  description: 'Notes on RTC, TikTok creative tools, and AI Coding.'
};

export const PAGE_SIZE_ARCHIVE = 10;
export const PAGE_SIZE_ESSAY = 10;

export { hasSiteUrl, siteUrl };
