const rawSiteUrl = (process.env.SITE_URL ?? 'https://paaatrick.com').trim();
const siteUrl = rawSiteUrl.replace(/\/+$/, '');
const hasSiteUrl = siteUrl.length > 0;

export const site = {
  url: siteUrl,
  title: '派大星星星星',
  brandTitle: '派大星星星星',
  author: '大星',
  authorAvatar: 'https://raw.githubusercontent.com/Fongim/personal_blog_image/master/image/20190516125601.jpg',
  description: '你有没有给我带点鱼来'
};

export const PAGE_SIZE_ARCHIVE = 10;
export const PAGE_SIZE_ESSAY = 10;

export { hasSiteUrl, siteUrl };
