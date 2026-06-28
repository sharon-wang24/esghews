export const config = { runtime: 'edge' };

export default async function handler(req) {
  const feeds = [
    'https://api.rss2json.com/v1/api.json?rss_url=https://www.esgtodaynews.com/feed/',
    'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.reuters.com/reuters/businessNews',
  ];

  try {
    const results = await Promise.all(feeds.map(url => fetch(url).then(r => r.json())));
    
    const items = [];
    results.forEach(data => {
      if (data.items) {
        data.items.slice(0, 6).forEach(item => {
          items.push({
            title: item.title,
            link: item.link,
            summary: item.description?.replace(/<[^>]*>/g, '').slice(0, 120) + '...',
            source: data.feed?.title || 'ESG Today'
          });
        });
      }
    });

    return new Response(JSON.stringify(items), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch(e) {
    return new Response(JSON.stringify([]), { status: 500 });
  }
}
