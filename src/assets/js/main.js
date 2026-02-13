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

const initPostToc = () => {
    const content = document.querySelector(".post-content");
    const desktopToc = document.querySelector(".post-toc-desktop");
    const mobileToc = document.querySelector(".post-toc-mobile");
    const desktopList = document.querySelector("#post-toc-list");
    const mobileList = document.querySelector("#post-toc-mobile-list");

    if (!content || !desktopToc || !mobileToc || !desktopList || !mobileList) {
        return () => {};
    }

    const headings = Array.from(content.querySelectorAll("h2, h3"));
    if (headings.length < 4) {
        return () => {};
    }

    desktopToc.classList.remove("is-hidden");
    mobileToc.classList.remove("is-hidden");

    const usedIds = new Set();
    const slugify = (text, fallback) => {
        const value = (text || "")
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s-]/gu, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "");
        return value || fallback;
    };

    const ensureId = (heading, index) => {
        if (heading.id) {
            usedIds.add(heading.id);
            return heading.id;
        }
        let base = slugify(heading.textContent, `section-${index + 1}`);
        let candidate = base;
        let counter = 2;
        while (usedIds.has(candidate)) {
            candidate = `${base}-${counter}`;
            counter += 1;
        }
        heading.id = candidate;
        usedIds.add(candidate);
        return candidate;
    };

    const allLinks = [];
    const buildListItem = (heading, index) => {
        const id = ensureId(heading, index);
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `#${id}`;
        link.textContent = heading.textContent.trim();
        link.className = `post-toc-link level-${heading.tagName.toLowerCase() === "h3" ? "3" : "2"}`;
        link.dataset.targetId = id;
        li.appendChild(link);
        allLinks.push(link);
        return li;
    };

    headings.forEach((heading, index) => {
        desktopList.appendChild(buildListItem(heading, index));
    });

    headings.forEach((heading, index) => {
        mobileList.appendChild(buildListItem(heading, index));
    });

    let currentActiveId = "";
    const activateLink = (id) => {
        if (!id || id === currentActiveId) {
            return;
        }
        currentActiveId = id;
        allLinks.forEach((link) => {
            link.classList.toggle("is-active", link.dataset.targetId === id);
        });
        const activeDesktopLink = desktopList.querySelector(`.post-toc-link.is-active[data-target-id="${id}"]`);
        if (activeDesktopLink) {
            activeDesktopLink.scrollIntoView({ block: "nearest", inline: "nearest" });
        }
    };

    const nav = document.querySelector(".site-nav");
    const actionWrap = document.querySelector(".post-actions");
    const footer = document.querySelector("footer");
    const updateDesktopTocMaxHeight = () => {
        const items = Array.from(desktopList.children);
        if (!items.length) {
            return;
        }
        const visibleCount = Math.min(10, items.length);
        const itemsHeight = items
            .slice(0, visibleCount)
            .reduce((total, item) => total + item.getBoundingClientRect().height, 0);
        const tocStyles = getComputedStyle(desktopToc);
        const paddingTop = Number.parseFloat(tocStyles.paddingTop) || 0;
        const paddingBottom = Number.parseFloat(tocStyles.paddingBottom) || 0;
        const maxHeight = Math.ceil(itemsHeight + paddingTop + paddingBottom + 2);
        desktopToc.style.setProperty("--post-toc-max-height", `${maxHeight}px`);
    };
    const updateDesktopTocPosition = () => {
        const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        const baseCenterY = window.innerHeight * 0.54 + rootFontSize * 4.8;
        const tocHeight = desktopToc.offsetHeight;
        const minCenterY = tocHeight / 2 + 12;
        let nextCenterY = Math.max(minCenterY, baseCenterY);
        const footerTop = footer ? footer.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
        const nearBottom = footerTop <= window.innerHeight + tocHeight * 0.35;

        if (nearBottom) {
            let maxCenterY = window.innerHeight - tocHeight / 2 - 12;
            if (actionWrap) {
                const actionTop = actionWrap.getBoundingClientRect().top;
                maxCenterY = Math.min(maxCenterY, actionTop - 12 - tocHeight / 2);
            }
            maxCenterY = Math.min(maxCenterY, footerTop - 16 - tocHeight / 2);
            nextCenterY = Math.max(minCenterY, Math.min(nextCenterY, maxCenterY));
        }

        desktopToc.style.setProperty("--post-toc-top", `${Math.round(nextCenterY)}px`);
    };
    const updateActiveByScroll = () => {
        if (!headings.length) {
            return;
        }
        const markerY = window.scrollY + window.innerHeight * 0.68;
        let activeId = headings[0].id;

        headings.forEach((heading) => {
            const headingTop = heading.getBoundingClientRect().top + window.scrollY;
            if (headingTop <= markerY) {
                activeId = heading.id;
            }
        });

        const doc = document.documentElement;
        const atBottom = Math.ceil(window.scrollY + window.innerHeight) >= doc.scrollHeight;
        if (atBottom) {
            activeId = headings[headings.length - 1].id;
        }
        activateLink(activeId);
    };
    const getOffsetTop = (target) => {
        const navHeight = nav ? nav.offsetHeight : 0;
        return target.getBoundingClientRect().top + window.scrollY - navHeight - 18;
    };

    const handleClick = (event) => {
        const link = event.target.closest(".post-toc-link");
        if (!link) {
            return;
        }
        const target = document.getElementById(link.dataset.targetId);
        if (!target) {
            return;
        }
        event.preventDefault();
        window.scrollTo({
            top: getOffsetTop(target),
            behavior: "smooth"
        });
        activateLink(link.dataset.targetId);
        if (mobileToc.open) {
            mobileToc.open = false;
        }
    };

    desktopList.addEventListener("click", handleClick);
    mobileList.addEventListener("click", handleClick);

    if (headings[0]?.id) {
        activateLink(headings[0].id);
    }
    updateDesktopTocMaxHeight();
    updateDesktopTocPosition();
    updateActiveByScroll();
    const handleDesktopTocResize = () => {
        updateDesktopTocMaxHeight();
        updateDesktopTocPosition();
        updateActiveByScroll();
    };
    const handleDesktopTocScroll = () => {
        updateDesktopTocPosition();
        updateActiveByScroll();
    };
    window.addEventListener("scroll", handleDesktopTocScroll, { passive: true });
    window.addEventListener("resize", handleDesktopTocResize);

    return () => {
        desktopList.removeEventListener("click", handleClick);
        mobileList.removeEventListener("click", handleClick);
        window.removeEventListener("scroll", handleDesktopTocScroll);
        window.removeEventListener("resize", handleDesktopTocResize);
    };
};

const initNavVisibility = () => {
    const siteNav = document.querySelector(".site-nav");
    if (!siteNav) {
        return () => {};
    }

    let lastScrollY = window.scrollY;
    let ticking = false;
    const delta = 6;
    let upwardDistance = 0;
    let navHeight = siteNav.offsetHeight || 80;

    const recalcNavHeight = () => {
        navHeight = siteNav.offsetHeight || 80;
    };

    const getShowThreshold = () => Math.max(36, Math.round(navHeight * 0.35));

    const updateVisibility = () => {
        const currentScrollY = window.scrollY;
        const diff = currentScrollY - lastScrollY;
        const scrollingDown = diff > delta;
        const scrollingUp = diff < -delta;
        const hideThreshold = navHeight;
        const showThreshold = getShowThreshold();

        if (currentScrollY <= hideThreshold) {
            siteNav.classList.remove("is-hidden");
            upwardDistance = 0;
        } else if (scrollingDown) {
            siteNav.classList.add("is-hidden");
            upwardDistance = 0;
        } else if (scrollingUp) {
            upwardDistance += -diff;
            if (!siteNav.classList.contains("is-hidden") || upwardDistance >= showThreshold) {
                siteNav.classList.remove("is-hidden");
                upwardDistance = 0;
            }
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

    recalcNavHeight();
    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", recalcNavHeight);
    return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", recalcNavHeight);
    };
};

const initNavTransparency = () => {
    const siteNav = document.querySelector(".site-nav");
    
    if (!siteNav) {
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

        dots.forEach((dot) => {
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
    pageCleanups.push(initPostToc());
    pageCleanups.push(initNavVisibility());
    pageCleanups.push(initNavTransparency());
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

const waitForStylesheet = (link) =>
    new Promise((resolve) => {
        if (link.sheet) {
            resolve();
            return;
        }
        const done = () => {
            link.removeEventListener("load", done);
            link.removeEventListener("error", done);
            resolve();
        };
        link.addEventListener("load", done, { once: true });
        link.addEventListener("error", done, { once: true });
    });

const getAbsoluteHref = (link) => new URL(link.getAttribute("href"), window.location.href).href;

const updatePageStyles = async (nextDoc) => {
    const existing = Array.from(document.head.querySelectorAll("link[rel='stylesheet'][data-page-style]"));
    const existingByHref = new Map(existing.map((link) => [link.href, link]));
    const incoming = Array.from(nextDoc.head.querySelectorAll("link[rel='stylesheet'][data-page-style]"));
    const incomingHrefs = new Set(incoming.map((link) => getAbsoluteHref(link)));

    const loadingTasks = [];
    incoming.forEach((link) => {
        const href = getAbsoluteHref(link);
        if (existingByHref.has(href)) {
            return;
        }
        const clone = link.cloneNode(true);
        document.head.appendChild(clone);
        loadingTasks.push(waitForStylesheet(clone));
    });

    if (loadingTasks.length) {
        await Promise.all(loadingTasks);
    }

    existing.forEach((link) => {
        if (!incomingHrefs.has(link.href)) {
            link.remove();
        }
    });
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
        await updatePageStyles(nextDoc);
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
