(() => {
  const section = document.querySelector('[data-waline]');
  if (!section) return;

  const status = section.querySelector('.comments-status');
  const retry = section.querySelector('.comments-retry');
  const container = section.querySelector('#waline');
  let loading = false;
  let loaded = false;

  async function loadComments() {
    if (loading || loaded) return;
    loading = true;
    retry.hidden = true;
    status.hidden = false;
    status.textContent = '正在加载评论…';
    container.setAttribute('aria-busy', 'true');

    try {
      const { init } = await import(section.dataset.clientUrl);
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
        emoji: false,
        search: false,
        imageUploader: false,
        highlighter: false,
        texRenderer: false,
        reaction: false,
        pageview: false,
        comment: false,
        locale: { placeholder: '留下你的想法…' }
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
