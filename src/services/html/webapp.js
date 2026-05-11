import http from 'http';
import { ServerWorkerContext } from './serverworker.js';

const CLIENT_POLYFILL = `
<script>
  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = (function() {
    function RunProxy(handlers) {
      this._sh = handlers ? handlers._sh : null;
      this._fh = handlers ? handlers._fh : null;
      this._uo = handlers ? handlers._uo : null;

      return new Proxy(this, {
        get: (target, prop) => {
          if (prop === 'withSuccessHandler') return (h) => new RunProxy({ ...target, _sh: h });
          if (prop === 'withFailureHandler') return (h) => new RunProxy({ ...target, _fh: h });
          if (prop === 'withUserObject') return (o) => new RunProxy({ ...target, _uo: o });
          
          return (...args) => {
            fetch('/__gas_rpc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ funcName: prop, args: args })
            })
            .then(r => r.json())
            .then(data => {
              if (data.error) {
                if (target._fh) target._fh(new Error(data.error), target._uo);
              } else {
                if (target._sh) target._sh(data.result, target._uo);
              }
            })
            .catch(err => {
              if (target._fh) target._fh(err, target._uo);
            });
          };
        }
      });
    }
    return new RunProxy();
  })();
  window.google.script.host = {
    close: function() { window.close(); },
    origin: window.location.origin,
    setHeight: function(h) { console.log('gas-fakes: Host setHeight called with', h); },
    setWidth: function(w) { console.log('gas-fakes: Host setWidth called with', w); }
  };
</script>
`;

export function startServer(port = 3000, scriptPath = null) {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/')) {
      // 1. Serve doGet
      try {
        const ctx = new ServerWorkerContext(scriptPath);
        // Emulate the event object passed to doGet
        const url = new URL(req.url, `http://${req.headers.host}`);
        const doGetEvent = { 
            parameter: Object.fromEntries(url.searchParams.entries()), 
            parameters: Object.fromEntries([...url.searchParams.keys()].map(k => [k, url.searchParams.getAll(k)])), 
            queryString: url.search.substring(1), 
            contextPath: '', 
            contentLength: 0 
        };
        const result = ctx.runFunction('doGet', [doGetEvent]);
        
        if (result && result.__isHtmlOutput) {
           let html = result.content;
           // Inject polyfill
           if (html.toLowerCase().includes('</head>')) {
               html = html.replace(/<\/head>/i, CLIENT_POLYFILL + '</head>');
           } else {
               html = CLIENT_POLYFILL + html;
           }
           res.writeHead(200, { 'Content-Type': 'text/html' });
           res.end(html);
        } else if (result && result.__isTextOutput) {
           res.writeHead(200, { 'Content-Type': result.mimeType || 'text/plain' });
           res.end(result.content);
        } else {
           res.writeHead(200, { 'Content-Type': 'text/plain' });
           res.end(typeof result === 'string' ? result : JSON.stringify(result));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end("Error executing doGet: " + err.message);
      }
    } else if (req.method === 'POST' && req.url === '/__gas_rpc') {
      // 2. Handle google.script.run RPC requests
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
         try {
            const payload = JSON.parse(body);
            const ctx = new ServerWorkerContext(scriptPath);
            // Execute the requested function statelessly
            const result = ctx.runFunction(payload.funcName, payload.args);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ result }));
         } catch (err) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
         }
      });
    } else if (req.method === 'POST' && req.url === '/') {
      // 3. Serve doPost
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          const ctx = new ServerWorkerContext(scriptPath);
          const doPostEvent = { 
            postData: { 
              contents: body, 
              type: req.headers['content-type'] 
            }, 
            parameter: {}, 
            parameters: {}, 
            queryString: '', 
            contextPath: '', 
            contentLength: body.length 
          };
          const result = ctx.runFunction('doPost', [doPostEvent]);
          
          if (result && result.__isHtmlOutput) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(result.content);
          } else if (result && result.__isTextOutput) {
            res.writeHead(200, { 'Content-Type': result.mimeType || 'text/plain' });
            res.end(result.content);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(typeof result === 'string' ? result : JSON.stringify(result));
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end("Error executing doPost: " + err.message);
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(port, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 gas-fakes Web App running at: http://localhost:${port}`);
    console.log(`=================================================\n`);
  });
  
  return server;
}
