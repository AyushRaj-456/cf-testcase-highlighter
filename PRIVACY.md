# Privacy Policy - CF Testcase Highlighter

**Effective Date:** July 24, 2026  
**Version:** 1.0.0

---

## Overview

**CF Testcase Highlighter** is committed to protecting your privacy. This privacy policy explains what information the extension accesses, how it is used, and how your privacy is protected.

---

## 1. Information Access & Local Processing

- **Codeforces Page Content**: The extension accesses text content inside Codeforces submission `Input` sections strictly to perform local line-based parsing and apply CSS visual highlights.
- **Local Operation**: All parsing, line splitting, and visual rendering occur **100% locally within your web browser**.

---

## 2. Information Storage

- **User Preferences**: The extension saves your preferred settings (such as the *"First line is t"* checkbox state and *"Lines per test"* number) locally on your device using Chrome's standard `chrome.storage.local` API.
- **No Test Content Storage**: Submission input text is never saved permanently, cached on disk, or stored beyond your active browser session.

---

## 3. Data Transmission & Sharing

- **No Remote Transmission**: The extension does **NOT** transmit any data, submission text, code, or user information to any external server or third party.
- **No Third-Party APIs**: The extension does not integrate with any external APIs, Cloud services, or remote scripts.
- **No Tracking or Analytics**: The extension contains **no analytics, tracking scripts, telemetry, or advertising**.

---

## 4. Permissions Used

- **`storage`**: Used solely to persist your local preferences (*First line is t*, *Lines per test*) on your computer.
- **Host Permission (`codeforces.com`)**: Used solely to run the script and stylesheet on Codeforces submission pages.

---

## 5. Contact & Questions

If you have any questions regarding this Privacy Policy, please open an issue on the official project repository.
