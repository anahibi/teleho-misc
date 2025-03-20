addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
    const apiUrl = `https://${HOST}/api/admin/invite/list`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify({
        limit: 3
      })
    });
  
    if (!response.ok) {
      return new Response(`APIエラー: ${response.status} - ${response.statusText}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  
    const data = await response.json();
    const filteredCodes = Array.isArray(data)
      ? data
          .filter(item => item.createdBy === null && item.usedBy === null)
          .map(item => item.code)
      : [];
  
    const html = `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>テレホ鯖 招待コード</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          ul { list-style-type: none; padding: 0; }
          li { background: #f4f4f4; margin: 5px 0; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>テレホ鯖 招待コード</h1>
        <p>招待コードが使えない場合、Misskeyの不具合の可能性もあるため、お手数ですが<a href="https://forms.gle/2Tr4XTPSWsGGttUu7">お問い合わせ</a>ください。</p>
        <ul>
          ${filteredCodes.map(code => `<li>${code}</li>`).join('')}
        </ul>
      </body>
      </html>
    `;
  
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  