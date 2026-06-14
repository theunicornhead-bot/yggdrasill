"use strict";

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "OPENAI_API_KEY is not set" });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const prompt = String(body.prompt || "").trim();
    const size = String(body.size || "1024x1024").trim();
    if (!prompt) {
      return res.status(400).json({ ok: false, error: "prompt is required" });
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        size,
        n: 1
      })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data?.error?.message || "OpenAI image generation failed"
      });
    }

    const imageItem = data?.data?.[0];
    const b64 = imageItem?.b64_json;
    const url = imageItem?.url;

    if (b64) {
      return res.status(200).json({
        ok: true,
        imagePath: `data:image/png;base64,${b64}`
      });
    }

    if (url) {
      return res.status(200).json({
        ok: true,
        imagePath: url
      });
    }

    return res.status(500).json({
      ok: false,
      error: "No image data returned"
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "Unknown server error"
    });
  }
};
