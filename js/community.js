let selectedCommunityId = null;
let currentUser = null;

async function loadCommunityPage() {
  const notice = document.getElementById('communityNotice');
  try {
    currentUser = await AnchorApi.currentUser();
    setupCommunityForm();
    setupPostForm();
    await refreshCommunities();
  } catch (error) {
    notice.textContent = error.message;
    document.getElementById('communityForm').style.display = 'none';
    document.getElementById('postForm').style.display = 'none';
  }
}

function setupCommunityForm() {
  const form = document.getElementById('communityForm');
  const notice = document.getElementById('communityNotice');
  if (!currentUser) {
    notice.textContent = '登录后可以建立梦中人社区。';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const data = await AnchorApi.request('/api/communities', {
        method: 'POST',
        body: JSON.stringify({
          name: document.getElementById('communityName').value.trim(),
          description: document.getElementById('communityDescription').value.trim()
        })
      });
      form.reset();
      notice.textContent = '社区已建立。';
      selectedCommunityId = data.community.id;
      await refreshCommunities();
      await loadPosts(selectedCommunityId);
    } catch (error) {
      notice.textContent = error.message;
    }
  });
}

function setupPostForm() {
  const form = document.getElementById('postForm');
  const notice = document.getElementById('communityNotice');
  if (!currentUser) {
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!selectedCommunityId) {
      notice.textContent = '请先选择一个社区。';
      return;
    }

    try {
      const data = await AnchorApi.request(`/api/communities/${selectedCommunityId}/posts`, {
        method: 'POST',
        body: JSON.stringify({
          title: document.getElementById('postTitle').value.trim(),
          body: document.getElementById('postBody').value.trim()
        })
      });
      form.reset();
      renderPosts(data.posts);
      notice.textContent = '讨论已发布。';
      await refreshCommunities();
    } catch (error) {
      notice.textContent = error.message;
    }
  });
}

async function refreshCommunities() {
  const data = await AnchorApi.request('/api/communities');
  renderCommunities(data.communities);
  if (!selectedCommunityId && data.communities.length) {
    selectedCommunityId = data.communities[0].id;
    await loadPosts(selectedCommunityId);
  } else if (!data.communities.length) {
    renderPosts([]);
  }
}

function renderCommunities(communities) {
  const list = document.getElementById('communitiesList');
  list.textContent = '';
  if (!communities.length) {
    list.append(AnchorApi.createElement('p', 'muted', '还没有梦中人社区。'));
    document.getElementById('selectedCommunityTitle').textContent = '讨论内容';
    return;
  }

  for (const community of communities) {
    const item = document.createElement('article');
    item.className = 'comment-item community-item';
    if (community.id === selectedCommunityId) item.classList.add('active-community');
    const button = AnchorApi.createElement('button', 'community-select', community.name);
    button.addEventListener('click', async () => {
      selectedCommunityId = community.id;
      await loadPosts(community.id);
      renderCommunities(communities);
    });
    item.append(
      button,
      AnchorApi.createElement('p', '', community.description || '暂无介绍。'),
      AnchorApi.createElement('div', 'muted', `${community.memberCount} 位梦中人 · ${community.postCount} 条讨论`)
    );
    list.append(item);
  }
}

async function loadPosts(communityId) {
  const data = await AnchorApi.request(`/api/communities/${communityId}/posts`);
  document.getElementById('selectedCommunityTitle').textContent = data.community.name;
  renderPosts(data.posts);
}

function renderPosts(posts) {
  const list = document.getElementById('communityPosts');
  list.textContent = '';
  if (!selectedCommunityId) {
    list.append(AnchorApi.createElement('p', 'muted', '选择或建立一个社区后开始讨论。'));
    return;
  }
  if (!posts.length) {
    list.append(AnchorApi.createElement('p', 'muted', '还没有讨论，写下第一段梦话。'));
    return;
  }

  for (const post of posts) {
    const item = document.createElement('article');
    item.className = 'comment-item';
    item.append(
      AnchorApi.createElement('div', 'movie-title', post.title),
      AnchorApi.createElement('div', 'comment-author', `${post.author.displayName} · ${post.author.publicId}`),
      AnchorApi.createElement('p', '', post.body),
      AnchorApi.createElement('time', 'muted', post.createdAt)
    );
    list.append(item);
  }
}

document.addEventListener('DOMContentLoaded', loadCommunityPage);
