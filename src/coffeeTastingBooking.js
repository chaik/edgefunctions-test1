/// <reference types="@fastly/js-compute" />

import { frescopaLocationsHandler } from "./frescopaLocations.js";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function coffeeTastingBookingHandler(req) {
    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method !== "GET") {
        return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    const url = new URL(req.url);
    const zipcode = url.searchParams.get("zipcode");

    if (!zipcode) {
        return jsonResponse({ error: "Missing required query parameter: zipcode" }, 400);
    }

    const syntheticReq = new Request(
        `https://localhost/compute/frescopa-locations?zipcode=${encodeURIComponent(zipcode)}`,
        {
            method: "GET",
            headers: {
                "x-api-key": "15x9hmBRjBD4CUSd7Q37kpMMf2EXRtYBJlrnnSNrohAe8GBpZbXkXxro3Q3rqVFN",
            },
        }
    );

    const response = await frescopaLocationsHandler(syntheticReq);
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
        response.headers.set(key, value);
    }
    return response;
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
