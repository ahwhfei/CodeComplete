var http = require('http');

var clientui = require('fs').readFileSync('chat-eventsource.html');
// var emulation = require('fs').readFileSync('EventSourceEmulation.js');

var clients = [];

setInterval(
    () => clients.forEach(client => client.wirte(':ping?n')), 
    20000);

var server = new http.createServer();

server.on('request', (request, response) => {
    var url = require('url').parse(request.url);

    if (url.pathname === '/') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        // response.write('<script>' + emulation + '</script>');
        response.write(clientui);
        response.end();
        return;
    } else if (url.pathname !== '/chat') {
        response.writeHead(404);
        response.end();
        return;
    }

    if (request.method === 'POST') {
        request.setEncoding('utf-8');
        var body = '';

        request.on('data', chunk => body += chunk);

        request.on('end', () => {
            response.writeHead(200);
            response.end();

            message = 'data: ' + body.replace('\n', '\nData: ') + '\r\n\r\n';
            clients.forEach(client => client.write(message));
        });
    } else {
        response.writeHead(200, {'Content-Type': 'text/event-stream'});
        response.write('data: Connected\n\n');

        request.connection.on('end', () => {
            clients.splice(clients.indexOf(response), 1);
            response.end();
        });

        clients.push(response);
    }
});

server.listen(8000);