async function updateNavAuthState() {
  const nav = document.querySelector('.nav-links');
  if (!nav || !window.AnchorApi) return;

  try {
    const user = await AnchorApi.currentUser();
    nav.querySelectorAll('[data-auth-dynamic]').forEach((node) => node.remove());
    const loginLinks = [...nav.querySelectorAll('a[href="login.html"]')];

    if (user) {
      loginLinks.forEach((link) => link.remove());

      const profile = document.createElement('a');
      profile.href = 'profile.html';
      profile.textContent = `访客 ${user.publicId}`;
      profile.dataset.authDynamic = 'true';

      const logout = document.createElement('a');
      logout.href = '#';
      logout.textContent = '退 出';
      logout.dataset.authDynamic = 'true';
      logout.addEventListener('click', async (event) => {
        event.preventDefault();
        AnchorApi.clearCurrentUser();
        await AnchorApi.request('/api/auth/logout', { method: 'POST' });
        window.location.href = 'index.html';
      });

      nav.append(profile, logout);
    } else if (!loginLinks.length) {
      const login = document.createElement('a');
      login.href = 'login.html';
      login.textContent = '访 客 登 记';
      login.dataset.authDynamic = 'true';
      nav.append(login);
    }
  } catch {
    return;
  }
}

document.addEventListener('DOMContentLoaded', updateNavAuthState);
