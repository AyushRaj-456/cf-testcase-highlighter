# CF Testcase Highlighter

Quickly identify and highlight individual test cases in Codeforces submission inputs on hover.

---

## Why?

When debugging competitive programming submissions on Codeforces, finding a specific failed test case (e.g. Test #15) inside one large continuous `Input` block can be tedious and error-prone, requiring manual line counting through hundreds of lines. 

**CF Testcase Highlighter** solves this problem by visually grouping and labeling input lines belonging to each test case directly inside the Codeforces submission viewer.

---

## Features

- **Visual Test Case Grouping**: Groups physical input lines belonging to each test case.
- **Hover Highlighting**: Hovering over any line of a test case highlights the entire test case block in blue.
- **Test Case Badges**: Automatically displays test case numbers (`#1`, `#2`, `#3`, etc.) right beside each test case.
- **Copy-Safe**: Test case badges are visual-only elements (`user-select: none`), so copying test case input copies only the raw input text.
- **Configurable Options**:
  - Toggle whether line 1 specifies $t$ (number of test cases).
  - Set custom fixed physical lines per test case.
- **Instant Reset**: Fully restores original Codeforces input formatting on demand.
- **Lightweight & Privacy-Focused**: Runs entirely locally in your browser. No external API calls, no backend, and no tracking.

---

## How It Works

1. Open any Codeforces submission test details view.
2. The **CF Testcase Highlighter** control panel appears right above the **Input** block:
   - **First line is `t`** (Checked by default): Interprets line 1 as the number of test cases $t$.
   - **Lines per test** (Default: `3`): Defines how many physical lines belong to one test case.
3. Click **Highlight**.
4. Hover your mouse over any line to highlight the full test case block with its number badge.
5. Click **Reset** at any time to return the input block back to its raw original text.

---

## Example

### Input Text:
```
5
1
0
0
2
1 0
0 1
3
1 1 1
0 0 0
4
1 0 1 0
0 1 0 1
5
1 0 1 0 1
1 1 1 1 1
```

### Settings:
- **First line is t**: `YES`
- **Lines per test**: `3`

### Result:
- First line (`5`) is identified as $t = 5$.
- Lines 2–4 are grouped as **Test #1**.
- Lines 5–7 are grouped as **Test #2**.
- Lines 8–10 are grouped as **Test #3**.
- Lines 11–13 are grouped as **Test #4**.
- Lines 14–16 are grouped as **Test #5**.

---

## Installation

### Chrome Web Store
> **Chrome Web Store link**: *Coming soon*

### Manual Installation (Developer Mode)

1. Download or clone this repository to your computer.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the `CF Testcase Highlighter` project folder.

---

## Limitations

- **Fixed Lines Per Test**: Version 1.0.0 assumes every test case in the input block occupies the exact same fixed number of physical lines. Variable-line testcase structures (e.g., $n$ lines where $n$ changes per testcase) are not supported in V1.

---

## Privacy Policy Summary

CF Testcase Highlighter operates **100% locally** in your browser:
- Page content is read locally solely to perform visual line grouping.
- No input data, submission data, or user data is transmitted to any external server.
- No analytics, telemetry, or tracking scripts are included.
- User settings (e.g. `Lines per test` preferences) are saved locally using Chrome's `chrome.storage.local` API.

---

## License

*Note for repository owner: Please choose an open source license (such as MIT, Apache 2.0, or GPL-3.0) when publishing this repository to GitHub.*
