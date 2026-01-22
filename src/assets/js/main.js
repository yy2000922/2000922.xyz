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

const boot = () => {
    removeAnimationArtifacts();
};

console.info("Clean theme assets loaded.");
onReady(boot);
