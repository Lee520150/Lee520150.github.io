(() => {
  const section = document.querySelector('[data-waline]');
  if (!section) return;

  const status = section.querySelector('.comments-status');
  const retry = section.querySelector('.comments-retry');
  const container = section.querySelector('#waline');
  let loading = false;
  let loaded = false;

  function installSecureLikeProxy(serverURL) {
    if (window.__colorLabSecureLikeProxy) return;

    const server = new URL(serverURL, window.location.href);
    const nativeFetch = window.fetch.bind(window);
    window.fetch = function secureLikeFetch(input, init = {}) {
      const requestUrl = typeof input === 'string' ? input : input.url;
      const method = (init.method || (typeof input === 'string' ? 'GET' : input.method)).toUpperCase();

      if (method === 'PUT' && typeof init.body === 'string') {
        try {
          const url = new URL(requestUrl, window.location.href);
          const body = JSON.parse(init.body);
          const keys = Object.keys(body);
          const isCommentLike =
            url.origin === server.origin &&
            /^\/api\/comment\/\d+\/?$/u.test(url.pathname) &&
            keys.length === 1 &&
            keys[0] === 'like' &&
            typeof body.like === 'boolean';

          if (isCommentLike) {
            url.pathname = url.pathname.replace('/api/comment/', '/api/secure-like/');
            return nativeFetch(url.toString(), init);
          }
        } catch {
          // Let Waline handle requests that are not the simple like action.
        }
      }

      return nativeFetch(input, init);
    };
    window.__colorLabSecureLikeProxy = true;

    const migrationKey = 'color-lab-secure-like-v1';
    if (!localStorage.getItem(migrationKey)) {
      localStorage.removeItem('WALINE_LIKE');
      localStorage.setItem(migrationKey, 'done');
    }
  }

  async function loadComments() {
    if (loading || loaded) return;
    loading = true;
    retry.hidden = true;
    status.hidden = false;
    status.textContent = '正在加载评论…';
    container.setAttribute('aria-busy', 'true');

    try {
      const { init } = await import(section.dataset.clientUrl);
      installSecureLikeProxy(section.dataset.serverUrl);
      init({
        el: container,
        serverURL: section.dataset.serverUrl,
        path: section.dataset.commentPath,
        lang: 'zh-CN',
        meta: ['nick', 'mail'],
        requiredMeta: ['nick'],
        login: 'enable',
        pageSize: 10,
        wordLimit: 2000,
        emoji: true,
        search: false,
        imageUploader: false,
        highlighter: false,
        texRenderer: false,
        reaction: true,
        pageview: false,
        comment: false,
        locale: {
          placeholder: '留下你的想法…',
          reactionTitle: '你认为这篇文章怎么样？'
        }
      });
      loaded = true;
      status.hidden = true;
    } catch (error) {
      container.replaceChildren();
      status.textContent = '评论暂时加载失败，请稍后重试。';
      retry.hidden = false;
      console.error('Unable to load comments:', error);
    } finally {
      loading = false;
      container.setAttribute('aria-busy', 'false');
    }
  }

  retry.addEventListener('click', loadComments);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        loadComments();
      }
    }, { rootMargin: '300px' });
    observer.observe(section);
  } else {
    loadComments();
  }
})();
