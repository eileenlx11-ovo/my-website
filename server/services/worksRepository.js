const { safeVideo } = require('./videoProviders');

const synonymGroups = [
  ['雨', '雨夜', '下雨', '雨天', '潮湿', '路灯', '巷弄', '伞'],
  ['雪', '冬天', '冬日', '寒冷', '白色', '山', '离别'],
  ['夏日', '夏天', '盛夏', '阳光', '炎热', '庄园', '绿裙子'],
  ['绿', '绿色', '祖母绿', '绿裙子', '草坪', '欲望'],
  ['红', '红色', '暗红', '旗袍', '暧昧', '香港'],
  ['孤独', '寂寞', '城市', '夜晚', '霓虹', '失眠'],
  ['青春', '暗恋', '信', '遗憾', '回忆', '校园'],
  ['海', '海边', '海浪', '蓝色', '夏天', '告别'],
  ['战争', '废墟', '逃亡', '历史', '时代', '苦难'],
  ['童话', '粉色', '酒店', '荒诞', '对称', '甜美'],
  ['爵士', '派对', '金色', '繁华', '纽约', '烟花'],
  ['雾', '清晨', '荒野', '古典', '告白', '散步'],
  ['火车', '旅行', '远方', '车站', '离别', '重逢'],
  ['月亮', '月光', '夜', '梦', '诗意', '乡愁'],
  ['花', '玫瑰', '花园', '爱情', '温柔', '春天']
];

function mapWork(row) {
  if (!row) return null;
  return {
    id: row.id,
    sourceType: row.source_type,
    kind: row.kind,
    literatureTitle: row.literature_title,
    literatureAuthor: row.literature_author,
    quote: row.quote,
    movieTitle: row.movie_title,
    movieYear: row.movie_year,
    movieDirector: row.movie_director,
    description: row.description,
    externalUrl: row.external_url,
    createdAt: row.created_at
  };
}

function getKeywords(db, workId) {
  return db.prepare('SELECT keyword FROM work_keywords WHERE work_id = ? ORDER BY keyword').all(workId).map((row) => row.keyword);
}

function getVideos(db, workId) {
  return db.prepare('SELECT * FROM videos WHERE work_id = ? ORDER BY id').all(workId).map(safeVideo).filter(Boolean);
}

function hydrateWork(db, row) {
  const work = mapWork(row);
  if (!work) return null;
  work.keywords = getKeywords(db, work.id);
  work.videos = getVideos(db, work.id);
  return work;
}

function searchLocalWorks(db, query) {
  const terms = expandSearchTerms(query);
  const rows = db.prepare('SELECT * FROM works ORDER BY id DESC LIMIT 500').all();

  return rows
    .map((row) => {
      const work = hydrateWork(db, row);
      return { work, score: scoreWork(work, terms) };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.work.id - a.work.id)
    .slice(0, 30)
    .map((item) => item.work);
}

function expandSearchTerms(query) {
  const normalized = normalize(query);
  const terms = new Set([normalized]);

  for (const part of String(query).split(/[\s,，。；;、]+/)) {
    const token = normalize(part);
    if (token) terms.add(token);
  }

  if (/^[一-龥]{2,12}$/.test(normalized)) {
    for (let index = 0; index < normalized.length; index += 1) {
      terms.add(normalized[index]);
      if (index < normalized.length - 1) terms.add(normalized.slice(index, index + 2));
    }
  }

  for (const group of synonymGroups) {
    if (group.some((word) => normalized.includes(normalize(word)) || normalize(word).includes(normalized))) {
      group.forEach((word) => terms.add(normalize(word)));
    }
  }

  return [...terms].filter(Boolean).sort((a, b) => b.length - a.length);
}

function scoreWork(work, terms) {
  const keywordText = normalize((work.keywords || []).join(' '));
  const titleText = normalize([work.literatureTitle, work.literatureAuthor, work.movieTitle, work.movieDirector].filter(Boolean).join(' '));
  const bodyText = normalize([work.quote, work.description].filter(Boolean).join(' '));
  let score = 0;

  for (const term of terms) {
    if (!term) continue;
    if (keywordText.split(' ').includes(term)) score += 30;
    else if (keywordText.includes(term)) score += 18;

    if (titleText.includes(term)) score += 16;
    if (bodyText.includes(term)) score += term.length > 1 ? 8 : 3;
  }

  return score;
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s\-—_《》“”"'‘’.,，。:：;；!?！？()（）\[\]【】]/g, '');
}

function getWork(db, id) {
  return hydrateWork(db, db.prepare('SELECT * FROM works WHERE id = ?').get(id));
}

function insertExternalWork(db, item) {
  const existing = db.prepare(`
    SELECT * FROM works
    WHERE source_type = ?
      AND COALESCE(literature_title, '') = COALESCE(?, '')
      AND COALESCE(movie_title, '') = COALESCE(?, '')
    LIMIT 1
  `).get(item.sourceType, item.literatureTitle || null, item.movieTitle || null);
  if (existing) return hydrateWork(db, existing);

  const insertWork = db.prepare(`
    INSERT INTO works (
      source_type, kind, literature_title, literature_author, quote,
      movie_title, movie_year, movie_director, description, external_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = insertWork.run(
    item.sourceType,
    item.kind,
    item.literatureTitle || null,
    item.literatureAuthor || null,
    item.quote || null,
    item.movieTitle || null,
    item.movieYear || null,
    item.movieDirector || null,
    item.description || '',
    item.externalUrl || null
  );

  const insertKeyword = db.prepare('INSERT INTO work_keywords (work_id, keyword) VALUES (?, ?)');
  for (const keyword of item.keywords || []) {
    if (keyword) insertKeyword.run(result.lastInsertRowid, String(keyword).slice(0, 80));
  }

  return getWork(db, result.lastInsertRowid);
}

function getComments(db, workId) {
  return db.prepare(`
    SELECT c.id, c.body, c.created_at, u.display_name, u.public_id
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.work_id = ? AND c.status = 'visible'
    ORDER BY c.id DESC
  `).all(workId).map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    author: {
      displayName: row.display_name,
      publicId: row.public_id
    }
  }));
}

module.exports = { searchLocalWorks, getWork, insertExternalWork, getComments, hydrateWork, expandSearchTerms };
