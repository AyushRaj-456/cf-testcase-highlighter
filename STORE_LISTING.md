# Chrome Web Store Listing Material

Copy and paste the text below directly into the **Chrome Web Store Developer Dashboard** when submitting the extension.

---

## 1. Extension Name
`CF Testcase Highlighter`

---

## 2. Short Description (Max 132 characters)
`Quickly identify individual test cases in Codeforces submission inputs, outputs, and answers.`

---

## 3. Detailed Description

```
CF Testcase Highlighter makes debugging competitive programming submissions on Codeforces faster and easier.

When viewing test details for a Codeforces submission, Codeforces displays input, output, and answer blocks as continuous text. When a solution fails on a specific test case (e.g., Test #15), manually locating that test case inside hundreds of lines requires tedious line counting.

CF Testcase Highlighter automatically groups physical lines belonging to each test case across Input, Output, and Answer blocks, highlighting the complete test case on hover with matched test case numbers (#1, #2, #3, etc.).

KEY FEATURES:

• Multi-Section Grouping: Groups test cases across Input, Output, and Answer sections.
• Matched Testcase Badges: Displays corresponding test case numbers (#1, #2, #3, etc.) on hover.
• Copy-Safe: Test case badges use visual-only pseudo-elements so copying test data yields raw text without extra labels.
• Customizable Settings: Easily set 'Lines per test' and 'Lines per answer' independently, and toggle whether line 1 specifies 't'.
• Instant Reset: One-click Reset restores original raw Codeforces formatting immediately.
• 100% Local & Privacy-Focused: Operates entirely locally in your browser. No backend, no remote code, and no tracking.

HOW TO USE:

1. Open any Codeforces submission page or test details view.
2. Configure settings in the control panel inserted above the submission section:
   - Check 'First line is t' if line 1 specifies the test count.
   - Enter 'Lines per test' (e.g. 3) and 'Lines per answer' (e.g. 1).
3. Click 'Highlight'.
4. Hover over any line in Input, Output, or Answer to highlight the full test case block.

LIMITATIONS (V1.0.0):
Version 1.0.0 supports inputs/outputs where every test case occupies a fixed number of physical lines. Variable-line testcase structures are not currently supported in V1.
```

---

## 4. Single-Purpose Description (For Chrome Web Store Reviewers)
`CF Testcase Highlighter helps Codeforces users visually identify individual test cases within submission test inputs, outputs, and answers by grouping a user-defined number of lines.`

---

## 5. Permission Justifications

### `storage`
`Used strictly to persist user preferences (such as 'First line is t' checkbox, 'Lines per test', and 'Lines per answer' numbers) locally in the browser across sessions.`

### Host Permissions (`https://codeforces.com/*`, `https://www.codeforces.com/*`)
`Required to inject the content script and CSS stylesheet onto Codeforces submission pages to format testcase input, output, and answer blocks.`

---

## 6. Privacy & Data Handling Summary

- **User Data Collected**: None.
- **Data Transmitted**: None. All input line parsing and DOM rendering happen strictly inside the local browser.
- **Analytics / Tracking**: None.
- **Local Preference Storage**: Preference options (`hasT`, `linesPerTest`, `linesPerAnswer`) are saved locally via `chrome.storage.local`.

---

## 7. Suggested Category
`Developer Tools` (Secondary: `Productivity`)

---

## 8. Suggested Screenshots Checklist

Prepare 3 screenshots (1280x800 or 640x400 PNG/JPEG):

- **Screenshot 1**: A Codeforces submission input/output block showing the **CF Testcase Highlighter** control panel injected cleanly above the sections.
- **Screenshot 2**: Mouse hovering over Test #4 showing lines highlighted in light blue with the `#4` badge on the top-right corner.
- **Screenshot 3**: The control panel with a warning message (e.g., when lines per test mismatch), demonstrating clear error feedback.

---

## 9. Promotional Copy & Taglines

- **Tagline**: *"Stop counting lines. Highlight Codeforces test cases instantly."*
- **One-Liner**: *"Visual testcase grouping and hover highlighting for Codeforces submission inputs, outputs, and answers."*
