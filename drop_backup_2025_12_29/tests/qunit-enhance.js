(function(){
  // QUnit enhancement: use QUnit.begin/testDone/log/done to maintain test-level counts
  function $(sel, root=document) { return root.querySelector(sel) }
  function createEl(tag, cls, txt){ const el = document.createElement(tag); if(cls) el.className = cls; if(txt !== undefined) el.textContent = txt; return el }

  if(!window.QUnit) {
    console.warn('QUnit not found - qunit-enhance.js requires QUnit to be loaded');
    return;
  }

  let totalEl, passEl, failEl, errorsPane, toggleBtn, scrollFirstBtn, clearBtn;
  let firstFailEl = null;
  let testsTotal = 0, testsPassed = 0, testsFailed = 0;

  function initUI() {
    totalEl = $('#q-total');
    passEl = $('#q-pass');
    failEl = $('#q-fail');
    errorsPane = $('#qunit-errors');
    toggleBtn = $('#q-toggle-errors');
    scrollFirstBtn = $('#q-scroll-first');
    clearBtn = $('#q-clear');

    if (!totalEl || !passEl || !failEl) {
      console.warn('QUnit enhance UI elements not found');
      return;
    }

    toggleBtn.addEventListener('click', function(){
      if(errorsPane.style.display === 'none' || !errorsPane.style.display) {
        errorsPane.style.display = 'block';
        toggleBtn.textContent = 'Hide failures';
      } else {
        errorsPane.style.display = 'none';
        toggleBtn.textContent = 'Show failures';
      }
    });

    scrollFirstBtn.addEventListener('click', function(){
      if(firstFailEl) firstFailEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    clearBtn.addEventListener('click', function(){
      errorsPane.innerHTML = '';
      firstFailEl = null;
      testsTotal = testsPassed = testsFailed = 0;
      totalEl.textContent = 'Total: 0';
      passEl.textContent = 'Passed: 0';
      failEl.textContent = 'Failed: 0';
    });
  }

  // Register QUnit hooks immediately (before DOM ready)
  QUnit.begin(function(){
    if (errorsPane) {
      errorsPane.innerHTML = '';
    }
    firstFailEl = null;
    testsTotal = testsPassed = testsFailed = 0;
    if (totalEl) totalEl.textContent = 'Total: 0';
    if (passEl) passEl.textContent = 'Passed: 0';
    if (failEl) failEl.textContent = 'Failed: 0';
  });

  QUnit.testDone(function(details){
    // details: { name, module, failed, passed, total, runtime }
    testsTotal += 1;
    if(details.failed === 0) testsPassed += 1;
    else testsFailed += 1;

    if (totalEl) totalEl.textContent = 'Total: ' + testsTotal;
    if (passEl) passEl.textContent = 'Passed: ' + testsPassed;
    if (failEl) failEl.textContent = 'Failed: ' + testsFailed;
  });

  QUnit.log(function(details){
    // details: { result, actual, expected, message, source, module, name }
    if(details.result === false && errorsPane) {
      const item = createEl('div', 'error-item');
      const title = createEl('div', 'error-title', (details.module || 'Module') + ': ' + (details.name || 'Test'));
      const message = createEl('div', 'error-details', details.message || 'Assertion failed');
      const expected = createEl('div', 'error-details', 'Expected: ' + (details.expected === undefined ? 'N/A' : JSON.stringify(details.expected)));
      const actual = createEl('div', 'error-details', 'Actual: ' + (details.actual === undefined ? 'N/A' : JSON.stringify(details.actual)));

      item.appendChild(title);
      item.appendChild(message);
      item.appendChild(expected);
      item.appendChild(actual);

      if(details.source) {
        const src = createEl('div', 'error-details', 'Source: ' + details.source);
        item.appendChild(src);
      }

      errorsPane.appendChild(item);
      if(!firstFailEl) firstFailEl = item;
      errorsPane.style.display = 'block';
      if (toggleBtn) toggleBtn.textContent = 'Hide failures';
    }
  });

  QUnit.done(function(final){
    // final: { total, failed, passed, runtime }
    // Ensure UI shows final counts too
    if (totalEl) totalEl.textContent = 'Total: ' + testsTotal;
    if (passEl) passEl.textContent = 'Passed: ' + testsPassed;
    if (failEl) failEl.textContent = 'Failed: ' + testsFailed;
  });

  // Initialize UI elements when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }
})();
