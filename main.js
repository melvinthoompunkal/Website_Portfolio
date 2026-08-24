(function () {
    "use strict";

    var docEl = document.documentElement;
    docEl.classList.add("js");

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", function () {
            var next = docEl.getAttribute("data-theme") === "dark" ? "light" : "dark";
            docEl.setAttribute("data-theme", next);
            try { localStorage.setItem("theme", next); } catch (e) {}
            window.dispatchEvent(new CustomEvent("palettechange"));
        });
    }

    var yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    var sections = Array.prototype.slice.call(document.querySelectorAll("main > section[id]"));

    sections.forEach(function (section) {
        var kids = Array.prototype.slice.call(section.querySelectorAll(".reveal"));
        kids.forEach(function (el, i) {
            el.style.setProperty("--d", Math.min(i * 70, 350) + "ms");
        });
    });

    if ("IntersectionObserver" in window && !reduceMotion && revealEls.length) {
        var revealObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-in");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );
        revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-in"); });
    }

    var navLinks = {};
    Array.prototype.forEach.call(document.querySelectorAll(".rail-nav a"), function (link) {
        var id = (link.getAttribute("href") || "").replace("#", "");
        if (id) { navLinks[id] = link; }
    });
    if ("IntersectionObserver" in window && Object.keys(navLinks).length) {
        var spy = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    var link = navLinks[entry.target.id];
                    if (!link) { return; }
                    if (entry.isIntersecting) {
                        Object.keys(navLinks).forEach(function (k) {
                            navLinks[k].classList.toggle("active", k === entry.target.id);
                        });
                    }
                });
            },
            { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
        );
        sections.forEach(function (s) { spy.observe(s); });
    }

    var canvas = document.getElementById("stream");
    if (canvas && canvas.getContext) {
        var ctx = canvas.getContext("2d");
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var width = 0;
        var height = 0;
        var pulses = [];
        var running = false;
        var rafId = 0;
        var lastTime = 0;
        var spawnTimer = 0;

        function palette() {
            var s = getComputedStyle(docEl);
            return {
                accent: s.getPropertyValue("--accent").trim() || "#e8a33d",
                line: s.getPropertyValue("--border-strong").trim() || "#2a3745",
                dim: s.getPropertyValue("--text-low").trim() || "#667483"
            };
        }
        var colors = palette();

        function resize() {
            var rect = canvas.getBoundingClientRect();
            if (!rect.width) { return; }
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            if (reduceMotion) { drawStatic(); }
        }

        function baseline() {
            ctx.strokeStyle = colors.line;
            ctx.globalAlpha = 0.9;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, height / 2 + 0.5);
            ctx.lineTo(width, height / 2 + 0.5);
            ctx.stroke();
            ctx.globalAlpha = 1;
        }

        function drawStatic() {
            ctx.clearRect(0, 0, width, height);
            baseline();
            var xs = [width * 0.12, width * 0.34, width * 0.58, width * 0.81];
            xs.forEach(function (x, i) {
                ctx.strokeStyle = colors.dim;
                ctx.globalAlpha = 0.5;
                ctx.lineWidth = 1.5;
                var h = 8 + i * 4;
                ctx.beginPath();
                ctx.moveTo(x, height / 2 - h);
                ctx.lineTo(x, height / 2 + h);
                ctx.stroke();
            });
            ctx.globalAlpha = 1;
        }

        function spawn() {
            var burst = Math.random() < 0.12;
            pulses.push({
                x: -4,
                v: 60 + Math.random() * 140,
                h: burst ? 20 + Math.random() * 12 : 4 + Math.random() * 10,
                w: burst ? 2 : 1.4,
                a: burst ? 0.85 : 0.28 + Math.random() * 0.32
            });
            if (pulses.length > 28) { pulses.shift(); }
        }

        function frame(now) {
            if (!running) { return; }
            var dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            ctx.clearRect(0, 0, width, height);
            baseline();

            spawnTimer -= dt;
            if (spawnTimer <= 0) {
                spawn();
                spawnTimer = 0.18 + Math.random() * 0.5;
            }

            ctx.lineCap = "round";
            for (var i = pulses.length - 1; i >= 0; i--) {
                var p = pulses[i];
                p.x += p.v * dt;
                if (p.x > width + 6) {
                    pulses.splice(i, 1);
                    continue;
                }
                ctx.strokeStyle = colors.accent;
                ctx.globalAlpha = p.a * Math.max(0.25, Math.min(1, p.x / 60));
                ctx.lineWidth = p.w;
                ctx.beginPath();
                ctx.moveTo(p.x, height / 2 - p.h);
                ctx.lineTo(p.x, height / 2 + p.h);
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            rafId = requestAnimationFrame(frame);
        }

        function start() {
            if (reduceMotion || running) { return; }
            running = true;
            lastTime = performance.now();
            rafId = requestAnimationFrame(frame);
        }
        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
        }

        window.addEventListener("palettechange", function () {
            colors = palette();
            if (reduceMotion) { drawStatic(); }
        });
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) { stop(); } else { start(); }
        });
        if ("ResizeObserver" in window) {
            new ResizeObserver(resize).observe(canvas);
        } else {
            window.addEventListener("resize", resize);
        }

        resize();
        if (reduceMotion) { drawStatic(); } else { start(); }
    }
})();
