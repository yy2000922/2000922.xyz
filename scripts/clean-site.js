#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const siteDir = path.join(root, "_site");

fs.rmSync(siteDir, { recursive: true, force: true });
console.log(`[clean-site] Removed ${siteDir}`);
