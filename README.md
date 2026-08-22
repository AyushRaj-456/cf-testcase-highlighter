# CF Testcase Highlighter

Quickly identify and highlight individual test cases in Codeforces submission inputs, outputs, and answers on hover.

---

## Why?

When debugging competitive programming submissions on Codeforces, finding a specific failed test case (e.g. Test #15) inside large continuous `Input`, `Output`, or `Answer` blocks can be tedious and error-prone, requiring manual line counting through hundreds of lines. 

**CF Testcase Highlighter** solves this problem by visually grouping and labeling physical lines belonging to each test case directly inside the Codeforces submission viewer.

---

## Features

- **Visual Test Case Grouping**: Groups physical lines for **Input**, **Output**, and **Answer** blocks.
- **Matched Testcase Numbers**: Test case numbering (`#1`, `#2`, `#3`, etc.) corresponds 1:1 between Input and Output/Answer.
- **Hover Highlighting**: Hovering over any line of a test case highlights the entire test case block in blue.
- **Test Case Badges**: Automatically displays test case number badges (`#1`, `#2`, `#3`, etc.) on the right of each test case block.
- **Copy-Safe**: Test case badges are visual-only elements (`user-select: none`), so copying test case text copies only raw plain text.
- **Configurable Options**:
  - Toggle whether Input line 1 specifies $t$ (number of test cases).
  - Set custom fixed physical lines per input test case (`Lines per test`).
  - Set custom fixed physical lines per output/answer test case (`Lines per answer`).
- **Instant Reset**: Fully restores original raw Codeforces input, output, and answer formatting on demand.
- **Lightweight & Privacy-Focused**: Runs entirely locally in your browser. No external API calls, no backend, and no tracking.

---

## Installation

### Method 1: Download ZIP (Recommended)

1. Download the latest release ZIP from the repository:
   - Click the green **Code** button at the top of this GitHub page and select **Download ZIP** (or download the ZIP from [Releases](https://github.com/AyushRaj-456/cf-testcase-highlighter/releases)).
2. Extract the downloaded `cf-testcase-highlighter.zip` file to a folder on your computer.
3. Open Google Chrome and type **`chrome://extensions/`** in the address bar.
4. Enable **Developer mode** using the toggle switch in the top-right corner.
5. Click **Load unpacked** in the top-left corner.
6. Select the extracted folder containing `manifest.json`.

---

### Method 2: Clone Repository via Git

```bash
git clone https://github.com/AyushRaj-456/cf-testcase-highlighter.git
```

1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select the cloned `cf-testcase-highlighter` folder.

---

## How It Works

1. Open any Codeforces submission page or test details view.
2. The **CF Testcase Highlighter** control panel appears above the submission blocks:
   - **First line is `t`** (Checked by default): Interprets Input line 1 as the number of test cases $t$.
   - **Lines per test** (Default: `3`): Defines how many physical lines belong to one input test case.
   - **Lines per answer** (Default: `1`): Defines how many physical lines belong to one output/answer test case.
3. Click **Highlight** (or press Enter in either input field).
4. Hover your mouse over any line in Input, Output, or Answer to highlight the full test case block with its number badge.
5. Click **Reset** at any time to return all blocks back to raw original Codeforces text.

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

### Output Text:
```
0
0
0
0
0
```

### Settings:
- **First line is t**: `YES`
- **Lines per test**: `3`
- **Lines per answer**: `1`

### Result:
- Input first line (`5`) is identified as $t = 5$.
- Input lines 2–4 are grouped as **Input Test #1**.
- Output line 1 is grouped as **Output Test #1**.
- Input lines 5–7 are grouped as **Input Test #2**.
- Output line 2 is grouped as **Output Test #2**.

---

## Limitations

- **Fixed Lines Per Test / Answer**: Version 1.0.0 assumes every test case in the input/output blocks occupies a fixed number of physical lines. Variable-line testcase structures (e.g., $n$ lines where $n$ changes per testcase) are not supported in V1.

---

## Privacy Policy

CF Testcase Highlighter operates **100% locally** in your browser:
- Page content is read locally solely to perform visual line grouping.
- No input/output data, submission data, or user data is transmitted to any external server.
- No analytics, telemetry, or tracking scripts are included.
- User settings (`hasT`, `linesPerTest`, `linesPerAnswer`) are saved locally using Chrome's `chrome.storage.local` API.

---

## License

Distributed under the MIT License. See [`LICENSE`](file:///c:/Users/Ayush/Desktop/Codes/CF%20Testcase%20Highlighter/LICENSE) for more information.
