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

const boot = () => {
    removeAnimationArtifacts();
    initPostActions();
    initPostHeaderVisibility();
};

console.info("Clean theme assets loaded.");
onReady(boot);
