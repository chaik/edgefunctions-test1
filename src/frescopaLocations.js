/// <reference types="@fastly/js-compute" />

import { SecretStoreManager } from "./lib/config.js";

export async function frescopaLocationsHandler(req) {
    if (req.method !== "GET") {
        return jsonResponse({ error: "Method Not Allowed" }, 405);
    }

    let expectedApiKey;
    try {
        expectedApiKey = await SecretStoreManager.getSecret('FRESCOPA_API_KEY');
    } catch (e) {
        console.log("Failed to load FRESCOPA_API_KEY secret:", e.toString());
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

    const LOCATION_DATA = {
        "10001": [
            {
                id: "nyc-midtown",
                name: "Frescopa Midtown",
                address: "350 5th Ave, New York, NY 10001",
                distance: "0.3 mi",
                times: ["8:00 AM", "9:30 AM", "11:00 AM", "1:00 PM", "3:30 PM"]
            },
            {
                id: "nyc-chelsea",
                name: "Frescopa Chelsea",
                address: "75 9th Ave, New York, NY 10011",
                distance: "0.8 mi",
                times: ["7:30 AM", "10:00 AM", "12:00 PM", "2:30 PM"]
            },
            {
                id: "nyc-gramercy",
                name: "Frescopa Gramercy",
                address: "200 Park Ave S, New York, NY 10003",
                distance: "1.2 mi",
                times: ["8:30 AM", "10:30 AM", "1:30 PM", "4:00 PM"]
            }
        ],
        "90210": [
            {
                id: "bh-rodeo",
                name: "Frescopa Rodeo Drive",
                address: "360 N Rodeo Dr, Beverly Hills, CA 90210",
                distance: "0.1 mi",
                times: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM"]
            },
            {
                id: "bh-wilshire",
                name: "Frescopa Wilshire",
                address: "9876 Wilshire Blvd, Beverly Hills, CA 90210",
                distance: "0.5 mi",
                times: ["8:00 AM", "10:30 AM", "12:30 PM", "2:00 PM", "4:30 PM"]
            }
        ],
        "60601": [
            {
                id: "chi-loop",
                name: "Frescopa The Loop",
                address: "111 S Wacker Dr, Chicago, IL 60601",
                distance: "0.2 mi",
                times: ["7:00 AM", "9:00 AM", "11:30 AM", "2:00 PM"]
            },
            {
                id: "chi-michigan",
                name: "Frescopa Michigan Ave",
                address: "625 N Michigan Ave, Chicago, IL 60611",
                distance: "1.0 mi",
                times: ["8:00 AM", "10:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"]
            },
            {
                id: "chi-wicker",
                name: "Frescopa Wicker Park",
                address: "1439 N Milwaukee Ave, Chicago, IL 60622",
                distance: "2.4 mi",
                times: ["9:00 AM", "11:00 AM", "1:30 PM"]
            }
        ],
        "89109": [
            {
                id: "lv-strip",
                name: "Frescopa Las Vegas Strip",
                address: "3570 S Las Vegas Blvd, Las Vegas, NV 89109",
                distance: "0.2 mi",
                times: ["8:00 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"]
            },
            {
                id: "lv-venetian",
                name: "Frescopa at The Venetian",
                address: "3355 S Las Vegas Blvd, Las Vegas, NV 89109",
                distance: "0.6 mi",
                times: ["9:00 AM", "11:30 AM", "1:30 PM", "3:30 PM"]
            }
        ],
        "98101": [
            {
                id: "sea-pike",
                name: "Frescopa Pike Place",
                address: "1428 Post Alley, Seattle, WA 98101",
                distance: "0.1 mi",
                times: ["6:30 AM", "8:00 AM", "10:00 AM", "12:00 PM", "2:30 PM"]
            },
            {
                id: "sea-pioneer",
                name: "Frescopa Pioneer Square",
                address: "200 1st Ave S, Seattle, WA 98104",
                distance: "0.7 mi",
                times: ["7:00 AM", "9:30 AM", "11:30 AM", "3:00 PM"]
            }
        ]
    };

    const url = new URL(req.url);
    const zipcode = url.searchParams.get("zipcode");

    if (!zipcode) {
        return jsonResponse({ error: "Missing required query parameter: zipcode" }, 400);
    }

    const locations = LOCATION_DATA[zipcode];

    if (!locations) {
        return jsonResponse({ error: `No Frescopa locations found for zipcode: ${zipcode}` }, 404);
    }

    return jsonResponse({ zipcode, locations }, 200);
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
