export const config = { runtime: 'edge' };

export default async function handler(req) {
  const feeds = [
    'https://www.esgtodaynews.com/feed/',
    'https://feeds.reuters.com/reuters/businessNews',
  ];

  try {
    const results = await Promise.all(
      feeds.map(url => fetch(url).then(r => r.text()))
    );

    const items = [];
    results.forEach(xml => {
      const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
      for (const match of matches) {
        const title = match[1].match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] || match[1].match(/<title>(.*?)<\/title>/)?.[1] || '';
        const link = match[1].match(/<link>(.*?)<\/link>/)?.[1] || '';
        const desc = match[1].match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] || '';
        if (title) items.push({ title: title.trim(), link: link.trim(), summary: desc.replace(/<[^>]*>/g, '').slice(0, 120).trim() + '...' });
      }
    });

    return new Response(JSON.stringify(items.slice(0, 12)), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
