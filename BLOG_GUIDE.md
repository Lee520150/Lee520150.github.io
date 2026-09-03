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

## 8. 美化标签

博客里已经加了一组类似 Stellar 的写作标签，可以直接写在 `.md` 文章里。

### 引言

适合放在文章开头，作为醒目的题记：

```markdown
{% quot 创作是并没有什么秘诀，能够交头接耳，一句话就传授给另一个的。 from:鲁迅 %}
```

也可以指定成标题大小：

```markdown
{% quot Chapter 1 · 选题 el:h3 %}
```

### 引用块

适合放原文和解释：

```markdown
{% blockquote from:鲁迅 %}
{创作是并没有什么秘诀。|这句话可以作为文章题记或旁注。}
{% endblockquote %}
```

普通 Markdown 引用也会自动变漂亮：

```markdown
> 这里是一段普通引用。
```

### 提示块

适合写温馨提示、低级错误、注意事项：

```markdown
{% note 温馨提示 color:warning %}
本篇不是严格教程，只是一次过程记录。
{% endnote %}
```

常用颜色：`warning`、`red`、`green`、`blue`、`purple`。

### 纸张块

适合放一段更正式、有首行缩进的文字：

```markdown
{% paper title:赛后记录 author:COLOR footer:节选 %}
<!-- paragraph -->
这里是一段正文，会自动首行缩进两个字符。

<!-- line right -->
写于某个晚上
{% endpaper %}
```

### 行内修饰

```markdown
{% mark 重点内容 color:warning %}
{% blur 鼠标放上来才显示 %}
{% psw 更像密码遮罩的隐藏文字 %}
{% del 被划掉的内容 %}
{% u 下划线 %}
{% wavy 波浪线 %}
{% emp 着重号 %}
```

### 大段隐藏

适合放需要鼠标悬停才显示的整段内容：

```markdown
{% spoiler Sensitive %}
这里写一整段内容。

可以有多个段落。
{% endspoiler %}
```
