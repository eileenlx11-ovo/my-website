async function loadWorkPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    showWorkError('缺少作品 ID。');
    return;
  }

  try {
    const [{ work }, { comments }, user] = await Promise.all([
      AnchorApi.request(`/api/works/${id}`),
      AnchorApi.request(`/api/works/${id}/comments`),
      AnchorApi.currentUser()
    ]);
    renderWork(work);
    renderComments(comments);
    setupCommentForm(work.id, Boolean(user));
    setupShareForm(work.id, Boolean(user));
    setupImageGenerator(work.id, Boolean(user));
  } catch (error) {
    showWorkError(error.message);
  }
}

function renderWork(work) {
  document.getElementById('workTitle').textContent = work.movieTitle || work.literatureTitle || '未命名作品';
  document.getElementById('workSubtitle').textContent = [work.literatureTitle && `《${work.literatureTitle}》`, work.literatureAuthor, work.movieTitle, work.movieYear].filter(Boolean).join(' · ');
  document.getElementById('workQuote').textContent = work.quote || work.description;
  document.getElementById('workDescription').textContent = work.description;

  const videoArea = document.getElementById('workVideos');
  videoArea.textContent = '';
  if (!work.videos?.length) {
    videoArea.append(AnchorApi.createElement('p', 'muted', '暂无可安全嵌入的视频片段。'));
  } else {
    for (const video of work.videos) {
      const button = AnchorApi.createElement('button', 'play-btn', video.title || '放映片段');
      button.addEventListener('click', () => openWorkVideo(video));
      videoArea.append(button);
    }
  }

  const external = document.getElementById('externalSource');
  external.textContent = '';
  if (work.externalUrl) {
    const link = AnchorApi.createElement('a', 'btn detail-link', '查看合法来源');
    link.href = work.externalUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    external.append(link);
  }
}

function openWorkVideo(video) {
  const box = document.getElementById('workVideoBox');
  box.textContent = '';
  const iframe = document.createElement('iframe');
  iframe.src = video.embedUrl;
  iframe.title = video.title || '视频片段';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
  box.append(iframe);
}

function renderComments(comments) {
  const list = document.getElementById('commentsList');
  list.textContent = '';
  if (!comments.length) {
    list.append(AnchorApi.createElement('p', 'muted', '还没有评论，等你写下第一句批注。'));
    return;
  }
  for (const comment of comments) {
    const item = document.createElement('article');
    item.className = 'comment-item';
    item.append(
      AnchorApi.createElement('div', 'comment-author', `${comment.author.displayName} · ${comment.author.publicId}`),
      AnchorApi.createElement('p', '', comment.body),
      AnchorApi.createElement('time', 'muted', comment.createdAt)
    );
    list.append(item);
  }
}

function setupCommentForm(workId, loggedIn) {
  const form = document.getElementById('commentForm');
  const notice = document.getElementById('commentNotice');
  form.style.display = loggedIn ? 'block' : 'none';
  notice.textContent = loggedIn ? '' : '登录后可以发表评论。';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const body = document.getElementById('commentBody').value.trim();
    try {
      const data = await AnchorApi.request(`/api/works/${workId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body })
      });
      document.getElementById('commentBody').value = '';
      renderComments(data.comments);
    } catch (error) {
      notice.textContent = error.message;
    }
  });
}

function setupShareForm(workId, loggedIn) {
  const form = document.getElementById('shareForm');
  const notice = document.getElementById('shareNotice');
  form.style.display = loggedIn ? 'block' : 'none';
  notice.textContent = loggedIn ? '' : '登录并成为好友后可以分享。';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await AnchorApi.request('/api/shares', {
        method: 'POST',
        body: JSON.stringify({
          recipientPublicId: document.getElementById('recipientPublicId').value.trim(),
          workId,
          message: document.getElementById('shareMessage').value.trim()
        })
      });
      notice.textContent = '已投递给这位友人。';
      form.reset();
    } catch (error) {
      notice.textContent = error.message;
    }
  });
}

async function setupImageGenerator(workId, loggedIn) {
  const form = document.getElementById('imageGenerateForm');
  const notice = document.getElementById('imageProviderNotice');
  const buttons = [...form.querySelectorAll('[data-image-type]')];

  try {
    const [status, gallery] = await Promise.all([
      AnchorApi.request('/api/image/status'),
      AnchorApi.request(`/api/works/${workId}/images`)
    ]);

    renderGeneratedImages(gallery.images);
    if (!loggedIn) {
      notice.textContent = '登录后可以生成电影票券、书签和海报。';
      form.style.display = 'none';
      return;
    }
    if (!status.available) {
      notice.textContent = status.message;
      buttons.forEach((button) => button.disabled = true);
      return;
    }
    notice.textContent = `${status.provider} 已就绪：${status.model}`;

    buttons.forEach((button) => {
      button.addEventListener('click', async () => {
        await generateArtifact(workId, button.dataset.imageType, button, notice);
      });
    });
  } catch (error) {
    notice.textContent = error.message;
  }
}

async function generateArtifact(workId, type, button, notice) {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = '生成中...';
  notice.textContent = '正在暗房中显影，请稍候。';

  try {
    const data = await AnchorApi.request(`/api/works/${workId}/images`, {
      method: 'POST',
      body: JSON.stringify({
        type,
        style: document.getElementById('imageStyle').value
      })
    });
    prependGeneratedImage(data.image);
    notice.textContent = `${data.label} 已生成。`;
  } catch (error) {
    notice.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

function renderGeneratedImages(images) {
  const grid = document.getElementById('generatedImages');
  grid.textContent = '';
  if (!images.length) {
    grid.append(AnchorApi.createElement('p', 'muted', '还没有生成的藏品。'));
    return;
  }
  for (const image of images) {
    grid.append(createGeneratedImageCard(image));
  }
}

function prependGeneratedImage(image) {
  const grid = document.getElementById('generatedImages');
  const empty = grid.querySelector('.muted');
  if (empty) empty.remove();
  grid.prepend(createGeneratedImageCard(image));
}

function createGeneratedImageCard(image) {
  const card = document.createElement('article');
  card.className = 'generated-item';
  const img = document.createElement('img');
  img.src = image.previewUrl;
  img.alt = imageTypeText(image.type);
  img.loading = 'lazy';

  const download = AnchorApi.createElement('a', 'btn detail-link', '下载');
  download.href = image.previewUrl;
  download.download = `${image.type}-${image.id}.png`;

  card.append(
    img,
    AnchorApi.createElement('div', 'comment-author', `${imageTypeText(image.type)} · ${image.provider}`),
    download
  );
  return card;
}

function imageTypeText(type) {
  return {
    ticket: '电影票券',
    bookmark: '文学书签',
    poster: '复古海报'
  }[type] || type;
}

function showWorkError(message) {
  document.getElementById('workTitle').textContent = message;
}

document.addEventListener('DOMContentLoaded', loadWorkPage);
