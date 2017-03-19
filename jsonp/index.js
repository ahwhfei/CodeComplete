((function () {
    const http = require('http');

    // returns content-type = text/plain
    const server = http.createServer((req, res) => {
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('X-Foo', 'bar');
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('ok');
    }).listen(9000);
})());