let currentUserPromise;

window.AnchorApi = {
  async request(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });

    const text = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const data = text && contentType.includes('application/json') ? JSON.parse(text) : {};
    if (!contentType.includes('application/json')) {
      throw new Error('后端服务未连接，当前页面只能展示静态内容。');
    }
    if (!response.ok) {
      throw new Error(data.error || '请求失败。');
    }
    return data;
  },

  createElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  },

  async currentUser() {
    currentUserPromise ||= this.request('/api/auth/me').then((data) => data.user);
    return currentUserPromise;
  },

  clearCurrentUser() {
    currentUserPromise = undefined;
  },

  renderVideoEmbed(container, video, fallbackTitle = '视频片段') {
    container.textContent = '';
    const iframe = document.createElement('iframe');
    iframe.src = video.embedUrl;
    iframe.title = video.title || fallbackTitle;
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    container.append(iframe);
  }
};
