# Chrome Web Store Listing Material

Copy and paste the text below directly into the **Chrome Web Store Developer Dashboard** when submitting the extension.

---

## 1. Extension Name
`CF Testcase Highlighter`

---

## 2. Short Description (Max 132 characters)
`Quickly identify individual test cases in Codeforces submission inputs.`

---

## 3. Detailed Description

```
CF Testcase Highlighter makes debugging competitive programming submissions on Codeforces faster and easier.

When viewing test details for a Codeforces submission, Codeforces displays all input test cases together inside one large block. When a solution fails on a specific test case (e.g., Test #15), manually locating that test case inside hundreds of input lines requires tedious line counting.

CF Testcase Highlighter automatically groups physical lines belonging to each test case and highlights the complete test case on hover with its test case number.

KEY FEATURES:

• Hover Highlighting: Hovering over any line belonging to a test case highlights the complete test case block.
• Testcase Badges: Displays visual badges (#1, #2, #3, etc.) on the right side of each test case.
• Copy-Safe: Test case badges use visual-only pseudo-elements so copying test input yields raw input text without extra labels.
• Customizable Settings: Easily toggle whether the first line specifies 't' (testcase count) and set the physical lines per testcase.
• Instant Reset: One-click Reset restores original raw Codeforces input formatting immediately.
• 100% Local & Privacy-Focused: Operates entirely locally in your browser. No backend, no remote code, and no tracking.

HOW TO USE:

1. Open any Codeforces submission page or test details view.
2. Configure settings in the control panel inserted above the Input section:
   - Check 'First line is t' if line 1 specifies the test count.
   - Enter 'Lines per test' (e.g. 3).
3. Click 'Highlight'.
4. Hover over any line to highlight the full test case block.

LIMITATIONS (V1.0.0):
Version 1.0.0 supports inputs where every test case occupies a fixed number of physical lines. Variable-line testcase structures are not currently supported in V1.
```

---

## 4. Single-Purpose Description (For Chrome Web Store Reviewers)
`CF Testcase Highlighter helps Codeforces users visually identify individual test cases within submission test input by grouping a user-defined number of input lines.`

---

## 5. Permission Justifications

### `storage`
`Used strictly to persist user preferences (such as 'First line is t' checkbox and 'Lines per test' number) locally in the browser across sessions.`

### Host Permissions (`https://codeforces.com/*`, `https://www.codeforces.com/*`)
`Required to inject the content script and CSS stylesheet onto Codeforces submission pages to format testcase input blocks.`

---

## 6. Privacy & Data Handling Summary

- **User Data Collected**: None.
- **Data Transmitted**: None. All input line parsing and DOM rendering happen strictly inside the local browser.
- **Analytics / Tracking**: None.
- **Local Preference Storage**: Preference options (`hasT`, `linesPerTest`) are saved locally via `chrome.storage.local`.

---

## 7. Suggested Category
`Developer Tools` (Secondary: `Productivity`)

---

## 8. Suggested Screenshots Checklist

Prepare 3 screenshots (1280x800 or 640x400 PNG/JPEG):

- **Screenshot 1**: A Codeforces submission input block showing the **CF Testcase Highlighter** control panel injected cleanly above the Input section.
- **Screenshot 2**: Mouse hovering over Test #4 showing the 3 lines highlighted in light blue with the `#4` badge on the top-right corner.
- **Screenshot 3**: The control panel with a warning message (e.g., when lines per test mismatch), demonstrating clear error feedback.

---

## 9. Promotional Copy & Taglines

- **Tagline**: *"Stop counting lines. Highlight Codeforces test cases instantly."*
- **One-Liner**: *"Visual testcase grouping and hover highlighting for Codeforces submissions."*
