// webllm-worker.js - This file is served from the public/ directory.
// We use importScripts to pull the WebWorkerMLCEngineHandler directly from CDN 
// to avoid local bundling issues during development.

importScripts("https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/lib/index.js");

// The library is now available under the 'webllm' global if using CDN bundle,
// or we can just hook up the message handler.
const handler = new self.webllm.WebWorkerMLCEngineHandler();

self.onmessage = (msg) => {
    handler.onmessage(msg);
};
