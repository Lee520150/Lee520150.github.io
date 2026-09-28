# Waline 评论区

客户端已接入文章模板，尚未配置服务端时不显示评论区。资源来自固定版本的 `@waline/client`，随 Hexo 构建发布，无需浏览器访问外部脚本 CDN。

## 首次部署

1. 使用自己的 GitHub 账号登录 Vercel，按 [Waline 官方快速开始](https://waline.js.org/guide/get-started/) 的部署按钮创建独立 Waline 项目。
2. 在该项目的 Storage 中添加 Neon 数据库。选择适合的免费方案，核对额度和计费设置。
3. 打开 Neon SQL Editor，运行官方的 [waline.pgsql](https://github.com/walinejs/waline/blob/main/assets/waline.pgsql) 初始化表结构。
4. 返回 Vercel，重新部署 Waline 项目，使数据库环境变量生效。
5. 打开服务地址的 `/ui/register`，先注册管理员。第一个注册账号会成为管理员，完成这一步后再对外启用评论。
6. 按官方服务端文档设置站点名称、站点 URL 及允许的站点来源；需要留言审核时设置 `COMMENT_AUDIT=true`。生产环境规则以 [环境变量文档](https://waline.js.org/reference/server/env.html) 为准。

数据库密码、连接字符串等仅存放在服务端环境变量中，不要填入博客文件或提交到 GitHub。

## 启用

在 `_config.yml` 中填写真实的服务端 HTTPS 地址，并启用：

```yaml
waline:
  enable: true
  server_url: 'https://你的服务域名'
```

完成构建后，先测试一条留言与回复，检查后台能收到，再发布博客。无需修改每篇文章；在某篇文章的 front matter 中设置 `comments: false` 可以单独关闭评论。

## 评论标识

默认使用文章源文件相对路径的 SHA-256 前 24 位作为标识，格式为 `post-<hash>`。修改日期、标题或域名不会改变该标识。已有评论的文章如果需要移动或重命名文件，先把原页面 `data-comment-path` 属性的值写入该文章的 front matter：

```yaml
comment_id: 原有标识
```

日常修改文章不需要重新部署 Waline。评论独立保存在 Neon，需自行保留数据库备份。
