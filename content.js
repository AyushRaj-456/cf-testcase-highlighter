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
    linesPerTest: 3,
    linesPerAnswer: 1
  };

  let userSettings = { ...DEFAULT_SETTINGS };

  // Load saved settings from chrome.storage if available
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['cf_th_hasT', 'cf_th_linesPerTest', 'cf_th_linesPerAnswer'], (data) => {
        if (data.cf_th_hasT !== undefined) userSettings.hasT = Boolean(data.cf_th_hasT);
        if (data.cf_th_linesPerTest !== undefined) {
          const parsed = parseInt(data.cf_th_linesPerTest, 10);
          if (!isNaN(parsed) && parsed >= 1) userSettings.linesPerTest = parsed;
        }
        if (data.cf_th_linesPerAnswer !== undefined) {
          const parsedAns = parseInt(data.cf_th_linesPerAnswer, 10);
          if (!isNaN(parsedAns) && parsedAns >= 1) userSettings.linesPerAnswer = parsedAns;
        }
      });
    }
  } catch (e) {
    // Fallback to defaults
  }

  function saveSettings(hasT, linesPerTest, linesPerAnswer) {
    userSettings.hasT = hasT;
    userSettings.linesPerTest = linesPerTest;
    userSettings.linesPerAnswer = linesPerAnswer;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          cf_th_hasT: hasT,
          cf_th_linesPerTest: linesPerTest,
          cf_th_linesPerAnswer: linesPerAnswer
        });
      }
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Extract physical lines cleanly from a PRE element without destroying line structure.
   * Handles plain text (\n), <div> line wrappers (.test-example-line), and <br> tags.
   */
  function extractPhysicalLinesFromPre(pre) {
    if (!pre) return [];

    // Save pristine original HTML for 100% exact Reset
    if (!pre.hasAttribute('data-cf-th-original-html')) {
      pre.setAttribute('data-cf-th-original-html', pre.innerHTML);
    }

    // 1. Check if PRE contains <div> elements (e.g. .test-example-line in Codeforces Example blocks)
    const divLines = pre.querySelectorAll(':scope > div, :scope > .test-example-line');
    if (divLines.length > 0) {
      const lines = [];
      divLines.forEach(div => {
        lines.push(div.textContent || '');
      });
      return lines;
    }

    // 2. Check if PRE contains <br> tags
    const brTags = pre.querySelectorAll('br');
    if (brTags.length > 0) {
      const lines = [];
      let currentLineText = '';
      pre.childNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
          lines.push(currentLineText);
          currentLineText = '';
        } else {
          currentLineText += node.textContent || '';
        }
      });
      if (currentLineText.length > 0 || lines.length === 0) {
        lines.push(currentLineText);
      }
      return lines;
    }

    // 3. Fallback: Plain text in PRE. Use innerText or textContent normalized by \n
    let rawText = '';
    if (pre.innerText && pre.innerText.includes('\n')) {
      rawText = pre.innerText;
    } else {
      rawText = pre.textContent || pre.innerText || '';
    }

    const cleanText = rawText.replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '');
    const normalized = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return normalized.split('\n');
  }

  /**
   * Pure parsing function for CF Testcase Highlighter Input (accepts array of lines or string)
   */
  function parseTestCasesFromLines(lines, hasT, linesPerTest) {
    const result = {
      t: null,
      tLine: null,
      tests: [],
      remainder: [],
      errors: [],
      warnings: []
    };

    if (!Array.isArray(lines) || lines.length === 0) {
      result.errors.push("Input contains no text lines.");
      return result;
    }

    const parsedLPT = parseInt(linesPerTest, 10);
    if (isNaN(parsedLPT) || parsedLPT < 1) {
      result.errors.push("Lines per test must be a positive integer (minimum 1).");
      return result;
    }

    const cleanLines = lines.map(line => line.replace(/[\uFEFF\u200B-\u200D\u00A0]/g, ''));

    // Remove single trailing empty line caused by terminal newline
    if (cleanLines.length > 0 && cleanLines[cleanLines.length - 1] === '') {
      cleanLines.pop();
    }

    if (cleanLines.length === 0) {
      result.errors.push("Input contains no text lines.");
      return result;
    }

    let dataLines = cleanLines;

    if (hasT) {
      result.tLine = cleanLines[0];
      const rawTStr = cleanLines[0].trim();
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
      dataLines = cleanLines.slice(1);
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

  function parseTestCases(rawInput, hasT, linesPerTest) {
    if (Array.isArray(rawInput)) return parseTestCasesFromLines(rawInput, hasT, linesPerTest);
    if (!rawInput || typeof rawInput !== 'string') return { tests: [], remainder: [], errors: ["Input is empty or invalid."], warnings: [] };
    const cleanInput = rawInput.replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '');
    const normalized = cleanInput.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return parseTestCasesFromLines(normalized.split('\n'), hasT, linesPerTest);
  }

  /**
   * Pure parsing function for Codeforces Output and Answer sections (accepts array of lines or string)
   */
  function parseAnswerTestCasesFromLines(lines, linesPerAnswer) {
    const result = {
      tests: [],
      remainder: [],
      errors: [],
      warnings: []
    };

    if (!Array.isArray(lines) || lines.length === 0) {
      result.errors.push("Content contains no text lines.");
      return result;
    }

    const parsedLPA = parseInt(linesPerAnswer, 10);
    if (isNaN(parsedLPA) || parsedLPA < 1) {
      result.errors.push("Lines per answer must be a positive integer (minimum 1).");
      return result;
    }

    const cleanLines = lines.map(line => line.replace(/[\uFEFF\u200B-\u200D\u00A0]/g, ''));

    if (cleanLines.length > 0 && cleanLines[cleanLines.length - 1] === '') {
      cleanLines.pop();
    }

    if (cleanLines.length === 0) {
      result.errors.push("Content contains no text lines.");
      return result;
    }

    const totalLines = cleanLines.length;

    for (let i = 0; i < totalLines; i += parsedLPA) {
      if (i + parsedLPA <= totalLines) {
        const testChunk = cleanLines.slice(i, i + parsedLPA);
        result.tests.push({
          number: result.tests.length + 1,
          lines: testChunk
        });
      } else {
        result.remainder = cleanLines.slice(i);
        result.warnings.push(
          `${result.remainder.length} line(s) remain and do not form a complete testcase (requires ${parsedLPA} line(s) per answer).`
        );
      }
    }

    return result;
  }

  function parseAnswerTestCases(rawOutput, linesPerAnswer) {
    if (Array.isArray(rawOutput)) return parseAnswerTestCasesFromLines(rawOutput, linesPerAnswer);
    if (!rawOutput || typeof rawOutput !== 'string') return { tests: [], remainder: [], errors: ["Content is empty or invalid."], warnings: [] };
    const cleanOutput = rawOutput.replace(/[\uFEFF\u200B-\u200D\u00A0]/g, '');
    const normalized = cleanOutput.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return parseAnswerTestCasesFromLines(normalized.split('\n'), linesPerAnswer);
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

    // 2. Check parent element class names (e.g. <div class="input"><pre>...</pre></div>)
    const parent = pre.parentElement;
    if (parent) {
      if (parent.classList.contains('input') || parent.classList.contains('input-file')) return 'input';
      if (parent.classList.contains('output') || parent.classList.contains('output-file')) return 'output';
      if (parent.classList.contains('answer') || parent.classList.contains('answer-file')) return 'answer';
      if (parent.classList.contains('checker')) return 'checker log';
    }

    // 3. Check previous siblings (e.g. <div>Input</div>, <b>Input</b>, <span class="name">Input</span>, <div class="title">Input</div>)
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

    // 4. Check parent container's headings / labels / titles (only if parent wraps single PRE)
    if (parent) {
      const preCountInParent = parent.querySelectorAll('pre').length;
      if (preCountInParent === 1) {
        const titleEl = parent.querySelector('.title, .name, .header, .caption, b, strong, h4, h5, div');
        if (titleEl && titleEl !== pre) {
          const text = titleEl.textContent.trim().toLowerCase();
          if (text === 'input' || text.startsWith('input')) return 'input';
          if (text === 'output' || text.startsWith('output')) return 'output';
          if (text === 'answer' || text.startsWith('answer')) return 'answer';
          if (text.includes('checker log')) return 'checker log';
        }
      }
    }

    // 5. Check PRE's own class names
    if (pre.classList.contains('input')) return 'input';
    if (pre.classList.contains('output')) return 'output';
    if (pre.classList.contains('answer')) return 'answer';
    if (pre.classList.contains('checker')) return 'checker log';

    return '';
  }

  function isCodeforcesInputPre(pre) {
    if (!pre || pre.tagName !== 'PRE') return false;
    if (pre.classList.contains('prettyprint') || pre.closest('.program-source') || pre.closest('.source-code')) return false;
    if (getPreSectionTitle(pre) !== 'input') return false;
    const txt = (pre.textContent || pre.innerText || '').trim();
    if (txt === '' || txt === '?' || txt === '...') return false;
    return true;
  }

  function isCodeforcesOutputPre(pre) {
    if (!pre || pre.tagName !== 'PRE') return false;
    if (pre.classList.contains('prettyprint') || pre.closest('.program-source') || pre.closest('.source-code')) return false;
    if (getPreSectionTitle(pre) !== 'output') return false;
    const txt = (pre.textContent || pre.innerText || '').trim();
    if (txt === '' || txt === '?' || txt === '...') return false;
    return true;
  }

  function isCodeforcesAnswerPre(pre) {
    if (!pre || pre.tagName !== 'PRE') return false;
    if (pre.classList.contains('prettyprint') || pre.closest('.program-source') || pre.closest('.source-code')) return false;
    if (getPreSectionTitle(pre) !== 'answer') return false;
    const txt = (pre.textContent || pre.innerText || '').trim();
    if (txt === '' || txt === '?' || txt === '...') return false;
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
   * Render Parsed Elements cleanly into target PRE block.
   * Note: No trailing \n is appended to test.lines.join('\n') because testSpan has display: block,
   * avoiding extra blank line breaks inside <pre> blocks.
   */
  function renderTestCasesInPre(pre, parseResult, failedTestNum) {
    pre.textContent = ''; // Clear current content

    if (parseResult.tLine !== undefined && parseResult.tLine !== null) {
      const tSpan = document.createElement('span');
      tSpan.className = 'cf-th-t-line';
      tSpan.textContent = parseResult.tLine; // No trailing \n
      pre.appendChild(tSpan);
    }

    parseResult.tests.forEach((test) => {
      const testSpan = document.createElement('span');
      testSpan.className = 'cf-th-testcase';
      testSpan.setAttribute('data-test-number', test.number);
      testSpan.setAttribute('data-test-label', `#${test.number}`);

      testSpan.style.display = 'block';
      testSpan.style.position = 'relative';
      testSpan.style.borderLeft = '4px solid transparent';
      testSpan.style.paddingLeft = '6px';
      testSpan.style.paddingRight = '60px';
      testSpan.style.margin = '0';
      testSpan.style.borderRadius = '3px';
      testSpan.style.transition = 'background-color 0.15s ease, border-left-color 0.15s ease';
      testSpan.style.cursor = 'pointer';

      const isFailed = failedTestNum !== null && test.number === failedTestNum;
      if (isFailed) {
        testSpan.classList.add('cf-th-failed');
        testSpan.style.backgroundColor = '#ffe3e3';
        testSpan.style.borderLeft = '4px solid #dc3545';
      }

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

      // No trailing \n because testSpan is display: block
      const linesText = document.createTextNode(test.lines.join('\n'));
      testSpan.appendChild(linesText);

      pre.appendChild(testSpan);
    });

    if (parseResult.remainder && parseResult.remainder.length > 0) {
      const remainderSpan = document.createElement('span');
      remainderSpan.className = 'cf-th-remainder';
      remainderSpan.style.opacity = '0.7';
      remainderSpan.style.fontStyle = 'italic';
      remainderSpan.textContent = parseResult.remainder.join('\n'); // No trailing \n
      pre.appendChild(remainderSpan);
    }
  }

  /**
   * Helper to get container for grouping PRE blocks
   */
  function getTestDetailsContainer(pre) {
    const parentFile = pre.closest('.file');
    if (parentFile && parentFile.parentElement) {
      return parentFile.parentElement;
    }
    return pre.closest('.sample-test, .popup, .test-details, .roundbox, table, body') || document.body;
  }

  /**
   * Inject extension controls and attach handlers for a submission test case group
   */
  function setupTestcaseHighlighterGroup(groupContext, inputPre, outputPre, answerPre) {
    let container = groupContext.querySelector(':scope > .cf-th-container, .cf-th-container');
    let checkbox, numInput, numAnswerInput, highlightBtn, resetBtn, statusMsg;

    if (!container) {
      container = document.createElement('div');
      container.className = 'cf-th-container';

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
      checkbox = document.createElement('input');
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
      numInput = document.createElement('input');
      numInput.type = 'number';
      numInput.className = 'cf-th-input';
      numInput.value = userSettings.linesPerTest;
      numInput.min = '1';
      inputField.appendChild(inputLabelText);
      inputField.appendChild(numInput);
      controls.appendChild(inputField);

      // Number Field: Lines per answer
      const answerField = document.createElement('label');
      answerField.className = 'cf-th-field';
      const answerLabelText = document.createElement('span');
      answerLabelText.className = 'cf-th-label-text';
      answerLabelText.textContent = 'Lines per answer';
      numAnswerInput = document.createElement('input');
      numAnswerInput.type = 'number';
      numAnswerInput.className = 'cf-th-input';
      numAnswerInput.value = userSettings.linesPerAnswer;
      numAnswerInput.min = '1';
      answerField.appendChild(answerLabelText);
      answerField.appendChild(numAnswerInput);
      controls.appendChild(answerField);

      // Buttons
      const btnGroup = document.createElement('div');
      btnGroup.className = 'cf-th-btn-group';

      highlightBtn = document.createElement('button');
      highlightBtn.type = 'button';
      highlightBtn.className = 'cf-th-btn cf-th-btn-primary';
      highlightBtn.textContent = 'Highlight';

      resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'cf-th-btn cf-th-btn-secondary';
      resetBtn.textContent = 'Reset';

      btnGroup.appendChild(highlightBtn);
      btnGroup.appendChild(resetBtn);
      controls.appendChild(btnGroup);

      // Status / Message Bar
      statusMsg = document.createElement('div');
      statusMsg.className = 'cf-th-status';

      container.appendChild(controls);
      container.appendChild(statusMsg);

      const firstPre = inputPre || outputPre || answerPre;
      if (firstPre && firstPre.parentNode) {
        firstPre.parentNode.insertBefore(container, firstPre);
      }
    } else {
      checkbox = container.querySelector('.cf-th-checkbox');
      const numInputs = container.querySelectorAll('.cf-th-input');
      numInput = numInputs[0];
      numAnswerInput = numInputs[1];
      highlightBtn = container.querySelector('.cf-th-btn-primary');
      resetBtn = container.querySelector('.cf-th-btn-secondary');
      statusMsg = container.querySelector('.cf-th-status');
    }

    if (inputPre) inputPre.setAttribute('data-cf-th-initialized', 'true');
    if (outputPre) outputPre.setAttribute('data-cf-th-initialized', 'true');
    if (answerPre) answerPre.setAttribute('data-cf-th-initialized', 'true');

    function performReset() {
      [inputPre, outputPre, answerPre].forEach(pre => {
        if (pre) {
          const origHtml = pre.getAttribute('data-cf-th-original-html');
          if (origHtml !== null) {
            pre.innerHTML = origHtml;
          }
        }
      });
      statusMsg.textContent = '';
      statusMsg.className = 'cf-th-status';
    }

    function performHighlight() {
      const hasT = checkbox ? checkbox.checked : userSettings.hasT;
      const linesPerTestVal = numInput ? parseInt(numInput.value, 10) : userSettings.linesPerTest;
      const linesPerAnsVal = numAnswerInput ? parseInt(numAnswerInput.value, 10) : userSettings.linesPerAnswer;

      const parsedLPT = isNaN(linesPerTestVal) ? 3 : linesPerTestVal;
      const parsedLPA = isNaN(linesPerAnsVal) ? 1 : linesPerAnsVal;

      saveSettings(hasT, parsedLPT, parsedLPA);

      let errors = [];
      let warnings = [];
      let successes = [];
      const failedTestNum = detectFailedTestNumber(container);

      // Process Input
      if (inputPre) {
        const inputLines = extractPhysicalLinesFromPre(inputPre);
        if (inputLines.length === 0) {
          warnings.push("Input content is empty or loading.");
        } else {
          const parseResult = parseTestCasesFromLines(inputLines, hasT, parsedLPT);
          if (parseResult.errors.length > 0) {
            errors.push(`Input Error: ${parseResult.errors.join(' ')}`);
          } else {
            renderTestCasesInPre(inputPre, parseResult, failedTestNum);
            successes.push(`Input (${parseResult.tests.length} test cases)`);
            if (parseResult.warnings.length > 0) {
              warnings.push(`Input: ${parseResult.warnings.join(' ')}`);
            }
          }
        }
      }

      // Process Output
      if (outputPre) {
        const outputLines = extractPhysicalLinesFromPre(outputPre);
        if (outputLines.length === 0) {
          warnings.push("Output content is empty or loading.");
        } else {
          const parseResult = parseAnswerTestCasesFromLines(outputLines, parsedLPA);
          if (parseResult.errors.length > 0) {
            errors.push(`Output Error: ${parseResult.errors.join(' ')}`);
          } else {
            renderTestCasesInPre(outputPre, parseResult, failedTestNum);
            successes.push(`Output (${parseResult.tests.length} test cases)`);
            if (parseResult.warnings.length > 0) {
              warnings.push(`Output: ${parseResult.warnings.join(' ')}`);
            }
          }
        }
      }

      // Process Answer
      if (answerPre) {
        const answerLines = extractPhysicalLinesFromPre(answerPre);
        if (answerLines.length === 0) {
          warnings.push("Answer content is empty or loading.");
        } else {
          const parseResult = parseAnswerTestCasesFromLines(answerLines, parsedLPA);
          if (parseResult.errors.length > 0) {
            errors.push(`Answer Error: ${parseResult.errors.join(' ')}`);
          } else {
            renderTestCasesInPre(answerPre, parseResult, failedTestNum);
            successes.push(`Answer (${parseResult.tests.length} test cases)`);
            if (parseResult.warnings.length > 0) {
              warnings.push(`Answer: ${parseResult.warnings.join(' ')}`);
            }
          }
        }
      }

      if (errors.length > 0) {
        statusMsg.textContent = errors.join(' | ');
        statusMsg.className = 'cf-th-status cf-th-visible cf-th-error';
      } else if (warnings.length > 0) {
        const succStr = successes.length > 0 ? `Highlighted ${successes.join(', ')}. ` : '';
        statusMsg.textContent = `${succStr}${warnings.join(' ')}`;
        statusMsg.className = 'cf-th-status cf-th-visible cf-th-warning';
      } else if (successes.length > 0) {
        statusMsg.textContent = `Successfully highlighted ${successes.join(', ')}!`;
        statusMsg.className = 'cf-th-status cf-th-visible cf-th-info';
      }
    }

    if (highlightBtn) highlightBtn.onclick = performHighlight;
    if (resetBtn) resetBtn.onclick = performReset;

    if (numInput) {
      numInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performHighlight();
        }
      };
    }

    if (numAnswerInput) {
      numAnswerInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performHighlight();
        }
      };
    }

    // Auto-highlight on setup
    performHighlight();
  }

  /**
   * Scan DOM for Codeforces submission & sample PRE elements
   */
  function scanAndInitialize() {
    const preElements = document.querySelectorAll('pre');
    if (preElements.length === 0) return;

    const containerMap = new Map();

    preElements.forEach((pre) => {
      let type = null;
      if (isCodeforcesInputPre(pre)) type = 'input';
      else if (isCodeforcesOutputPre(pre)) type = 'output';
      else if (isCodeforcesAnswerPre(pre)) type = 'answer';

      if (type) {
        const container = getTestDetailsContainer(pre);
        if (!containerMap.has(container)) {
          containerMap.set(container, { input: null, output: null, answer: null });
        }
        const group = containerMap.get(container);
        if (!group[type]) {
          group[type] = pre;
        }
      }
    });

    containerMap.forEach((group, container) => {
      const { input, output, answer } = group;
      const needsInit = (input && !input.hasAttribute('data-cf-th-initialized')) ||
                        (output && !output.hasAttribute('data-cf-th-initialized')) ||
                        (answer && !answer.hasAttribute('data-cf-th-initialized'));

      if (needsInit) {
        setupTestcaseHighlighterGroup(container, input, output, answer);
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
