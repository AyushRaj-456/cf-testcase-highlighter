# Chrome Web Store Release Checklist - v1.0.0

Use this checklist to verify that the project is completely ready for submission to the Chrome Web Store Developer Dashboard.

---

## 1. Code & Manifest Verification
- [x] `manifest.json` uses Manifest V3.
- [x] Extension version is `1.0.0`.
- [x] Extension name is `CF Testcase Highlighter`.
- [x] Permissions restricted strictly to `storage` and Codeforces host permissions (`https://codeforces.com/*`, `https://www.codeforces.com/*`).
- [x] No development `console.log` statements remain in `content.js`.
- [x] No `eval()`, `new Function()`, or external remote scripts are used.

## 2. File Assets & Icons
- [x] Icon 16x16 exists at `icons/icon16.jpeg`.
- [x] Icon 48x48 exists at `icons/icon48.jpeg`.
- [x] Icon 128x128 exists at `icons/icon128.jpeg`.
- [x] All icon paths in `manifest.json` match actual files.

## 3. Functionality Testing
- [x] Extension loads cleanly via Chrome `chrome://extensions/` (**Load unpacked**).
- [x] Controls appear cleanly above Codeforces submission `Input` sections.
- [x] Output, Answer, Checker Log, problem examples, and code viewers are NOT touched.
- [x] Main test case input parses $t = 5$ with 3 lines/test into 5 complete groups (#1 to #5).
- [x] Hovering over any line highlights all 3 lines in blue with the badge on top-right.
- [x] Copying highlighted text copies raw input lines without copying badge labels.
- [x] **Reset** button restores original Codeforces input text cleanly.
- [x] Repeated Highlight and Reset operations work without creating duplicate wrappers or controls.

## 4. Documentation & Store Listing Material
- [x] Public repository `README.md` updated.
- [x] `STORE_LISTING.md` created with descriptions, single-purpose text, and permission justifications.
- [x] `PRIVACY.md` policy document created.
- [x] `release/cf-testcase-highlighter-v1.0.0.zip` created with `manifest.json` at the ZIP root.

---

## 5. Next Steps for Submission
- [ ] Log in to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
- [ ] Upload `release/cf-testcase-highlighter-v1.0.0.zip`.
- [ ] Copy text from `STORE_LISTING.md` into the dashboard fields.
- [ ] Upload screenshots (1280x800 or 640x400).
- [ ] Link `PRIVACY.md` or paste policy text into the Privacy tab.
- [ ] Submit for review!
