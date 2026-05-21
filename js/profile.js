async function loadProfilePage() {
  const notice = document.getElementById('profileNotice');
  try {
    const user = await AnchorApi.currentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }

    setupProfileForm();
    const [profileData, commentsData, friendsData] = await Promise.all([
      AnchorApi.request('/api/profile/me'),
      AnchorApi.request('/api/profile/me/comments'),
      AnchorApi.request('/api/friends')
    ]);

    renderProfile(profileData.profile);
    renderMyComments(commentsData.comments);
    renderProfileFriends(friendsData.friends);
  } catch (error) {
    notice.textContent = error.message;
  }
}

function setupProfileForm() {
  document.getElementById('profileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const notice = document.getElementById('profileNotice');
    try {
      const data = await AnchorApi.request('/api/profile/me', {
        method: 'PUT',
        body: JSON.stringify({
          bio: document.getElementById('profileBio').value.trim(),
          favoriteBookGenres: document.getElementById('favoriteBookGenres').value.trim(),
          favoriteMovieGenres: document.getElementById('favoriteMovieGenres').value.trim()
        })
      });
      renderProfile(data.profile);
      notice.textContent = '简介已保存。';
    } catch (error) {
      notice.textContent = error.message;
    }
  });
}

function renderProfile(profile) {
  document.getElementById('profileIdentity').textContent = `${profile.user.displayName} · ${profile.user.publicId}`;
  document.getElementById('profileBio').value = profile.bio;
  document.getElementById('favoriteBookGenres').value = profile.favoriteBookGenres;
  document.getElementById('favoriteMovieGenres').value = profile.favoriteMovieGenres;
}

function renderMyComments(comments) {
  const list = document.getElementById('myComments');
  list.textContent = '';
  if (!comments.length) {
    list.append(AnchorApi.createElement('p', 'muted', '你还没有写过批注。'));
    return;
  }

  for (const comment of comments) {
    const item = document.createElement('article');
    item.className = 'comment-item';
    const title = comment.work.movieTitle || comment.work.literatureTitle || '作品详情';
    const link = AnchorApi.createElement('a', 'movie-title', title);
    link.href = `work.html?id=${comment.work.id}#comments`;
    item.append(
      link,
      AnchorApi.createElement('p', '', comment.body),
      AnchorApi.createElement('time', 'muted', comment.createdAt)
    );
    list.append(item);
  }
}

function renderProfileFriends(friends) {
  const list = document.getElementById('profileFriends');
  list.textContent = '';
  if (!friends.length) {
    list.append(AnchorApi.createElement('p', 'muted', '还没有书友或票友。'));
    return;
  }

  for (const friend of friends) {
    list.append(AnchorApi.createElement('li', '', `${friend.displayName} · ${friend.publicId}`));
  }
}

document.addEventListener('DOMContentLoaded', loadProfilePage);
