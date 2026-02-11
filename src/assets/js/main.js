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
        return () => {};
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
        return () => {
            window.removeEventListener("scroll", updateActions);
            window.removeEventListener("resize", updateActions);
        };
    }

    updateFooterOffset();
    window.addEventListener("scroll", updateFooterOffset, { passive: true });
    window.addEventListener("resize", updateFooterOffset);
    return () => {
        window.removeEventListener("scroll", updateFooterOffset);
        window.removeEventListener("resize", updateFooterOffset);
    };
};

const initPostHeaderVisibility = () => {
    const postContainer = document.querySelector(".post-container");
    if (!postContainer) {
        return () => {};
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
    return () => {
        window.removeEventListener("scroll", onScroll);
    };
};

const initHomeNavStyle = () => {
    const heroSection = document.querySelector(".hero-section");
    const siteNav = document.querySelector(".site-nav");
    
    if (!heroSection || !siteNav) {
        return () => {};
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
    return () => {
        window.removeEventListener("scroll", updateNavStyle);
        siteNav.classList.remove("is-transparent");
    };
};

const initGridDots = () => {
    const heroSection = document.querySelector(".hero-section");
    if (!heroSection) {
        return () => {};
    }

    const existingCanvas = document.querySelector(".grid-dots-canvas");
    if (existingCanvas) {
        existingCanvas.remove();
    }

    const canvas = document.createElement("canvas");
    canvas.className = "grid-dots-canvas";
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
    let running = true;
    let rafId = 0;
    const draw = (time) => {
        if (!running) return;
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
        
        rafId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    resize();
    rafId = requestAnimationFrame(draw);
    return () => {
        running = false;
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
        window.removeEventListener("resize", resize);
        canvas.remove();
    };
};

const initMobileMenu = () => {
    const toggle = document.querySelector(".menu-toggle");
    const menuLinks = document.querySelector(".menu-links");
    const overlay = document.querySelector(".menu-overlay");
    const body = document.body;

    if (!toggle || !menuLinks || !overlay) {
        return;
    }

    const toggleMenu = (open) => {
        const isOpen = open !== undefined ? open : !toggle.classList.contains("is-active");
        
        toggle.classList.toggle("is-active", isOpen);
        toggle.setAttribute("aria-expanded", isOpen);
        menuLinks.classList.toggle("is-active", isOpen);
        overlay.classList.toggle("is-active", isOpen);
        
        // Prevent body scroll when menu is open
        if (isOpen) {
            body.style.overflow = "hidden";
        } else {
            body.style.overflow = "";
        }
    };

    toggle.addEventListener("click", () => toggleMenu());
    overlay.addEventListener("click", () => toggleMenu(false));

    // Close menu when clicking on a link
    menuLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => toggleMenu(false));
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && toggle.classList.contains("is-active")) {
            toggleMenu(false);
        }
    });
};

const initThemeToggle = () => {
    const toggleButton = document.querySelector(".theme-toggle");
    if (!toggleButton) return;

    // Toggle logic
    toggleButton.addEventListener("click", () => {
        // Add transition class for smooth animation
        document.documentElement.classList.add('theme-transition');

        let theme = document.documentElement.getAttribute("data-theme");
        if (theme === "dark") {
            theme = "light";
        } else {
            theme = "dark";
        }
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        // Remove transition class after animation finishes
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 350); // Slightly longer than CSS transition (300ms)
    });
};

const pageCleanups = [];

const initPage = () => {
    while (pageCleanups.length) {
        const cleanup = pageCleanups.pop();
        if (typeof cleanup === "function") cleanup();
    }
    removeAnimationArtifacts();
    pageCleanups.push(initPostActions());
    pageCleanups.push(initPostHeaderVisibility());
    pageCleanups.push(initHomeNavStyle());
    pageCleanups.push(initGridDots());
};

let globalInited = false;
const initGlobal = () => {
    if (globalInited) return;
    globalInited = true;
    initMobileMenu();
    initThemeToggle();
};

const boot = () => {
    initGlobal();
    initPage();
};

console.info("Clean theme assets loaded.");
const PJAX_SELECTOR = "a[href]";

const isSameOrigin = (url) => url.origin === window.location.origin;

const shouldHandleLink = (link) => {
    if (!link) return false;
    if (link.hasAttribute("data-no-pjax")) return false;
    if (link.target && link.target !== "_self") return false;
    if (link.hasAttribute("download")) return false;
    if (link.getAttribute("rel") === "external") return false;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return false;
    if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
    try {
        const url = new URL(href, window.location.href);
        if (!isSameOrigin(url)) return false;
        if (url.pathname === window.location.pathname && url.hash) return false;
        return true;
    } catch (err) {
        return false;
    }
};

const updatePageStyles = (nextDoc) => {
    const existing = document.head.querySelectorAll("link[rel='stylesheet'][data-page-style]");
    existing.forEach((link) => link.remove());
    const incoming = nextDoc.head.querySelectorAll("link[rel='stylesheet'][data-page-style]");
    incoming.forEach((link) => document.head.appendChild(link.cloneNode(true)));
};

const executeScripts = (root) => {
    if (!root) return;
    root.querySelectorAll("script").forEach((script) => {
        const replacement = document.createElement("script");
        Array.from(script.attributes).forEach((attr) => {
            replacement.setAttribute(attr.name, attr.value);
        });
        replacement.textContent = script.textContent || "";
        script.replaceWith(replacement);
    });
};

const swapContent = (nextDoc) => {
    const nextMain = nextDoc.querySelector("main");
    const currentMain = document.querySelector("main");
    if (!nextMain || !currentMain) return;
    currentMain.innerHTML = nextMain.innerHTML;
    document.title = nextDoc.title;
    const nextBodyClass = nextDoc.body.getAttribute("class");
    if (nextBodyClass) {
        document.body.setAttribute("class", nextBodyClass);
    } else {
        document.body.removeAttribute("class");
    }
    updatePageStyles(nextDoc);
    executeScripts(currentMain);
};

const reinitAfterSwap = () => {
    initPage();
    if (window.mermaid && typeof window.mermaid.init === "function") {
        window.mermaid.init(undefined, document.querySelectorAll(".mermaid"));
    }
};

const loadPage = async (url, pushState = true) => {
    try {
        const response = await fetch(url, { headers: { "X-Requested-With": "pjax" } });
        if (!response.ok) {
            window.location.href = url;
            return;
        }
        const html = await response.text();
        const parser = new DOMParser();
        const nextDoc = parser.parseFromString(html, "text/html");
        swapContent(nextDoc);
        if (pushState) {
            window.history.pushState({ url }, "", url);
        }
        window.scrollTo({ top: 0, behavior: "auto" });
        reinitAfterSwap();
    } catch (error) {
        console.warn("[pjax] navigation failed, fallback to full reload:", error);
        window.location.href = url;
    }
};

const handleLinkClick = (event) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest(PJAX_SELECTOR);
    if (!shouldHandleLink(link)) return;
    event.preventDefault();
    const href = link.getAttribute("href");
    const url = new URL(href, window.location.href).toString();
    loadPage(url, true);
};

const handlePopState = (event) => {
    const url = (event.state && event.state.url) || window.location.href;
    loadPage(url, false);
};

onReady(() => {
    boot();
    document.addEventListener("click", handleLinkClick);
    window.addEventListener("popstate", handlePopState);
});
