const db = require('./db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Roll-based Rate Limiter (Simulating Google AI Studio 15 RPM Free Tier quota)
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 15;
let requestTimestamps = [];

function checkRateLimit() {
    const now = Date.now();
    requestTimestamps = requestTimestamps.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    
    const count = requestTimestamps.length;
    const remaining = Math.max(0, MAX_REQUESTS - count);
    const limitPercentage = (remaining / MAX_REQUESTS) * 100;
    
    let status = "green";
    if (remaining <= 5 && remaining > 0) status = "yellow";
    if (remaining === 0) status = "red";

    return {
        count,
        limit: MAX_REQUESTS,
        remaining,
        status,
        percentage: parseFloat(limitPercentage.toFixed(1))
    };
}

function recordRequest() {
    requestTimestamps.push(Date.now());
}

// Advanced Rule-based Heuristic Engine for WAF Fallback & Double-check
const XSS_REGEX = /<script[\s\S]*?>|javascript:|onerror\s*=|onload\s*=|onmouseover\s*=|onfocus\s*=|<iframe[\s\S]*?>|<object[\s\S]*?>|<embed[\s\S]*?>/gi;
const SQLI_REGEX = /\b(union\s+select|select\s+from|insert\s+into|delete\s+from|drop\s+table|alter\s+table|update\s+set)\b|('|")\s*or\s*('|")?\d+('|")?\s*=\s*('|")?\d+|--\s*$|\/\*[\s\S]*?\*\//gi;

const PROFANITY_LIST = [
    'bangsat', 'tahi', 'babi', 'anjing', 'goblok', 'tolol', 'kontol', 'memek', 
    'bajingan', 'perek', 'brengsek', 'fuck', 'shit', 'bitch', 'asshole', 'jancok', 'asu'
];

function scanHeuristics(text) {
    if (!text) return { isBlocked: false, type: "Clean Traffic", reason: "" };

    // Check Stored XSS
    if (XSS_REGEX.test(text)) {
        const matches = text.match(XSS_REGEX);
        return {
            isBlocked: true,
            type: "Stored XSS",
            reason: "Deteksi muatan skrip peretasan berbahaya (XSS) di lapisan input ulasan.",
            highlight: matches ? matches[0] : text
        };
    }

    // Check SQL Injection
    if (SQLI_REGEX.test(text)) {
        const matches = text.match(SQLI_REGEX);
        return {
            isBlocked: true,
            type: "SQL Injection",
            reason: "Deteksi struktur perintah SQL mencurigakan (SQLi) yang mencoba memanipulasi database.",
            highlight: matches ? matches[0] : text
        };
    }

    // Check Cyberbullying / Profanity
    const lowerText = text.toLowerCase();
    for (const badWord of PROFANITY_LIST) {
        const wordRegex = new RegExp(`\\b${badWord}\\b`, 'i');
        if (wordRegex.test(lowerText) || lowerText.includes(badWord)) {
            return {
                isBlocked: true,
                type: "Cyberbullying / Profanity",
                reason: "Deteksi kata kasar, bullying, atau bahasa tidak senonoh yang merusak kenyamanan publik.",
                highlight: badWord
            };
        }
    }

    return { isBlocked: false, type: "Clean Traffic", reason: "" };
}

// Global feedback loop whitelist for Human-in-the-Loop context correction
const localBypassWhitelist = [];

function addToWhitelist(text) {
    if (text) {
        const cleaned = text.trim().toLowerCase();
        if (!localBypassWhitelist.includes(cleaned)) {
            localBypassWhitelist.push(cleaned);
        }
    }
}

// AI WAF using official Google AI Studio SDK
async function scanWAF(text, ipAddress, userKey = null) {
    if (text) {
        const cleanedText = text.trim().toLowerCase();
        if (localBypassWhitelist.includes(cleanedText)) {
            return {
                isBlocked: false,
                type: "Clean Traffic (Whitelisted)",
                reason: "Lolos via verifikasi manual IT Security"
            };
        }
    }

    const rateLimit = checkRateLimit();
    if (rateLimit.remaining === 0) {
        // Automatically block due to Rate Limiting
        return {
            isBlocked: true,
            type: "Rate Limiting",
            reason: "Batas panggilan API Gratis Google AI Studio terlampaui (15 RPM). Proteksi diaktifkan.",
            highlight: "HTTP 429 - Rate Limit Exceeded"
        };
    }

    recordRequest();

    const apiKey = userKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.log("[WAF Heuristics] Running local heuristics scan...");
        const result = scanHeuristics(text);
        if (result.isBlocked) {
            await db.addThreat({
                ip: ipAddress,
                type: result.type,
                payload: text,
                severity: result.type === "Cyberbullying / Profanity" ? "MEDIUM" : "HIGH"
            });
        }
        return result;
    }

    // Call Gemini 2.5 Flash-Lite WAF via official SDK
    try {
        console.log("[WAF AI SDK] Scanning input using Google AI Studio SDK (gemini-2.5-flash-lite)...");
        
        const systemInstruction = `You are a highly secure Web Application Firewall (WAF) protecting a digital tourism dashboard from Stored Cross-Site Scripting (XSS), SQL Injection (SQLi), and toxic cyberbullying or extreme profanity.
Analyze the user's raw input comment. Determine if it contains any threat:
1. "Stored XSS" (attempts to execute scripts, embed iframes, trigger event handlers like onload/onerror, javascript:, etc.)
2. "SQL Injection" (attempts to inject SQL constructs such as ' OR '1'='1', UNION SELECT, --, SQL comments, drop table)
3. "Cyberbullying / Profanity" (extreme insults, cyberbullying, swearing, vulgar terms, slur words in Indonesian or English)
4. "Clean Traffic" (safe, helpful, constructive review)

Respond ONLY in valid, strict JSON format matching this schema:
{
  "isBlocked": boolean,
  "type": "Stored XSS" | "SQL Injection" | "Cyberbullying / Profanity" | "Clean Traffic",
  "reason": "Short explanation in Indonesian explaining the threat and why it is blocked or why it is clean",
  "highlight": "The exact malicious payload snippet, or empty string if clean"
}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            systemInstruction: systemInstruction
        });

        const response = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: `Input to scan: "${text}"` }] }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
                maxOutputTokens: 256
            }
        });

        const jsonText = response.response.text().trim();
        const scanResult = JSON.parse(jsonText);

        if (scanResult.isBlocked) {
            await db.addThreat({
                ip: ipAddress,
                type: scanResult.type,
                payload: text,
                severity: scanResult.type === "Cyberbullying / Profanity" ? "MEDIUM" : "HIGH"
            });
        }
        
        return scanResult;
    } catch (e) {
        console.error("[WAF AI SDK Error] SDK call failed, using heuristics fallback:", e.message);
        const result = scanHeuristics(text);
        if (result.isBlocked) {
            await db.addThreat({
                ip: ipAddress,
                type: result.type,
                payload: text,
                severity: result.type === "Cyberbullying / Profanity" ? "MEDIUM" : "HIGH"
            });
        }
        return result;
    }
}

module.exports = {
    scanWAF,
    checkRateLimit,
    scanHeuristics,
    addToWhitelist
};
