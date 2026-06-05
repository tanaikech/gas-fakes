#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const logFile = process.env.OMLX_MCP_LOG
  || path.join(process.cwd(), 'gasmess', 'omlx_mcp.log');

function log(msg) {
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${msg}\n`);
  } catch {
    // Logging must not break the MCP server.
  }
}

log('Starting oMLX MCP Server...');

function envOr(key, fallback) {
  const value = process.env[key];
  return value && value.trim() ? value : fallback;
}

const BASE_URL = envOr('AGY_CUSTOM_BASE_URL', 'http://localhost:8000/v1');
const MODEL = envOr('AGY_DEFAULT_MODEL', 'gemma-4-e4b-it-OptiQ-4bit');
const API_KEY = envOr('AGY_CUSTOM_API_KEY', 'trumpity');

log(`Configuration: URL=${BASE_URL}, MODEL=${MODEL}, LOG=${logFile}`);

let buffer = '';

process.stdin.on('data', (chunk) => {
  buffer += chunk.toString();
  let lineEndIndex;
  while ((lineEndIndex = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, lineEndIndex).trim();
    buffer = buffer.slice(lineEndIndex + 1);
    if (line) {
      handleMessage(line);
    }
  }
});

async function handleMessage(line) {
  try {
    log(`Received: ${line}`);
    const request = JSON.parse(line);

    if (request.method === 'initialize') {
      sendResponse({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'omlx-mcp', version: '1.0.0' }
        }
      });
    } else if (request.method === 'notifications/initialized') {
      log('Initialized notification received');
    } else if (request.method === 'tools/list') {
      sendResponse({
        jsonrpc: '2.0',
        id: request.id,
        result: {
          tools: [
            {
              name: 'query_local_model',
              description: 'Send a prompt or coding instruction to the locally running oMLX model and get its response.',
              inputSchema: {
                type: 'object',
                properties: {
                  prompt: {
                    type: 'string',
                    description: 'The prompt or instruction to send to the local model.'
                  }
                },
                required: ['prompt']
              }
            }
          ]
        }
      });
    } else if (request.method === 'tools/call') {
      const toolName = request.params.name;
      const toolArgs = request.params.arguments || {};

      if (toolName === 'query_local_model') {
        const prompt = toolArgs.prompt;
        log(`Calling query_local_model with prompt length: ${prompt?.length ?? 0}`);

        try {
          const resultText = await queryOmlx(prompt);
          sendResponse({
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [{ type: 'text', text: resultText }]
            }
          });
        } catch (err) {
          log(`Error querying oMLX: ${err.message}`);
          sendError(request.id, -32603, `Failed to query oMLX model: ${err.message}`);
        }
      } else {
        sendError(request.id, -32601, `Tool not found: ${toolName}`);
      }
    } else if (request.id !== undefined) {
      sendError(request.id, -32601, `Method not found: ${request.method}`);
    }
  } catch (err) {
    log(`Error handling message: ${err.message}`);
  }
}

function sendResponse(response) {
  const line = JSON.stringify(response) + '\n';
  log(`Sending: ${line.trim()}`);
  process.stdout.write(line);
}

function sendError(id, code, message) {
  sendResponse({
    jsonrpc: '2.0',
    id,
    error: { code, message }
  });
}

async function queryOmlx(prompt) {
  const url = `${BASE_URL.replace(/\/$/, '')}/chat/completions`;
  log(`Fetching oMLX at ${url}`);

  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) {
    headers.Authorization = `Bearer ${API_KEY}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
