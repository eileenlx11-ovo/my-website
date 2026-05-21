let selectedVideo = null;

async function executeSearch() {
  const searchInput = document.getElementById('searchInput').value.trim();
  const container = document.getElementById('resultsContainer');

  if (!searchInput) {
    container.textContent = '';
    container.append(statusMessage('请在打字机前留下您的意象。', 'var(--accent-red)'));
    return;
  }

  container.textContent = '';
  container.append(statusMessage('[ 正在暗房中显影底片... ]', 'var(--gold)'));

  try {
    const data = await AnchorApi.request(`/api/search?q=${encodeURIComponent(searchInput)}`);
    renderResults(data.results, data.externalStatus);
  } catch (error) {
    container.textContent = '';
    container.append(statusMessage(error.message, 'var(--accent-red)'));
  }
}

function renderResults(results, externalStatus) {
  const container = document.getElementById('resultsContainer');
  container.textContent = '';

  if (!results.length) {
    container.append(statusMessage('胶片库中暂无此意象的存档。请尝试：绿、雪、旗袍、派对、雾、粉色、遗憾、夏日。', '#9a9386'));
    return;
  }

  const providerNote = document.createElement('div');
  providerNote.className = 'provider-note';
  providerNote.textContent = providerStatusText(externalStatus);
  container.append(providerNote);

  for (const work of results) {
    container.append(renderResultCard(work));
  }
}

function renderResultCard(work) {
  const card = document.createElement('article');
  card.className = 'result-item';

  const literature = document.createElement('section');
  literature.className = 'literature-section';
  literature.append(
    AnchorApi.createElement('div', 'tag-line', work.kind === 'movie' ? 'Movie / 电影资料' : 'Chapter / 纸页上的字句'),
    AnchorApi.createElement('p', 'literature-text', work.quote || work.description),
    AnchorApi.createElement('div', 'book-title', work.literatureTitle ? `——《${work.literatureTitle}》 ${work.literatureAuthor || ''}` : '—— 外部电影资料')
  );

  const movie = document.createElement('section');
  movie.className = 'movie-match';
  movie.append(
    AnchorApi.createElement('div', 'tag-line', 'Frame / 显影的胶片'),
    AnchorApi.createElement('h4', 'movie-title', work.movieTitle ? `🎬 ${work.movieTitle}${work.movieYear ? ` (${work.movieYear})` : ''}` : '待匹配电影片段'),
    AnchorApi.createElement('p', 'movie-desc', work.movieTitle ? work.description : '这是来自开放书籍资料的结果，可进入详情页继续评论、分享或等待后续电影匹配。')
  );

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  if (work.videos?.length) {
    const play = document.createElement('button');
    play.className = 'play-btn';
    play.textContent = '🎬 放映此幕';
    play.addEventListener('click', () => openVideo(work.videos[0]));
    actions.append(play);
  }

  const detail = document.createElement('a');
  detail.className = 'btn detail-link';
  detail.href = `work.html?id=${work.id}`;
  detail.textContent = '进入批注页';
  actions.append(detail);

  if (work.externalUrl) {
    const external = document.createElement('a');
    external.className = 'btn detail-link';
    external.href = work.externalUrl;
    external.target = '_blank';
    external.rel = 'noopener noreferrer';
    external.textContent = '查看合法来源';
    actions.append(external);
  }

  movie.append(actions);
  card.append(literature, movie);
  return card;
}

function openVideo(video) {
  const modal = document.getElementById('videoModal');
  const box = document.getElementById('videoPlayerBox');
  selectedVideo = video;
  AnchorApi.renderVideoEmbed(box, video, '电影片段');
  modal.style.display = 'flex';
}

function closeVideo() {
  selectedVideo = null;
  document.getElementById('videoModal').style.display = 'none';
  document.getElementById('videoPlayerBox').textContent = '';
}

function statusMessage(text, color) {
  const node = document.createElement('div');
  node.className = 'empty-state';
  node.style.color = color;
  node.textContent = text;
  return node;
}

function providerStatusText(status = {}) {
  if (status.books === 'skipped' && status.movies === 'skipped') return '已从站内资料库返回匹配结果。';
  return '已同时尝试开放书籍/电影 API；缺少密钥的平台会自动跳过，站内资料仍可使用。';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchButton')?.addEventListener('click', executeSearch);
  document.getElementById('searchInput')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') executeSearch();
  });
});
