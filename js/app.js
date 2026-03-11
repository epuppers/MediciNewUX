// ============================================
// RICH TEXT INPUT
// ============================================
(function() {
  // Keyboard shortcuts: Cmd/Ctrl + B, I, U, Shift+7 (ordered list), Shift+8 (bullet list)
  document.addEventListener('keydown', function(e) {
    const el = e.target;
    if (!el.isContentEditable) return;

    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    if (e.key === 'b') {
      e.preventDefault();
      document.execCommand('bold');
    } else if (e.key === 'i') {
      e.preventDefault();
      document.execCommand('italic');
    } else if (e.key === 'u') {
      e.preventDefault();
      document.execCommand('underline');
    } else if (e.shiftKey && e.key === '7') {
      e.preventDefault();
      document.execCommand('insertOrderedList');
    } else if (e.shiftKey && e.key === '8') {
      e.preventDefault();
      document.execCommand('insertUnorderedList');
    }
  });

  // Markdown-as-you-type: convert patterns on input
  document.addEventListener('input', function(e) {
    const el = e.target;
    if (!el.isContentEditable) return;
    convertMarkdown(el);
  });

  function convertMarkdown(el) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return;

    const text = node.textContent;
    const offset = range.startOffset;

    // Bold: **text**
    const boldMatch = text.match(/\*\*(.+?)\*\*/);
    if (boldMatch) {
      applyInlineFormat(node, boldMatch, 'b', el);
      return;
    }

    // Italic: *text* (but not **)
    const italicMatch = text.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
    if (italicMatch) {
      applyInlineFormat(node, italicMatch, 'i', el);
      return;
    }

    // Bullet list: line starting with "- " or "* "
    if (/^[-*] $/.test(text) && node.parentNode === el) {
      node.textContent = '';
      document.execCommand('insertUnorderedList');
      return;
    }

    // Numbered list: line starting with "1. "
    if (/^\d+\. $/.test(text) && node.parentNode === el) {
      node.textContent = '';
      document.execCommand('insertOrderedList');
      return;
    }
  }

  function applyInlineFormat(textNode, match, tag, editor) {
    const before = textNode.textContent.substring(0, match.index);
    const after = textNode.textContent.substring(match.index + match[0].length);
    const inner = match[1];

    const parent = textNode.parentNode;

    // Build replacement nodes
    const frag = document.createDocumentFragment();
    if (before) frag.appendChild(document.createTextNode(before));

    const formatted = document.createElement(tag);
    formatted.textContent = inner;
    frag.appendChild(formatted);

    // Add a space after so cursor has somewhere to go
    const afterNode = document.createTextNode(after || '\u00A0');
    frag.appendChild(afterNode);

    parent.replaceChild(frag, textNode);

    // Place cursor after the formatted text
    const sel = window.getSelection();
    const newRange = document.createRange();
    newRange.setStart(afterNode, after ? 0 : 1);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
})();

// ============================================
// TOAST NOTIFICATIONS (#8)
// ============================================
function showToast(text, duration) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 200);
  }, duration || 2000);
}

// ============================================
// MESSAGE HOVER ACTIONS (#1)
// ============================================
(function() {
  // SVG icons
  const icons = {
    copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5.5" y="1.5" width="8" height="10"/><path d="M2.5 4.5v10h8"/></svg>',
    regen: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.5 8a5.5 5.5 0 0 1 9.5-3.75M13.5 8a5.5 5.5 0 0 1-9.5 3.75"/><path d="M12 1v3.25h-3.25M4 15v-3.25h3.25" fill="currentColor" stroke="none"/></svg>',
    del: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12M5 4V2.5h6V4M4 4v9.5h8V4"/><line x1="6.5" y1="6.5" x2="6.5" y2="11"/><line x1="9.5" y1="6.5" x2="9.5" y2="11"/></svg>'
  };

  document.addEventListener('mouseenter', function(e) {
    const block = e.target.closest('.msg-block');
    if (!block || block.querySelector('.msg-actions')) return;

    const isAI = !!block.querySelector('.ai-block');
    const isUser = !!block.querySelector('.user-card');
    if (!isAI && !isUser) return;

    const bar = document.createElement('div');
    bar.className = 'msg-actions';

    // Copy button — always
    const copyBtn = makeActionBtn(icons.copy, 'Copy', function() {
      const body = block.querySelector('.msg-body');
      if (body) {
        navigator.clipboard.writeText(body.textContent.trim()).then(() => showToast('Copied to clipboard'));
      }
    });
    bar.appendChild(copyBtn);

    // Regenerate — AI only
    if (isAI) {
      const regenBtn = makeActionBtn(icons.regen, 'Regenerate', function() {
        showToast('Regenerating response...');
      });
      bar.appendChild(regenBtn);
    }

    // Delete — always
    const delBtn = makeActionBtn(icons.del, 'Delete', function() {
      block.style.transition = 'opacity 0.2s ease, max-height 0.3s ease';
      block.style.opacity = '0';
      block.style.maxHeight = block.offsetHeight + 'px';
      block.style.overflow = 'hidden';
      setTimeout(() => {
        block.style.maxHeight = '0';
        block.style.marginBottom = '0';
        block.style.padding = '0';
      }, 50);
      setTimeout(() => block.remove(), 350);
      showToast('Message deleted');
    });
    bar.appendChild(delBtn);

    block.appendChild(bar);
  }, true);

  document.addEventListener('mouseleave', function(e) {
    const block = e.target.closest('.msg-block');
    if (!block) return;
    const related = e.relatedTarget;
    if (related && block.contains(related)) return;
    const bar = block.querySelector('.msg-actions');
    if (bar) bar.remove();
  }, true);

  function makeActionBtn(svg, title, onClick) {
    const btn = document.createElement('button');
    btn.className = 'msg-action-btn';
    btn.title = title;
    btn.innerHTML = svg;
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }
})();

// ============================================
// THREAD HOVER ACTIONS (#10)
// ============================================
(function() {
  const shareIcon = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="3" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="12" cy="13" r="2"/><line x1="5.8" y1="7" x2="10.2" y2="4"/><line x1="5.8" y1="9" x2="10.2" y2="12"/></svg>';
  const delIcon = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12M5 4V2.5h6V4M4 4v9.5h8V4"/><line x1="6.5" y1="6.5" x2="6.5" y2="11"/><line x1="9.5" y1="6.5" x2="9.5" y2="11"/></svg>';

  document.addEventListener('mouseenter', function(e) {
    const item = e.target.closest('.thread-item');
    if (!item || item.querySelector('.thread-actions')) return;

    const bar = document.createElement('div');
    bar.className = 'thread-actions';

    // Share
    const shareBtn = document.createElement('button');
    shareBtn.className = 'thread-action-btn';
    shareBtn.title = 'Share';
    shareBtn.innerHTML = shareIcon;
    shareBtn.addEventListener('click', function(ev) {
      ev.stopPropagation();
      showToast('Share link copied');
    });
    bar.appendChild(shareBtn);

    // Delete
    const delBtn = document.createElement('button');
    delBtn.className = 'thread-action-btn';
    delBtn.title = 'Delete';
    delBtn.innerHTML = delIcon;
    delBtn.addEventListener('click', function(ev) {
      ev.stopPropagation();
      item.style.transition = 'opacity 0.2s';
      item.style.opacity = '0';
      setTimeout(() => item.remove(), 200);
      showToast('Thread deleted');
    });
    bar.appendChild(delBtn);

    item.appendChild(bar);
  }, true);

  document.addEventListener('mouseleave', function(e) {
    const item = e.target.closest('.thread-item');
    if (!item) return;
    const related = e.relatedTarget;
    if (related && item.contains(related)) return;
    const bar = item.querySelector('.thread-actions');
    if (bar) bar.remove();
  }, true);
})();

// ============================================
// FEEDBACK BUTTONS (#9)
// ============================================
function giveFeedback(btn, type) {
  const container = btn.closest('.msg-feedback');
  container.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(type === 'up' ? 'Thanks for the feedback' : 'Feedback noted — we\'ll improve');
}

// ============================================
// SEARCH STATES (#5)
// ============================================
let searchTimer = null;
function runGlobalSearchEnhanced(q) {
  const results = document.getElementById('searchResults');
  if (!results) return;

  // Clear previous debounce
  if (searchTimer) clearTimeout(searchTimer);

  // Empty query — close
  if (!q.trim()) {
    results.style.display = 'none';
    return;
  }

  results.style.display = 'block';
  results.innerHTML = '<div class="search-status">Searching...</div>';

  // Debounce 200ms then search
  searchTimer = setTimeout(() => {
    const ql = q.toLowerCase();
    // Search all threads by keyword
    const allThreads = [
      { id: 'fund3', title: 'Fund III — Allocation Drift', keywords: 'fund allocation drift ips mandate rebalance trim large cap equity' },
      { id: 'hilgard', title: 'Hilgard — Fee Analysis', keywords: 'hilgard fee analysis management committed capital offset' },
      { id: 'q4lp', title: 'Q4 LP Distribution Waterfall', keywords: 'q4 lp distribution waterfall carry preferred return' },
      { id: 'k1', title: 'K-1 Document Extraction', keywords: 'k1 k-1 tax document extraction partner allocation ridgeline' },
      { id: 'erabor', title: 'Erabor Partnership Terms', keywords: 'erabor partnership terms gp commit clawback side letter marcus' }
    ];
    const matches = allThreads.filter(t =>
      t.title.toLowerCase().includes(ql) || t.keywords.includes(ql)
    );

    if (matches.length) {
      results.innerHTML = matches.map(m =>
        '<div class="search-result-item" onclick="selectThread(\'' + m.id + '\',null);closeSearch()">' +
        m.title + '</div>'
      ).join('');
    } else {
      results.innerHTML = '<div class="search-no-results">No results for "' + escapeHtml(q) + '"</div>';
    }
  }, 200);
}

function closeSearch() {
  const results = document.getElementById('searchResults');
  if (results) results.style.display = 'none';
}

// ============================================
// DRAG & DROP FILE ZONE (#7)
// ============================================
(function() {
  let dragCounter = 0;
  document.addEventListener('dragenter', function(e) {
    const area = e.target.closest('.input-area');
    if (!area) return;
    e.preventDefault();
    dragCounter++;
    area.classList.add('drop-active');
  });
  document.addEventListener('dragleave', function(e) {
    const area = e.target.closest('.input-area');
    if (!area) return;
    dragCounter--;
    if (dragCounter <= 0) {
      area.classList.remove('drop-active');
      dragCounter = 0;
    }
  });
  document.addEventListener('dragover', function(e) {
    if (e.target.closest('.input-area')) e.preventDefault();
  });
  document.addEventListener('drop', function(e) {
    const area = e.target.closest('.input-area');
    if (!area) return;
    e.preventDefault();
    area.classList.remove('drop-active');
    dragCounter = 0;
    const files = e.dataTransfer.files;
    if (files.length) {
      showToast('Attached: ' + files[0].name);
    }
  });
})();

// ============================================
// INPUT DISABLED DURING GENERATION (#6)
// ============================================
function disableInput(threadId, disable) {
  const thread = document.getElementById('thread-' + threadId);
  if (!thread) return;
  const input = thread.querySelector('.text-input');
  if (!input) return;
  if (disable) {
    input.classList.add('disabled');
    input.setAttribute('contenteditable', 'false');
  } else {
    input.classList.remove('disabled');
    input.setAttribute('contenteditable', 'true');
  }
}

// ============================================
// THEME TOGGLE
// ============================================
(function() {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// ============================================
// MODE SWITCHING
// ============================================
let currentMode = 'chat';

function switchMode(mode, btn) {
  currentMode = mode;
  document.querySelectorAll('.top-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const chatView = document.getElementById('chatView');
  const workflowsView = document.getElementById('workflowsView');
  const brainView = document.getElementById('brainView');
  const chatSidebar = document.getElementById('chatSidebar');
  const workflowSidebar = document.getElementById('workflowSidebar');
  const brainSidebar = document.getElementById('brainSidebar');
  const newBtn = document.getElementById('newBtn');

  // Hide all views
  chatView.classList.remove('active');
  workflowsView.classList.remove('active');
  brainView.classList.remove('active');

  // Hide all sidebars
  chatSidebar.style.display = 'none';
  workflowSidebar.style.display = 'none';
  brainSidebar.style.display = 'none';

  if (mode === 'chat') {
    chatView.classList.add('active');
    chatSidebar.style.display = 'block';
    newBtn.textContent = '+ New Thread';
    newBtn.style.display = '';
  } else if (mode === 'workflows') {
    workflowsView.classList.add('active');
    workflowSidebar.style.display = 'block';
    newBtn.textContent = '+ New Workflow';
    newBtn.style.display = '';
    showWorkflowListing();
  } else if (mode === 'brain') {
    brainView.classList.add('active');
    brainSidebar.style.display = 'block';
    newBtn.style.display = 'none';
  }
}

function switchBrainSection(section, el) {
  // Update sidebar active state
  var brainSidebar = document.getElementById('brainSidebar');
  brainSidebar.querySelectorAll('.thread-item').forEach(function(item) { item.classList.remove('active'); });
  el.classList.add('active');

  // Switch content section
  document.querySelectorAll('.brain-section').forEach(function(s) { s.classList.remove('active'); });
  var target = document.getElementById('brain-' + section);
  if (target) target.classList.add('active');
}

function runGlobalSearch(q) {
  runGlobalSearchEnhanced(q);
}

// ============================================
// THREAD SWITCHING
// ============================================
const threadTitles = {
  fund3: 'Fund III — Allocation Drift',
  hilgard: 'Hilgard — Fee Analysis',
  q4lp: 'Q4 LP Distribution Waterfall',
  k1: 'K-1 Document Extraction',
  erabor: 'Erabor Partnership Terms',
  new: 'New Thread'
};

const threadHasFiles = {
  fund3: false,
  hilgard: true,
  q4lp: false,
  k1: false,
  erabor: false,
  new: false
};

let activeThread = 'fund3';

function selectThread(id, el) {
  activeThread = id;

  // Update sidebar
  document.querySelectorAll('.thread-item').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');

  // Switch thread content
  document.querySelectorAll('.chat-thread').forEach(t => t.classList.remove('active'));
  const thread = document.getElementById('thread-' + id);
  if (thread) {
    thread.classList.add('active');
  }

  // Update header title
  const title = document.getElementById('chatHeaderTitle');
  if (title && threadTitles[id]) title.textContent = threadTitles[id];

  // Update Files button state
  updateFilesButton();

  // Close file panel when switching threads
  closeFilePanel();

  // Trigger Erabor animation when that thread is selected
  if (id === 'erabor') runEraborSequence();
}

function updateFilesButton() {
  const btn = document.getElementById('filesBtn');
  if (!btn) return;
  if (threadHasFiles[activeThread]) {
    btn.classList.remove('disabled');
    btn.disabled = false;
  } else {
    btn.classList.add('disabled');
    btn.disabled = true;
  }
}

// ============================================
// FILE PANEL
// ============================================
function openFilePanel(tab) {
  if (!threadHasFiles[activeThread]) return;
  const panel = document.getElementById('filePanel');
  panel.classList.add('open');
  document.getElementById('filePanelResizeHandle').classList.add('visible');
  switchFilePanelTab(tab || 'viewer');
  if (tab === 'viewer') buildSpreadsheet();
}

function closeFilePanel() {
  const panel = document.getElementById('filePanel');
  panel.classList.remove('open');
  panel.style.width = '';
  document.getElementById('filePanelResizeHandle').classList.remove('visible');
}

// ============================================
// DRAG-RESIZE PANELS
// ============================================
(function() {
  function initResize(handleId, getTarget, getSide) {
    const handle = document.getElementById(handleId);
    if (!handle) return;

    let startX, startW, target;

    handle.addEventListener('mousedown', function(e) {
      e.preventDefault();
      target = getTarget();
      if (!target) return;
      startX = e.clientX;
      startW = target.offsetWidth;
      handle.classList.add('dragging');
      target.classList.add('no-transition');
      target.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function onMove(e) {
        const delta = e.clientX - startX;
        const newW = getSide === 'left'
          ? startW - delta   // right panel: drag left = wider
          : startW + delta;  // sidebar: drag right = wider
        target.style.width = newW + 'px';
      }

      function onUp() {
        handle.classList.remove('dragging');
        target.classList.remove('no-transition');
        target.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // Sidebar: drag right edge to resize
  initResize('sidebarResizeHandle',
    () => document.getElementById('sidebar'),
    'right'
  );

  // File panel: drag left edge to resize
  initResize('filePanelResizeHandle',
    () => document.getElementById('filePanel'),
    'left'
  );
})();

function switchFilePanelTab(tab) {
  document.querySelectorAll('.file-panel-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.file-panel-view').forEach(v => v.classList.remove('active'));

  if (tab === 'viewer') {
    document.getElementById('fpTabViewer').classList.add('active');
    document.getElementById('fpViewer').classList.add('active');
    buildSpreadsheet();
  } else {
    document.getElementById('fpTabFolder').classList.add('active');
    document.getElementById('fpFolder').classList.add('active');
  }
}

// ============================================
// INTERACTIVE SPREADSHEET
// ============================================
const sheetData = [
  { row: 1, cells: ['Period', 'Quarter', 'Committed Cap', 'Fee Rate', 'Gross Fee', 'Offset', 'Net Fee', 'Cumulative'] },
  { row: 2, cells: ['2025', 'Q1', '$86,000,000', '1.75%', '$376,250', '$0', '$376,250', '$376,250'],
    formulas: [null, null, null, null, '=C2*D2/4', null, '=E2-F2', '=G2'] },
  { row: 3, cells: ['2025', 'Q2', '$86,000,000', '1.75%', '$376,250', '$42,000', '$334,250', '$710,500'],
    formulas: [null, null, null, null, '=C3*D3/4', null, '=E3-F3', '=H2+G3'] },
  { row: 4, cells: ['2025', 'Q3', '$86,000,000', '1.75%', '$376,250', '$18,500', '$357,750', '$1,068,250'],
    formulas: [null, null, null, null, '=C4*D4/4', null, '=E4-F4', '=H3+G4'] },
  { row: 5, cells: ['2025', 'Q4', '$86,000,000', '1.75%', '$376,250', '$0', '$376,250', '$1,444,500'],
    formulas: [null, null, null, null, '=C5*D5/4', null, '=E5-F5', '=H4+G5'] },
  { row: 6, cells: ['', '', '', '', '', '', '', ''], formulas: null },
  { row: 7, cells: ['2026', 'Q1', '$86,000,000', '1.25%', '$268,750', '$0', '$268,750', '$1,713,250'],
    formulas: [null, null, null, null, '=C7*D7/4', null, '=E7-F7', '=H5+G7'] },
  { row: 8, cells: ['2026', 'Q2', '$86,000,000', '1.25%', '$268,750', '$0', '$268,750', '$1,982,000'],
    formulas: [null, null, null, null, '=C8*D8/4', null, '=E8-F8', '=H7+G8'] },
  { row: 9, cells: ['2026', 'Q3', '$86,000,000', '1.25%', '$268,750', '$0', '$268,750', '$2,250,750'],
    formulas: [null, null, null, null, '=C9*D9/4', null, '=E9-F9', '=H8+G9'] },
  { row: 10, cells: ['2026', 'Q4', '$86,000,000', '1.25%', '$268,750', '$0', '$268,750', '$2,519,500'],
    formulas: [null, null, null, null, '=C10*D10/4', null, '=E10-F10', '=H9+G10'] },
  { row: 11, cells: ['', '', '', '', '', '', '', ''], formulas: null },
  { row: 12, cells: ['TOTAL', '', '', '', '$2,580,000', '$60,500', '$2,519,500', ''],
    formulas: [null, null, null, null, '=SUM(E2:E10)', '=SUM(F2:F10)', '=SUM(G2:G10)', null] },
];

const colLetters = ['A','B','C','D','E','F','G','H'];
let sheetBuilt = false;

function buildSpreadsheet() {
  if (sheetBuilt) return;
  sheetBuilt = true;

  const tbody = document.getElementById('fpSheetBody');
  tbody.innerHTML = '';

  sheetData.forEach((row) => {
    const tr = document.createElement('tr');
    // Row number
    const rowTd = document.createElement('td');
    rowTd.textContent = row.row;
    tr.appendChild(rowTd);

    row.cells.forEach((val, ci) => {
      const td = document.createElement('td');
      td.textContent = val;
      const isNum = /^\$/.test(val) || /^\d+\.\d+%$/.test(val);
      if (isNum) td.classList.add('fp-cell-number');

      const formula = row.formulas && row.formulas[ci];
      td.dataset.cellRef = colLetters[ci] + row.row;
      td.dataset.formula = formula || val;
      td.dataset.value = val;

      td.addEventListener('click', function() {
        // Clear previous selection
        document.querySelectorAll('.fp-cell-selected').forEach(c => c.classList.remove('fp-cell-selected'));
        td.classList.add('fp-cell-selected');
        document.getElementById('fpCellRef').textContent = td.dataset.cellRef;
        document.getElementById('fpFormula').textContent = formula || val;
      });

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

// ============================================
// TASK & CALENDAR PANELS
// ============================================
function closeAllPanels() {
  var tp = document.getElementById('taskPanel');
  var cp = document.getElementById('calendarPanel');
  var up = document.getElementById('usagePanel');
  if (tp) tp.style.display = 'none';
  if (cp) cp.style.display = 'none';
  if (up) up.style.display = 'none';
}

function toggleTaskPanel() {
  const tp = document.getElementById('taskPanel');
  const wasOpen = tp && tp.style.display !== 'none';
  closeAllPanels();
  if (!wasOpen && tp) tp.style.display = 'block';
}

function toggleCalendarPanel() {
  const cp = document.getElementById('calendarPanel');
  const wasOpen = cp && cp.style.display !== 'none';
  closeAllPanels();
  if (!wasOpen && cp) {
    buildMiniCalendar();
    cp.style.display = 'block';
  }
}

function toggleUsagePanel() {
  const up = document.getElementById('usagePanel');
  const wasOpen = up && up.style.display !== 'none';
  closeAllPanels();
  if (!wasOpen && up) up.style.display = 'block';
}

// Close top-bar dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.top-icon-btn') && !e.target.closest('.th-dropdown') && !e.target.closest('.top-profile')) {
    closeAllPanels();
    var pp = document.getElementById('profilePanel');
    if (pp) pp.style.display = 'none';
  }
});

function toggleProfileMenu() {
  const pp = document.getElementById('profilePanel');
  const wasOpen = pp && pp.style.display !== 'none';
  closeAllPanels();
  if (pp) pp.style.display = 'none';
  if (!wasOpen && pp) pp.style.display = 'block';
}

function buildMiniCalendar() {
  const grid = document.getElementById('miniCalGrid');
  if (!grid || grid.children.length > 0) return;
  const days = ['','','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31'];
  const eventDays = ['9','12','14','18'];
  days.forEach(d => {
    const div = document.createElement('div');
    div.className = 'mcg-day' + (d === '' ? ' empty' : '') + (d === '9' ? ' today' : '') + (eventDays.includes(d) && d !== '9' ? ' has-event' : '');
    div.textContent = d;
    grid.appendChild(div);
  });
}

// Close panels on outside click
document.addEventListener('click', function(e) {
  if (!e.target.closest('#taskAlertBtn') && !e.target.closest('#taskPanel')) {
    const tp = document.getElementById('taskPanel');
    if (tp) tp.style.display = 'none';
  }
  if (!e.target.closest('#calendarBtn') && !e.target.closest('#calendarPanel')) {
    const cp = document.getElementById('calendarPanel');
    if (cp) cp.style.display = 'none';
  }
  if (!e.target.closest('.sidebar-search')) {
    closeSearch();
  }
});

function handleNew() {
  if (currentMode === 'chat') {
    selectThread('new', null);
    // Deselect all sidebar items
    document.querySelectorAll('.thread-item').forEach(t => t.classList.remove('active'));
    // Focus the input
    const input = document.getElementById('new-thread-input');
    if (input) input.focus();
  } else {
    alert('New workflow creation dialog would open here');
  }
}

// ============================================
// EXPORT & SHARE (#13)
// ============================================
function exportThread() {
  const thread = document.getElementById('thread-' + activeThread);
  if (!thread) return;
  const messages = thread.querySelectorAll('.msg-block');
  let md = '# ' + (threadTitles[activeThread] || 'Thread') + '\n\n';
  messages.forEach(msg => {
    const sender = msg.querySelector('.sender');
    const time = msg.querySelector('.timestamp');
    const body = msg.querySelector('.msg-body');
    if (sender && body) {
      md += '**' + sender.textContent + '** (' + (time ? time.textContent : '') + ')\n';
      md += body.textContent.trim() + '\n\n---\n\n';
    }
  });
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (threadTitles[activeThread] || 'thread').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.md';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported as Markdown');
}

function shareThread() {
  const url = window.location.origin + '/thread/' + activeThread;
  navigator.clipboard.writeText(url).then(() => showToast('Share link copied'));
}

function fillSuggestion(text) {
  const input = document.getElementById('new-thread-input');
  if (input) {
    input.textContent = text;
    input.focus();
    // Place cursor at end
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// ============================================
// WORKFLOW DETAIL
// ============================================
const workflowData = {
  'rent-roll': {
    title: 'Rent Roll Extraction',
    desc: 'Extracts and standardizes rent roll data from uploaded PDFs into clean xlsx format.'
  },
  'k1-extract': {
    title: 'K-1 Document Processing',
    desc: 'Parses K-1 tax documents, extracts allocations, and maps to fund accounting structure.'
  },
  'lp-waterfall': {
    title: 'LP Distribution Waterfall',
    desc: 'Calculates LP/GP distribution splits across preferred return, catch-up, and carried interest tiers.'
  },
  'fee-calc': {
    title: 'Management Fee Calculator',
    desc: 'Computes management fees across fund vehicles using committed/invested capital basis.'
  },
  'covenant': {
    title: 'Loan Covenant Monitor',
    desc: 'Monitors DSCR, LTV, and debt yield covenants across the loan book.'
  }
};

function showWorkflowDetail(id, el) {
  const data = workflowData[id];
  if (!data) return;

  document.getElementById('wfDetailTitle').textContent = data.title;
  document.getElementById('wfDetailDesc').textContent = data.desc;

  document.getElementById('wfListing').style.display = 'none';
  const detail = document.getElementById('wfDetail');
  detail.style.display = 'flex';

  // Reset to overview tab
  switchTab('overview', document.querySelector('.tab-btn'));

  // Update sidebar active
  document.querySelectorAll('.wf-side-item').forEach(item => item.classList.remove('active'));
  if (el) {
    const sideItem = el.closest('.wf-side-item');
    if (sideItem) sideItem.classList.add('active');
  }
  // Also sync sidebar when clicked from card (match by id)
  const sidebarMap = {
    'rent-roll': 0, 'k1-extract': 1, 'lp-waterfall': 2, 'fee-calc': 3, 'covenant': 4
  };
  const sideItems = document.querySelectorAll('.wf-side-item');
  if (sidebarMap[id] !== undefined && sideItems[sidebarMap[id]]) {
    document.querySelectorAll('.wf-side-item').forEach(item => item.classList.remove('active'));
    sideItems[sidebarMap[id]].classList.add('active');
  }
}

function showWorkflowListing() {
  document.getElementById('wfListing').style.display = 'flex';
  document.getElementById('wfDetail').style.display = 'none';
  closeCosimoPanel();
}

// ============================================
// TABS
// ============================================
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

  btn.classList.add('active');
  document.getElementById('tab-' + tabId).classList.add('active');
}

// ============================================
// DROPDOWN
// ============================================
function toggleDropdown(e) {
  e.stopPropagation();
  const menu = document.getElementById('actionDropdown');
  menu.classList.toggle('show');
}

document.addEventListener('click', () => {
  document.getElementById('actionDropdown')?.classList.remove('show');
});

// ============================================
// COSIMO PANEL
// ============================================
function openCosimoPanel() {
  document.getElementById('actionDropdown').classList.remove('show');
  document.getElementById('cosimoPanel').classList.add('open');
  document.getElementById('panelOverlay').classList.add('show');
  document.getElementById('sidebar').classList.add('collapsed');
  document.getElementById('panelInput').focus();
}

function closeCosimoPanel() {
  document.getElementById('cosimoPanel').classList.remove('open');
  document.getElementById('panelOverlay').classList.remove('show');
  document.getElementById('sidebar').classList.remove('collapsed');
}

function handlePanelKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendPanelMessage();
  }
}

function sendPanelMessage() {
  const input = document.getElementById('panelInput');
  const html = input.innerHTML.trim();
  if (!html || input.textContent.trim() === '') return;

  const chat = document.getElementById('panelChat');

  // Add user message (preserve formatting)
  const userMsg = document.createElement('div');
  userMsg.className = 'panel-msg panel-msg-user';
  userMsg.innerHTML = `
    <div class="panel-msg-header">
      <span class="panel-msg-sender">You</span>
      <div class="badge badge-human" style="width:16px;height:16px;font-size:9px;">E</div>
    </div>
    ${html}
  `;
  chat.appendChild(userMsg);
  input.innerHTML = '';

  // Add typing indicator
  const typing = document.createElement('div');
  typing.className = 'panel-msg panel-msg-ai';
  typing.innerHTML = `
    <div class="panel-msg-header">
      <div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>
      <span class="panel-msg-sender">Cosimo</span>
    </div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;
  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  // Simulate response
  setTimeout(() => {
    typing.innerHTML = `
      <div class="panel-msg-header">
        <div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>
        <span class="panel-msg-sender">Cosimo</span>
      </div>
      I've understood your request. In a live environment, I would update the workflow configuration and show you a diff of the changes. For this demo, the modification has been noted.
    `;
    chat.scrollTop = chat.scrollHeight;
  }, 1800);
}

// ============================================
// K-1 ERROR RETRY
// ============================================
function retryK1() {
  const btn = document.querySelector('.cosimo-error-retry');
  if (!btn || btn.classList.contains('retrying')) return;
  btn.classList.add('retrying');
  btn.querySelector('.retry-icon').style.animation = '';

  // Simulate retry attempt, then fail again
  setTimeout(() => {
    btn.classList.remove('retrying');
    alert('Retry failed — Ridgeline Capital vault is still unreachable. Contact integrations team or try again later.');
  }, 2500);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// ERABOR THREAD ANIMATION
// ============================================
let eraborPlayed = false;
let eraborRunning = false;
let eraborTimers = [];
let eraborIntervals = [];
const eraborUserMsg = 'Pull the Erabor partnership agreement and summarize the key economic terms. I need to understand the GP commit, fee structure, clawback provisions, and any side letter concessions before the Thursday call with Marcus. Cross-reference against our standard Fund III terms and flag anything non-standard.';

// Check if user is scrolled near the bottom (within 80px)
function isNearBottom(el) {
  return (el.scrollHeight - el.scrollTop - el.clientHeight) < 80;
}

// Only auto-scroll if the user is already near the bottom
function softScroll(el) {
  if (isNearBottom(el)) {
    el.scrollTop = el.scrollHeight;
  }
}

function eraborTimer(fn, ms) {
  const id = setTimeout(fn, ms);
  eraborTimers.push(id);
  return id;
}

function showEraborStopBtn(show) {
  const sendBtn = document.getElementById('erabor-send-btn');
  const stopBtn = document.getElementById('erabor-stop-btn');
  if (sendBtn) sendBtn.style.display = show ? 'none' : '';
  if (stopBtn) stopBtn.style.display = show ? '' : 'none';
}

function runEraborSequence() {
  if (eraborPlayed || eraborRunning) return;
  eraborRunning = true;

  const thinking = document.getElementById('erabor-thinking');
  const reasoning = document.getElementById('erabor-reasoning');
  const reply = document.getElementById('erabor-reply');
  const steps = document.querySelectorAll('#erabor-steps .reasoning-step-item');
  const scroll = document.getElementById('erabor-scroll');
  const thinkingCubes = thinking.querySelector('.cosimo-thinking');

  // Show stop button, hide send, disable input
  showEraborStopBtn(true);
  disableInput('erabor', true);

  // State 1: Thinking cubes for 2s
  eraborTimer(() => {
    thinkingCubes.classList.add('fading');

    eraborTimer(() => {
      thinking.style.display = 'none';
      reasoning.style.display = 'block';

      // State 2: Reveal reasoning steps one by one
      steps.forEach((step, i) => {
        eraborTimer(() => {
          step.classList.add('visible');
          softScroll(scroll);
        }, i * 550);
      });

      // Collapse reasoning and start streaming
      const totalStepTime = steps.length * 550 + 1000;
      eraborTimer(() => {
        reasoning.style.display = 'none';
        document.getElementById('erabor-latency').style.display = '';

        eraborTimer(() => {
          reply.style.display = 'block';
          streamReply(scroll);
        }, 500);
      }, totalStepTime);

    }, 500);
  }, 2000);
}

function markEraborDone() {
  eraborRunning = false;
  eraborPlayed = true;
  showEraborStopBtn(false);
  disableInput('erabor', false);
}

function cancelErabor() {
  // Kill all pending timers/intervals
  eraborTimers.forEach(id => clearTimeout(id));
  eraborIntervals.forEach(id => clearInterval(id));
  eraborTimers = [];
  eraborIntervals = [];
  eraborRunning = false;

  // Hide the entire Cosimo response block
  const response = document.getElementById('erabor-response');
  if (response) response.style.display = 'none';

  // Swap stop → send, re-enable input
  showEraborStopBtn(false);
  disableInput('erabor', false);

  // Put user's message back in the input for editing
  const input = document.getElementById('erabor-input');
  if (input) {
    input.textContent = eraborUserMsg;
    input.focus();
    // Place cursor at end
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

// ============================================
// CHARACTER-BY-CHARACTER STREAMING
// ============================================
function streamReply(scroll) {
  const blocks = document.querySelectorAll('#erabor-reply .erabor-stream-block');

  // Pre-process: capture each block's original HTML, then hide content
  const blockData = [];
  blocks.forEach(block => {
    const section = block.querySelector('.erabor-section');
    if (section) {
      // Structured section: reveal rows one at a time
      const rows = section.querySelectorAll('.erabor-kv');
      rows.forEach(r => { r.style.opacity = '0'; r.style.transform = 'translateY(4px)'; });
      blockData.push({ el: block, type: 'section', section, rows: Array.from(rows) });
    } else {
      // Text paragraph: type character by character
      const paragraphs = block.querySelectorAll('p');
      const pData = [];
      paragraphs.forEach(p => {
        // Store original HTML content (to preserve <strong> etc)
        pData.push({ el: p, html: p.innerHTML });
        p.textContent = '';
      });
      blockData.push({ el: block, type: 'text', paragraphs: pData });
    }
    block.style.display = 'none';
  });

  // Create a blinking cursor element
  const cursor = document.createElement('span');
  cursor.className = 'stream-cursor';

  let blockIdx = 0;

  function processNextBlock() {
    if (blockIdx >= blockData.length) {
      cursor.remove();
      markEraborDone();
      return;
    }

    const bd = blockData[blockIdx];
    bd.el.style.display = '';
    bd.el.classList.add('streamed');
    softScroll(scroll);

    if (bd.type === 'text') {
      typeTextBlock(bd, cursor, scroll, () => {
        blockIdx++;
        processNextBlock();
      });
    } else {
      streamSectionBlock(bd, cursor, scroll, () => {
        blockIdx++;
        processNextBlock();
      });
    }
  }

  processNextBlock();
}

function typeTextBlock(bd, cursor, scroll, onDone) {
  let pIdx = 0;

  function typeNextParagraph() {
    if (pIdx >= bd.paragraphs.length) {
      onDone();
      return;
    }

    const pInfo = bd.paragraphs[pIdx];
    const fullHTML = pInfo.html;

    // Parse out text and HTML tags so we can type text chars
    // but insert tags instantly
    const tokens = tokenizeHTML(fullHTML);
    let tokenIdx = 0;
    let builtHTML = '';

    pInfo.el.innerHTML = '';
    pInfo.el.appendChild(cursor);

    // Characters per tick — simulate fast but readable streaming
    const charsPerTick = 2;
    const tickInterval = 16; // ~60fps

    const timer = setInterval(() => {
      let charsAdded = 0;

      while (tokenIdx < tokens.length && charsAdded < charsPerTick) {
        const token = tokens[tokenIdx];
        if (token.type === 'tag') {
          builtHTML += token.value;
          tokenIdx++;
        } else {
          builtHTML += token.value;
          tokenIdx++;
          charsAdded++;
        }
      }

      pInfo.el.innerHTML = builtHTML;
      pInfo.el.appendChild(cursor);
      softScroll(scroll);

      if (tokenIdx >= tokens.length) {
        clearInterval(timer);
        cursor.remove();
        pIdx++;
        eraborTimer(typeNextParagraph, 120);
      }
    }, tickInterval);
    eraborIntervals.push(timer);
  }

  typeNextParagraph();
}

function streamSectionBlock(bd, cursor, scroll, onDone) {
  // Section title appears instantly, then rows stream in one at a time
  bd.section.querySelector('.erabor-section-title').appendChild(cursor);
  softScroll(scroll);

  let rowIdx = 0;

  function showNextRow() {
    if (rowIdx >= bd.rows.length) {
      cursor.remove();
      onDone();
      return;
    }

    const row = bd.rows[rowIdx];
    row.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    row.style.opacity = '1';
    row.style.transform = 'translateY(0)';

    // Move cursor after the row
    row.appendChild(cursor);
    softScroll(scroll);

    rowIdx++;
    eraborTimer(showNextRow, 180);
  }

  eraborTimer(showNextRow, 200);
}

// Break HTML string into tokens: { type: 'tag'|'char', value }
function tokenizeHTML(html) {
  const tokens = [];
  let i = 0;
  while (i < html.length) {
    if (html[i] === '<') {
      // Capture full tag
      const end = html.indexOf('>', i);
      if (end !== -1) {
        tokens.push({ type: 'tag', value: html.slice(i, end + 1) });
        i = end + 1;
      } else {
        tokens.push({ type: 'char', value: html[i] });
        i++;
      }
    } else if (html[i] === '&') {
      // Capture HTML entity (e.g. &amp;)
      const semi = html.indexOf(';', i);
      if (semi !== -1 && semi - i < 10) {
        tokens.push({ type: 'char', value: html.slice(i, semi + 1) });
        i = semi + 1;
      } else {
        tokens.push({ type: 'char', value: html[i] });
        i++;
      }
    } else {
      tokens.push({ type: 'char', value: html[i] });
      i++;
    }
  }
  return tokens;
}

// ============================================
// ATTACH FILE ACTIONS
// ============================================
function attachFromComputer(btn) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.onchange = function() {
    if (input.files.length) {
      const names = Array.from(input.files).map(f => f.name).join(', ');
      showToast('Attached: ' + names);
    }
  };
  input.click();
}

function attachFromDrive(btn) {
  showToast('Cloud drive picker opening\u2026');
}

// ============================================
// MODEL SELECTOR
// ============================================
function toggleModelDropdown(btn) {
  const selector = btn.closest('.model-selector');
  const wasOpen = selector.classList.contains('open');
  // Close all open dropdowns first
  document.querySelectorAll('.model-selector.open').forEach(s => s.classList.remove('open'));
  if (!wasOpen) {
    selector.classList.add('open');
    const dropdown = selector.querySelector('.model-dropdown');
    // Temporarily show off-screen to measure
    dropdown.style.visibility = 'hidden';
    dropdown.style.display = 'block';
    const ddRect = dropdown.getBoundingClientRect();
    dropdown.style.display = '';
    dropdown.style.visibility = '';

    const btnRect = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Try above the button first
    let top = btnRect.top - ddRect.height - 4;
    if (top < 4) top = btnRect.bottom + 4; // flip below if no room above
    if (top + ddRect.height > vh - 4) top = vh - ddRect.height - 4; // clamp bottom

    let left = btnRect.left;
    if (left + ddRect.width > vw - 4) left = vw - ddRect.width - 4; // clamp right
    if (left < 4) left = 4; // clamp left

    dropdown.style.top = top + 'px';
    dropdown.style.left = left + 'px';
    dropdown.style.bottom = 'auto';
  }
}

function selectModel(option) {
  const selector = option.closest('.model-selector');
  const label = selector.querySelector('.model-selector-label');
  const model = option.dataset.model;
  const name = option.querySelector('.model-option-name').textContent;

  // Update selected state within this dropdown
  selector.querySelectorAll('.model-option').forEach(o => o.classList.remove('selected'));
  option.classList.add('selected');

  // Update button label
  label.textContent = name;

  // Close dropdown
  selector.classList.remove('open');

  showToast('Switched to ' + name);
}

// Close model dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.model-selector')) {
    document.querySelectorAll('.model-selector.open').forEach(s => s.classList.remove('open'));
  }
});
