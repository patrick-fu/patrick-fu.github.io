# paaatrick.com (Astro)

此仓库已从 Hexo 迁移到 Astro，主题基于 `astro-whono`。

## 分支与发布

- 源码分支：`main`
- 发布方式：GitHub Actions（`.github/workflows/deploy.yml`）
- GitHub Pages Source：`GitHub Actions`

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 内容目录

- 文章：`src/content/essay/*.md`
- 静态资源：`public/`

文章 URL 保持历史格式：

- `https://paaatrick.com/YYYY-MM-DD-title/`

## Hexo 文章迁移脚本

```bash
npm run migrate:hexo
```

脚本会将 `source/_posts` 批量迁移到 `src/content/essay`，并移除 `<!-- more -->` 标记。

> 当前仓库已完成一次迁移，`source/` 目录已清理。
