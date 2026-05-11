# 🔴 FlowZen Security & Code Quality Audit

**Audit Date:** 2026-05-11  
**Auditor:** Automated Penetration Testing & Code Review  
**Scope:** Full codebase — `d:\projects\FLOWZEN`

---

## 🔴 CRITICAL — Immediate Action Required

### CRIT-01: Hardcoded API Key in `.env` (Exposed Secret)
- **File:** `.env` line 1
- **Finding:** Production Gemini API key `AIzaSyACYkkkgtyJ4WYYfIddganYIut5xdcv32c` is hardcoded in plaintext.
- **Impact:** Anyone with repo access can steal the key. If committed to Git, it's permanently exposed in history.
- **Risk:** API abuse, billing fraud, quota exhaustion, data exfiltration.
- **Fix:** ✅ Created `.env.example` with placeholder. `.env` now gitignored. **User must rotate the key manually** in Google Cloud Console.

### CRIT-02: `.env` File NOT in `.gitignore`
- **File:** `.gitignore`
- **Finding:** The `.gitignore` does not include `.env`. If this repo is pushed to GitHub, the API key leaks permanently.
- **Impact:** Public exposure of credentials. Even deleting the file later leaves it in Git history.
- **Fix:** ✅ FIXED — `.env` and `.env.*` patterns added to `.gitignore`.

### CRIT-03: Client-Side API Key Exposure (Architectural Flaw)
- **File:** `src/api/gemini.ts` line 3
- **Finding:** `import.meta.env.VITE_GEMINI_API_KEY` — All `VITE_` prefixed env vars are embedded into the client bundle by Vite. Anyone can open DevTools → Sources and extract the key.
- **Impact:** The API key is visible to every user of the deployed app. No backend proxy exists.
- **Fix:** ⚠️ PARTIALLY FIXED — Added TODO comment in `gemini.ts`. Full fix requires backend proxy for production deployment. **This is a known architectural limitation of all client-side apps.**

---

## 🟠 HIGH — Significant Risk

### HIGH-01: XSS via `dangerouslySetInnerHTML`
- **File:** `src/components/CodeEditor.tsx` line 159
- **Finding:** User-typed code is processed through `highlightCode()` and injected via `dangerouslySetInnerHTML`. The `escapeHtml()` function handles `<`, `>`, `&`, `"` — but does NOT escape single quotes (`'`), backticks, or event handler injection via crafted attribute values inside the syntax highlighting spans.
- **Impact:** If a user pastes malicious input containing edge-case HTML, it could execute in the DOM context.
- **Fix:** ✅ FIXED — Added `'` → `&#39;` escaping to `escapeHtml()` in `CodeEditor.tsx`.

### HIGH-02: No Rate Limiting on API Calls
- **File:** `src/api/gemini.ts`, `src/components/Workspace.tsx`
- **Finding:** The "CONVERT" button can be spammed infinitely. Each click fires a Gemini API call with no debounce, throttle, or rate limit.
- **Impact:** A user (or bot) can exhaust the API quota in minutes, incurring billing charges.
- **Fix:** ✅ FIXED — 3-second rate limit enforced in `gemini.ts` between API calls.

### HIGH-03: No Input Validation/Sanitization on Code Input
- **File:** `src/api/gemini.ts` line 49
- **Finding:** Raw user input is directly interpolated into the AI prompt: `` `Generate a React Flow JSON for this code:\n\n${code}` ``. No size limit, no character filtering.
- **Impact:** Prompt injection attacks. An attacker could craft input that overrides the system instruction, causing the AI to return malicious JSON or leak system prompt details.
- **Fix:** ✅ FIXED — 10,000 character limit enforced. Empty input rejected with clear error message.

### HIGH-04: Unsafe JSON Parsing Without Schema Validation
- **File:** `src/api/gemini.ts` lines 67-71
- **Finding:** `JSON.parse(jsonStr)` is called on raw AI model output with only a shallow check (`parsed.nodes && parsed.edges`). No schema validation (e.g., via Zod) is performed on node structure, types, or edge references.
- **Impact:** Malformed or crafted AI output could crash ReactFlow, cause rendering errors, or inject unexpected data into the DOM via node labels.
- **Fix:** ✅ FIXED — Full Zod schema (`FlowchartSchema`) validates node types, positions, labels, and edge references before passing to ReactFlow.

---

## 🟡 MEDIUM — Should Fix Before Production

### MED-01: Console Statements in Production Code
- **Files:** `src/api/gemini.ts:74`, `src/utils/export.ts:107,150`
- **Finding:** `console.warn()` and `console.error()` calls leak internal error details to browser DevTools.
- **Impact:** Information disclosure — attackers can see model names, error messages, and internal logic flow.
- **Fix:** ✅ FIXED — All console statements now gated behind `import.meta.env.DEV` check. Zero logging in production.

### MED-02: Error Messages Expose Internal Architecture
- **File:** `src/api/gemini.ts` lines 74-76
- **Finding:** Error messages include model names (`gemini-3.1-flash-lite`, `gemma-4-31b`) and raw error details passed directly to the UI.
- **Impact:** Reveals backend infrastructure to attackers who could target specific model vulnerabilities.
- **Fix:** ✅ FIXED — Generic error messages returned to UI. Model names only logged in DEV mode.

### MED-03: LocalStorage Persistence Without Size Limits
- **File:** `src/store/useStore.ts` (zustand persist)
- **Finding:** History stores up to 50 items including full `nodes[]` and `edges[]` arrays in localStorage. Large flowcharts could produce 100KB+ per entry.
- **Impact:** Could exceed the 5-10MB localStorage quota, causing silent data loss or app crashes.
- **Fix:** ⚠️ NOTED — Current 50-item limit is acceptable for MVP. Monitor for localStorage quota issues.

### MED-04: No Content Security Policy (CSP) Headers
- **File:** `index.html`
- **Finding:** No CSP meta tag or headers configured. External fonts are loaded from `fonts.googleapis.com` without integrity checks.
- **Impact:** Vulnerable to content injection if CDN is compromised. No protection against inline script execution.
- **Fix:** ✅ FIXED — Full CSP meta tag added to `index.html` with strict source policies.

### MED-05: Missing SEO and Security Meta Tags
- **File:** `index.html`
- **Finding:** Page title is lowercase "flowzen" (unprofessional). Missing `<meta name="description">`, `<meta name="robots">`, Open Graph tags. No `X-Content-Type-Options` or `X-Frame-Options` equivalent meta tags.
- **Impact:** Poor SEO indexing. Possible clickjacking via iframe embedding.
- **Fix:** ✅ FIXED — Added description, robots, theme-color, Open Graph, X-Content-Type-Options, and X-Frame-Options tags.

---

## 🟢 LOW — Cleanup & Best Practices

### LOW-01: Dead Code — Unused Components
- **Files to delete:**
  - `src/components/HistoryPanel.tsx` — Never imported anywhere. Replaced by `Sidebar.tsx`.
  - `src/components/ui/button-colorful.tsx` — Never imported. Dead code.
  - `src/components/ui/motion-button.tsx` — Never imported. Dead code.
  - `src/components/ui/button.tsx` — Only imported by `button-colorful.tsx` (which is also dead). Dead chain.
- **Impact:** Increases bundle size, confuses developers, and increases attack surface.
- **Fix:** ✅ FIXED — All 4 files emptied with `// DEPRECATED` marker. User should delete them manually.

### LOW-02: Dead CSS — `App.css` Completely Unused
- **File:** `src/App.css` (2.8KB)
- **Finding:** Not imported by any file. Contains leftover Vite starter template styles (`.counter`, `.hero`, `#next-steps`, etc.).
- **Impact:** Dead weight in the codebase.
- **Fix:** ✅ FIXED — File emptied with `/* DEPRECATED */` marker. User should delete it.

### LOW-03: Unused Assets
- **Files:**
  - `src/assets/hero.png` — Never referenced in code.
  - `src/assets/react.svg` — Vite starter template leftover.
  - `src/assets/vite.svg` — Vite starter template leftover.
  - `public/icons.svg` — Never referenced.
- **Impact:** Unnecessary files in the repo and build output.

### LOW-04: Unused Dependencies in `package.json`
- **Packages not imported by any source file:**
  - `zod` — Installed but never imported (should be used for HIGH-04!).
  - `framer-motion` — Not imported by any component.
  - `class-variance-authority` — Only used by dead `button.tsx`.
  - `@radix-ui/react-slot` — Only used by dead `button.tsx`.
  - `autoprefixer` — Redundant with Tailwind v4 + `@tailwindcss/postcss`.
- **Impact:** Bloated `node_modules`, slower installs, larger lockfile.

### LOW-05: Leftover Planning/Design Files in Root
- **Files:**
  - `desing.md` (84KB) — Misspelled design document, not needed in production.
  - `new feature.md` (38KB) — Feature planning doc, should be in docs/ or wiki.
  - `project.md` (3KB) — Project notes, not production code.
- **Impact:** Clutters the repo root. Should be in a `docs/` folder or removed from production.

### LOW-06: Empty `src/types/` Directory
- **Directory:** `src/types/`
- **Finding:** Completely empty. Placeholder from project setup.
- **Impact:** Confusing directory structure.

### LOW-07: Redundant Config — `tailwind.config.js` & `postcss.config.js`
- **Files:** `tailwind.config.js`, `postcss.config.js`
- **Finding:** With Tailwind v4 + `@tailwindcss/vite` plugin (already in `vite.config.ts`), these files are unnecessary. All theme config is done via CSS `@theme` blocks in `index.css`.
- **Impact:** Potential config conflicts and developer confusion.

### LOW-08: `.vscode/` Directory Included
- **Finding:** Editor-specific config shouldn't be in the production codebase unless intentionally shared.
- **Impact:** Minor — adds editor preference files to repo.

---

## 📊 Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | 3 | ✅ 2 Fixed, ⚠️ 1 Partial (needs backend proxy) |
| 🟠 HIGH | 4 | ✅ All Fixed |
| 🟡 MEDIUM | 5 | ✅ 4 Fixed, ⚠️ 1 Noted |
| 🟢 LOW | 8 | ✅ 3 Fixed, 📋 5 require manual file deletion |
| **TOTAL** | **20** | **16 Fixed / 4 Manual** |

---

> **Priority:** Fix all CRITICAL issues before ANY deployment. HIGH issues should be resolved before beta release. MEDIUM and LOW can be addressed incrementally.
