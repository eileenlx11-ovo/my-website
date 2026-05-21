async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function searchBooks(query) {
  const results = [];
  const openLibrary = await fetchJson(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`);
  if (openLibrary?.docs) {
    for (const doc of openLibrary.docs.slice(0, 5)) {
      results.push({
        sourceType: 'open_library',
        kind: 'book',
        literatureTitle: doc.title,
        literatureAuthor: doc.author_name?.[0] || '作者待考',
        quote: null,
        movieTitle: null,
        movieYear: null,
        movieDirector: null,
        description: `开放书籍资料：${doc.title}${doc.first_publish_year ? `，首版 ${doc.first_publish_year}` : ''}`,
        externalUrl: doc.key ? `https://openlibrary.org${doc.key}` : null,
        keywords: [query, doc.title].filter(Boolean),
        videos: []
      });
    }
  }

  if (process.env.GOOGLE_BOOKS_API_KEY) {
    const google = await fetchJson(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${process.env.GOOGLE_BOOKS_API_KEY}`);
    if (google?.items) {
      for (const item of google.items.slice(0, 5)) {
        const info = item.volumeInfo || {};
        results.push({
          sourceType: 'google_books',
          kind: 'book',
          literatureTitle: info.title,
          literatureAuthor: info.authors?.[0] || '作者待考',
          quote: null,
          movieTitle: null,
          movieYear: null,
          movieDirector: null,
          description: info.description ? stripHtml(info.description).slice(0, 240) : `Google Books 资料：${info.title}`,
          externalUrl: safeExternalUrl(info.infoLink),
          keywords: [query, info.title].filter(Boolean),
          videos: []
        });
      }
    }
  }

  return results;
}

function stripHtml(text) {
  return String(text).replace(/<[^>]*>/g, '');
}

function safeExternalUrl(url) {
  try {
    const parsed = new URL(url);
    const allowedHosts = ['books.google.com', 'openlibrary.org'];
    return allowedHosts.includes(parsed.hostname) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

module.exports = { searchBooks };
