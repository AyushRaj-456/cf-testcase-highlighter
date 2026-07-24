/**
 * CF Testcase Highlighter - Content Script
 * Manifest V3 compatible, Vanilla JS
 */

(function () {
  'use strict';

  if (window.__cfTestcaseHighlighterInjected) return;
  window.__cfTestcaseHighlighterInjected = true;

  // Default Settings
  const DEFAULT_SETTINGS = {
    hasT: true,
    linesPerTest: 3
  };

  let userSettings = { ...DEFAULT_SETTINGS };

  // Load saved settings from chrome.storage if available
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['cf_th_hasT', 'cf_th_linesPerTest'], (data) => {
        if (data.cf_th_hasT !== undefined) userSettings.hasT = Boolean(data.cf_th_hasT);
        if (data.cf_th_linesPerTest !== undefined) {
          const parsed = parseInt(data.cf_th_linesPerTest, 10);
          if (!isNaN(parsed) && parsed >= 1) userSettings.linesPerTest = parsed;
        }
      });
    }
  } catch (e) {
    // Fallback to defaults
  }

  function saveSettings(hasT, linesPerTest) {
    userSettings.hasT = hasT;
    userSettings.linesPerTest = linesPerTest;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          cf_th_hasT: hasT,
          cf_th_linesPerTest: linesPerTest
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Pure parsing function for CF Testcase Highlighter
   */
  function parseTestCases(rawInput, hasT, linesPerTest) {
    const result = {
      t: null,
      tLine: null,
      tests: [],
      remainder: [],
      errors: [],
      warnings: []
    };

    if (!rawInput || typeof rawInput !== 'string') {
      result.errors.push("Input is empty or invalid.");
      return result;
    }

    const parsedLPT = parseInt(linesPerTest, 10);
    if (isNaN(parsedLPT) || parsedLPT < 1) {
      result.errors.push("Lines per test must be a positive integer (minimum 1).");
      return result;
    }

    // Strip UTF-8 BOM (\uFEFF), non-breaking spaces (\u00A0), and zero-width characters (\u200B-\u200D)
    const cleanInput = rawInput.replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '');

    // Normalize newlines (CRLF / CR -> LF)
    const normalized = cleanInput.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');

    // Remove single trailing empty element caused by terminal newline
    if (lines.length > 0 && lines[lines.length - 1] === '') {
      lines.pop();
    }

    if (lines.length === 0) {
      result.errors.push("Input contains no text lines.");
      return result;
    }

    let dataLines = lines;

    if (hasT) {
      result.tLine = lines[0];
      const rawTStr = lines[0].trim();
      const cleanTStr = rawTStr.replace(/[^\d-]/g, '');

      if (!cleanTStr || !/^-?\d+$/.test(cleanTStr)) {
        result.errors.push(`Invalid test case count 't' on line 1: "${rawTStr}". Expected an integer.`);
        return result;
      }

      const parsedT = parseInt(cleanTStr, 10);
      if (parsedT <= 0) {
        result.errors.push(`Invalid test case count t = ${parsedT}. Expected t > 0.`);
        return result;
      }

      result.t = parsedT;
      dataLines = lines.slice(1);
    }

    const totalDataLines = dataLines.length;

    for (let i = 0; i < totalDataLines; i += parsedLPT) {
      if (i + parsedLPT <= totalDataLines) {
        const testChunk = dataLines.slice(i, i + parsedLPT);
        result.tests.push({
          number: result.tests.length + 1,
          lines: testChunk
        });
      } else {
        result.remainder = dataLines.slice(i);
        result.warnings.push(
          `${result.remainder.length} line(s) remain and do not form a complete testcase (requires ${parsedLPT} lines).`
        );
      }
    }

    if (hasT && result.t !== null) {
      if (result.tests.length !== result.t) {
        result.warnings.push(
          `Expected ${result.t} test cases from first line, but found ${result.tests.length} complete group(s) of ${parsedLPT} lines.`
        );
      }
    }

    return result;
  }

  /**
   * Determine section title ('input', 'output', 'answer', 'checker log') for a PRE element
   */
  function getPreSectionTitle(pre) {
    if (!pre || pre.tagName !== 'PRE') return '';

    // 1. Check direct file container
    const parentFile = pre.closest('.file');
    if (parentFile) {
      if (parentFile.classList.contains('input-file')) return 'input';
      if (parentFile.classList.contains('output-file')) return 'output';
      if (parentFile.classList.contains('answer-file')) return 'answer';
      if (parentFile.classList.contains('checker-file')) return 'checker log';
      const nameEl = parentFile.querySelector('.name');
      if (nameEl) return nameEl.textContent.trim().toLowerCase();
    }

    // 2. Check previous siblings (e.g. <div>Input</div>, <b>Input</b>, <span class="name">Input</span>)
    let prev = pre.previousElementSibling;
    let lookbackCount = 0;
    while (prev && lookbackCount < 5) {
      const text = prev.textContent.trim().toLowerCase();
      if (text === 'input' || text.startsWith('input')) return 'input';
      if (text === 'output' || text.startsWith('output')) return 'output';
      if (text === 'answer' || text.startsWith('answer')) return 'answer';
      if (text.includes('checker log')) return 'checker log';
      if (prev.tagName === 'PRE') break;
      prev = prev.previousElementSibling;
      lookbackCount++;
    }

    // 3. Check parent container's headings / labels / titles
    const parent = pre.parentElement;
    if (parent) {
      const titleEl = parent.querySelector('.title, .name, .header, .caption, b, strong, h4, h5, div');
      if (titleEl && titleEl !== pre) {
        const text = titleEl.textContent.trim().toLowerCase();
        if (text === 'input' || text.startsWith('input')) return 'input';
        if (text === 'output' || text.startsWith('output')) return 'output';
        if (text === 'answer' || text.startsWith('answer')) return 'answer';
        if (text.includes('checker log')) return 'checker log';
      }
    }

    // 4. Check PRE's own class names
    if (pre.classList.contains('input')) return 'input';
    if (pre.classList.contains('output')) return 'output';
    if (pre.classList.contains('answer')) return 'answer';
    if (pre.classList.contains('checker')) return 'checker log';

    return '';
  }

  /**
   * Check if a PRE element belongs strictly to a Codeforces submission Input section
   */
  function isCodeforcesSubmissionInputPre(pre) {
    if (!pre || pre.tagName !== 'PRE') return false;

    // Exclude source code viewers
    if (pre.classList.contains('prettyprint') ||
        pre.closest('.program-source') ||
        pre.closest('.source-code')) {
      return false;
    }

    // Exclude problem statement example tests
    if (pre.closest('.sample-test') || pre.closest('.sample-tests')) {
      return false;
    }

    const sectionTitle = getPreSectionTitle(pre);
    if (sectionTitle !== 'input') return false;

    // Ignore placeholder PRE blocks containing only '?' or '...'
    const txt = (pre.textContent || pre.innerText || '').trim();
    if (txt === '' || txt === '?' || txt === '...') {
      return false;
    }

    return true;
  }

  /**
   * Attempt to detect failed test number from surrounding Codeforces context
   */
  function detectFailedTestNumber(container) {
    try {
      const contextEl = container.closest('.popup, .test-details, .file, .roundbox, table, body') || document.body;
      const text = contextEl.textContent || '';
      const match = text.match(/(?:failed|wrong answer|time limit exceeded|memory limit exceeded|runtime error)\s+on\s+test\s+(\d+)/i);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    } catch (e) {
      // Ignore detection errors
    }
    return null;
  }

  /**
   * Extract raw input text cleanly from target PRE element
   */
  function getRawInput(activePre) {
    if (!activePre) return '';

    let saved = activePre.getAttribute('data-cf-th-original');
    if (saved && saved.trim() !== '?' && saved.trim() !== '...' && saved.trim().length > 0) {
      return saved;
    }

    // If activePre already contains our rendered testcases, extract raw input text
    if (activePre.querySelector('.cf-th-testcase')) {
      let reconstructed = '';
      const tLine = activePre.querySelector('.cf-th-t-line');
      if (tLine) reconstructed += tLine.textContent;

      const testSpans = activePre.querySelectorAll('.cf-th-testcase');
      testSpans.forEach(span => {
        reconstructed += span.textContent;
      });

      const remainder = activePre.querySelector('.cf-th-remainder');
      if (remainder) reconstructed += remainder.textContent;

      if (reconstructed.trim().length > 0) {
        activePre.setAttribute('data-cf-th-original', reconstructed);
        return reconstructed;
      }
    }

    const currentText = activePre.textContent || activePre.innerText || '';
    const trimmed = currentText.trim();
    if (trimmed !== '' && trimmed !== '?' && trimmed !== '...') {
      activePre.setAttribute('data-cf-th-original', currentText);
      return currentText;
    }

    return currentText;
  }

  /**
   * Inject extension controls and attach handlers to a Codeforces Input PRE block
   */
  function setupInputHighlighter(initialPre) {
    if (initialPre.hasAttribute('data-cf-th-initialized')) return;
    initialPre.setAttribute('data-cf-th-initialized', 'true');

    // Create extension UI container
    const container = document.createElement('div');
    container.className = 'cf-th-container';

    // Build controls HTML safely
    const controls = document.createElement('div');
    controls.className = 'cf-th-controls';

    // Title
    const title = document.createElement('div');
    title.className = 'cf-th-title';
    title.textContent = 'CF Testcase Highlighter';
    const badge = document.createElement('span');
    badge.className = 'cf-th-title-badge';
    badge.textContent = 'V1';
    title.appendChild(badge);
    controls.appendChild(title);

    // Checkbox Field: First line is t
    const checkboxField = document.createElement('label');
    checkboxField.className = 'cf-th-field';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'cf-th-checkbox';
    checkbox.checked = userSettings.hasT;
    const checkboxLabelText = document.createElement('span');
    checkboxLabelText.className = 'cf-th-label-text';
    checkboxLabelText.textContent = 'First line is t';
    checkboxField.appendChild(checkbox);
    checkboxField.appendChild(checkboxLabelText);
    controls.appendChild(checkboxField);

    // Number Field: Lines per test
    const inputField = document.createElement('label');
    inputField.className = 'cf-th-field';
    const inputLabelText = document.createElement('span');
    inputLabelText.className = 'cf-th-label-text';
    inputLabelText.textContent = 'Lines per test';
    const numInput = document.createElement('input');
    numInput.type = 'number';
    numInput.className = 'cf-th-input';
    numInput.value = userSettings.linesPerTest;
    numInput.min = '1';
    inputField.appendChild(inputLabelText);
    inputField.appendChild(numInput);
    controls.appendChild(inputField);

    // Buttons
    const btnGroup = document.createElement('div');
    btnGroup.className = 'cf-th-btn-group';

    const highlightBtn = document.createElement('button');
    highlightBtn.type = 'button';
    highlightBtn.className = 'cf-th-btn cf-th-btn-primary';
    highlightBtn.textContent = 'Highlight';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'cf-th-btn cf-th-btn-secondary';
    resetBtn.textContent = 'Reset';

    btnGroup.appendChild(highlightBtn);
    btnGroup.appendChild(resetBtn);
    controls.appendChild(btnGroup);

    // Status / Message Bar
    const statusMsg = document.createElement('div');
    statusMsg.className = 'cf-th-status';

    container.appendChild(controls);
    container.appendChild(statusMsg);

    // Insert container immediately before initialPre element
    if (initialPre.parentNode) {
      initialPre.parentNode.insertBefore(container, initialPre);
    }

    /**
     * Clear and reset PRE block back to original state
     */
    function performReset() {
      const orig = getRawInput(initialPre);
      if (orig && initialPre) {
        initialPre.textContent = orig;
      }
      statusMsg.textContent = '';
      statusMsg.className = 'cf-th-status';
    }

    /**
     * Parse and render highlighted test cases
     */
    function performHighlight() {
      const originalInputText = getRawInput(initialPre);

      if (!originalInputText || originalInputText.trim() === '' || originalInputText.trim() === '?' || originalInputText.trim() === '...') {
        statusMsg.textContent = "Input content is still loading or empty. Please click Highlight again once loaded.";
        statusMsg.className = 'cf-th-status cf-th-visible cf-th-warning';
        return;
      }

      // Reset to original text first before parsing
      initialPre.textContent = originalInputText;

      const hasT = checkbox.checked;
      const linesPerTest = parseInt(numInput.value, 10);

      // Save user settings
      saveSettings(hasT, isNaN(linesPerTest) ? 3 : linesPerTest);

      // Run pure parser
      const parseResult = parseTestCases(originalInputText, hasT, linesPerTest);

      // Handle Errors
      if (parseResult.errors.length > 0) {
        statusMsg.textContent = parseResult.errors.join(' ');
        statusMsg.className = 'cf-th-status cf-th-visible cf-th-error';
        return;
      }

      // Handle Warnings & Success Feedback
      if (parseResult.warnings.length > 0) {
        statusMsg.textContent = `Highlighted ${parseResult.tests.length} test case(s). ${parseResult.warnings.join(' ')}`;
        statusMsg.className = 'cf-th-status cf-th-visible cf-th-warning';
      } else {
        statusMsg.textContent = `Successfully highlighted ${parseResult.tests.length} test case(s)!`;
        statusMsg.className = 'cf-th-status cf-th-visible cf-th-info';
      }

      // Render Parsed Elements safely into initialPre
      initialPre.textContent = ''; // Clear current content

      const failedTestNum = detectFailedTestNumber(container);

      // Render first line 't' if enabled
      if (hasT && parseResult.tLine !== null) {
        const tSpan = document.createElement('span');
        tSpan.className = 'cf-th-t-line';
        tSpan.textContent = parseResult.tLine + '\n';
        initialPre.appendChild(tSpan);
      }

      // Render each test case group
      parseResult.tests.forEach((test) => {
        const testSpan = document.createElement('span');
        testSpan.className = 'cf-th-testcase';
        testSpan.setAttribute('data-test-number', test.number);
        testSpan.setAttribute('data-test-label', `#${test.number}`);

        // Inline base styles for 100% compatibility
        testSpan.style.display = 'block';
        testSpan.style.position = 'relative';
        testSpan.style.borderLeft = '4px solid transparent';
        testSpan.style.paddingLeft = '6px';
        testSpan.style.paddingRight = '60px';
        testSpan.style.margin = '2px 0';
        testSpan.style.borderRadius = '3px';
        testSpan.style.transition = 'background-color 0.15s ease, border-left-color 0.15s ease';
        testSpan.style.cursor = 'pointer';

        const isFailed = failedTestNum !== null && test.number === failedTestNum;
        if (isFailed) {
          testSpan.classList.add('cf-th-failed');
          testSpan.style.backgroundColor = '#ffe3e3';
          testSpan.style.borderLeft = '4px solid #dc3545';
        }

        // JS Hover Event Handlers to guarantee visual highlight on mouse over
        testSpan.addEventListener('mouseenter', () => {
          testSpan.style.backgroundColor = isFailed ? '#ffc9c9' : '#bbe1ff';
          testSpan.style.borderLeft = isFailed ? '4px solid #dc3545' : '4px solid #0056b3';
          testSpan.style.boxShadow = '0 1px 4px rgba(0, 86, 179, 0.25)';
        });

        testSpan.addEventListener('mouseleave', () => {
          if (isFailed) {
            testSpan.style.backgroundColor = '#ffe3e3';
            testSpan.style.borderLeft = '4px solid #dc3545';
            testSpan.style.boxShadow = 'none';
          } else {
            testSpan.style.backgroundColor = 'transparent';
            testSpan.style.borderLeft = '4px solid transparent';
            testSpan.style.boxShadow = 'none';
          }
        });

        // Raw input lines text node (CSS ::before pseudo-element renders #1 badge)
        const linesText = document.createTextNode(test.lines.join('\n') + '\n');
        testSpan.appendChild(linesText);

        initialPre.appendChild(testSpan);
      });

      // Render remaining lines if incomplete block exists
      if (parseResult.remainder.length > 0) {
        const remainderSpan = document.createElement('span');
        remainderSpan.className = 'cf-th-remainder';
        remainderSpan.style.opacity = '0.7';
        remainderSpan.style.fontStyle = 'italic';
        remainderSpan.textContent = parseResult.remainder.join('\n') + '\n';
        initialPre.appendChild(remainderSpan);
      }
    }

    // Event Listeners
    highlightBtn.addEventListener('click', performHighlight);
    resetBtn.addEventListener('click', performReset);

    // Enable Enter key on number input to trigger Highlight
    numInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performHighlight();
      }
    });

    // Auto-highlight on setup
    performHighlight();
  }

  /**
   * Scan DOM for Codeforces Input PRE elements
   */
  function scanAndInitialize() {
    const preElements = document.querySelectorAll('pre');
    preElements.forEach((pre) => {
      if (isCodeforcesSubmissionInputPre(pre)) {
        setupInputHighlighter(pre);
      }
    });
  }

  // Initial Scan
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndInitialize);
  } else {
    scanAndInitialize();
  }

  // Debounced MutationObserver for dynamic Codeforces content (modals/popups)
  let observerTimer = null;
  const observer = new MutationObserver(() => {
    if (observerTimer) clearTimeout(observerTimer);
    observerTimer = setTimeout(() => {
      scanAndInitialize();
    }, 150);
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true
  });
})();
