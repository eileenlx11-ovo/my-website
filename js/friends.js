async function loadFriendsPage() {
  try {
    const user = await AnchorApi.currentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    document.getElementById('myPublicId').textContent = user.publicId;
    setupFriendForm();
    await refreshFriendsData();
  } catch (error) {
    document.getElementById('friendNotice').textContent = error.message;
  }
}

function setupFriendForm() {
  document.getElementById('addFriendForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const notice = document.getElementById('friendNotice');
    try {
      await AnchorApi.request('/api/friend-requests', {
        method: 'POST',
        body: JSON.stringify({ publicId: document.getElementById('friendPublicId').value.trim() })
      });
      notice.textContent = '好友请求已送达。';
      event.target.reset();
      await refreshFriendsData();
    } catch (error) {
      notice.textContent = error.message;
    }
  });
}

async function refreshFriendsData() {
  const [friendsData, requestsData, sharesData] = await Promise.all([
    AnchorApi.request('/api/friends'),
    AnchorApi.request('/api/friend-requests'),
    AnchorApi.request('/api/shares/inbox')
  ]);
  renderFriends(friendsData.friends);
  renderRequests(requestsData.requests);
  renderShares(sharesData.shares);
}

function renderFriends(friends) {
  const list = document.getElementById('friendsList');
  list.textContent = '';
  if (!friends.length) {
    list.append(AnchorApi.createElement('p', 'muted', '还没有好友。'));
    return;
  }
  for (const friend of friends) {
    list.append(AnchorApi.createElement('li', '', `${friend.displayName} · ${friend.publicId}`));
  }
}

function renderRequests(requests) {
  const list = document.getElementById('requestsList');
  list.textContent = '';
  if (!requests.length) {
    list.append(AnchorApi.createElement('p', 'muted', '暂无待处理请求。'));
    return;
  }
  for (const request of requests) {
    const item = document.createElement('li');
    item.textContent = `${request.requester.displayName} · ${request.requester.publicId} `;
    const accept = AnchorApi.createElement('button', 'mini-btn', '接受');
    accept.addEventListener('click', () => handleRequest(request.id, 'accept'));
    const reject = AnchorApi.createElement('button', 'mini-btn', '拒绝');
    reject.addEventListener('click', () => handleRequest(request.id, 'reject'));
    item.append(accept, reject);
    list.append(item);
  }
}

async function handleRequest(id, action) {
  await AnchorApi.request(`/api/friend-requests/${id}/${action}`, { method: 'POST' });
  await refreshFriendsData();
}

function renderShares(shares) {
  const list = document.getElementById('sharesList');
  list.textContent = '';
  if (!shares.length) {
    list.append(AnchorApi.createElement('p', 'muted', '暂无收到的分享。'));
    return;
  }
  for (const share of shares) {
    const item = document.createElement('article');
    item.className = 'comment-item';
    const link = AnchorApi.createElement('a', 'movie-title', share.work.movieTitle || share.work.literatureTitle || '作品详情');
    link.href = `work.html?id=${share.work.id}`;
    item.append(
      AnchorApi.createElement('div', 'comment-author', `${share.sender.displayName} 分享给你`),
      link,
      AnchorApi.createElement('p', '', share.message || share.work.description)
    );
    list.append(item);
  }
}

document.addEventListener('DOMContentLoaded', loadFriendsPage);
