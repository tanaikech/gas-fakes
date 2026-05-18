import http from 'http';
import { ServerWorkerContext } from './serverworker.js';

const CLIENT_POLYFILL = `
<link rel="stylesheet" href="https://ssl.gstatic.com/docs/script/css/add-ons1.css">
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
            let hasError = false;
            let errorMsg = '';
            
            // Validate arguments according to Google Apps Script rules
            const validateArg = (arg) => {
              if (arg === undefined) {
                hasError = true;
                errorMsg = 'google.script.run cannot process undefined arguments.';
              } else if (typeof arg === 'function') {
                hasError = true;
                errorMsg = 'google.script.run cannot process function arguments.';
              } else if (typeof Element !== 'undefined' && arg instanceof Element) {
                hasError = true;
                errorMsg = 'google.script.run cannot process DOM element arguments.';
              } else if (arg === window) {
                hasError = true;
                errorMsg = 'google.script.run cannot process window object arguments.';
              } else if (arg !== null && typeof arg === 'object') {
                // deep validation could go here, but shallow is usually enough for the common mistakes
              }
            };
            args.forEach(validateArg);

            if (hasError) {
              if (target._fh) {
                setTimeout(() => target._fh(new Error(errorMsg), target._uo), 0);
              }
              return;
            }

            fetch(window.location.origin + '/__gas_rpc', {
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
    close: function() { 
      if (window.top && window.top !== window) {
        window.top.postMessage({ type: 'gas-fakes-close' }, '*');
      } else {
        document.body.innerHTML = '<h3 style="font-family: sans-serif; text-align: center; margin-top: 50px;">Dialog Closed. You may close this tab.</h3>';
      }
    },
    origin: window.location.origin,
    setHeight: function(h) { console.log('gas-fakes: Host setHeight called with', h); },
    setWidth: function(w) { console.log('gas-fakes: Host setWidth called with', w); }
  };
//# sourceURL=gas-fakes:///polyfill.js
</script>
`;

export function startServer(port = 3000, scriptPath = null, entryFunction = 'doGet') {
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url.startsWith('/')) {
      // 1. Serve GET request
      try {
        const ctx = new ServerWorkerContext(scriptPath);
        // Emulate the event object passed to doGet
        const url = new URL(req.url, `http://${req.headers.host}`);
        const getEvent = { 
            parameter: Object.fromEntries(url.searchParams.entries()), 
            parameters: Object.fromEntries([...url.searchParams.keys()].map(k => [k, url.searchParams.getAll(k)])), 
            queryString: url.search.substring(1), 
            contextPath: '', 
            contentLength: 0 
        };
        const result = ctx.runFunction(entryFunction, [getEvent]);
        
        if (result && result.__isHtmlOutput) {
           let html = result.content;
           // Inject polyfill
           if (html.toLowerCase().includes('</head>')) {
               html = html.replace(/<\/head>/i, CLIENT_POLYFILL + '</head>');
           } else {
               html = CLIENT_POLYFILL + html;
           }

           if (result.__framingType === 'modal' || result.__framingType === 'sidebar') {
               const isSidebar = result.__framingType === 'sidebar';
               const widthStr = isSidebar ? '300px' : '600px';
               const heightStr = isSidebar ? '100vh' : '450px';
               const safeTitle = (result.title || 'gas-fakes Dialog').replace(/"/g, '&quot;');
               
               const modalCss = `
                   body { background-color: rgba(0,0,0,0.6); margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: 'Google Sans', Roboto, Arial, sans-serif; overflow: hidden; }
                   .dialog { width: ${widthStr}; height: ${heightStr}; background: #fff; border-radius: 8px; box-shadow: 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12), 0 11px 15px -7px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; }
                   .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 14px 24px; border-bottom: 1px solid transparent; }
                   .dialog-title { font-size: 22px; color: #202124; margin: 0; line-height: 28px; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                   .dialog-close { background: none; border: none; font-size: 20px; color: #5f6368; cursor: pointer; padding: 0; line-height: 1; }
                   .dialog-close:hover { color: #202124; }
                   .dialog-content { padding: 0; flex-grow: 1; display: flex; border: none; }
                   iframe { border: none; width: 100%; height: 100%; background: #fff; }
               `;

               const sidebarCss = `
                   body { background-color: transparent; margin: 0; display: flex; justify-content: flex-end; height: 100vh; font-family: 'Google Sans', Roboto, Arial, sans-serif; overflow: hidden; pointer-events: none; }
                   .dialog { width: ${widthStr}; height: ${heightStr}; background: #fff; box-shadow: -1px 0 4px rgba(0,0,0,0.2); display: flex; flex-direction: column; pointer-events: auto; border-left: 1px solid #dadce0; }
                   .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 16px; border-bottom: 1px solid #dadce0; }
                   .dialog-title { font-size: 16px; color: #202124; margin: 0; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                   .dialog-close { background: none; border: none; font-size: 20px; color: #5f6368; cursor: pointer; padding: 0; line-height: 1; }
                   .dialog-close:hover { color: #202124; }
                   .dialog-content { flex-grow: 1; display: flex; border: none; }
                   iframe { border: none; width: 100%; height: 100%; background: #fff; }
               `;

               const css = isSidebar ? sidebarCss : modalCss;
               
               // We encode the HTML so we can safely inject it into the iframe using document.write
               const encodedHtml = encodeURIComponent(html);

               html = `
<!DOCTYPE html>
<html>
  <head>
    <title>${safeTitle}</title>
    <style>${css}</style>
  </head>
  <body>
    <div class="dialog">
      <div class="dialog-header">
        <h2 class="dialog-title">${safeTitle}</h2>
        <button class="dialog-close" aria-label="Close" onclick="closeDialog()">x</button>
      </div>
      <div class="dialog-content">
        <iframe id="gas-fakes-frame"></iframe>
      </div>
    </div>
    <script>
      // Handle programmatic closures from google.script.host.close()
      window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'gas-fakes-close') {
           document.body.innerHTML = '<h3 style="font-family: sans-serif; text-align: center; margin-top: 50px;">Dialog Closed. You may close this tab.</h3>';
        }
      });
      // Handle the 'X' button
      function closeDialog() {
         document.body.innerHTML = '<h3 style="font-family: sans-serif; text-align: center; margin-top: 50px;">Dialog Closed. You may close this tab.</h3>';
      }

      const iframe = document.getElementById('gas-fakes-frame');
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(decodeURIComponent("${encodedHtml}"));
      iframe.contentWindow.document.close();
    </script>
  </body>
  </html>`;
         }

         res.writeHead(200, { 'Content-Type': 'text/html' });           res.end(html);
        } else if (result && result.__isTextOutput) {
           res.writeHead(200, { 'Content-Type': result.mimeType || 'text/plain' });
           res.end(result.content);
        } else {
           res.writeHead(200, { 'Content-Type': 'text/plain' });
           res.end(typeof result === 'string' ? result : JSON.stringify(result));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end("Error executing " + entryFunction + ": " + err.message);
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
    console.log('\n=================================================');
    console.log('🚀 gas-fakes Web App running at: http://localhost:' + port);
    console.log('=================================================\n');
  });
  
  return server;
}
