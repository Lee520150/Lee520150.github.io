const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const version = require('@waline/client/package.json').version;
const assetRoot = `vendor/waline/${version}`;

hexo.extend.helper.register('waline_options', function (post) {
  const settings = hexo.config.waline || {};
  if (!settings.enable || !settings.server_url || post.comments === false || post.layout !== 'post') {
    return null;
  }

  const server = new URL(settings.server_url);
  if (server.protocol !== 'https:' || server.username || server.password || server.search || server.hash) {
    throw new Error('waline.server_url must be an HTTPS server URL without credentials, query or fragment.');
  }

  // Source names survive date and domain changes; comment_id can preserve a renamed post's thread.
  const source = String(post.source).replace(/\\/g, '/');
  const thread = post.comment_id || `post-${createHash('sha256').update(source).digest('hex').slice(0, 24)}`;
  return {
    serverURL: server.href.replace(/\/$/, ''),
    path: String(thread),
    clientURL: this.url_for(`/${assetRoot}/waline.js`),
    styleURL: this.url_for(`/${assetRoot}/waline.css`)
  };
});

hexo.extend.generator.register('waline-assets', function () {
  const dist = path.dirname(require.resolve('@waline/client/style'));
  return ['waline.js', 'waline.css', 'waline.js.map', 'waline.css.map'].map(name => ({
    path: `${assetRoot}/${name}`,
    data: () => fs.createReadStream(path.join(dist, name))
  }));
});
