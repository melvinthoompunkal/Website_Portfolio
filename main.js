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
        { keys: ["god view", "godview", "kafka", "real-time", "realtime", "map"], reply: "God View streams global events, markets, and weather onto one live map. FastAPI, Kafka, Redis, WebGL, ten thousand events a second. The stream-worker loop is on the Developer path." },
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
