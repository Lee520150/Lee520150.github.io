# Blog Writing Guide

这份文档记录以后如何撰写、预览和发布博客。

## 1. 进入博客目录

打开 PowerShell，执行：

```powershell
cd D:\blog
```

## 2. 新建一篇文章

最简单的方法：直接双击博客目录里的这个文件：

```text
D:\blog\new-post.bat
```

它会让你输入文章标题，然后自动创建文章并打开新文章文件。

脚本还会让你选择文章所属板块：

```text
1. 学习笔记
2. PCB 设计
3. 项目作品
4. 生活
5. 个人博客
```

选好后，脚本会自动写入文章头部的 `categories` 和 `tags`。例如选择 `PCB 设计` 后，文章会属于：

```markdown
categories:
  - PCB
tags:
  - PCB
```

这样文章会自动出现在对应板块页面里。

也可以手动执行：

```powershell
hexo new "文章标题"
```

文章会生成在：

```text
D:\blog\source\_posts\文章标题.md
```

用 VS Code、Typora 或记事本打开这个 Markdown 文件即可写文章。

## 3. 文章基本格式

```markdown
---
title: 文章标题
date: 2026-08-24 20:00:00
tags:
  - PCB
categories:
  - PCB 设计
---

这里写首页摘要。

<!-- more -->

这里写正文内容。
```

说明：

- `title` 是文章标题。
- `date` 是发布时间。
- `tags` 是标签。
- `categories` 是分类。
- `<!-- more -->` 上方内容会作为首页摘要。

## 4. 本地预览

在 `D:\blog` 目录下运行：

```powershell
npm run server
```

然后浏览器打开：

```text
http://localhost:4000/
```

修改 `.md` 文件后，本地预览通常会自动重新生成，刷新浏览器即可看到变化。

停止本地预览：

```text
Ctrl + C
```

## 5. 发布到线上

本地保存 Markdown 文件后，线上网站不会立刻自动更新。

最简单的方法：直接双击博客目录里的这个文件：

```text
D:\blog\update-blog.bat
```

它会自动构建、提交并推送。结束后窗口会停住，你可以看到是否成功。

也可以在 PowerShell 里运行更新脚本：

```powershell
cd D:\blog
.\update-blog.ps1
```

也可以自定义提交信息：

```powershell
cd D:\blog
.\update-blog.ps1 "add new article"
```

如果不用脚本，也可以手动执行：

```powershell
git add .
git commit -m "update blog"
git push
```

推送成功后，GitHub Pages 会自动部署。通常等待 1-3 分钟后，线上博客会更新：

```text
https://lee520150.github.io/
```

## 6. 修改栏目页

常用栏目页位置：

```text
D:\blog\source\notes\index.md
D:\blog\source\pcb\index.md
D:\blog\source\projects\index.md
D:\blog\source\life\index.md
D:\blog\source\about\index.md
D:\blog\source\links\index.md
```

普通文章放在：

```text
D:\blog\source\_posts
```

栏目介绍改对应目录下的 `index.md`。

## 7. 最常用流程

```powershell
cd D:\blog
双击 new-post.bat
npm run server
双击 update-blog.bat
```

记住一句话：

```text
保存 Markdown 只影响本地；git push 后线上才会更新。
```
