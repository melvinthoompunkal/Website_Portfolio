(() => {
    "use strict";

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const VIEWS = {
        home: "view-landing",
        landing: "view-landing",
        recruiter: "view-recruiter",
        developer: "view-developer",
        playground: "view-playground"
    };

    const TITLES = {
        view: "Melvin Thoompunkal: Choose Your Path",
        recruiter: "Melvin Thoompunkal: The Sixty-Second Version",
        developer: "Melvin Thoompunkal: Under the Hood",
        playground: "Melvin Thoompunkal: Playground"
    };

    let currentView = null;

    /* ---------- toast ---------- */
    const toastEl = $("#toast");
    let toastTimer = null;
    function toast(message, ms = 2600) {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.hidden = false;
        requestAnimationFrame(() => toastEl.classList.add("show"));
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove("show");
            setTimeout(() => { toastEl.hidden = true; }, 350);
        }, ms);
    }

    /* ---------- theme ---------- */
    const themeToggle = $("#themeToggle");
    function setTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem("theme", theme); } catch (e) {}
    }
    themeToggle.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme");
        if (cur === "retro") {
            let restore = "dark";
            try { if (localStorage.getItem("theme") === "light") restore = "light"; } catch (e) {}
            setTheme(restore);
            toast("Back to normal.");
            return;
        }
        setTheme(cur === "light" ? "dark" : "light");
    });

    /* ---------- router ---------- */
    function viewFromHash() {
        const h = location.hash.replace("#", "").toLowerCase();
        return VIEWS[h] ? h : "home";
    }

    function showView(name) {
        const targetId = VIEWS[name];
        if (!targetId || name === currentView) return;
        currentView = name;
        $$(".view").forEach(v => v.classList.remove("active"));
        const target = document.getElementById(targetId);
        target.classList.add("active");
        document.body.dataset.view = name;
        document.title = TITLES[name] || TITLES.view;
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        observeReveals(target);
        if (name === "recruiter") runCounters(target);
        if (name === "playground") {
            requestAnimationFrame(() => {
                if (currentView !== "playground") return;
                fitGlobe();
                startGlobe();
                fitGraft();
                startGraftLoop();
            });
        } else {
            stopGlobe();
            stopGrafLoop();
        }
    }

    window.addEventListener("hashchange", () => showView(viewFromHash()));

    /* ---------- reveal on scroll ---------- */
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("shown");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });

    function observeReveals(scope) {
        $$(".reveal", scope).forEach((el, i) => {
            el.style.transitionDelay = `${Math.min(i * 55, 420)}ms`;
            revealObserver.observe(el);
        });
    }

    /* ---------- rotating keyword typewriter ---------- */
    const keywordEl = $("#rotatingKeyword");
    const KEYWORDS = ["Real-Time Systems", "Applied AI", "Data Engineering", "Machine Learning", "Blockchain", "Full Stack"];
    function typeText(el, text, speed = 65) {
        el.textContent = "";
        let i = 0;
        (function tick() {
            if (i < text.length) {
                el.textContent += text.charAt(i++);
                setTimeout(tick, speed);
            }
        })();
    }
    function rotateKeywords() {
        let idx = 1;
        setInterval(() => {
            typeText(keywordEl, KEYWORDS[idx]);
            idx = (idx + 1) % KEYWORDS.length;
        }, 3400);
    }
    if (!reducedMotion && keywordEl) rotateKeywords();

    /* ---------- glyph parallax ---------- */
    const glyphs = $$(".glyph");
    if (!reducedMotion && glyphs.length && matchMedia("(pointer: fine)").matches) {
        let mx = 0, my = 0, cx = 0, cy = 0;
        document.addEventListener("mousemove", e => {
            mx = e.clientX / window.innerWidth - 0.5;
            my = e.clientY / window.innerHeight - 0.5;
        });
        (function drift() {
            cx += (mx - cx) * 0.06;
            cy += (my - cy) * 0.06;
            glyphs.forEach(g => {
                const depth = Number(g.dataset.depth || 12);
                g.style.transform = `translate(${(-cx * depth).toFixed(2)}px, ${(-cy * depth).toFixed(2)}px)`;
            });
            requestAnimationFrame(drift);
        })();
    }

    /* ---------- counters ---------- */
    function animateCounter(el) {
        const target = Number(el.dataset.count || 0);
        const suffix = el.dataset.suffix || "";
        const prefix = el.dataset.prefix || "";
        if (reducedMotion) {
            el.textContent = prefix + target.toLocaleString() + suffix;
            return;
        }
        const dur = 1100;
        const start = performance.now();
        (function frame(now) {
            const t = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
            if (t < 1) requestAnimationFrame(frame);
        })(start);
    }
    function runCounters(scope) {
        $$(".stat-number[data-count]", scope).forEach(el => {
            if (el.dataset.done) return;
            el.dataset.done = "1";
            animateCounter(el);
        });
    }

    /* ---------- copy code buttons ---------- */
    $$(".copy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const code = btn.closest(".code-demo").querySelector("code").textContent;
            navigator.clipboard.writeText(code).then(() => {
                btn.classList.add("copied");
                toast("Copied.", 1400);
                setTimeout(() => btn.classList.remove("copied"), 1600);
            }).catch(() => toast("Couldn't access clipboard"));
        });
    });

    /* ---------- blockchain simulator ---------- */
    const chainVisual = $("#chainVisual");
    const txInput = $("#txInput");
    const addBlockBtn = $("#addBlockBtn");
    const resetChainBtn = $("#resetChainBtn");

    function fakeHash(str, seed = 5381) {
        let h1 = seed >>> 0;
        let h2 = 52711 >>> 0;
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);
            h1 = ((h1 << 5) + h1 + c) >>> 0;
            h2 = ((h2 << 5) - h2 + c * 31) >>> 0;
        }
        return (h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0")).slice(0, 16);
    }

    let blockIndex = 0;
    let lastHash = fakeHash("hello, world").slice(0, 4) + "…" + fakeHash("hello, world").slice(-4);

    function shortHash(h) {
        return h.slice(0, 4) + "…" + h.slice(-4);
    }

    function addBlock() {
        const existing = $$(".block:not(.genesis)", chainVisual).length;
        if (existing >= 8) {
            toast("Max chain length reached. Reset to start a new fork.");
            return;
        }
        const data = txInput.value.trim() || `tx ${blockIndex + 1}`;
        const blockHash = fakeHash(lastHash.replace(/…/, "") + data + blockIndex);
        blockIndex++;

        const block = document.createElement("div");
        block.className = "block";
        block.innerHTML =
            `<h3>Block #${blockIndex}</h3>` +
            `<p class="block-data"></p>` +
            `<p class="block-hash">prev ${shortHash(lastHash)}<br>hash ${shortHash(blockHash)}</p>`;
        block.querySelector(".block-data").textContent = data;
        chainVisual.appendChild(block);
        txInput.value = "";
        lastHash = blockHash;
        chainVisual.parentElement.scrollLeft = chainVisual.parentElement.scrollWidth;
    }

    function resetChain() {
        $$(".block:not(.genesis)", chainVisual).forEach(b => b.remove());
        blockIndex = 0;
        lastHash = fakeHash("hello, world").slice(0, 4) + "…" + fakeHash("hello, world").slice(-4);
        txInput.value = "";
    }

    if (addBlockBtn) {
        addBlockBtn.addEventListener("click", addBlock);
        txInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); addBlock(); } });
        resetChainBtn.addEventListener("click", resetChain);
    }

    /* ---------- stock tracker mini ---------- */
    const symbolInput = $("#symbolInput");
    const trackBtn = $("#trackBtn");
    const stockPanel = $("#stockPanel");
    const stockHint = $("#stockHint");
    const stockName = $("#stockName");
    const stockPrice = $("#stockPrice");
    const stockChange = $("#stockChange");
    const sparkline = $("#sparkline");

    const KNOWN_STOCKS = {
        AAPL: "Apple Inc.", MSFT: "Microsoft Corp.", GOOGL: "Alphabet Inc.",
        AMZN: "Amazon.com Inc.", NVDA: "NVIDIA Corp.", META: "Meta Platforms",
        TSLA: "Tesla Inc.", NFLX: "Netflix Inc.", AMD: "Advanced Micro Devices",
        SPY: "S&P 500 ETF", QQQ: "Nasdaq-100 ETF", JPM: "JPMorgan Chase"
    };

    const BASE_PRICES = { AAPL: 232.4, MSFT: 458.1, GOOGL: 189.7, AMZN: 214.3, NVDA: 128.6, META: 702.9, TSLA: 341.8, NFLX: 1128.4, AMD: 162.2, SPY: 638.5, QQQ: 556.2, JPM: 294.7 };

    let priceHistory = [];
    let tickTimer = null;

    function drawSparkline() {
        if (!sparkline || priceHistory.length < 2) return;
        const dpr = window.devicePixelRatio || 1;
        const w = sparkline.clientWidth, h = sparkline.clientHeight;
        sparkline.width = w * dpr;
        sparkline.height = h * dpr;
        const ctx = sparkline.getContext("2d");
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const min = Math.min(...priceHistory), max = Math.max(...priceHistory);
        const range = max - min || 1;
        const pad = 8;
        const up = priceHistory[priceHistory.length - 1] >= priceHistory[0];
        const color = getComputedStyle(document.documentElement).getPropertyValue(up ? "--up" : "--down").trim() || (up ? "#34d399" : "#fb7185");

        ctx.beginPath();
        priceHistory.forEach((p, i) => {
            const x = pad + (i / (priceHistory.length - 1)) * (w - pad * 2);
            const y = h - pad - ((p - min) / range) * (h - pad * 2);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = "round";
        ctx.stroke();

        const lastX = w - pad;
        const lastY = h - pad - ((priceHistory[priceHistory.length - 1] - min) / range) * (h - pad * 2);
        ctx.beginPath();
        ctx.arc(lastX, lastY, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }

    function renderQuote(name, price, changePct) {
        stockName.textContent = name;
        stockPrice.textContent = `$${price.toFixed(2)}`;
        stockChange.textContent = `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`;
        stockChange.className = `stock-change ${changePct >= 0 ? "up" : "down"}`;
        stockPanel.hidden = false;
        stockHint.hidden = true;
        drawSparkline();
    }

    function startTicker(label) {
        clearInterval(tickTimer);
        tickTimer = setInterval(() => {
            const drift = (Math.random() - 0.48) * priceHistory[priceHistory.length - 1] * 0.004;
            priceHistory.push(Math.max(priceHistory[priceHistory.length - 1] + drift, 1));
            if (priceHistory.length > 60) priceHistory.shift();
            const changePct = ((priceHistory[priceHistory.length - 1] - priceHistory[0]) / priceHistory[0]) * 100;
            renderQuote(label, priceHistory[priceHistory.length - 1], changePct);
        }, 1200);
    }

    function trackSymbol() {
        const raw = symbolInput.value.trim().toUpperCase();
        if (!raw) { toast("Type a ticker first. Try NVDA."); return; }
        const label = KNOWN_STOCKS[raw] || `${raw} (demo data)`;
        const base = BASE_PRICES[raw] || 40 + Math.random() * 400;
        priceHistory = [base];
        for (let i = 0; i < 24; i++) {
            priceHistory.push(Math.max(priceHistory[i] * (1 + (Math.random() - 0.48) * 0.006), 1));
        }
        const changePct = ((priceHistory[priceHistory.length - 1] - priceHistory[0]) / priceHistory[0]) * 100;
        renderQuote(label, priceHistory[priceHistory.length - 1], changePct);
        startTicker(label);
    }

    if (trackBtn) {
        trackBtn.addEventListener("click", trackSymbol);
        symbolInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); trackSymbol(); } });
        window.addEventListener("resize", drawSparkline);
    }

    /* ---------- chat simulator ---------- */
    const chatMessages = $("#chatMessages");
    const chatForm = $("#chatForm");
    const chatInput = $("#chatInput");

    const BOT_KB = [
        { keys: ["god view", "godview", "kafka", "real-time", "realtime", "map", "globe", "earth"], reply: "God View streams global events, markets, and weather onto one live map. FastAPI, Kafka, Redis, WebGL, ten thousand events a second. There is a miniature earth in the Playground." },
        { keys: ["graft", "claude", "agent", "repo"], reply: "Graft audits GitHub repos with multi-model Claude sub-agents. Each agent gets a context-budgeted chunk so nothing overflows, then the findings merge into a reusable blueprint." },
        { keys: ["stock", "rsi", "ticker", "analyzer", "finance"], reply: "StockAnalyzer computes RSI and moving averages straight from Yahoo Finance history. Vectorized pandas, no TA library. Its miniature cousin is running above." },
        { keys: ["blockchain", "chain", "credit", "crypto"], reply: "My decentralized credit-score prototype explored scoring beyond traditional bureaus. The demo above chains real hashes: every block depends on the one before it." },
        { keys: ["njit", "school", "class", "gpa", "study", "college"], reply: "CS junior at NJIT, class of 2028, Dean's List. Deep in Data Structures and Probability right now." },
        { keys: ["sompo", "intern", "internship", "work", "job"], reply: "Summer 2026 at Sompo Holdings: shipped an agentic AI chatbot to 500+ users and eval pipelines that lifted bot accuracy 40%." },
        { keys: ["hire", "hiring", "resume", "contact", "email", "reach"], reply: "Open to Summer 2027 internships. The resume is in the top bar, or email melvintthoompunkal@gmail.com" },
        { keys: ["python", "java", "sql", "c++", "language"], reply: "Python first, Java for systems coursework, SQL for anything data-shaped, C++ when NJIT insists." },
        { keys: ["hello", "hi", "hey", "yo", "sup"], reply: "Hey. Ask me about god view, graft, stocks, blockchain, or njit." },
        { keys: ["konami", "secret", "cheat", "code", "easteregg", "easter egg"], reply: "Try the classic: up up down down left right left right B A." }
    ];

    const BOT_FALLBACKS = [
        "Interesting. Say more?",
        "Hadn't thought of it that way.",
        "I'm a small rule-based bot. Melvin is the real thing. Try the Developer path.",
        "Fair point. Want god view, graft, or stocks?",
        "Noted. I cover projects, school, and hiring."
    ];

    function appendMsg(cls, name, text) {
        const msg = document.createElement("div");
        msg.className = `msg ${cls}`;
        const nameSpan = document.createElement("span");
        nameSpan.className = "msg-name";
        nameSpan.textContent = name;
        const textSpan = document.createElement("span");
        textSpan.className = "msg-text";
        textSpan.textContent = text;
        msg.append(nameSpan, textSpan);
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msg;
    }

    function botReply(userText) {
        const q = userText.toLowerCase();
        const match = BOT_KB.find(entry => entry.keys.some(k => q.includes(k)));
        const typing = document.createElement("div");
        typing.className = "msg msg-bot";
        typing.innerHTML = '<span class="msg-name">mini-melvin</span><span class="typing-dots"><span></span><span></span><span></span></span>';
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(() => {
            typing.remove();
            appendMsg("msg-bot", "mini-melvin", match ? match.reply : BOT_FALLBACKS[Math.floor(Math.random() * BOT_FALLBACKS.length)]);
        }, 700 + Math.random() * 900);
    }

    if (chatForm) {
        chatForm.addEventListener("submit", e => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;
            appendMsg("msg-user", "you", text);
            chatInput.value = "";
            botReply(text);
        });
    }

    /* ---------- canvas palette ---------- */
    const CANVAS_THEMES = {
        dark:  { panel: "#15151a", sphere: "#0d0d11", chip: "rgba(255,255,255,.06)", chipBorder: "rgba(255,255,255,.20)", soft: "#a6a6ad", faint: "#6f6f77", accent: "#dfa14f", rim: "rgba(255,255,255,.28)", edgeA: "rgba(223,161,79," },
        light: { panel: "#ececef", sphere: "#ffffff", chip: "#ffffff", chipBorder: "rgba(23,23,28,.22)", soft: "#55555c", faint: "#8b8b92", accent: "#a06a15", rim: "rgba(23,23,28,.30)", edgeA: "rgba(160,106,21," },
        retro: { panel: "#031403", sphere: "#010a01", chip: "rgba(0,255,128,.07)", chipBorder: "rgba(0,255,128,.5)", soft: "#22cc5f", faint: "#1a9948", accent: "#00ff41", rim: "rgba(0,255,128,.5)", edgeA: "rgba(0,255,128," }
    };
    let PAL = CANVAS_THEMES[document.documentElement.getAttribute("data-theme")] || CANVAS_THEMES.dark;
    new MutationObserver(() => {
        PAL = CANVAS_THEMES[document.documentElement.getAttribute("data-theme")] || CANVAS_THEMES.dark;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const easeOut = k => 1 - Math.pow(1 - k, 3);
    const easeIO = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    function rr(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
    function fitCanvasDPR(cv) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = cv.clientWidth, h = cv.clientHeight;
        if (!w || !h) return null;
        const need = Math.round(w * dpr) !== cv.width || Math.round(h * dpr) !== cv.height;
        if (need) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
        const ctx = cv.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, W: w, H: h };
    }

    /* ---------- god view mini globe ---------- */
    const globeCanvas = $("#globeCanvas");
    const globeFeedEl = $("#globeFeed");
    const GLOBE_TILT = 0.42;

    const GLOBE_EVENTS = [
        { lat: -6.2, lon: 106.8, tag: "NEWS", label: "Protest reported in Jakarta" },
        { lat: -34.6, lon: -58.4, tag: "NEWS", label: "Transport strike in Buenos Aires" },
        { lat: 52.5, lon: 13.4, tag: "NEWS", label: "Rail workers walk out in Berlin" },
        { lat: -1.29, lon: 36.82, tag: "NEWS", label: "Rally draws crowds in Nairobi" },
        { lat: 37.57, lon: 126.98, tag: "NEWS", label: "Tech summit opens in Seoul" },
        { lat: 30.04, lon: 31.24, tag: "NEWS", label: "Fuel subsidy protest in Cairo" },
        { lat: -33.87, lon: 151.21, tag: "NEWS", label: "Climate march in Sydney" },
        { lat: 19.43, lon: -99.13, tag: "NEWS", label: "Metro expansion vote in Mexico City" },
        { lat: 51.5, lon: -0.12, tag: "NEWS", label: "Fintech deal announced in London" },
        { lat: 40.7, lon: -74.0, tag: "MKT", label: "NASDAQ: NVDA +2.4% premarket" },
        { lat: 51.51, lon: -0.09, tag: "MKT", label: "LSE: FTSE slips 0.6%" },
        { lat: 35.68, lon: 139.77, tag: "MKT", label: "TSE: yen strengthens vs dollar" },
        { lat: 22.28, lon: 114.16, tag: "MKT", label: "HKEX: tech rally widens" },
        { lat: -23.55, lon: -46.63, tag: "MKT", label: "B3: real weakens on data" },
        { lat: 19.08, lon: 72.88, tag: "MKT", label: "NSE: Sensex hits record" },
        { lat: 47.37, lon: 8.54, tag: "MKT", label: "SIX: franc holds steady" },
        { lat: -33.87, lon: 151.19, tag: "MKT", label: "ASX: miners dip at open" },
        { lat: 14.6, lon: 121.0, tag: "WX", label: "Typhoon watch: Luzon" },
        { lat: 37.39, lon: -5.99, tag: "WX", label: "Heatwave alert: Seville" },
        { lat: 39.74, lon: -104.99, tag: "WX", label: "Blizzard warning: Denver" },
        { lat: -18.14, lon: 178.44, tag: "WX", label: "Cyclone forming near Fiji" },
        { lat: 24.71, lon: 46.68, tag: "WX", label: "Sandstorm reduces visibility in Riyadh" },
        { lat: 37.77, lon: -122.41, tag: "WX", label: "Dense fog: SFO ground delays" },
        { lat: 37.98, lon: 23.73, tag: "WX", label: "Wildfire smoke over Athens" },
        { lat: 69.65, lon: 18.96, tag: "WX", label: "Aurora watch: Tromso" }
    ];

    const LAND_RLE=[
[0,90],
[0,90],
[0,21,1,6,0,1,1,13,0,9,1,2,0,16,1,2,0,20],
[0,14,1,1,0,1,1,1,0,2,1,2,0,9,1,10,0,20,1,2,0,6,1,5,0,6,1,2,0,9],
[0,14,1,5,0,1,1,1,0,1,1,4,0,5,1,8,0,19,1,1,0,3,1,1,0,1,1,13,0,3,1,2,0,8],
[0,1,1,48,0,6,1,1,0,1,1,1,0,5,1,1,0,26],
[0,5,1,20,0,2,1,2,0,3,1,3,0,4,1,2,0,6,1,3,0,1,1,39],
[0,3,1,5,0,1,1,12,0,5,1,2,0,18,1,4,0,2,1,32,0,1,1,1,0,4],
[0,12,1,11,0,3,1,4,0,17,1,2,0,1,1,29,0,5,1,2,0,4],
[0,13,1,18,0,13,1,1,0,1,1,35,0,3,1,1,0,5],
[0,14,1,15,0,1,1,2,0,12,1,37,0,9],
[0,14,1,15,0,16,1,3,0,1,1,3,0,3,1,2,0,1,1,21,0,1,1,1,0,9],
[0,14,1,12,0,17,1,2,0,5,1,1,0,1,1,5,0,1,1,19,0,13],
[0,15,1,11,0,19,1,3,0,6,1,21,0,4,1,1,0,10],
[0,16,1,9,0,18,1,6,0,1,1,1,0,3,1,21,0,15],
[0,16,1,5,0,3,1,1,0,17,1,15,0,1,1,17,0,15],
[0,17,1,4,0,20,1,13,0,1,1,4,0,3,1,12,0,16],
[0,19,1,2,0,1,1,1,0,18,1,13,0,1,1,4,0,4,1,4,0,1,1,5,0,17],
[0,21,1,3,0,17,1,14,0,1,1,2,0,5,1,2,0,4,1,3,0,18],
[0,23,1,1,0,3,1,1,0,13,1,15,0,8,1,1,0,6,1,1,0,18],
[0,25,1,5,0,12,1,16,0,18,1,1,0,13],
[0,26,1,6,0,15,1,10,0,12,1,2,0,2,1,1,0,16],
[0,25,1,7,0,15,1,9,0,14,1,1,0,1,1,2,0,16],
[0,25,1,10,0,13,1,7,0,20,1,1,0,3,1,2,0,9],
[0,25,1,11,0,12,1,7,0,18,1,1,0,5,1,3,0,8],
[0,26,1,10,0,12,1,7,0,23,1,1,0,1,1,1,0,9],
[0,26,1,9,0,13,1,7,0,1,1,1,0,19,1,3,0,1,1,1,0,9],
[0,27,1,8,0,13,1,6,0,2,1,1,0,18,1,7,0,8],
[0,27,1,6,0,16,1,5,0,2,1,1,0,16,1,10,0,7],
[0,27,1,6,0,16,1,4,0,21,1,9,0,7],
[0,27,1,5,0,18,1,2,0,22,1,3,0,1,1,5,0,7],
[0,27,1,4,0,49,1,3,0,5,1,1,0,1],
[0,27,1,2,0,61],
[0,27,1,2,0,58,1,1,0,2],
[0,26,1,3,0,61],
[0,26,1,2,0,62],
[0,90],
[0,90],
[0,90],
[0,28,1,1,0,27,1,6,0,3,1,17,0,8],
[0,19,1,1,0,6,1,4,0,12,1,20,0,1,1,25,0,2],
[0,8,1,20,0,12,1,46,0,4],
[0,8,1,18,0,6,1,2,0,4,1,47,0,5],
[0,2,1,1,0,4,1,81,0,2],
[0,90]
];

const LAND_DOTS = [];
(function () {
    for (let r = 0; r < LAND_RLE.length; r++) {
        let c = 0;
        const runs = LAND_RLE[r];
        for (let i = 0; i < runs.length; i += 2) {
            if (runs[i]) {
                for (let k = 0; k < runs[i + 1]; k++) {
                    const la = (88 - r * 4) * Math.PI / 180;
                    const lo = (-178 + (c + k) * 4) * Math.PI / 180;
                    const cl = Math.cos(la);
                    LAND_DOTS.push([cl * Math.sin(lo), Math.sin(la), cl * Math.cos(lo)]);
                }
            }
            c += runs[i + 1];
        }
    }
})();

const pgState = { globeOn: false, globeRaf: 0, gLast: 0, rot: 0, eventAccum: 1500, dragging: false, dragX: 0, dragPauseUntil: 0, pulses: [], shuffle: [], cursor: 0 };

    function shufflePool() {
        pgState.shuffle = GLOBE_EVENTS.map((_, i) => i);
        for (let i = pgState.shuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pgState.shuffle[i], pgState.shuffle[j]] = [pgState.shuffle[j], pgState.shuffle[i]];
        }
        pgState.cursor = 0;
    }

    function projectLL(latDeg, lonDeg, R, cx, cy) {
        const la = latDeg * Math.PI / 180;
        const lo = lonDeg * Math.PI / 180 + pgState.rot;
        const x = Math.cos(la) * Math.sin(lo);
        const y = Math.sin(la);
        const z0 = Math.cos(la) * Math.cos(lo);
        const y2 = y * Math.cos(GLOBE_TILT) - z0 * Math.sin(GLOBE_TILT);
        const z2 = y * Math.sin(GLOBE_TILT) + z0 * Math.cos(GLOBE_TILT);
        return { x: cx + x * R, y: cy - y2 * R, z: z2 };
    }

    function fireNextEvent(now) {
        if (pgState.cursor >= pgState.shuffle.length) shufflePool();
        const ev = GLOBE_EVENTS[pgState.shuffle[pgState.cursor++]];
        pgState.pulses.push({ ev, t: now });
        if (pgState.pulses.length > 8) pgState.pulses.shift();
        const li = document.createElement("li");
        li.className = "gf-item";
        const time = document.createElement("span");
        time.className = "gf-time";
        time.textContent = new Date().toLocaleTimeString([], { hour12: false });
        const tag = document.createElement("span");
        tag.className = "gf-tag";
        tag.textContent = ev.tag;
        const label = document.createElement("span");
        label.className = "gf-label";
        label.textContent = ev.label;
        li.append(time, tag, label);
        globeFeedEl.prepend(li);
        while (globeFeedEl.children.length > 5) globeFeedEl.lastChild.remove();
    }

    function drawGlobe(now) {
        const f = fitCanvasDPR(globeCanvas);
        if (!f) return;
        const { ctx, W, H } = f;
        const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 6;
        ctx.clearRect(0, 0, W, H);

        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = PAL.sphere;
        ctx.fill();
        ctx.strokeStyle = PAL.rim;
        ctx.lineWidth = 1;
        ctx.stroke();

        const back = new Path2D(), front = new Path2D();
        const seg = (a, b) => {
            const p = projectLL(a[0], a[1], R, cx, cy), q = projectLL(b[0], b[1], R, cx, cy);
            ((p.z + q.z) / 2 >= 0 ? front : back).moveTo(p.x, p.y);
            ((p.z + q.z) / 2 >= 0 ? front : back).lineTo(q.x, q.y);
        };
        for (let la = -60; la <= 60; la += 30)
            for (let lo = 0; lo < 360; lo += 8) seg([la, lo], [la, lo + 8]);
        for (let lo = 0; lo < 360; lo += 30)
            for (let la = -84; la < 84; la += 8) seg([la, lo], [la + 8, lo]);
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = PAL.chipBorder; ctx.globalAlpha = 0.35; ctx.stroke(back);
        ctx.strokeStyle = PAL.soft; ctx.globalAlpha = 0.22; ctx.stroke(front);
        ctx.globalAlpha = 1;

        const cosR = Math.cos(pgState.rot), sinR = Math.sin(pgState.rot);
        const cT = Math.cos(GLOBE_TILT), sT = Math.sin(GLOBE_TILT);
        const ds = Math.max(1, R * 0.010);
        ctx.fillStyle = PAL.soft;
        ctx.globalAlpha = 0.55;
        for (const d of LAND_DOTS) {
            const xr = d[0] * cosR + d[2] * sinR;
            const zr = -d[0] * sinR + d[2] * cosR;
            const y2 = d[1] * cT - zr * sT;
            const z2 = d[1] * sT + zr * cT;
            if (z2 <= 0.02) continue;
            const s = ds * (0.6 + 0.4 * z2);
            ctx.fillRect(cx + xr * R - s / 2, cy - y2 * R - s / 2, s, s);
        }
        ctx.globalAlpha = 1;

        for (const ev of GLOBE_EVENTS) {
            const p = projectLL(ev.lat, ev.lon, R, cx, cy);
            if (p.z <= 0.02) continue;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(1.4, R * 0.009), 0, Math.PI * 2);
            ctx.fillStyle = PAL.faint;
            ctx.globalAlpha = 0.5;
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        pgState.pulses = pgState.pulses.filter(pl => now - pl.t < 1400);
        for (const pl of pgState.pulses) {
            const p = projectLL(pl.ev.lat, pl.ev.lon, R, cx, cy);
            if (p.z <= 0) continue;
            const k = (now - pl.t) / 1400;
            ctx.beginPath();
            ctx.arc(p.x, p.y, R * (0.02 + k * 0.075), 0, Math.PI * 2);
            ctx.strokeStyle = PAL.accent;
            ctx.globalAlpha = (1 - k) * 0.9;
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(2.2, R * 0.014), 0, Math.PI * 2);
            ctx.fillStyle = PAL.accent;
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    function globeFrame(ts) {
        if (!pgState.globeOn) return;
        const dt = Math.min(ts - (pgState.gLast || ts), 50);
        pgState.gLast = ts;
        if (!pgState.dragging && ts > pgState.dragPauseUntil) pgState.rot += dt * 0.00012;
        pgState.eventAccum += dt;
        if (pgState.eventAccum > 2400) { pgState.eventAccum = 0; fireNextEvent(ts); }
        drawGlobe(ts);
        pgState.globeRaf = requestAnimationFrame(globeFrame);
    }

    function fitGlobe() { drawGlobe(performance.now()); }
    function startGlobe() {
        if (pgState.globeOn || !globeCanvas) return;
        if (!pgState.shuffle.length) shufflePool();
        pgState.globeOn = true;
        pgState.gLast = performance.now();
        pgState.globeRaf = requestAnimationFrame(globeFrame);
    }
    function stopGlobe() {
        pgState.globeOn = false;
        cancelAnimationFrame(pgState.globeRaf);
    }

    if (globeCanvas) {
        globeCanvas.addEventListener("pointerdown", e => {
            pgState.dragging = true;
            pgState.dragX = e.clientX;
            pgState.dragPauseUntil = Infinity;
            globeCanvas.classList.add("dragging");
            globeCanvas.setPointerCapture(e.pointerId);
        });
        globeCanvas.addEventListener("pointermove", e => {
            if (!pgState.dragging) return;
            pgState.rot += (e.clientX - pgState.dragX) * 0.006;
            pgState.dragX = e.clientX;
        });
        const endDrag = () => {
            if (!pgState.dragging) return;
            pgState.dragging = false;
            pgState.dragPauseUntil = performance.now() + 1600;
            globeCanvas.classList.remove("dragging");
        };
        globeCanvas.addEventListener("pointerup", endDrag);
        globeCanvas.addEventListener("pointercancel", endDrag);
    }

    /* ---------- mini graft scan ---------- */
    const graftCanvas = $("#graftCanvas");
    const graftBtn = $("#graftRunBtn");
    const graftStatus = $("#graftStatus");

    const GF_FILES = ["api/main.py", "api/routes.py", "stream/worker.py", "stream/hub.py", "ingest/gdelt.py", "ingest/markets.py", "geo/postgis.py", "web/Globe.jsx"];
    const GF_CHUNKS = [{ id: "C1", files: [0, 1], agent: 0 }, { id: "C2", files: [2, 3], agent: 1 }, { id: "C3", files: [4, 5, 6], agent: 1 }, { id: "C4", files: [7], agent: 2 }];
    const GF_AGENTS = ["A1 api", "A2 core", "A3 ui"];
    const GF_FEATURES = [
        { label: "FastAPI app", c: 0, a: 0 }, { label: "REST routes", c: 0, a: 0 },
        { label: "Kafka consumer", c: 1, a: 1 }, { label: "Redis publish", c: 1, a: 1 }, { label: "WebSocket hub", c: 1, a: 1 },
        { label: "GDELT fetcher", c: 2, a: 1 }, { label: "Market poller", c: 2, a: 1 }, { label: "Normalizer", c: 2, a: 1 }, { label: "PostGIS lookup", c: 2, a: 1 },
        { label: "React mount", c: 3, a: 2 }, { label: "WebGL globe", c: 3, a: 2 }, { label: "GeoJSON layer", c: 3, a: 2 }
    ];
    const GF_CLUSTERS = ["API", "STREAM", "INGEST", "WEB"];
    const GF_EDGES = [[0, 1], [2, 3], [3, 4], [4, 9], [5, 6], [6, 7], [7, 11], [10, 11], [2, 5], [8, 11]];
    const GF_STATUS = [
        [0, "Reading God_View repository"],
        [700, "Chunking within 8k-token budget"],
        [1700, "Dispatching 4 chunks to 3 sub-agents"],
        [3200, "Sub-agents extracting features"],
        [6800, "Linking feature graph"],
        [7900, "Blueprint ready. 12 features across 4 modules."]
    ];
    const GF_TOTAL = 7900;

    const gf = { on: false, raf: 0, t0: 0, running: false, done: false, statusIdx: -1 };

    function gfLayout(W, H) {
        const padL = Math.max(12, W * 0.03);
        const colFileX = padL + 62;
        const fileTop = H * 0.10, fileRowH = Math.min(30, H * 0.8 / GF_FILES.length);
        const chunkX = W * 0.27, chunkRowY = i => H * (0.16 + i * (H * 0.68 / GF_CHUNKS.length));
        const agentX = W * 0.46, agentRowY = i => H * (0.24 + i * (H * 0.52 / GF_AGENTS.length));
        const ccx = W * 0.78, ccy = H * 0.48;
        const S = Math.min(H * 0.26, W * 0.105);
        const centers = [[ccx, ccy - S], [ccx - S * 1.25, ccy], [ccx + S * 1.25, ccy], [ccx, ccy + S]];
        const slots = [];
        const perCluster = {};
        GF_FEATURES.forEach(f => { (perCluster[f.c] = perCluster[f.c] || []).push(f); });
        Object.values(perCluster).forEach(group => group.forEach((f, j) => {
            const ang = -Math.PI / 2 + (j / group.length) * Math.PI * 2;
            slots[GF_FEATURES.indexOf(f)] = {
                x: centers[f.c][0] + Math.cos(ang) * S * 0.52,
                y: centers[f.c][1] + Math.sin(ang) * S * 0.40
            };
        }));
        return { padL, colFileX, fileTop, fileRowH, chunkX, chunkRowY, agentX, agentRowY, centers, slots, S };
    }

    function gfChip(ctx, x, y, text, opts = {}) {
        ctx.font = "10px 'JetBrains Mono', monospace";
        const w = Math.max(ctx.measureText(text).width + 16, opts.minW || 44), h = opts.h || 20;
        rr(ctx, x - w / 2, y - h / 2, w, h, 6);
        ctx.fillStyle = opts.fill || PAL.chip;
        ctx.fill();
        ctx.strokeStyle = opts.border || PAL.chipBorder;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = opts.color || PAL.soft;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y + 0.5);
        return w;
    }

    function quadPoint(p0, p1, p2, k) {
        const u = 1 - k;
        return { x: u * u * p0.x + 2 * u * k * p1.x + k * k * p2.x, y: u * u * p0.y + 2 * u * k * p1.y + k * k * p2.y };
    }

    function drawGraft(t, ts) {
        const f = fitCanvasDPR(graftCanvas);
        if (!f) return;
        const { ctx, W, H } = f;
        const L = gfLayout(W, H);
        ctx.clearRect(0, 0, W, H);
        ctx.font = "10px 'JetBrains Mono', monospace";

        GF_FILES.forEach((name, i) => {
            const k = easeOut(Math.min(Math.max((t - i * 70) / 450, 0), 1));
            if (k <= 0) return;
            const y = L.fileTop + i * L.fileRowH;
            let alpha = k;
            let x = L.colFileX, yy = y;
            const ci = GF_CHUNKS.findIndex(c => c.files.includes(i));
            if (ci >= 0) {
                const ck = Math.min(Math.max((t - (800 + ci * 180)) / 500, 0), 1);
                if (ck > 0) {
                    const e = easeIO(ck);
                    x = x + (L.chunkX - x) * e;
                    yy = y + (L.chunkRowY(ci) - y) * e;
                    alpha = k * (1 - e);
                }
            }
            ctx.globalAlpha = alpha;
            ctx.fillStyle = PAL.faint;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(name, x - 56, yy);
            ctx.globalAlpha = 1;
        });

        GF_CHUNKS.forEach((c, ci) => {
            const k = easeOut(Math.min(Math.max((t - (800 + ci * 180)) / 500, 0), 1));
            if (k <= 0) return;
            const home = { x: L.chunkX, y: L.chunkRowY(ci) };
            const ag = { x: L.agentX, y: L.agentRowY(c.agent) };
            const mk = Math.min(Math.max((t - (1700 + ci * 200)) / 600, 0), 1);
            const pos = mk > 0
                ? quadPoint(home, { x: (home.x + ag.x) / 2, y: (home.y + ag.y) / 2 - 26 }, ag, easeIO(mk))
                : home;
            const alpha = mk > 0 ? 1 - mk * 0.85 : k;
            ctx.globalAlpha = Math.max(alpha, 0);
            gfChip(ctx, pos.x, pos.y, `${c.id} (${c.files.length})`, { color: PAL.accent, border: PAL.accent });
            ctx.globalAlpha = 1;
        });

        GF_AGENTS.forEach((name, ai) => {
            const k = easeOut(Math.min(Math.max((t - (1600 + ai * 140)) / 400, 0), 1));
            if (k <= 0) return;
            const busy = GF_CHUNKS.some((c, ci) =>
                (c.agent === ai && t > 1700 + ci * 200 && t < 2300 + ci * 200)) ||
                GF_FEATURES.some((fe, fi) => fe.a === ai && t > 3200 + fi * 260 && t < 3820 + fi * 260);
            gfChip(ctx, L.agentX, L.agentRowY(ai), name, {
                minW: 76, h: 24,
                border: busy ? PAL.accent : PAL.chipBorder,
                color: busy ? PAL.accent : PAL.soft,
                fill: PAL.chip
            });
        });

        const drift = gf.done && !reducedMotion;
        GF_FEATURES.forEach((fe, fi) => {
            const start = 3200 + fi * 260, dur = 620;
            const k = Math.min(Math.max((t - start) / dur, 0), 1);
            if (k <= 0) return;
            const slot = L.slots[fi];
            let x = slot.x, y = slot.y;
            if (drift) { x += Math.sin(ts / 900 + fi * 1.7) * 2; y += Math.cos(ts / 1100 + fi) * 2; }
            if (k < 1) {
                const from = { x: L.agentX, y: L.agentRowY(fe.a) };
                const mid = { x: (from.x + slot.x) / 2, y: (from.y + slot.y) / 2 + (fi % 2 ? 24 : -24) };
                const p = quadPoint(from, mid, slot, easeIO(k));
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = PAL.accent;
                ctx.fill();
                return;
            }
            const ek = easeOut(k);
            ctx.beginPath();
            ctx.arc(x, y, 2.6, 0, Math.PI * 2);
            ctx.fillStyle = PAL.accent;
            ctx.globalAlpha = ek;
            ctx.fill();
            ctx.globalAlpha = ek;
            ctx.fillStyle = PAL.soft;
            ctx.font = "10px 'JetBrains Mono', monospace";
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(fe.label, x + 7, y);
            ctx.globalAlpha = 1;
        });

        GF_EDGES.forEach(([a, b], ei) => {
            const ka = Math.min(Math.max((t - (3200 + a * 260 + 620)) / 300, 0), 1);
            const kb = Math.min(Math.max((t - (3200 + b * 260 + 620)) / 300, 0), 1);
            const ke = Math.min(Math.max((t - (6800 + ei * 55)) / 500, 0), 1);
            if (ke <= 0 || ka < 1 || kb < 1) return;
            const pa = L.slots[a], pb = L.slots[b];
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = PAL.edgeA + "0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        if (t > 2000) {
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = PAL.edgeA + "0.18)";
            L.centers.forEach((c, ci) => {
                const members = GF_FEATURES.filter(fe => fe.c === ci).length;
                if (!members || t < 3200) return;
                ctx.beginPath();
                ctx.ellipse(c[0], c[1], L.S * 0.72, L.S * 0.58, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = PAL.faint;
                ctx.font = "9px 'JetBrains Mono', monospace";
                ctx.textAlign = "center";
                ctx.fillText(GF_CLUSTERS[ci], c[0], c[1] + L.S * 0.78);
            });
            ctx.setLineDash([]);
        }

        const si = GF_STATUS.reduce((acc, s, i) => t >= s[0] ? i : acc, 0);
        if ((gf.running || gf.done) && si !== gf.statusIdx) { gf.statusIdx = si; graftStatus.textContent = GF_STATUS[si][1]; }
    }

    function graftFrame(ts) {
        if (!gf.on) return;
        const t = reducedMotion ? GF_TOTAL : Math.min(ts - gf.t0, GF_TOTAL);
        drawGraft(t, ts);
        if (gf.running && t >= GF_TOTAL) {
            gf.running = false;
            gf.done = true;
            graftBtn.disabled = false;
            graftBtn.textContent = "Run again";
        }
        gf.raf = requestAnimationFrame(graftFrame);
    }

    function fitGraft() { if (graftCanvas) drawGraft(reducedMotion || gf.done ? GF_TOTAL : (gf.running ? performance.now() - gf.t0 : -1), performance.now()); }
    function startGraftLoop() {
        if (!graftCanvas || gf.on) return;
        gf.on = true;
        gf.raf = requestAnimationFrame(graftFrame);
    }
    function stopGrafLoop() {
        gf.on = false;
        cancelAnimationFrame(gf.raf);
    }

    if (graftBtn) {
        graftBtn.addEventListener("click", () => {
            if (gf.running) return;
            gf.running = true;
            gf.done = false;
            gf.statusIdx = -1;
            gf.t0 = performance.now();
            graftBtn.disabled = true;
            graftBtn.textContent = "Scanning";
            if (!gf.on) startGraftLoop();
        });
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) { stopGlobe(); stopGrafLoop(); }
        else if (currentView === "playground") { startGlobe(); startGraftLoop(); }
    });
    window.addEventListener("resize", () => {
        if (currentView !== "playground") return;
        fitGlobe(); fitGraft();
    });

    /* ---------- konami ---------- */
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
    let konamiBuf = [];
    document.addEventListener("keydown", e => {
        konamiBuf.push(e.code);
        if (konamiBuf.length > KONAMI.length) konamiBuf.shift();
        if (konamiBuf.join(",") === KONAMI.join(",")) {
            konamiBuf = [];
            setTheme("retro");
            toast("Retro mode on. Toggle the theme to leave.", 4200);
        }
    });

    /* ---------- init ---------- */
    $("#year").textContent = new Date().getFullYear();
    showView(viewFromHash());
})();
