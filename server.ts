
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8'
  });

  res.end(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My First Node.js Website</title>
      </head>
      <body>
        <h1>Hello World!</h1>
        <p>Welcome to my first Node.js website.</p>
        <p>This webpage is powered by Node.js and deployed on Vercel.</p>
      </body>
    </html>
  `);
});

server.listen(process.env.PORT || 3000);
