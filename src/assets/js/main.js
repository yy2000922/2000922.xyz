const onReady = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
        return;
    }
    callback();
};

const removeAnimationArtifacts = () => {
    // Keep a placeholder to restore/extend simple UI interactions without tying to DOM ready logic.
};

const initPostActions = () => {
    const actionWrap = document.querySelector(".post-actions");
    if (!actionWrap) {
        return;
    }

    const backButton = actionWrap.querySelector("[data-action='back']");
    const topButton = actionWrap.querySelector("[data-action='top']");
    const footer = document.querySelector("footer");
    const baseBottomRaw = getComputedStyle(actionWrap).getPropertyValue("--post-actions-bottom-base");
    const baseBottom = Number.parseFloat(baseBottomRaw) || 20;

    const updateFooterOffset = () => {
        if (!footer) {
            return;
        }
        const footerRect = footer.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const overlap = Math.max(0, viewportHeight - footerRect.top + 12);
        actionWrap.style.setProperty("--post-actions-bottom", `${baseBottom + overlap}px`);
    };

    if (backButton) {
        backButton.addEventListener("click", () => {
            if (window.history.length > 1) {
                window.history.back();
                return;
            }
            window.location.href = "/";
        });
    }

    if (topButton) {
        const updateTopVisibility = () => {
            if (window.scrollY > 300) {
                topButton.classList.add("is-visible");
                return;
            }
            topButton.classList.remove("is-visible");
        };

        topButton.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        const updateActions = () => {
            updateTopVisibility();
            updateFooterOffset();
        };

        updateActions();
        window.addEventListener("scroll", updateActions, { passive: true });
        window.addEventListener("resize", updateActions);
        return;
    }

    updateFooterOffset();
    window.addEventListener("scroll", updateFooterOffset, { passive: true });
    window.addEventListener("resize", updateFooterOffset);
};

const initPostHeaderVisibility = () => {
    const postContainer = document.querySelector(".post-container");
    if (!postContainer) {
        return;
    }

    const siteNav = document.querySelector(".site-nav");
    if (!siteNav) {
        return;
    }

    let lastScrollY = window.scrollY;
    let ticking = false;
    const minScroll = 80;
    const delta = 6;

    const updateVisibility = () => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY + delta;
        const scrollingUp = currentScrollY < lastScrollY - delta;

        if (currentScrollY <= minScroll) {
            siteNav.classList.remove("is-hidden");
        } else if (scrollingDown) {
            siteNav.classList.add("is-hidden");
        } else if (scrollingUp) {
            siteNav.classList.remove("is-hidden");
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateVisibility);
            ticking = true;
        }
    };

    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
};

const initHomeNavStyle = () => {
    const heroSection = document.querySelector(".hero-section");
    const siteNav = document.querySelector(".site-nav");
    
    if (!heroSection || !siteNav) {
        return;
    }

    const updateNavStyle = () => {
        if (window.scrollY < 20) {
            siteNav.classList.add("is-transparent");
        } else {
            siteNav.classList.remove("is-transparent");
        }
    };

    window.addEventListener("scroll", updateNavStyle, { passive: true });
    updateNavStyle();
};

const initGridDots = () => {
    const heroSection = document.querySelector(".hero-section");
    if (!heroSection) {
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "145vh";
    canvas.style.zIndex = "-1";
    canvas.style.pointerEvents = "none";
    // Match CSS mask-image
    canvas.style.maskImage = "linear-gradient(to bottom, black 60%, transparent 100%)";
    canvas.style.webkitMaskImage = "linear-gradient(to bottom, black 60%, transparent 100%)";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let width, height;
    let dots = [];
    const gridSize = 60;

    const initDots = () => {
        dots = [];
        // Use document.documentElement.clientWidth to exclude scrollbar width, matching CSS "width: 100%" behavior
        const cssWidth = document.documentElement.clientWidth;
        const centerX = cssWidth / 2;
        
        // CSS Grid aligns center of 60px tile (30px) to center of screen.
        // The vertical line is at 0px (left) of the tile.
        // So the line is at: Center - 30px.
        // We add 0.5px to center the dot on the 1px wide line.
        const firstLineX = centerX - 30 + 0.5;
        
        // Find the first visible line X coordinate
        const startX = ((firstLineX % gridSize) + gridSize) % gridSize;

        for (let x = startX; x < width; x += gridSize) {
            for (let y = 0.5; y < height; y += gridSize) {
                // Sparsity: Only create dots at 40% of intersections
                if (Math.random() > 0.4) continue;

                dots.push({
                    x,
                    y,
                    maxOpacity: 0.3 + Math.random() * 0.4,
                    // State machine: 0=WAITING, 1=FADING_IN, 2=VISIBLE, 3=FADING_OUT
                    state: 0, 
                    // Initial random delay before first blink
                    timer: Math.random() * 10000,
                    
                    // Durations (ms)
                    fadeInDuration: 1500,
                    stayDuration: 2500 + Math.random() * 1500, // Stay for 2.5s - 4s
                    fadeOutDuration: 1500,
                    waitDuration: 5000 + Math.random() * 15000 // Wait 5s - 20s before next blink
                });
            }
        }
    };

    const resize = () => {
        // Match the width calculation to the CSS container
        // body::before is absolute, usually relative to viewport (excluding scrollbar)
        const cssWidth = document.documentElement.clientWidth;
        
        width = cssWidth;
        height = window.innerHeight * 1.45;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        
        initDots();
    };

    let lastTime = 0;
    const draw = (time) => {
        if (!lastTime) lastTime = time;
        const dt = time - lastTime;
        lastTime = time;

        // Clear logic for transparent canvas
        ctx.clearRect(0, 0, width, height);
        
        dots.forEach(dot => {
            dot.timer -= dt;

            // State transition logic
            if (dot.timer <= 0) {
                switch (dot.state) {
                    case 0: // WAITING -> FADING_IN
                        dot.state = 1;
                        dot.timer = dot.fadeInDuration;
                        break;
                    case 1: // FADING_IN -> VISIBLE
                        dot.state = 2;
                        dot.timer = dot.stayDuration;
                        break;
                    case 2: // VISIBLE -> FADING_OUT
                        dot.state = 3;
                        dot.timer = dot.fadeOutDuration;
                        break;
                    case 3: // FADING_OUT -> WAITING
                        dot.state = 0;
                        dot.timer = dot.waitDuration;
                        break;
                }
            }

            // Calculate opacity based on state
            let opacity = 0;
            if (dot.state === 1) { // Fading In
                opacity = dot.maxOpacity * (1 - dot.timer / dot.fadeInDuration);
            } else if (dot.state === 2) { // Visible
                opacity = dot.maxOpacity;
            } else if (dot.state === 3) { // Fading Out
                opacity = dot.maxOpacity * (dot.timer / dot.fadeOutDuration);
            }

            // Optimization: Skip drawing if invisible
            if (opacity <= 0) return;

            // Use gray color (100, 100, 100) instead of pure black (0, 0, 0)
            // This ensures the dot is never "pitch black" even at max opacity
            ctx.fillStyle = `rgba(100, 100, 100, ${opacity})`;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    requestAnimationFrame(draw);
};

const boot = () => {
    removeAnimationArtifacts();
    initPostActions();
    initPostHeaderVisibility();
    initHomeNavStyle();
    initGridDots();
};

console.info("Clean theme assets loaded.");
onReady(boot);
