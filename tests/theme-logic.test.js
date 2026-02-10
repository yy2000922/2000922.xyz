const assert = require('assert');

// Mock Browser Environment
global.window = {
    matchMedia: (query) => ({
        matches: query.includes('dark'), // Simulate system dark mode preference
        addListener: () => {},
        removeListener: () => {}
    })
};

global.localStorage = {
    store: {},
    getItem: function(key) { return this.store[key] || null; },
    setItem: function(key, value) { this.store[key] = value.toString(); },
    clear: function() { this.store = {}; }
};

global.document = {
    documentElement: {
        attributes: {},
        getAttribute: function(key) { return this.attributes[key]; },
        setAttribute: function(key, value) { this.attributes[key] = value; }
    },
    querySelector: () => ({ addEventListener: () => {} }) // Mock toggle button
};

// Test 1: Default Logic (Simulating Inline Script)
console.log('Test 1: Default Theme Logic (Inline Script Simulation)');
global.localStorage.clear();
// Reset DOM
global.document.documentElement.attributes = {};

// Simulate Inline Script
(function() {
    const savedTheme = global.localStorage.getItem('theme');
    if (savedTheme === 'light') {
        global.document.documentElement.setAttribute('data-theme', 'light');
    } else {
        global.document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

// Assertions
assert.strictEqual(global.document.documentElement.getAttribute('data-theme'), 'dark', 'Default should be dark');
console.log('PASS: Default is dark');


// Test 2: Persistence Logic (Simulate Saved Light Theme)
console.log('\nTest 2: Persistence Logic (Saved Light Theme)');
global.localStorage.setItem('theme', 'light');
global.document.documentElement.attributes = {};

(function() {
    const savedTheme = global.localStorage.getItem('theme');
    if (savedTheme === 'light') {
        global.document.documentElement.setAttribute('data-theme', 'light');
    } else {
        global.document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

assert.strictEqual(global.document.documentElement.getAttribute('data-theme'), 'light', 'Should respect saved light theme');
console.log('PASS: Respects saved light theme');


// Test 3: Toggle Logic
console.log('\nTest 3: Toggle Logic');
// Reset to Dark
global.document.documentElement.setAttribute('data-theme', 'dark');
global.localStorage.setItem('theme', 'dark');

// Extract Toggle Logic from main.js idea
function onToggle() {
    let theme = global.document.documentElement.getAttribute("data-theme");
    if (theme === "dark") {
        theme = "light";
    } else {
        theme = "dark";
    }
    global.document.documentElement.setAttribute("data-theme", theme);
    global.localStorage.setItem("theme", theme);
}

// Action: Click Toggle
onToggle();
assert.strictEqual(global.document.documentElement.getAttribute('data-theme'), 'light', 'Should switch to light');
assert.strictEqual(global.localStorage.getItem('theme'), 'light', 'Should save light preference');
console.log('PASS: Toggles to Light');

// Action: Click Toggle Again
onToggle();
assert.strictEqual(global.document.documentElement.getAttribute('data-theme'), 'dark', 'Should switch back to dark');
assert.strictEqual(global.localStorage.getItem('theme'), 'dark', 'Should save dark preference');
console.log('PASS: Toggles back to Dark');

console.log('\nAll tests passed successfully.');