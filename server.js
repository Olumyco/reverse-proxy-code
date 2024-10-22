const http = require('http');
const port = 4000;

const proxyPorts = {
    simpleapi: 3500
};

const server = http.createServer((clientRequest, clientResponse) => {
    const portTrack = clientRequest.url.match(/^\/\w+/)[0];
    const hostport = proxyPorts[portTrack.slice(1)];

    if (hostport) {
        const path = clientRequest.url.split(portTrack)[1];

        const options = {
            hostname: '',
            port: hostport,
            path: path,
            method: clientRequest.method,
            headers: clientRequest.headers
        };
    
        makeRequest(options, clientRequest, clientResponse);
    } else {
        clientResponse.writeHead(400, {'Content-Type': 'application/json'});
        clientResponse.write(JSON.stringify({
            code: 1006,
            error: true,
            message: 'Endpoint not found!'
        }));
    }
    
});

const makeRequest = (options, clientRequest, clientResponse) => {
    const proxy = http.request(options, res => {
        clientResponse.writeHead(res.statusCode, res.headers);
        res.pipe(clientResponse, {end: true});
    });

    clientRequest.pipe(proxy, {end: true});
};

server.listen(port, () => console.log(`Proxy server running on port ${port}`));