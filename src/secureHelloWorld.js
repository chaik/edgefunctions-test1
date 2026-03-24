/// <reference types="@fastly/js-compute" />

import { SecretStoreManager } from "./lib/config.js";

export async function secureHelloWorldHandler(req) {
  if (req.method !== "GET") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  let expectedApiKey;
  try {
    expectedApiKey = await SecretStoreManager.getSecret('API_KEY');
  } catch (e) {
    console.log("Failed to load API_KEY secret:", e.toString());
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return jsonResponse(
      { error: "Missing API key", hint: "Send x-api-key header" },
      401
    );
  }

  if (!safeEquals(apiKey, expectedApiKey)) {
    return jsonResponse({ error: "Invalid API key" }, 403);
  }

  return jsonResponse({
    message: "Hello from authenticated Edge Function!",
    path: new URL(req.url).pathname,
    authenticatedBy: "api-key",
  }, 200);
}

function safeEquals(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
