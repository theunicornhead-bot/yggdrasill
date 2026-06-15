"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const GENERATED_DIR = path.join(ROOT, "generated", "mechs");

loadDotEnv(path.join(ROOT, ".env"));

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) return;
    const key = match[1];
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value.trim();
  });
}

function getOpenAiApiKey() {
  loadDotEnv(path.join(ROOT, ".env"));
  return String(process.env.OPENAI_API_KEY || "").trim();
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  });
  response.end(JSON.stringify(payload));
}

function sendNoContent(response) {
  response.writeHead(204, {
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  });
  response.end();
}

function sendHealth(response) {
  sendJson(response, 200, {
    ok: true,
    cwd: ROOT,
    hasOpenAiApiKey: Boolean(getOpenAiApiKey()),
    generatedDir: GENERATED_DIR
  });
}

function readRequestJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function safeUnitId(unitId) {
  const safe = String(unitId || "").replace(/[^A-Za-z0-9_-]/g, "");
  if (!safe) throw new Error("unitId is required");
  return safe;
}

async function generateMechImage(request, response) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    sendJson(response, 500, { ok: false, error: "OPENAI_API_KEY is not configured on the server" });
    return;
  }

  try {
    const body = await readRequestJson(request);
    const unitId = safeUnitId(body.unitId);
    const prompt = String(body.prompt || "").trim();
    if (!prompt) {
      sendJson(response, 400, { ok: false, error: "prompt is required" });
      return;
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size: "1024x1024",
        n: 1
      })
    });

    const payload = await openaiResponse.json().catch(() => ({}));
    if (!openaiResponse.ok) {
      const message = payload.error?.message || `OpenAI image generation failed with ${openaiResponse.status}`;
      sendJson(response, 502, { ok: false, error: message });
      return;
    }

    const image = payload.data?.[0];
    let imageBuffer = null;
    if (image?.b64_json) {
      imageBuffer = Buffer.from(image.b64_json, "base64");
    } else if (image?.url) {
      const imageResponse = await fetch(image.url);
      if (!imageResponse.ok) throw new Error(`Image download failed with ${imageResponse.status}`);
      imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    }
    if (!imageBuffer) throw new Error("OpenAI response did not include image data");

    fs.mkdirSync(GENERATED_DIR, { recursive: true });
    const filePath = path.join(GENERATED_DIR, `${unitId}.png`);
    fs.writeFileSync(filePath, imageBuffer);
    sendJson(response, 200, { ok: true, imagePath: `/generated/mechs/${unitId}.png` });
  } catch (error) {
    sendJson(response, 500, { ok: false, error: error.message || String(error) });
  }
}

function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const requestedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.normalize(path.join(ROOT, requestedPath));
  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "Content-Type": contentType(filePath), "Cache-Control": "no-store" });
    response.end(data);
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".csv": "text/csv; charset=utf-8",
    ".png": "image/png",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg"
  }[ext] || "application/octet-stream";
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (request.method === "GET" && url.pathname === "/api/health") {
    sendHealth(response);
    return;
  }
  if (request.method === "GET" && url.pathname === "/favicon.ico") {
    sendNoContent(response);
    return;
  }
  if (request.method === "OPTIONS" && url.pathname === "/api/generate-mech-image") {
    sendNoContent(response);
    return;
  }
  if (request.method === "POST" && url.pathname === "/api/generate-mech-image") {
    generateMechImage(request, response);
    return;
  }
  if (request.method === "GET") {
    serveStatic(request, response);
    return;
  }
  response.writeHead(405);
  response.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Yggdrasill local server: http://localhost:${PORT}`);
});
