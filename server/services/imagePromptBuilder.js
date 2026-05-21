const templateInstructions = {
  ticket: 'Design an original collectible cinema ticket. Horizontal ticket layout, perforated edges, serial number, elegant typography, aged paper texture.',
  bookmark: 'Design an original literary bookmark. Tall vertical composition, textured paper, refined typography, subtle decorative border, suitable for printing.',
  poster: 'Design an original vintage art poster. Strong cinematic composition, no real actor likeness, no official logo, no copyrighted poster replication.'
};

const defaultStyle = 'vintage film still, darkroom atmosphere, muted brass gold, deep burgundy, emerald green, aged paper, grain texture';

function buildImagePrompt(work, type, style = '') {
  const instruction = templateInstructions[type];
  if (!instruction) {
    throw new Error('Unsupported image type.');
  }

  const title = work.movieTitle || work.literatureTitle || 'Untitled';
  const literary = [work.literatureTitle, work.literatureAuthor].filter(Boolean).join(' by ');
  const film = [work.movieTitle, work.movieYear].filter(Boolean).join(', ');
  const quote = (work.quote || work.description || '').slice(0, 360);
  const requestedStyle = String(style || '').trim().slice(0, 80);

  return [
    instruction,
    `Subject title: ${title}.`,
    literary ? `Literary source: ${literary}.` : '',
    film ? `Film reference metadata: ${film}.` : '',
    `Mood excerpt: ${quote}`,
    `Visual direction: ${requestedStyle || defaultStyle}.`,
    'Create an original design inspired by the mood only. Do not depict real actors, official logos, copyrighted poster layouts, studio marks, or recognizable branded assets.',
    'No extra explanatory text outside the designed artifact. High-quality print-ready illustration.'
  ].filter(Boolean).join('\n');
}

function imageTypeLabel(type) {
  return {
    ticket: '电影票券',
    bookmark: '文学书签',
    poster: '复古海报'
  }[type] || type;
}

module.exports = { buildImagePrompt, imageTypeLabel };
