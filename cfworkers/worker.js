addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const apiUrl = `https://${HOST}/api/admin/invite/list`;  // `HOST`は環境変数として直接使用
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`  // `TOKEN`も環境変数として直接使用
    },
    body: JSON.stringify({
      limit: 5,
      type: 'unused',
      sort: '-createdAt'
    })
  });

  if (!response.ok) {
    return new Response(`API Error: ${response.status} - ${response.statusText}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  const data = await response.json();
  const filteredCodes = Array.isArray(data)
    ? data
        .filter(item => item.createdBy.username === 'admin')
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
        a:link { color: #3399cc; }
        a:visited { color: #cc6633; }
        @media (prefers-color-scheme: dark) {body {background-color: #2E2F31; color: #f5f5f5;li { background: #48494d;}}
      </style>
    </head>
    <body>
      <h1>テレホ鯖 招待コード</h1>
      <p>招待コードが使えない場合は、バグの可能性もあるため、お手数ですが<a href="https://forms.gle/2Tr4XTPSWsGGttUu7">お問い合わせ</a>ください。</p>
      <p>このページに招待コードが表示されない場合は売り切れです。入荷までお待ちください。</p>
      <ul>
        ${filteredCodes.map(code => `<li>${code}</li>`).join('')}
      </ul>
      <p><a href="https://204.jp">テレホ鯖へアクセス</a></p>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
