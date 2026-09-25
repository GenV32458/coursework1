const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 3000;
const root = __dirname;
const languageCodes = { luganda: "lug", french: "fr" };
const translationCache = new Map();
const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png"
};

function sendJson(response, statusCode, value) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(value));
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";
        request.on("data", chunk => {
            body += chunk;
            if (body.length > 20_000) request.destroy();
        });
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

async function handleTranslation(request, response) {
    const apiKey = process.env.FASIRI_API_KEY;
    if (!apiKey) {
        sendJson(response, 503, { error: "The free Fasiri API key is not configured." });
        return;
    }

    try {
        const body = JSON.parse(await readBody(request));
        const target = languageCodes[body.target];
        if (!body.text || typeof body.text !== "string" || !target) {
            sendJson(response, 400, { error: "Invalid text or target language." });
            return;
        }

        const cacheKey = `${target}:${body.text.trim().toLowerCase()}`;
        if (translationCache.has(cacheKey)) {
            sendJson(response, 200, { translation: translationCache.get(cacheKey) });
            return;
        }

        const endpoint = process.env.FASIRI_API_ENDPOINT || "https://api.fasiri-ai.com/api/v1/translate";
        const apiResponse = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                text: body.text,
                source_lang: "en",
                target_lang: target
            })
        });
        const data = await apiResponse.json();
        if (!apiResponse.ok) throw new Error(data.error?.message || "The translation service returned an error.");
        const translation = data.translated_text || data.translation || data.result?.translated_text;
        if (!translation) throw new Error("The translation service returned an unexpected response.");
        translationCache.set(cacheKey, translation);
        sendJson(response, 200, { translation });
    } catch (error) {
        sendJson(response, 502, { error: error.message || "Could not reach the translation service." });
    }
}

function serveFile(request, response) {
    const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
    const filePath = path.resolve(root, `.${decodeURIComponent(requestPath)}`);
    if (!filePath.startsWith(`${root}${path.sep}`)) {
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
        response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
        response.end(data);
    });
}

http.createServer(async (request, response) => {
    if (request.method === "POST" && request.url === "/api/translate") {
        await handleTranslation(request, response);
        return;
    }
    if (request.method === "GET") {
        serveFile(request, response);
        return;
    }
    response.writeHead(405);
    response.end("Method not allowed");
}).listen(port, () => {
    console.log(`KYU Lingua is running at http://localhost:${port}`);
});
