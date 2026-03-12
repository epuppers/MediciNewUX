// ============================================
// MOCK DATA — THREADS
// ============================================
// ============================================
// MOCK DATA — WORKFLOWS
// ============================================
const MOCK_WORKFLOWS = {
  'rent-roll': {
    title: 'Rent Roll Extraction',
    desc: 'Extracts and standardizes rent roll data from uploaded PDFs into clean xlsx format.',
    cardDesc: 'Extracts and standardizes rent roll data from uploaded PDFs. Outputs clean xlsx with unit-level detail, floor mapping, and lease terms.',
    status: 'active',
    steps: 4,
    runs: 47,
    lastRun: '2h ago',
    lastShort: '2h',
    notif: false
  },
  'k1-extract': {
    title: 'K-1 Document Processing',
    desc: 'Parses K-1 tax documents, extracts allocations, and maps to fund accounting structure.',
    cardDesc: 'Parses K-1 tax documents, extracts allocations, and maps to fund accounting structure. Flags discrepancies against capital accounts.',
    status: 'active',
    steps: 5,
    runs: 23,
    lastRun: '6h ago',
    lastShort: '6h',
    notif: false
  },
  'lp-waterfall': {
    title: 'LP Distribution Waterfall',
    desc: 'Calculates LP/GP distribution splits across preferred return, catch-up, and carried interest tiers.',
    cardDesc: 'Calculates LP/GP distribution splits across preferred return, catch-up, and carried interest tiers. Generates allocation schedules.',
    status: 'draft',
    steps: 6,
    runs: 0,
    lastRun: 'Created Feb 20',
    lastShort: '\u2014',
    notif: false
  },
  'fee-calc': {
    title: 'Management Fee Calculator',
    desc: 'Computes management fees across fund vehicles using committed/invested capital basis.',
    cardDesc: 'Computes management fees across fund vehicles using committed/invested capital basis, step-downs, and offset provisions.',
    status: 'active',
    steps: 3,
    runs: 31,
    lastRun: '1d ago',
    lastShort: '1d',
    notif: false
  },
  'covenant': {
    title: 'Loan Covenant Monitor',
    desc: 'Monitors DSCR, LTV, and debt yield covenants across the loan book.',
    cardDesc: 'Monitors DSCR, LTV, and debt yield covenants across the loan book. Alerts when metrics approach or breach thresholds.',
    status: 'paused',
    steps: 4,
    runs: 18,
    lastRun: 'Paused Feb 15',
    lastShort: '10d',
    notif: true
  }
};

// ============================================
// MOCK DATA — SPREADSHEET
// ============================================
const MOCK_SPREADSHEET = {
  columns: ['A','B','C','D','E','F','G','H'],
  headers: ['Period', 'Quarter', 'Committed Cap', 'Fee Rate', 'Gross Fee', 'Offset', 'Net Fee', 'Cumulative'],
  rows: [
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
  ]
};

// ============================================
// MOCK DATA — BRAIN MEMORY
// ============================================
const MOCK_MEMORY = {
  roleProfile: 'VP of Fund Accounting at a mid-market PE firm. I manage 12 funds across 3 vintages, primarily focused on real estate and infrastructure. I report to the CFO and work closely with investor relations.',
  selectedTraits: ['Direct', 'Detail-oriented', 'Professional'],
  presetTraits: ['Witty', 'Friendly', 'Formal', 'Direct', 'Cautious', 'Detail-oriented', 'Big-picture', 'Encouraging', 'Professional', 'Concise', 'Thorough'],
  facts: [
    { category: 'preference', text: 'Prefers IRR over MOIC when comparing fund performance across vintages.', source: 'Learned from conversation', date: 'Feb 14, 2026' },
    { category: 'contact', text: 'Reports go to Sarah Chen (CFO) and Marcus Webb (COO). Sarah prefers executive summaries; Marcus wants full detail.', source: 'Learned from conversation', date: 'Feb 12, 2026' },
    { category: 'fund', text: 'Fund III has a 2/20 fee structure with European waterfall. GP commit is 5%. Preferred return is 8%.', source: 'Added by you', date: 'Feb 10, 2026' },
    { category: 'style', text: 'Always include vintage year when referencing funds. Never abbreviate fund names in reports.', source: 'Learned from conversation', date: 'Feb 8, 2026' },
    { category: 'workflow', text: 'Uses Yardi Voyager for property management data exports. Prefers CSV format over Excel for data imports.', source: 'Learned from conversation', date: 'Feb 6, 2026' },
    { category: 'preference', text: 'When building financial models, always start with assumptions tab, then build out to projections.', source: 'Learned from conversation', date: 'Feb 3, 2026' },
    { category: 'contact', text: 'Primary auditor is Deloitte. Audit partner is James Whitfield. Fiscal year ends March 31.', source: 'Added by you', date: 'Jan 28, 2026' },
    { category: 'fund', text: 'Hilgard Fund is a 2021 vintage focused on multifamily residential. 14 LP investors. Currently in harvest period.', source: 'Learned from conversation', date: 'Jan 22, 2026' }
  ]
};

// ============================================
// MOCK DATA — HEADER PANELS (Tasks, Calendar, Usage)
// ============================================
const MOCK_TASKS = [
  { title: 'Review Halcyon Towers IC memo', meta: 'Due today · Assigned by Sarah K.', urgent: true },
  { title: 'Approve row 14 rent roll change', meta: 'Due Mar 10 · Spreadsheets', urgent: false },
  { title: 'Follow up — James Leland LP commitment', meta: 'Due Mar 12 · CRM', urgent: false }
];

const MOCK_CALENDAR = {
  month: 'March 2026',
  events: [
    { title: 'IC Vote — Halcyon Towers', meta: 'Mar 12, 10:00 AM', color: 'var(--violet-3)' },
    { title: 'LP Call — James Leland', meta: 'Mar 14, 2:00 PM', color: 'var(--blue-3)' },
    { title: 'Fund III Quarterly Review', meta: 'Mar 18, 9:00 AM', color: 'var(--green)' }
  ]
};

const MOCK_USAGE = {
  planLimit: '34.0M credits',
  used: '20.5M credits',
  remaining: '13.5M credits',
  percentUsed: '60.3%',
  overage: '$0.00',
  renews: 'Apr 1, 2026'
};

// ============================================
// MOCK DATA — BRAIN LESSONS
// ============================================
const MOCK_LESSONS = {
  'rent-roll-format': {
    title: 'Rent Roll Formatting Standards',
    scope: 'company',
    author: 'Sarah Chen',
    updated: 'Feb 28',
    usage: 23,
    lastUsed: '2d ago',
    preview: 'All rent rolls must follow the standardized column layout: Unit, Tenant, Lease Start, Lease End, Monthly Rent, Status. Column headers use title case...'
  },
  'k1-extraction': {
    title: 'K-1 Document Extraction Rules',
    scope: 'user',
    author: 'you',
    updated: 'Feb 22',
    usage: 18,
    lastUsed: '5d ago',
    preview: 'When extracting K-1 data, always pull: Partner name, TIN (last 4 only), ordinary income (Box 1), rental income (Box 2), guaranteed payments (Box 4c)...'
  },
  'waterfall-calc': {
    title: 'LP Distribution Waterfall Logic',
    scope: 'company',
    author: 'Marcus Webb',
    updated: 'Feb 15',
    usage: 14,
    lastUsed: '1w ago',
    preview: 'Distribution follows European waterfall: (1) Return of capital, (2) Preferred return at 8%, (3) GP catch-up to 20%, (4) 80/20 split above hurdle...'
  },
  'report-formatting': {
    title: 'Quarterly Report Formatting Guide',
    scope: 'user',
    author: 'you',
    updated: 'Feb 10',
    usage: 9,
    lastUsed: '3d ago',
    preview: 'Reports use DM Sans for body text, IBM Plex Mono for data tables. Primary color is #2D2D2E, accent is #74418F. Section headers are 16pt bold...'
  },
  'fee-calc-rules': {
    title: 'Management Fee Calculation Rules',
    scope: 'company',
    author: 'Sarah Chen',
    updated: 'Jan 30',
    usage: 7,
    lastUsed: '2w ago',
    preview: 'Management fees are calculated on committed capital during investment period, then on invested capital post-investment period. Rate is 2% per annum...'
  },
  'yardi-export': {
    title: 'Yardi Export Cleanup Process',
    scope: 'user',
    author: 'you',
    updated: 'Jan 18',
    usage: 4,
    lastUsed: '4d ago',
    preview: 'Yardi CSV exports need these corrections: (1) Remove the first 3 header rows, (2) Strip trailing whitespace from unit codes, (3) Convert dates from MM/DD/YYYY to ISO...'
  }
};

const MOCK_THREADS = {
  fund3: {
    title: 'Fund III — Allocation Drift',
    meta: 'Today, 2:31 PM',
    hasFiles: false,
    indicator: null,
    keywords: 'fund allocation drift ips mandate rebalance trim large cap equity'
  },
  hilgard: {
    title: 'Hilgard — Fee Analysis',
    meta: 'Feb 22, 4:15 PM',
    hasFiles: true,
    indicator: 'ready',
    keywords: 'hilgard fee analysis management committed capital offset'
  },
  q4lp: {
    title: 'Q4 LP Distribution Waterfall',
    meta: 'Yesterday, 11:20 AM',
    hasFiles: false,
    indicator: null,
    keywords: 'q4 lp distribution waterfall carry preferred return'
  },
  k1: {
    title: 'K-1 Document Extraction',
    meta: 'Feb 20, 9:45 AM',
    hasFiles: false,
    indicator: 'error',
    keywords: 'k1 k-1 tax document extraction partner allocation ridgeline'
  },
  erabor: {
    title: 'Erabor Partnership Terms',
    meta: 'Feb 18, 3:30 PM',
    hasFiles: false,
    indicator: null,
    keywords: 'erabor partnership terms gp commit clawback side letter marcus'
  },
  new: {
    title: 'New Thread',
    meta: '',
    hasFiles: false,
    indicator: null,
    keywords: ''
  }
};

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
    // Search all threads by keyword using MOCK_THREADS
    const searchable = Object.keys(MOCK_THREADS)
      .filter(id => id !== 'new')
      .map(id => ({ id: id, title: MOCK_THREADS[id].title, keywords: MOCK_THREADS[id].keywords }));
    const matches = searchable.filter(t =>
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
  // Re-apply purple intensity for new theme
  const saved = localStorage.getItem('purpleIntensity');
  if (saved) applyPurpleIntensity(saved);
}

// ============================================
// PURPLE INTENSITY
// ============================================
const CONFIG_PURPLE_BASE_COLORS = {
  light: {
    '--berry-1': '#E0D0E1', '--berry-2': '#C4A6C5', '--berry-3': '#8B4F8D',
    '--berry-4': '#5D355E', '--berry-5': '#2E1A2F',
    '--violet-1': '#D8C8E2', '--violet-2': '#A383B4', '--violet-3': '#74418F',
    '--violet-4': '#4D2B5F', '--violet-5': '#271630',
    '--chinese-1': '#D8CAD9', '--chinese-2': '#A891AD', '--chinese-3': '#7F6485',
    '--chinese-4': '#4A2E50', '--chinese-5': '#2A182E'
  },
  dark: {
    '--berry-1': '#2e1f2f', '--berry-2': '#5a3a5c', '--berry-3': '#a860aa',
    '--berry-4': '#5D355E', '--berry-5': '#2E1A2F',
    '--violet-1': '#241a2f', '--violet-2': '#6a4a80', '--violet-3': '#8855a8',
    '--violet-4': '#4D2B5F', '--violet-5': '#271630',
    '--chinese-1': '#261a28', '--chinese-2': '#4e3854', '--chinese-3': '#8a6c92',
    '--chinese-4': '#4A2E50', '--chinese-5': '#2A182E'
  }
};

function hexToHsl(hex) {
  var r = parseInt(hex.slice(1, 3), 16) / 255;
  var g = parseInt(hex.slice(3, 5), 16) / 255;
  var b = parseInt(hex.slice(5, 7), 16) / 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  var r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return '#' + [r, g, b].map(function(x) {
    var hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function hexToRgbString(hex) {
  return parseInt(hex.slice(1,3),16) + ',' +
         parseInt(hex.slice(3,5),16) + ',' +
         parseInt(hex.slice(5,7),16);
}

// Map: which tokens also need an RGB triplet companion
var CONFIG_RGB_COMPANIONS = {
  '--violet-3': '--violet-3-rgb',
  '--berry-3': '--berry-3-rgb'
};

function applyPurpleIntensity(value) {
  var intensity = parseInt(value, 10);
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  var bases = isDark ? CONFIG_PURPLE_BASE_COLORS.dark : CONFIG_PURPLE_BASE_COLORS.light;
  var root = document.documentElement;

  Object.keys(bases).forEach(function(prop) {
    var hsl = hexToHsl(bases[prop]);
    var newSat = Math.min(100, hsl[1] * (intensity / 100));
    var newHex = hslToHex(hsl[0], newSat, hsl[2]);
    root.style.setProperty(prop, newHex);

    // Also update RGB triplet if this token has one
    if (CONFIG_RGB_COMPANIONS[prop]) {
      root.style.setProperty(CONFIG_RGB_COMPANIONS[prop], hexToRgbString(newHex));
    }
  });

  // Update label
  var label = document.getElementById('contrastValue');
  if (label) label.textContent = intensity + '%';

  localStorage.setItem('purpleIntensity', intensity);
}

// Restore saved intensity on load
(function() {
  var saved = localStorage.getItem('purpleIntensity');
  if (saved) {
    applyPurpleIntensity(saved);
    var slider = document.getElementById('purpleIntensitySlider');
    if (slider) slider.value = saved;
  }
})();

// ============================================
// ACCESSIBILITY
// ============================================

// --- Font size boost ---
// App uses px units throughout, so root font-size changes have no effect.
// CSS zoom on the app frame scales everything proportionally including px.
// We compensate the frame dimensions so it still fills the viewport.
var fontSizeZoomLevels = [1, 1.05, 1.1, 1.15, 1.2];

function applyFontSizeBoost(value) {
  var step = parseInt(value, 10);
  var zoom = fontSizeZoomLevels[step] || 1;
  var frame = document.querySelector('.app-frame');
  if (!frame) return;

  if (zoom === 1) {
    frame.style.zoom = '';
    frame.style.width = '';
    frame.style.height = '';
  } else {
    frame.style.zoom = zoom;
    frame.style.width = (100 / zoom) + 'vw';
    frame.style.height = (100 / zoom) + 'vh';
  }

  var label = document.getElementById('fontSizeValue');
  if (label) {
    if (step === 0) label.textContent = '100%';
    else label.textContent = Math.round(zoom * 100) + '%';
  }
  localStorage.setItem('a11yFontSize', step);
}

// --- Dyslexia font ---
function toggleDyslexiaFont() {
  var root = document.documentElement;
  var active = root.getAttribute('data-a11y-font') === 'dyslexia';
  if (active) {
    root.removeAttribute('data-a11y-font');
    localStorage.setItem('a11yDyslexia', 'off');
  } else {
    root.setAttribute('data-a11y-font', 'dyslexia');
    localStorage.setItem('a11yDyslexia', 'on');
  }
  syncA11yToggles();
}

// --- Reduced motion ---
function toggleReducedMotion() {
  var root = document.documentElement;
  var active = root.getAttribute('data-a11y-motion') === 'reduced';
  if (active) {
    root.removeAttribute('data-a11y-motion');
    localStorage.setItem('a11yMotion', 'off');
  } else {
    root.setAttribute('data-a11y-motion', 'reduced');
    localStorage.setItem('a11yMotion', 'on');
  }
  syncA11yToggles();
}

// --- High contrast + focus ---
function toggleHighContrast() {
  var root = document.documentElement;
  var active = root.getAttribute('data-a11y-contrast') === 'high';
  if (active) {
    root.removeAttribute('data-a11y-contrast');
    localStorage.setItem('a11yContrast', 'off');
  } else {
    root.setAttribute('data-a11y-contrast', 'high');
    localStorage.setItem('a11yContrast', 'on');
  }
  syncA11yToggles();
}

// --- Sync toggle visuals to current state ---
function syncA11yToggles() {
  var root = document.documentElement;

  var dyslexiaOn = root.getAttribute('data-a11y-font') === 'dyslexia';
  var motionOn = root.getAttribute('data-a11y-motion') === 'reduced';
  var contrastOn = root.getAttribute('data-a11y-contrast') === 'high';

  var dt = document.getElementById('dyslexiaToggleTrack');
  var dh = document.getElementById('dyslexiaToggleThumb');
  var mt = document.getElementById('motionToggleTrack');
  var mh = document.getElementById('motionToggleThumb');
  var ct = document.getElementById('contrastToggleTrack');
  var ch = document.getElementById('contrastToggleThumb');

  if (dt) dt.classList.toggle('active', dyslexiaOn);
  if (dh) dh.classList.toggle('active', dyslexiaOn);
  if (mt) mt.classList.toggle('active', motionOn);
  if (mh) mh.classList.toggle('active', motionOn);
  if (ct) ct.classList.toggle('active', contrastOn);
  if (ch) ch.classList.toggle('active', contrastOn);
}

// --- Restore all a11y settings on load ---
(function() {
  var fontSize = localStorage.getItem('a11yFontSize');
  if (fontSize && parseInt(fontSize, 10) > 0) {
    applyFontSizeBoost(fontSize);
    var slider = document.getElementById('fontSizeSlider');
    if (slider) slider.value = fontSize;
  }

  if (localStorage.getItem('a11yDyslexia') === 'on') {
    document.documentElement.setAttribute('data-a11y-font', 'dyslexia');
  }
  // Respect OS preference, or saved user preference
  var motionPref = localStorage.getItem('a11yMotion');
  if (motionPref === 'on' || (motionPref === null && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    document.documentElement.setAttribute('data-a11y-motion', 'reduced');
  }
  if (localStorage.getItem('a11yContrast') === 'on') {
    document.documentElement.setAttribute('data-a11y-contrast', 'high');
  }

  syncA11yToggles();
})();

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
  const newBtn = document.getElementById('newBtn');

  // Hide all views
  chatView.classList.remove('active');
  workflowsView.classList.remove('active');
  brainView.classList.remove('active');

  // Hide sidebars
  chatSidebar.style.display = 'none';
  workflowSidebar.style.display = 'none';

  // Clear brain nav active state when switching modes
  document.querySelectorAll('.brain-nav-btn').forEach(b => b.classList.remove('active'));

  if (mode === 'chat') {
    chatView.classList.add('active');
    chatSidebar.style.display = 'flex';
    newBtn.textContent = '+ New Thread';
    newBtn.style.display = '';
  } else if (mode === 'workflows') {
    workflowsView.classList.add('active');
    workflowSidebar.style.display = 'flex';
    newBtn.textContent = '+ New Workflow';
    newBtn.style.display = '';
    showWorkflowListing();
  }
}

function switchBrainSection(section, el) {
  currentMode = 'brain';

  // Update brain nav active state
  document.querySelectorAll('.brain-nav-btn').forEach(function(b) { b.classList.remove('active'); });
  if (el) el.classList.add('active');

  // Activate brain view, hide others
  document.getElementById('chatView').classList.remove('active');
  document.getElementById('workflowsView').classList.remove('active');
  document.getElementById('brainView').classList.add('active');

  // Deactivate top tabs (brain has no top tab now)
  document.querySelectorAll('.top-tab').forEach(function(b) { b.classList.remove('active'); });

  // Hide mode-specific sidebars, hide new button
  document.getElementById('chatSidebar').style.display = 'none';
  document.getElementById('workflowSidebar').style.display = 'none';
  document.getElementById('newBtn').style.display = 'none';

  // Switch brain content section
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
  if (title && MOCK_THREADS[id]) title.textContent = MOCK_THREADS[id].title;

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
  if (MOCK_THREADS[activeThread].hasFiles) {
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
  if (!MOCK_THREADS[activeThread].hasFiles) return;
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
const sheetData = MOCK_SPREADSHEET.rows;
const colLetters = MOCK_SPREADSHEET.columns;
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
function renderHeaderPanels() {
  // Render tasks
  var taskPanel = document.getElementById('taskPanel');
  if (taskPanel) {
    var taskItems = MOCK_TASKS.map(function(t) {
      return '<div class="task-item' + (t.urgent ? ' urgent' : '') + '">' +
        '<div class="task-dot"></div>' +
        '<div class="task-body">' +
          '<div class="task-title">' + escapeHtml(t.title) + '</div>' +
          '<div class="task-meta">' + escapeHtml(t.meta) + '</div>' +
        '</div>' +
        (t.urgent ? '<div class="task-priority urgent-label">URGENT</div>' : '') +
      '</div>';
    }).join('');
    taskPanel.innerHTML =
      '<div class="th-dropdown-header">Assigned Tasks <span class="th-dropdown-count">' + MOCK_TASKS.length + '</span></div>' +
      taskItems +
      '<div class="th-dropdown-footer">View all tasks</div>';
  }

  // Render calendar events
  var calPanel = document.getElementById('calendarPanel');
  if (calPanel) {
    var eventsHtml = MOCK_CALENDAR.events.map(function(e) {
      return '<div class="cal-event"><div class="cal-event-dot" style="background:' + e.color + '"></div><div><div class="cal-event-title">' + escapeHtml(e.title) + '</div><div class="cal-event-meta">' + escapeHtml(e.meta) + '</div></div></div>';
    }).join('');
    calPanel.innerHTML =
      '<div class="th-dropdown-header">' + escapeHtml(MOCK_CALENDAR.month) + '</div>' +
      '<div class="mini-cal"><div class="mini-cal-days">Su Mo Tu We Th Fr Sa</div><div class="mini-cal-grid" id="miniCalGrid"></div></div>' +
      '<div class="th-dropdown-header" style="border-top:1px solid var(--taupe-2);">Upcoming</div>' +
      eventsHtml;
  }

  // Render usage stats
  var usagePanel = document.getElementById('usagePanel');
  if (usagePanel) {
    usagePanel.innerHTML =
      '<div class="th-dropdown-header">Credit Usage — ' + escapeHtml(MOCK_CALENDAR.month) + '</div>' +
      '<div class="usage-meter-wrap">' +
        '<div class="usage-gauge">' +
          '<svg viewBox="0 0 200 130" class="usage-gauge-svg">' +
            '<defs><linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="var(--violet-3)"/><stop offset="60%" stop-color="var(--berry-3)"/><stop offset="100%" stop-color="var(--red)"/></linearGradient></defs>' +
            '<path d="M20 105 A80 80 0 0 1 180 105" fill="none" stroke="var(--taupe-1)" stroke-width="14" stroke-linecap="square"/>' +
            '<path d="M20 105 A80 80 0 0 1 124.5 29" fill="none" stroke="url(#gaugeGrad)" stroke-width="14" stroke-linecap="square"/>' +
            '<line x1="20" y1="105" x2="20" y2="95" stroke="var(--taupe-3)" stroke-width="1.5"/>' +
            '<line x1="100" y1="25" x2="100" y2="35" stroke="var(--taupe-3)" stroke-width="1.5"/>' +
            '<line x1="180" y1="105" x2="180" y2="95" stroke="var(--taupe-3)" stroke-width="1.5"/>' +
            '<line x1="100" y1="105" x2="120" y2="42" stroke="var(--taupe-5)" stroke-width="2.5" stroke-linecap="square"/>' +
            '<rect x="95" y="100" width="10" height="10" fill="var(--taupe-5)"/>' +
            '<text x="20" y="122" font-family="\'IBM Plex Mono\', monospace" font-size="9" font-weight="600" fill="var(--taupe-3)" text-anchor="middle">0</text>' +
            '<text x="180" y="122" font-family="\'IBM Plex Mono\', monospace" font-size="9" font-weight="600" fill="var(--taupe-3)" text-anchor="middle">' + escapeHtml(MOCK_USAGE.planLimit) + '</text>' +
          '</svg>' +
          '<div class="usage-gauge-readout">' +
            '<span class="usage-gauge-value">' + escapeHtml(MOCK_USAGE.percentUsed) + '</span>' +
            '<span class="usage-gauge-unit">used this period</span>' +
          '</div>' +
        '</div>' +
        '<div class="usage-stats">' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Plan Limit</span><span class="usage-stat-value">' + escapeHtml(MOCK_USAGE.planLimit) + '</span></div>' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Used</span><span class="usage-stat-value">' + escapeHtml(MOCK_USAGE.used) + '</span></div>' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Remaining</span><span class="usage-stat-value usage-stat-highlight">' + escapeHtml(MOCK_USAGE.remaining) + '</span></div>' +
          '<div class="usage-stat-divider"></div>' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Overage</span><span class="usage-stat-value">' + escapeHtml(MOCK_USAGE.overage) + '</span></div>' +
          '<div class="usage-stat-row"><span class="usage-stat-label">Renews</span><span class="usage-stat-value">' + escapeHtml(MOCK_USAGE.renews) + '</span></div>' +
        '</div>' +
      '</div>';
  }
}

// Render header panels on load
(function() { renderHeaderPanels(); })();

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
  let md = '# ' + (MOCK_THREADS[activeThread].title || 'Thread') + '\n\n';
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
  a.download = (MOCK_THREADS[activeThread].title || 'thread').replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.md';
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
function showWorkflowDetail(id, el) {
  const data = MOCK_WORKFLOWS[id];
  if (!data) return;

  document.getElementById('wfDetailTitle').textContent = data.title;
  document.getElementById('wfDetailDesc').textContent = data.desc;

  document.getElementById('wfListing').style.display = 'none';
  const detail = document.getElementById('wfDetail');
  detail.style.display = 'flex';

  // Reset to overview tab
  switchTab('overview', document.querySelector('.tab-btn'));

  // Update sidebar active — match by data-wf-id attribute
  document.querySelectorAll('.wf-side-item').forEach(item => item.classList.remove('active'));
  if (el) {
    const sideItem = el.closest('.wf-side-item');
    if (sideItem) sideItem.classList.add('active');
  }
  // Also sync sidebar when clicked from card (match by data attribute)
  var sideTarget = document.querySelector('.wf-side-item[data-wf-id="' + id + '"]');
  if (sideTarget) {
    document.querySelectorAll('.wf-side-item').forEach(item => item.classList.remove('active'));
    sideTarget.classList.add('active');
  }
}

function showWorkflowListing() {
  document.getElementById('wfListing').style.display = 'flex';
  document.getElementById('wfDetail').style.display = 'none';
  document.querySelectorAll('.wf-side-item').forEach(item => item.classList.remove('active'));
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

// ============================================
// BRAIN — MEMORY SECTION
// ============================================

var activeCategory = 'all';

function renderMemoryFromData() {
  // Render role profile
  var roleField = document.getElementById('roleField');
  if (roleField) roleField.textContent = MOCK_MEMORY.roleProfile;

  // Render selected traits
  var traitSelected = document.getElementById('traitSelected');
  if (traitSelected) {
    traitSelected.innerHTML = MOCK_MEMORY.selectedTraits.map(function(t) {
      return '<span class="mem-trait-tag active" onclick="removeTrait(this)">' + escapeHtml(t) + ' <span class="trait-x">&times;</span></span>';
    }).join('');
  }

  // Render preset traits (disable those that are selected)
  var traitPresets = document.getElementById('traitPresets');
  if (traitPresets) {
    traitPresets.innerHTML = MOCK_MEMORY.presetTraits.map(function(t) {
      var isSelected = MOCK_MEMORY.selectedTraits.indexOf(t) !== -1;
      return '<span class="mem-trait-tag' + (isSelected ? ' disabled' : '') + '" onclick="toggleTrait(this)">' + escapeHtml(t) + '</span>';
    }).join('');
  }

  // Render fact cards
  var factList = document.getElementById('memFactList');
  if (factList) {
    factList.innerHTML = MOCK_MEMORY.facts.map(function(f) {
      return '<div class="mem-fact-card" data-category="' + f.category + '">' +
        '<div class="mem-fact-top">' +
          '<span class="mem-fact-cat cat-' + f.category + '">' + f.category.charAt(0).toUpperCase() + f.category.slice(1) + '</span>' +
          '<button class="mem-fact-menu-btn" onclick="toggleFactMenu(this)">' +
            '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/></svg>' +
          '</button>' +
          '<div class="mem-fact-menu">' +
            '<button onclick="editFact(this)">Edit</button>' +
            '<button onclick="deleteFact(this)">Delete</button>' +
          '</div>' +
        '</div>' +
        '<div class="mem-fact-text">' + escapeHtml(f.text) + '</div>' +
        '<div class="mem-fact-meta">' +
          '<span class="mem-fact-source">' + escapeHtml(f.source) + '</span>' +
          '<span class="mem-fact-date">' + escapeHtml(f.date) + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
  }
}

// Render memory data on load
(function() { renderMemoryFromData(); })();

function toggleAddMemory() {
  var form = document.getElementById('memAddForm');
  if (form.style.display === 'none') {
    form.style.display = 'block';
    document.getElementById('memAddInput').focus();
  } else {
    form.style.display = 'none';
  }
}

function cancelAddMemory() {
  document.getElementById('memAddForm').style.display = 'none';
  document.getElementById('memAddInput').value = '';
}

function submitNewMemory() {
  var input = document.getElementById('memAddInput');
  var text = input.value.trim();
  if (!text) return;

  var category = document.getElementById('memAddCategory').value;
  var today = new Date();
  var dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  var card = document.createElement('div');
  card.className = 'mem-fact-card';
  card.setAttribute('data-category', category);
  card.innerHTML =
    '<div class="mem-fact-top">' +
      '<span class="mem-fact-cat cat-' + category + '">' + category.charAt(0).toUpperCase() + category.slice(1) + '</span>' +
      '<button class="mem-fact-menu-btn" onclick="toggleFactMenu(this)">' +
        '<svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14"><circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/></svg>' +
      '</button>' +
      '<div class="mem-fact-menu">' +
        '<button onclick="editFact(this)">Edit</button>' +
        '<button onclick="deleteFact(this)">Delete</button>' +
      '</div>' +
    '</div>' +
    '<div class="mem-fact-text">' + escapeHtml(text) + '</div>' +
    '<div class="mem-fact-meta">' +
      '<span class="mem-fact-source">Added by you</span>' +
      '<span class="mem-fact-date">' + dateStr + '</span>' +
    '</div>';

  var list = document.getElementById('memFactList');
  list.insertBefore(card, list.firstChild);

  input.value = '';
  document.getElementById('memAddForm').style.display = 'none';
  showToast('Memory saved');
}

function filterMemories() {
  var query = document.getElementById('memSearchInput').value.toLowerCase();
  var cards = document.querySelectorAll('.mem-fact-card');
  var visibleCount = 0;

  cards.forEach(function(card) {
    var text = card.querySelector('.mem-fact-text').textContent.toLowerCase();
    var cat = card.getAttribute('data-category');
    var matchesSearch = !query || text.indexOf(query) !== -1;
    var matchesCategory = activeCategory === 'all' || cat === activeCategory;

    if (matchesSearch && matchesCategory) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  document.getElementById('memNoResults').style.display = visibleCount === 0 ? 'flex' : 'none';
}

function filterByCategory(cat, el) {
  activeCategory = cat;

  document.querySelectorAll('.mem-cat-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');

  filterMemories();
}

function toggleFactMenu(btn) {
  // Close all other menus first
  document.querySelectorAll('.mem-fact-menu.open').forEach(function(m) { m.classList.remove('open'); });

  var menu = btn.nextElementSibling;
  menu.classList.toggle('open');
}

function editFact(btn) {
  var card = btn.closest('.mem-fact-card');
  var textEl = card.querySelector('.mem-fact-text');
  var menu = btn.closest('.mem-fact-menu');
  menu.classList.remove('open');

  textEl.setAttribute('contenteditable', 'true');
  textEl.focus();

  // Select all text
  var range = document.createRange();
  range.selectNodeContents(textEl);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  // Save on blur
  function saveEdit() {
    textEl.removeAttribute('contenteditable');
    textEl.removeEventListener('blur', saveEdit);
    textEl.removeEventListener('keydown', handleKey);
    // Update source
    var source = card.querySelector('.mem-fact-source');
    source.textContent = 'Edited by you';
    showToast('Memory updated');
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      textEl.blur();
    }
    if (e.key === 'Escape') {
      textEl.blur();
    }
  }

  textEl.addEventListener('blur', saveEdit);
  textEl.addEventListener('keydown', handleKey);
}

function deleteFact(btn) {
  var card = btn.closest('.mem-fact-card');
  var menu = btn.closest('.mem-fact-menu');
  menu.classList.remove('open');

  // Check if confirmation already showing
  if (card.querySelector('.mem-delete-confirm')) return;

  var confirm = document.createElement('div');
  confirm.className = 'mem-delete-confirm';
  confirm.innerHTML =
    '<span>Delete this memory?</span>' +
    '<button class="mem-delete-yes" onclick="confirmDelete(this)">Yes</button>' +
    '<button class="mem-delete-no" onclick="cancelDelete(this)">No</button>';

  card.appendChild(confirm);
}

function confirmDelete(btn) {
  var card = btn.closest('.mem-fact-card');
  card.style.transition = 'opacity 0.2s, max-height 0.2s';
  card.style.opacity = '0';
  card.style.maxHeight = card.offsetHeight + 'px';
  card.style.overflow = 'hidden';

  setTimeout(function() {
    card.style.maxHeight = '0';
    card.style.padding = '0 14px';
    card.style.marginBottom = '0';
  }, 50);

  setTimeout(function() {
    card.remove();
    filterMemories(); // Update no-results state
    showToast('Memory deleted');
  }, 300);
}

function cancelDelete(btn) {
  var confirm = btn.closest('.mem-delete-confirm');
  confirm.remove();
}

// Personality trait functions
function toggleTrait(el) {
  if (el.classList.contains('disabled')) return;

  var traitName = el.textContent.trim();

  // Add to selected
  var selected = document.getElementById('traitSelected');
  var tag = document.createElement('span');
  tag.className = 'mem-trait-tag active';
  tag.onclick = function() { removeTrait(tag); };
  tag.innerHTML = escapeHtml(traitName) + ' <span class="trait-x">&times;</span>';
  selected.appendChild(tag);

  // Disable in presets
  el.classList.add('disabled');

  showToast(traitName + ' added');
}

function removeTrait(el) {
  var traitName = el.textContent.replace('\u00d7', '').trim();

  // Re-enable in presets
  var presets = document.getElementById('traitPresets');
  presets.querySelectorAll('.mem-trait-tag').forEach(function(p) {
    if (p.textContent.trim() === traitName) {
      p.classList.remove('disabled');
    }
  });

  el.remove();
  showToast(traitName + ' removed');
}

function addCustomTrait() {
  var input = document.getElementById('traitInput');
  var text = input.value.trim();
  if (!text) return;

  var selected = document.getElementById('traitSelected');
  var tag = document.createElement('span');
  tag.className = 'mem-trait-tag active';
  tag.onclick = function() { removeTrait(tag); };
  tag.innerHTML = escapeHtml(text) + ' <span class="trait-x">&times;</span>';
  selected.appendChild(tag);

  input.value = '';
  showToast(text + ' added');
}

// Close fact menus when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.mem-fact-menu-btn') && !e.target.closest('.mem-fact-menu')) {
    document.querySelectorAll('.mem-fact-menu.open').forEach(function(m) { m.classList.remove('open'); });
  }
});

// ============================================
// BRAIN — LESSONS SECTION
// ============================================

var activeLessonScope = 'all';
var lessonIsEditing = false;

var lessonData = MOCK_LESSONS;

function renderLessonList() {
  var list = document.getElementById('lessonList');
  if (!list) return;
  var scopeArrowSvg = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="11" height="11"><path d="M1 8h14M11 4l4 4-4 4"/></svg>';
  list.innerHTML = Object.keys(MOCK_LESSONS).map(function(id) {
    var d = MOCK_LESSONS[id];
    var scopeClass = d.scope === 'company' ? 'scope-company' : 'scope-user';
    var scopeLabel = d.scope === 'company' ? 'Company' : 'Personal';
    return '<div class="lesson-card" data-scope="' + d.scope + '" data-lesson="' + id + '" onclick="openLesson(\'' + id + '\')">' +
      '<div class="lesson-card-top">' +
        '<span class="lesson-scope-badge ' + scopeClass + '">' + scopeLabel + '</span>' +
        '<div class="lesson-card-top-right">' +
          '<span class="lesson-usage">Referenced ' + d.usage + ' times</span>' +
          '<button class="lesson-card-scope-btn" onclick="toggleCardScope(this, event)" title="Change scope">' + scopeArrowSvg + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="lesson-card-title">' + escapeHtml(d.title) + '</div>' +
      '<div class="lesson-card-preview">' + escapeHtml(d.preview) + '</div>' +
      '<div class="lesson-card-meta">' +
        '<span class="lesson-card-date">Updated ' + d.updated + '</span>' +
        '<span class="lesson-card-author">by ' + escapeHtml(d.author) + '</span>' +
      '</div>' +
    '</div>';
  }).join('');
}

// Render lesson list on load
(function() { renderLessonList(); })();

var currentLessonId = null;

function filterLessons() {
  var query = document.getElementById('lessonSearchInput').value.toLowerCase();
  var cards = document.querySelectorAll('.lesson-card');
  var visibleCount = 0;

  cards.forEach(function(card) {
    var title = card.querySelector('.lesson-card-title').textContent.toLowerCase();
    var preview = card.querySelector('.lesson-card-preview').textContent.toLowerCase();
    var scope = card.getAttribute('data-scope');
    var matchesSearch = !query || title.indexOf(query) !== -1 || preview.indexOf(query) !== -1;
    var matchesScope = activeLessonScope === 'all' || scope === activeLessonScope;

    if (matchesSearch && matchesScope) {
      card.style.display = '';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  document.getElementById('lessonNoResults').style.display = visibleCount === 0 ? 'flex' : 'none';
}

function filterLessonScope(scope, el) {
  activeLessonScope = scope;
  document.querySelectorAll('#lessonScopeFilters .mem-cat-pill').forEach(function(p) { p.classList.remove('active'); });
  el.classList.add('active');
  filterLessons();
}

function openLesson(id) {
  currentLessonId = id;
  var data = lessonData[id];
  if (!data) return;

  // Update detail header
  document.getElementById('lessonDetailTitle').textContent = data.title;

  // Update meta bar
  var scopeBadge = document.getElementById('lessonDetailScope');
  scopeBadge.textContent = data.scope === 'company' ? 'Company' : 'Personal';
  scopeBadge.className = 'lesson-scope-badge ' + (data.scope === 'company' ? 'scope-company' : 'scope-user');

  // Update scope toggle button text
  document.getElementById('lessonScopeToggleText').textContent = data.scope === 'company' ? 'Change to Personal' : 'Promote to Company';

  // Switch views
  document.getElementById('lessonsListView').style.display = 'none';
  document.getElementById('lessonDetailView').style.display = '';

  // Reset edit state
  lessonIsEditing = false;
  var editBtn = document.getElementById('lessonEditBtn');
  editBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z"/></svg>';
  editBtn.title = 'Edit Directly';
  editBtn.classList.remove('primary');
  document.getElementById('lessonDetailBody').removeAttribute('contenteditable');
}

function closeLessonDetail() {
  document.getElementById('lessonDetailView').style.display = 'none';
  document.getElementById('lessonsListView').style.display = '';

  // Reset edit state
  if (lessonIsEditing) {
    lessonIsEditing = false;
    document.getElementById('lessonDetailBody').removeAttribute('contenteditable');
  }

  currentLessonId = null;
}

function toggleLessonEdit() {
  var body = document.getElementById('lessonDetailBody');
  var editBtn = document.getElementById('lessonEditBtn');

  lessonIsEditing = !lessonIsEditing;

  if (lessonIsEditing) {
    body.setAttribute('contenteditable', 'true');
    body.focus();
    editBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M2 8.5l4 4 8-9"/></svg>';
    editBtn.title = 'Save Changes';
    editBtn.classList.add('primary');
    showToast('Editing mode — click save when done');
  } else {
    body.removeAttribute('contenteditable');
    editBtn.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z"/></svg>';
    editBtn.title = 'Edit Directly';
    editBtn.classList.remove('primary');
    showToast('Lesson saved');
  }
}

function openCosimoForLesson() {
  // Update Cosimo panel context for this lesson
  var data = lessonData[currentLessonId];
  var panelName = document.querySelector('.cosimo-panel-name');
  panelName.textContent = 'Edit: ' + (data ? data.title : 'Lesson');

  var panelChat = document.getElementById('panelChat');
  panelChat.innerHTML =
    '<div class="panel-msg panel-msg-ai">' +
      '<div class="panel-msg-header">' +
        '<div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>' +
        '<span class="panel-msg-sender">Cosimo</span>' +
      '</div>' +
      'I have the <strong>' + escapeHtml(data ? data.title : 'lesson') + '</strong> loaded. I can help you:' +
      '<br><br>' +
      '<strong>"Add a new validation rule"</strong><br>' +
      '<strong>"Update the column format for dates"</strong><br>' +
      '<strong>"Add an exception for Fund IV properties"</strong><br>' +
      '<strong>"Rewrite the overview section to be more concise"</strong>' +
    '</div>';

  openCosimoPanel();
}

function toggleLessonScope() {
  var data = lessonData[currentLessonId];
  if (!data) return;

  data.scope = data.scope === 'company' ? 'user' : 'company';

  var scopeBadge = document.getElementById('lessonDetailScope');
  scopeBadge.textContent = data.scope === 'company' ? 'Company' : 'Personal';
  scopeBadge.className = 'lesson-scope-badge ' + (data.scope === 'company' ? 'scope-company' : 'scope-user');

  document.getElementById('lessonScopeToggleText').textContent = data.scope === 'company' ? 'Change to Personal' : 'Promote to Company';

  // Update the card in list view too
  var card = document.querySelector('.lesson-card[data-lesson="' + currentLessonId + '"]');
  if (card) {
    card.setAttribute('data-scope', data.scope);
    var cardBadge = card.querySelector('.lesson-scope-badge');
    cardBadge.textContent = data.scope === 'company' ? 'Company' : 'Personal';
    cardBadge.className = 'lesson-scope-badge ' + (data.scope === 'company' ? 'scope-company' : 'scope-user');
  }

  showToast('Scope changed to ' + (data.scope === 'company' ? 'Company' : 'Personal'));
}

function deleteLesson() {
  if (!currentLessonId) return;

  var card = document.querySelector('.lesson-card[data-lesson="' + currentLessonId + '"]');

  // Close detail view first
  closeLessonDetail();

  // Remove card with animation
  if (card) {
    card.style.transition = 'opacity 0.2s, max-height 0.2s';
    card.style.opacity = '0';
    card.style.maxHeight = card.offsetHeight + 'px';
    card.style.overflow = 'hidden';

    setTimeout(function() {
      card.style.maxHeight = '0';
      card.style.padding = '0 14px';
    }, 50);

    setTimeout(function() {
      card.remove();
      filterLessons();
    }, 300);
  }

  showToast('Lesson deleted');
}

function createNewLesson() {
  var panelName = document.querySelector('.cosimo-panel-name');
  panelName.textContent = 'Create New Lesson';

  var panelChat = document.getElementById('panelChat');
  panelChat.innerHTML =
    '<div class="panel-msg panel-msg-ai">' +
      '<div class="panel-msg-header">' +
        '<div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>' +
        '<span class="panel-msg-sender">Cosimo</span>' +
      '</div>' +
      'I can help you create a new lesson. Describe what you want to teach me:' +
      '<br><br>' +
      '<strong>"How we format quarterly LP reports"</strong><br>' +
      '<strong>"Rules for processing capital call notices"</strong><br>' +
      '<strong>"Our naming conventions for fund entities"</strong><br>' +
      '<strong>"How to reconcile Yardi exports with GL"</strong>' +
    '</div>';

  openCosimoPanel();
}

// ============================================
// BRAIN — DATA GRAPHS
// ============================================

var graphState = {
  level: 'root',        // 'root', 'cluster', 'entity'
  currentCategory: null,
  currentEntity: null
};

var graphColors = {
  funds:     { core: '#9b6bc2', mid: '#74418F', dim: '#4D2B5F', glow: 'rgba(155,107,194,0.5)' },
  contacts:  { core: '#c278c4', mid: '#8B4F8D', dim: '#5D355E', glow: 'rgba(194,120,196,0.5)' },
  documents: { core: '#7bb8d9', mid: '#5a9fc2', dim: '#3a7a9e', glow: 'rgba(123,184,217,0.5)' },
  workflows: { core: '#6abf6e', mid: '#3D8B40', dim: '#2a6b2c', glow: 'rgba(106,191,110,0.5)' },
  systems:   { core: '#d4a646', mid: '#B8862B', dim: '#8a6518', glow: 'rgba(212,166,70,0.5)' },
  entities:  { core: '#9e9ca3', mid: '#6a6870', dim: '#4a484f', glow: 'rgba(158,156,163,0.4)' },
  you:       { core: '#b478d8', mid: '#8855a8', dim: '#5a3070', glow: 'rgba(180,120,216,0.6)' }
};

var MOCK_GRAPH_DATA = {
  categories: [
    { id: 'funds', label: 'Funds', icon: '\u25C8', count: 11 },
    { id: 'contacts', label: 'Contacts', icon: '\u25CB', count: 18 },
    { id: 'documents', label: 'Documents', icon: '\u25A1', count: 16 },
    { id: 'workflows', label: 'Workflows', icon: '\u25B7', count: 12 },
    { id: 'systems', label: 'Systems', icon: '\u2699', count: 9 },
    { id: 'entities', label: 'Entities', icon: '\u25C7', count: 14 }
  ],
  nodes: {
    funds: [
      { id: 'fund-iii', label: 'Fund III', sub: '2019 Vintage', facts: [
        '2/20 fee structure with European waterfall',
        'GP commit is 5%, preferred return 8%',
        '14 LP investors, $420M committed capital',
        'Real estate focus — multifamily and industrial',
        'Currently in harvest period'
      ], related: ['sarah-chen', 'deloitte', 'k1-docs', 'hilgard', 'prop-berkshire', 'prop-marina'] },
      { id: 'hilgard', label: 'Hilgard Fund', sub: '2021 Vintage', facts: [
        '2021 vintage, multifamily residential focus',
        '14 LP investors across 3 institutions',
        'Currently in harvest period',
        'Managed by same team as Fund III'
      ], related: ['fund-iii', 'marcus-webb', 'rent-rolls', 'prop-hilgard-apt'] },
      { id: 'erabor', label: 'Erabor', sub: '2023 Vintage', facts: [
        '2023 vintage, infrastructure and energy',
        'Still in investment period',
        '$280M target, $190M committed so far',
        'European waterfall, 8% preferred return'
      ], related: ['sarah-chen', 'fund-iii', 'anna-kowalski'] },
      { id: 'opp-iv', label: 'Opportunity IV', sub: '2024 Vintage', facts: [
        'Newest fund, launched Q3 2024',
        'Opportunistic strategy across sectors',
        'Target $500M, first close at $150M'
      ], related: ['marcus-webb', 'erabor', 'david-park'] },
      { id: 'growth-i', label: 'Growth I', sub: '2020 Vintage', facts: [
        'Growth equity fund targeting tech-enabled services',
        '$310M committed, fully deployed',
        '11 portfolio companies',
        'American waterfall, 7% preferred'
      ], related: ['sarah-chen', 'lp-calpers', 'lp-harvardmc'] },
      { id: 'credit-ii', label: 'Credit II', sub: '2022 Vintage', facts: [
        'Private credit fund, mezzanine and senior secured',
        '$180M AUM, 12% target net return',
        'Quarterly distributions, current pay'
      ], related: ['elena-vasquez', 'deloitte', 'bank-svb'] },
      { id: 'infra-fund', label: 'Infra Fund', sub: '2023 Vintage', facts: [
        'Infrastructure — data centers, fiber, renewables',
        '$450M target, $290M first close',
        'Co-investment sidecar available'
      ], related: ['erabor', 'anna-kowalski', 'lp-adia'] },
      { id: 'co-invest-iii', label: 'Co-Invest III', sub: '2021 SPV', facts: [
        'Deal-by-deal co-investment vehicle',
        '8 completed deals, 2 in pipeline',
        'No management fee, 15% carry'
      ], related: ['opp-iv', 'david-park', 'lp-calpers'] },
      { id: 'secondaries', label: 'Secondaries I', sub: '2024 Vintage', facts: [
        'LP secondary and GP-led continuation fund',
        '$200M target, marketing phase',
        'Focus on NAV-discount opportunities'
      ], related: ['growth-i', 'credit-ii', 'rachel-kim'] },
      { id: 'seed-ventures', label: 'Seed Ventures', sub: '2022 Vintage', facts: [
        'Early-stage venture program',
        '$50M fund, 28 portfolio companies',
        'Follow-on reserve ratio 40%'
      ], related: ['growth-i', 'david-park', 'lp-tiger'] },
      { id: 'impact-i', label: 'Impact I', sub: '2024 ESG', facts: [
        'ESG-focused impact fund',
        '$150M target, Article 9 SFDR compliant',
        'Affordable housing and clean energy'
      ], related: ['infra-fund', 'anna-kowalski', 'lp-omers'] }
    ],
    contacts: [
      { id: 'sarah-chen', label: 'Sarah Chen', sub: 'CFO', facts: [
        'Chief Financial Officer',
        'Prefers executive summaries over detail',
        'Primary approver for quarterly reports',
        'Direct report of the CEO'
      ], related: ['fund-iii', 'erabor', 'deloitte', 'marcus-webb'] },
      { id: 'marcus-webb', label: 'Marcus Webb', sub: 'COO', facts: [
        'Chief Operating Officer',
        'Wants full detail in all reports',
        'Oversees workflow automation initiatives',
        'Reviews all LP communications'
      ], related: ['sarah-chen', 'hilgard', 'opp-iv'] },
      { id: 'james-whitfield', label: 'James Whitfield', sub: 'Audit Partner', facts: [
        'Deloitte audit partner',
        'Annual audit cycle ends March 31',
        'Has been partner for 3 years'
      ], related: ['deloitte', 'fund-iii', 'sarah-chen'] },
      { id: 'lp-group', label: 'LP Investors', sub: '32 Total', facts: [
        '32 LP investors across all funds',
        'Mix of institutions, family offices, HNW individuals',
        'Quarterly reporting cadence',
        'Annual meeting in September'
      ], related: ['fund-iii', 'hilgard', 'erabor'] },
      { id: 'elena-vasquez', label: 'Elena Vasquez', sub: 'Fund Controller', facts: [
        'Senior fund controller, manages NAV calculations',
        'Expert in waterfall modeling',
        'CPA, previously at PwC'
      ], related: ['credit-ii', 'sarah-chen', 'wf-nav-calc'] },
      { id: 'david-park', label: 'David Park', sub: 'IR Director', facts: [
        'Investor Relations director',
        'Manages LP communications and fundraising',
        'Joined from Goldman Sachs',
        'Runs annual LP meeting logistics'
      ], related: ['opp-iv', 'lp-group', 'qtr-reports', 'co-invest-iii'] },
      { id: 'anna-kowalski', label: 'Anna Kowalski', sub: 'VP Acquisitions', facts: [
        'VP of Acquisitions, infrastructure deals',
        'Manages deal pipeline and due diligence',
        'Sources deals in Europe and N. America'
      ], related: ['erabor', 'infra-fund', 'impact-i'] },
      { id: 'rachel-kim', label: 'Rachel Kim', sub: 'General Counsel', facts: [
        'General counsel and CCO',
        'Oversees LPA drafting and compliance',
        'SEC and CFTC reporting lead'
      ], related: ['lpa-docs', 'compliance-docs', 'secondaries'] },
      { id: 'tom-brennan', label: 'Tom Brennan', sub: 'CTO', facts: [
        'Chief Technology Officer',
        'Leads data infrastructure and integrations',
        'Driving AI adoption across firm'
      ], related: ['salesforce', 'yardi', 'snowflake', 'tableau'] },
      { id: 'lp-calpers', label: 'CalPERS', sub: 'Institutional LP', facts: [
        'California Public Employees Retirement System',
        '$8B PE allocation, $45M committed across 3 funds',
        'Annual re-up decisions in Q4'
      ], related: ['fund-iii', 'growth-i', 'co-invest-iii', 'david-park'] },
      { id: 'lp-harvardmc', label: 'Harvard MC', sub: 'Endowment LP', facts: [
        'Harvard Management Company',
        '$25M commitment in Growth I',
        'Requires ILPA-compliant reporting'
      ], related: ['growth-i', 'david-park', 'qtr-reports'] },
      { id: 'lp-adia', label: 'ADIA', sub: 'Sovereign LP', facts: [
        'Abu Dhabi Investment Authority',
        '$60M commitment to Infra Fund',
        'Requires Sharia-compliant structuring review'
      ], related: ['infra-fund', 'david-park'] },
      { id: 'lp-tiger', label: 'Tiger Global', sub: 'Crossover LP', facts: [
        'Crossover fund, $15M in Seed Ventures',
        'Co-investment rights on Series A+ deals',
        'Quarterly valuation mark reviews'
      ], related: ['seed-ventures', 'david-park'] },
      { id: 'lp-omers', label: 'OMERS', sub: 'Pension LP', facts: [
        'Ontario Municipal Employees Retirement System',
        '$30M commitment to Impact I',
        'ESG screening requirements'
      ], related: ['impact-i', 'david-park'] },
      { id: 'ext-counsel', label: 'Kirkland & Ellis', sub: 'External Counsel', facts: [
        'Primary external legal counsel',
        'Handles fund formation, LPA negotiation',
        'Partner: Margaret Hsu'
      ], related: ['rachel-kim', 'lpa-docs', 'secondaries'] },
      { id: 'auditor-kpmg', label: 'KPMG', sub: 'Tax Advisor', facts: [
        'Tax advisory and K-1 preparation',
        'Handles multi-state and international tax',
        'Annual engagement, Feb-Apr'
      ], related: ['k1-docs', 'deloitte', 'sarah-chen'] },
      { id: 'admin-citco', label: 'Citco', sub: 'Fund Admin', facts: [
        'Third-party fund administrator',
        'NAV calculation, investor statements, capital calls',
        'Administers Growth I and Credit II'
      ], related: ['growth-i', 'credit-ii', 'elena-vasquez'] },
      { id: 'broker-jll', label: 'JLL', sub: 'Broker', facts: [
        'Real estate broker for acquisitions',
        'Exclusive on industrial portfolio',
        'Market reports quarterly'
      ], related: ['fund-iii', 'hilgard', 'anna-kowalski'] }
    ],
    documents: [
      { id: 'k1-docs', label: 'K-1 Documents', sub: '48 Files', facts: [
        'Annual K-1 tax documents for all LP investors',
        'Extracted fields: partner name, TIN, Box 1-4c',
        'Processing via automated extraction workflow'
      ], related: ['fund-iii', 'lp-group', 'auditor-kpmg'] },
      { id: 'rent-rolls', label: 'Rent Rolls', sub: '24 Files', facts: [
        'Monthly rent roll exports from Yardi',
        'Standardized column format enforced',
        'Status color coding: green/amber/red'
      ], related: ['hilgard', 'yardi'] },
      { id: 'qtr-reports', label: 'Quarterly Reports', sub: '48 Files', facts: [
        'LP quarterly performance reports across all funds',
        'DM Sans body, IBM Plex Mono tables',
        'IRR and MOIC metrics included',
        'ILPA-compliant format for institutional LPs'
      ], related: ['sarah-chen', 'lp-group', 'fund-iii', 'david-park'] },
      { id: 'lpa-docs', label: 'LPAs', sub: '11 Files', facts: [
        'Limited Partnership Agreements for all funds',
        'Define fee structures, waterfall, GP terms',
        'Source of truth for fund economics'
      ], related: ['fund-iii', 'hilgard', 'erabor', 'opp-iv', 'rachel-kim'] },
      { id: 'cap-call-docs', label: 'Capital Calls', sub: '86 Files', facts: [
        'Capital call notices across all active funds',
        'Includes wire instructions and due dates',
        'Average 10-day notice period'
      ], related: ['lp-group', 'elena-vasquez', 'admin-citco'] },
      { id: 'dist-notices', label: 'Distribution Notices', sub: '34 Files', facts: [
        'Distribution and return-of-capital notices',
        'Waterfall calculations attached',
        'Requires dual signoff (CFO + Controller)'
      ], related: ['sarah-chen', 'elena-vasquez', 'wf-waterfall'] },
      { id: 'compliance-docs', label: 'Compliance Filings', sub: '22 Files', facts: [
        'ADV, PF, CPO-PQR filings',
        'SEC annual amendment due March 31',
        'CFTC reporting quarterly'
      ], related: ['rachel-kim', 'deloitte'] },
      { id: 'board-decks', label: 'Board Decks', sub: '16 Files', facts: [
        'Quarterly advisory board presentations',
        'Fund performance, pipeline, market outlook',
        'Confidential — limited distribution'
      ], related: ['sarah-chen', 'marcus-webb', 'david-park'] },
      { id: 'due-diligence', label: 'DD Packages', sub: '28 Files', facts: [
        'Due diligence document packages for fundraising',
        'Includes track record, team bios, references',
        'Updated semi-annually'
      ], related: ['david-park', 'opp-iv', 'secondaries'] },
      { id: 'valuation-reports', label: 'Valuation Reports', sub: '44 Files', facts: [
        'Quarterly fair value reports per ASC 820',
        'Third-party valuations for Level 3 assets',
        'Reviewed by audit committee'
      ], related: ['elena-vasquez', 'deloitte', 'fund-iii', 'growth-i'] },
      { id: 'insurance-docs', label: 'Insurance Policies', sub: '8 Files', facts: [
        'D&O, E&O, Cyber, Property policies',
        'Annual renewal in November',
        'Broker: Marsh McLennan'
      ], related: ['rachel-kim', 'firm'] },
      { id: 'tax-opinions', label: 'Tax Opinions', sub: '6 Files', facts: [
        'FIRPTA, UBTI, and ECI analysis',
        'Blocker entity structuring opinions',
        'Updated per new fund formation'
      ], related: ['auditor-kpmg', 'lpa-docs', 'rachel-kim'] },
      { id: 'side-letters', label: 'Side Letters', sub: '42 Files', facts: [
        'LP-specific side letter agreements',
        'MFN provisions tracked centrally',
        'Key terms: fee discounts, co-invest, reporting'
      ], related: ['lpa-docs', 'rachel-kim', 'lp-calpers', 'lp-adia'] },
      { id: 'pitch-decks', label: 'Pitch Decks', sub: '14 Files', facts: [
        'Fundraising pitch materials by fund',
        'Version controlled, compliance-reviewed',
        'Includes tearsheets and one-pagers'
      ], related: ['david-park', 'opp-iv', 'impact-i', 'secondaries'] },
      { id: 'wire-instructions', label: 'Wire Instructions', sub: '6 Files', facts: [
        'Bank wire details for each fund entity',
        'Dual-verification required on changes',
        'Updated semi-annually'
      ], related: ['bank-svb', 'cap-call-docs', 'elena-vasquez'] },
      { id: 'org-charts', label: 'Org Charts', sub: '11 Files', facts: [
        'Fund entity structure diagrams',
        'GP/LP/Blocker/Feeder relationships',
        'Updated for each new fund or restructuring'
      ], related: ['rachel-kim', 'lpa-docs', 'firm'] }
    ],
    workflows: [
      { id: 'wf-rent-roll', label: 'Rent Roll Extract', sub: 'Active', facts: [
        'Automated Yardi CSV extraction and formatting',
        'Runs daily at 6:00 AM',
        '98.2% success rate across 142 runs'
      ], related: ['rent-rolls', 'yardi', 'hilgard'] },
      { id: 'wf-k1', label: 'K-1 Processing', sub: 'Active', facts: [
        'Extracts and validates K-1 tax documents',
        'Runs on document upload trigger',
        'Flags anomalies for manual review'
      ], related: ['k1-docs', 'fund-iii', 'lp-group'] },
      { id: 'wf-waterfall', label: 'LP Waterfall', sub: 'Active', facts: [
        'Calculates LP distribution waterfall',
        'European waterfall logic per LPA terms',
        'Handles catch-up, clawback, and GP commit'
      ], related: ['lpa-docs', 'fund-iii', 'dist-notices'] },
      { id: 'wf-fees', label: 'Fee Calculator', sub: 'Active', facts: [
        'Management fee calculation engine',
        '2% on committed during investment period',
        'Switches to invested capital post-period'
      ], related: ['fund-iii', 'hilgard', 'erabor'] },
      { id: 'wf-nav-calc', label: 'NAV Calculator', sub: 'Active', facts: [
        'Quarterly NAV calculation across all funds',
        'Pulls from Yardi, Citco, and manual inputs',
        'Reconciliation tolerance: 0.1%'
      ], related: ['elena-vasquez', 'admin-citco', 'valuation-reports'] },
      { id: 'wf-cap-call', label: 'Capital Call Gen', sub: 'Active', facts: [
        'Generates capital call notices from templates',
        'Auto-calculates pro-rata LP amounts',
        'Sends via DocuSign for e-signature'
      ], related: ['cap-call-docs', 'lp-group', 'elena-vasquez'] },
      { id: 'wf-compliance', label: 'Compliance Monitor', sub: 'Active', facts: [
        'Monitors regulatory filing deadlines',
        'Alerts 30/15/7 days before due dates',
        'Tracks SEC, CFTC, state blue sky'
      ], related: ['compliance-docs', 'rachel-kim'] },
      { id: 'wf-lp-portal', label: 'LP Portal Sync', sub: 'Active', facts: [
        'Syncs documents to investor portal',
        'Auto-publishes quarterly reports on approval',
        'Tracks LP download activity'
      ], related: ['qtr-reports', 'david-park', 'salesforce'] },
      { id: 'wf-reconcile', label: 'Bank Reconciliation', sub: 'Active', facts: [
        'Daily bank statement reconciliation',
        'Matches capital calls and distributions',
        'Escalates unmatched items after 3 days'
      ], related: ['bank-svb', 'elena-vasquez', 'wire-instructions'] },
      { id: 'wf-esg-report', label: 'ESG Reporting', sub: 'Draft', facts: [
        'Collects ESG metrics from portfolio companies',
        'SFDR Article 9 PAI indicators',
        'Annual report generation'
      ], related: ['impact-i', 'anna-kowalski', 'compliance-docs'] },
      { id: 'wf-data-room', label: 'Data Room Mgmt', sub: 'Active', facts: [
        'Manages virtual data rooms for fundraising',
        'Auto-watermarks confidential documents',
        'Tracks LP access and engagement analytics'
      ], related: ['due-diligence', 'pitch-decks', 'david-park'] },
      { id: 'wf-valuation', label: 'Valuation Pipeline', sub: 'Active', facts: [
        'Quarterly valuation workflow with approvals',
        'Draft → Review → Committee → Final pipeline',
        'Integrates third-party valuation agents'
      ], related: ['valuation-reports', 'sarah-chen', 'deloitte'] }
    ],
    systems: [
      { id: 'yardi', label: 'Yardi Voyager', sub: 'Property Mgmt', facts: [
        'Primary property management system',
        'CSV exports need cleanup (3 header rows, whitespace, dates)',
        'Preferred format: CSV over Excel'
      ], related: ['rent-rolls', 'wf-rent-roll', 'hilgard'] },
      { id: 'deloitte', label: 'Deloitte', sub: 'Auditor', facts: [
        'External audit firm',
        'Fiscal year ends March 31',
        'Audit partner: James Whitfield'
      ], related: ['james-whitfield', 'fund-iii', 'sarah-chen'] },
      { id: 'salesforce', label: 'Salesforce', sub: 'CRM', facts: [
        'LP relationship management',
        'Tracks commitments, communications, meetings',
        'Syncs with quarterly reporting workflow'
      ], related: ['lp-group', 'qtr-reports', 'david-park'] },
      { id: 'snowflake', label: 'Snowflake', sub: 'Data Warehouse', facts: [
        'Central data warehouse for analytics',
        'Ingests from Yardi, Salesforce, Citco',
        'Powers Tableau dashboards and Cosimo queries'
      ], related: ['tom-brennan', 'tableau', 'yardi'] },
      { id: 'tableau', label: 'Tableau', sub: 'BI / Dashboards', facts: [
        'Business intelligence and visualization',
        'Fund performance, portfolio, LP dashboards',
        'Embedded in LP portal'
      ], related: ['snowflake', 'tom-brennan', 'qtr-reports'] },
      { id: 'bank-svb', label: 'First Republic', sub: 'Banking', facts: [
        'Primary banking relationship (formerly SVB)',
        'Fund-level accounts, escrow services',
        'Wire processing SLA: same day before 2pm'
      ], related: ['wire-instructions', 'credit-ii', 'wf-reconcile'] },
      { id: 'docusign', label: 'DocuSign', sub: 'E-Signature', facts: [
        'Electronic signature platform',
        'Used for capital calls, side letters, LPAs',
        'Integrated with workflow automation'
      ], related: ['wf-cap-call', 'side-letters', 'cap-call-docs'] },
      { id: 'box', label: 'Box', sub: 'File Storage', facts: [
        'Enterprise file storage and sharing',
        'Folder structure mirrors fund hierarchy',
        'Retention policy: 10 years post-fund termination'
      ], related: ['tom-brennan', 'due-diligence', 'wf-data-room'] },
      { id: 'outlook', label: 'Outlook / M365', sub: 'Email & Calendar', facts: [
        'Microsoft 365 email and calendar',
        'Shared calendars for fund deadlines',
        'Archive policy: 7 years'
      ], related: ['tom-brennan', 'salesforce', 'marcus-webb'] }
    ],
    entities: [
      { id: 'firm', label: 'The Firm', sub: 'Mid-Market PE', facts: [
        'Mid-market private equity firm',
        '11 active funds across RE, infra, credit, growth, venture',
        '50+ LP investors, ~$2.8B total AUM',
        'Founded 2008, 45 employees'
      ], related: ['fund-iii', 'hilgard', 'erabor', 'opp-iv', 'sarah-chen', 'growth-i'] },
      { id: 'fiscal-year', label: 'Fiscal Year', sub: 'Ends Mar 31', facts: [
        'Fiscal year ends March 31',
        'Audit cycle runs April-June',
        'Quarterly reporting: Jun, Sep, Dec, Mar'
      ], related: ['deloitte', 'qtr-reports'] },
      { id: 'fee-structure', label: 'Fee Structure', sub: '2/20 Standard', facts: [
        '2% management fee / 20% carried interest',
        'European waterfall across most funds',
        '8% preferred return, then GP catch-up',
        'Venture fund: 2.5/25 with no pref'
      ], related: ['fund-iii', 'hilgard', 'erabor', 'lpa-docs', 'wf-fees'] },
      { id: 'prop-berkshire', label: 'Berkshire Complex', sub: 'Multifamily', facts: [
        '320-unit multifamily, Fund III portfolio',
        'Acquired 2020, $62M basis',
        'Current NOI: $4.8M, 94% occupied'
      ], related: ['fund-iii', 'rent-rolls', 'yardi'] },
      { id: 'prop-marina', label: 'Marina Industrial', sub: 'Industrial', facts: [
        '480K SF industrial park, Fund III',
        '12 tenants, triple-net leases',
        'Cap rate at acquisition: 5.8%'
      ], related: ['fund-iii', 'yardi'] },
      { id: 'prop-hilgard-apt', label: 'Hilgard Apartments', sub: 'Multifamily', facts: [
        '210-unit luxury apartments',
        'Flagship Hilgard Fund asset',
        'Value-add renovation 80% complete'
      ], related: ['hilgard', 'rent-rolls', 'yardi'] },
      { id: 'portfolio-saas', label: 'CloudMetrics', sub: 'SaaS / Growth I', facts: [
        'B2B SaaS analytics platform',
        'Growth I portfolio company, Series C',
        '$18M ARR, 130% net retention'
      ], related: ['growth-i', 'valuation-reports'] },
      { id: 'portfolio-fintech', label: 'PayBridge', sub: 'Fintech / Growth I', facts: [
        'Payment processing for SMBs',
        '$42M revenue, EBITDA positive',
        'Potential exit target — strategic interest'
      ], related: ['growth-i', 'seed-ventures', 'valuation-reports'] },
      { id: 'portfolio-climate', label: 'GreenGrid', sub: 'CleanTech / Impact', facts: [
        'Grid-scale battery storage developer',
        'Impact I portfolio, 3 projects operational',
        '200MW pipeline, DOE loan guarantee pending'
      ], related: ['impact-i', 'infra-fund', 'anna-kowalski'] },
      { id: 'benchmark-pe', label: 'PE Benchmarks', sub: 'Cambridge / Preqin', facts: [
        'Cambridge Associates PE benchmark data',
        'Preqin peer fund comparisons',
        'Updated quarterly, used in LP reports'
      ], related: ['qtr-reports', 'david-park', 'tableau'] },
      { id: 'market-data', label: 'Market Data', sub: 'CoStar / PitchBook', facts: [
        'CoStar real estate market data',
        'PitchBook PE deal flow and valuations',
        'MSCI climate risk data for ESG'
      ], related: ['anna-kowalski', 'board-decks', 'due-diligence'] },
      { id: 'carry-plan', label: 'Carry Plan', sub: 'GP Economics', facts: [
        'Carried interest allocation plan',
        'Points allocated across 12 senior team members',
        'Vesting: 4-year cliff, fund-by-fund'
      ], related: ['fee-structure', 'firm', 'sarah-chen'] },
      { id: 'succession-plan', label: 'Succession Plan', sub: 'Key Person', facts: [
        'Key person provisions per LPA',
        'Succession committee: 3 senior partners',
        'Insurance: $10M key person policy'
      ], related: ['firm', 'rachel-kim', 'insurance-docs'] },
      { id: 'esg-framework', label: 'ESG Framework', sub: 'UN PRI Signatory', facts: [
        'UN PRI signatory since 2021',
        'Annual PRI assessment score: 4/5',
        'TCFD-aligned climate disclosure'
      ], related: ['impact-i', 'wf-esg-report', 'compliance-docs'] }
    ]
  }
};

// Find an entity across all categories
function findEntity(entityId) {
  for (var cat in MOCK_GRAPH_DATA.nodes) {
    var nodes = MOCK_GRAPH_DATA.nodes[cat];
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].id === entityId) return { node: nodes[i], category: cat };
    }
  }
  return null;
}

// SVG namespace
var SVG_NS = 'http://www.w3.org/2000/svg';

// ---- PERSISTENT SVG GRAPH ENGINE ----
// All nodes are rendered once. Navigation = animating transforms/opacity.

var graphBuilt = false;
var graphW = 0, graphH = 0, graphCX = 0, graphCY = 0;
var graphNodeEls = {};   // id -> { g, homeX, homeY, homeR }
var graphEdgeEls = [];
var driftRAF = null;
var driftItems = [];
var ANIM = 500; // ms for transitions

function buildGraph() {
  var container = document.getElementById('graphContainer');
  var svg = document.getElementById('graphSvg');
  graphW = container.offsetWidth;
  graphH = container.offsetHeight;

  if (graphW < 10 || graphH < 10) {
    setTimeout(buildGraph, 100);
    return;
  }

  graphCX = graphW / 2;
  graphCY = graphH / 2;
  svg.setAttribute('viewBox', '0 0 ' + graphW + ' ' + graphH);

  // Clear
  svg.innerHTML = '';
  graphNodeEls = {};
  graphEdgeEls = [];

  // --- Defs ---
  var defs = document.createElementNS(SVG_NS, 'defs');
  for (var cid in graphColors) {
    var gc = graphColors[cid];
    // Glow filter
    var f = document.createElementNS(SVG_NS, 'filter');
    f.setAttribute('id', 'glow-' + cid);
    f.setAttribute('x', '-80%'); f.setAttribute('y', '-80%');
    f.setAttribute('width', '260%'); f.setAttribute('height', '260%');
    var blur = document.createElementNS(SVG_NS, 'feGaussianBlur');
    blur.setAttribute('in', 'SourceGraphic'); blur.setAttribute('stdDeviation', '6'); blur.setAttribute('result', 'b');
    var cm = document.createElementNS(SVG_NS, 'feColorMatrix');
    cm.setAttribute('in', 'b'); cm.setAttribute('type', 'matrix');
    cm.setAttribute('values', '1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0');
    var merge = document.createElementNS(SVG_NS, 'feMerge');
    var mn1 = document.createElementNS(SVG_NS, 'feMergeNode');
    var mn2 = document.createElementNS(SVG_NS, 'feMergeNode');
    mn2.setAttribute('in', 'SourceGraphic');
    merge.appendChild(mn1); merge.appendChild(mn2);
    f.appendChild(blur); f.appendChild(cm); f.appendChild(merge);
    defs.appendChild(f);

    // Gradient
    var grad = document.createElementNS(SVG_NS, 'radialGradient');
    grad.setAttribute('id', 'grad-' + cid);
    grad.setAttribute('cx', '38%'); grad.setAttribute('cy', '32%'); grad.setAttribute('r', '60%');
    grad.setAttribute('fx', '35%'); grad.setAttribute('fy', '28%');
    [[0,'#fff',0.25],[25,gc.core,1],[75,gc.mid,1],[100,gc.dim,1]].forEach(function(s) {
      var stop = document.createElementNS(SVG_NS, 'stop');
      stop.setAttribute('offset', s[0] + '%');
      stop.setAttribute('stop-color', s[1]);
      stop.setAttribute('stop-opacity', s[2]);
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
  }
  svg.appendChild(defs);

  // --- Background click layer ---
  var bgRect = document.createElementNS(SVG_NS, 'rect');
  bgRect.setAttribute('width', graphW); bgRect.setAttribute('height', graphH);
  bgRect.setAttribute('fill', 'transparent');
  bgRect.style.cursor = 'default';
  bgRect.addEventListener('click', function() {
    if (graphState.level === 'cluster') graphNavigate('root');
  });
  svg.appendChild(bgRect);

  // --- Edges layer ---
  var edgesG = document.createElementNS(SVG_NS, 'g');
  edgesG.setAttribute('id', 'graphEdges');
  svg.appendChild(edgesG);

  // --- Tether line (YOU → active category, shown in cluster view) ---
  var tether = document.createElementNS(SVG_NS, 'line');
  tether.setAttribute('id', 'graphTether');
  tether.setAttribute('x1', graphCX); tether.setAttribute('y1', graphCY);
  tether.setAttribute('x2', graphCX); tether.setAttribute('y2', graphCY);
  tether.setAttribute('stroke', 'rgba(180,120,216,0.5)');
  tether.setAttribute('stroke-width', '1.5');
  tether.setAttribute('stroke-dasharray', '6,4');
  tether.style.opacity = '0';
  tether.style.transition = 'opacity ' + ANIM + 'ms ease';
  edgesG.appendChild(tether);

  // --- Orbital rings ---
  var orbitG = document.createElementNS(SVG_NS, 'g');
  orbitG.setAttribute('id', 'graphOrbits');
  var cats = MOCK_GRAPH_DATA.categories;
  var rootRadius = Math.min(graphCX, graphCY) * 0.52;

  var orbit = document.createElementNS(SVG_NS, 'circle');
  orbit.setAttribute('cx', graphCX); orbit.setAttribute('cy', graphCY);
  orbit.setAttribute('r', rootRadius); orbit.setAttribute('fill', 'none');
  orbit.setAttribute('stroke', 'rgba(255,255,255,0.04)'); orbit.setAttribute('stroke-width', '1');
  orbit.setAttribute('stroke-dasharray', '4,8');
  orbitG.appendChild(orbit);
  svg.appendChild(orbitG);

  // --- Build edges (center to each category) ---
  var catPositions = {};
  for (var i = 0; i < cats.length; i++) {
    var angle = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
    catPositions[cats[i].id] = {
      x: graphCX + Math.cos(angle) * rootRadius,
      y: graphCY + Math.sin(angle) * rootRadius
    };

    var edge = makeEdge(graphCX, graphCY, catPositions[cats[i].id].x, catPositions[cats[i].id].y, graphColors[cats[i].id].core, 0.2);
    edge.dataset.type = 'root-edge';
    edge.dataset.cat = cats[i].id;
    edgesG.appendChild(edge);
    graphEdgeEls.push(edge);
  }

  // Cross-connections
  var crossLinks = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,4],[2,5],[3,4],[0,5],[1,5]];
  for (var c = 0; c < crossLinks.length; c++) {
    var aId = cats[crossLinks[c][0]].id, bId = cats[crossLinks[c][1]].id;
    var a = catPositions[aId], b = catPositions[bId];
    var xedge = makeEdge(a.x, a.y, b.x, b.y, 'rgba(255,255,255,0.06)', 0.06);
    xedge.dataset.type = 'cross-edge';
    edgesG.appendChild(xedge);
    graphEdgeEls.push(xedge);
  }

  // --- Nodes layer ---
  var nodesG = document.createElementNS(SVG_NS, 'g');
  nodesG.setAttribute('id', 'graphNodes');
  svg.appendChild(nodesG);

  // --- Center YOU node ---
  var youNode = makeNode('you', 'YOU', '', graphCX, graphCY, 28, 'you', true);
  youNode.g.addEventListener('click', function() { graphNavigate('root'); });
  nodesG.appendChild(youNode.g);
  graphNodeEls['you'] = { g: youNode.g, homeX: graphCX, homeY: graphCY, homeR: 28, catId: null, type: 'center' };

  // --- Category nodes ---
  for (var i = 0; i < cats.length; i++) {
    var cat = cats[i];
    var pos = catPositions[cat.id];
    var nodeR = 20 + Math.min(cat.count, 20) * 0.6;

    var cn = makeNode(cat.id, cat.label, cat.count + ' items', pos.x, pos.y, nodeR, cat.id, false, cat.count);
    (function(catId) {
      cn.g.addEventListener('click', function() { graphNavigate(catId); });
    })(cat.id);

    nodesG.appendChild(cn.g);
    graphNodeEls[cat.id] = { g: cn.g, homeX: pos.x, homeY: pos.y, homeR: nodeR, catId: cat.id, type: 'category' };

    // --- Child entity nodes (initially hidden, positioned at parent) ---
    var childNodes = MOCK_GRAPH_DATA.nodes[cat.id] || [];
    // Distribute across rings — fewer per ring for readability
    var maxPerRing = 7;
    var ringCount = Math.ceil(childNodes.length / maxPerRing);
    var minDim = Math.min(graphCX, graphCY);
    var baseChildR = minDim * 0.45;
    var ringSpacing = minDim * 0.22;

    for (var j = 0; j < childNodes.length; j++) {
      var cNode = childNodes[j];
      var ringIdx = Math.floor(j / maxPerRing);
      var posInRing = j - ringIdx * maxPerRing;
      var nodesInThisRing = Math.min(maxPerRing, childNodes.length - ringIdx * maxPerRing);
      var childRadius = baseChildR + ringIdx * ringSpacing;
      var cAngle = (posInRing / nodesInThisRing) * Math.PI * 2 - Math.PI / 2 + ringIdx * 0.35;
      var childTargetX = graphCX + Math.cos(cAngle) * childRadius;
      var childTargetY = graphCY + Math.sin(cAngle) * childRadius;
      var abbr = cNode.label.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 3);
      var childNodeR = ringIdx === 0 ? 16 : 13;

      var en = makeNode(cNode.id, cNode.label, cNode.sub, pos.x, pos.y, 0, cat.id, false, abbr);
      en.g.style.opacity = '0';
      en.g.style.pointerEvents = 'none';

      (function(entityId, catId) {
        en.g.addEventListener('click', function() { openGraphEntity(entityId, catId); });
      })(cNode.id, cat.id);

      nodesG.appendChild(en.g);
      graphNodeEls[cNode.id] = {
        g: en.g, homeX: childTargetX, homeY: childTargetY, homeR: childNodeR,
        parentX: pos.x, parentY: pos.y,
        catId: cat.id, type: 'entity'
      };

      // Edges from category center to child (hidden initially)
      var cEdge = makeEdge(graphCX, graphCY, childTargetX, childTargetY, graphColors[cat.id].core, 0.3);
      cEdge.style.opacity = '0';
      cEdge.dataset.type = 'child-edge';
      cEdge.dataset.cat = cat.id;
      edgesG.appendChild(cEdge);
      graphEdgeEls.push(cEdge);
    }
  }

  // --- Inter-entity edges (connections between child nodes within a category) ---
  for (var ci = 0; ci < cats.length; ci++) {
    var catChildren = MOCK_GRAPH_DATA.nodes[cats[ci].id] || [];
    var catChildIds = {};
    catChildren.forEach(function(cn) { catChildIds[cn.id] = true; });

    for (var cj = 0; cj < catChildren.length; cj++) {
      var child = catChildren[cj];
      if (!child.related) continue;
      for (var ri = 0; ri < child.related.length; ri++) {
        var relId = child.related[ri];
        // Only draw if the related node is in the SAME category and avoid duplicates (only draw a→b where a < b)
        if (!catChildIds[relId]) continue;
        if (child.id >= relId) continue;
        var ndA = graphNodeEls[child.id];
        var ndB = graphNodeEls[relId];
        if (!ndA || !ndB) continue;
        var ie = makeEdge(ndA.homeX, ndA.homeY, ndB.homeX, ndB.homeY, graphColors[cats[ci].id].core, 0.15);
        ie.style.opacity = '0';
        ie.dataset.type = 'inter-edge';
        ie.dataset.cat = cats[ci].id;
        edgesG.appendChild(ie);
        graphEdgeEls.push(ie);
      }
    }
  }

  // --- Cross-category related edges (dimmer, show in cluster view) ---
  for (var ci2 = 0; ci2 < cats.length; ci2++) {
    var catNodes2 = MOCK_GRAPH_DATA.nodes[cats[ci2].id] || [];
    for (var cn2 = 0; cn2 < catNodes2.length; cn2++) {
      var cNode2 = catNodes2[cn2];
      if (!cNode2.related) continue;
      for (var ri2 = 0; ri2 < cNode2.related.length; ri2++) {
        var rId2 = cNode2.related[ri2];
        // Check if this related entity is in a DIFFERENT category
        var relFound = findEntity(rId2);
        if (!relFound || relFound.category === cats[ci2].id) continue;
        if (cNode2.id >= rId2) continue; // avoid duplicates
        var ndC = graphNodeEls[cNode2.id];
        var ndD = graphNodeEls[rId2];
        if (!ndC || !ndD) continue;
        var xe = makeEdge(ndC.homeX, ndC.homeY, ndD.homeX, ndD.homeY, 'rgba(255,255,255,0.08)', 0.08);
        xe.style.opacity = '0';
        xe.dataset.type = 'cross-entity-edge';
        xe.dataset.srcCat = cats[ci2].id;
        xe.dataset.dstCat = relFound.category;
        edgesG.appendChild(xe);
        graphEdgeEls.push(xe);
      }
    }
  }

  graphBuilt = true;
  applyRootState(false);
  startDriftLoop(svg);
}

function makeEdge(x1, y1, x2, y2, color, opacity) {
  var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  var dx = x2 - x1, dy = y2 - y1;
  var nx = -dy * 0.08, ny = dx * 0.08;
  var d = 'M' + x1 + ',' + y1 + ' Q' + (mx + nx) + ',' + (my + ny) + ' ' + x2 + ',' + y2;

  var path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '1');
  path.style.opacity = opacity;
  path.style.transition = 'opacity ' + ANIM + 'ms ease';
  return path;
}

function makeNode(id, label, sub, x, y, r, colorId, isCenter, innerText) {
  var col = graphColors[colorId];
  var g = document.createElementNS(SVG_NS, 'g');
  g.setAttribute('data-node-id', id);
  g.style.cursor = 'pointer';
  g.style.transition = 'opacity ' + ANIM + 'ms ease';

  // We use a nested <g> for position so we can animate it
  var posG = document.createElementNS(SVG_NS, 'g');
  posG.setAttribute('data-pos', '1');
  posG.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  g.appendChild(posG);

  // Glow circle
  var glow = document.createElementNS(SVG_NS, 'circle');
  glow.setAttribute('cx', 0); glow.setAttribute('cy', 0);
  glow.setAttribute('fill', 'url(#grad-' + colorId + ')');
  glow.setAttribute('filter', 'url(#glow-' + colorId + ')');
  glow.style.r = r + 'px';
  posG.appendChild(glow);

  // Body circle
  var body = document.createElementNS(SVG_NS, 'circle');
  body.setAttribute('cx', 0); body.setAttribute('cy', 0);
  body.setAttribute('fill', 'url(#grad-' + colorId + ')');
  body.style.r = r + 'px';
  posG.appendChild(body);

  // Edge highlight
  var edge = document.createElementNS(SVG_NS, 'circle');
  edge.setAttribute('cx', 0); edge.setAttribute('cy', 0);
  edge.setAttribute('fill', 'none'); edge.setAttribute('stroke', 'rgba(255,255,255,0.12)');
  edge.setAttribute('stroke-width', '1');
  edge.style.r = r + 'px';
  posG.appendChild(edge);

  // Store circle refs for animation
  g._circles = [glow, body, edge];
  g._posG = posG;

  // Inner text
  if (innerText !== undefined && innerText !== '') {
    var txt = document.createElementNS(SVG_NS, 'text');
    txt.setAttribute('x', 0); txt.setAttribute('y', 0);
    txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dominant-baseline', 'central');
    txt.setAttribute('fill', 'rgba(255,255,255,0.85)');
    txt.setAttribute('font-family', "'IBM Plex Mono', monospace");
    txt.setAttribute('font-size', isCenter ? '11' : Math.max(9, r * 0.5));
    txt.setAttribute('font-weight', '700');
    txt.setAttribute('pointer-events', 'none');
    txt.textContent = innerText;
    posG.appendChild(txt);
    g._innerText = txt;
  }

  // Label below
  var lbl = document.createElementNS(SVG_NS, 'text');
  lbl.setAttribute('x', 0); lbl.setAttribute('y', r + 16);
  lbl.setAttribute('text-anchor', 'middle');
  lbl.setAttribute('fill', 'rgba(255,255,255,0.7)');
  lbl.setAttribute('font-family', "'IBM Plex Mono', monospace");
  lbl.setAttribute('font-size', '10'); lbl.setAttribute('font-weight', '600');
  lbl.setAttribute('pointer-events', 'none');
  lbl.textContent = label;
  posG.appendChild(lbl);
  g._label = lbl;

  // Sub label
  if (sub) {
    var slbl = document.createElementNS(SVG_NS, 'text');
    slbl.setAttribute('x', 0); slbl.setAttribute('y', r + 28);
    slbl.setAttribute('text-anchor', 'middle');
    slbl.setAttribute('fill', 'rgba(255,255,255,0.3)');
    slbl.setAttribute('font-family', "'IBM Plex Mono', monospace");
    slbl.setAttribute('font-size', '9');
    slbl.setAttribute('pointer-events', 'none');
    slbl.textContent = sub;
    posG.appendChild(slbl);
    g._subLabel = slbl;
  }

  // Hover tooltip
  g.addEventListener('mouseenter', function(e) {
    var tip = label + (sub ? ' \u00b7 ' + sub : '');
    showGraphTooltip(g, tip);
  });
  g.addEventListener('mouseleave', hideGraphTooltip);

  return { g: g };
}

function animateNode(nodeData, toX, toY, toR, toOpacity, delay) {
  var g = nodeData.g;
  var posG = g._posG;
  var circles = g._circles;
  var easing = 'cubic-bezier(0.34, 1, 0.64, 1)';

  setTimeout(function() {
    // Animate position via CSS transform (animatable)
    posG.style.transition = 'transform ' + ANIM + 'ms ' + easing;
    posG.style.transform = 'translate(' + toX + 'px,' + toY + 'px)';

    // Animate radius via CSS r property (animatable)
    circles.forEach(function(c) {
      c.style.transition = 'r ' + ANIM + 'ms ' + easing;
      c.style.r = toR + 'px';
    });

    // Animate opacity
    g.style.opacity = toOpacity;

    // Update label offsets
    if (g._label) {
      g._label.setAttribute('y', toR + 14);
      g._label.style.opacity = toR < 10 ? '0' : '1';
    }
    if (g._subLabel) {
      g._subLabel.setAttribute('y', toR + 25);
      // Hide sub-label on small nodes to reduce clutter
      g._subLabel.style.opacity = toR < 18 ? '0' : '1';
    }
    if (g._innerText) {
      g._innerText.setAttribute('font-size', Math.max(8, toR * 0.45));
    }

    // Pointer events
    g.style.pointerEvents = toOpacity > 0.1 ? 'auto' : 'none';
  }, delay || 0);
}

function applyRootState(animated) {
  var cats = MOCK_GRAPH_DATA.categories;
  var d = animated ? 0 : -1; // -1 means instant

  // Edges
  graphEdgeEls.forEach(function(edge) {
    if (!animated) edge.style.transition = 'none';
    else edge.style.transition = 'opacity ' + ANIM + 'ms ease';

    if (edge.dataset.type === 'root-edge' || edge.dataset.type === 'cross-edge') {
      edge.style.opacity = edge.dataset.type === 'root-edge' ? '0.2' : '0.06';
    } else {
      edge.style.opacity = '0';
    }
  });

  // Helper to disable transitions for instant positioning
  function setInstant(nd) {
    nd.g.style.transition = 'none';
    nd.g._posG.style.transition = 'none';
    nd.g._circles.forEach(function(c) { c.style.transition = 'none'; });
  }

  // YOU node — center, full size
  var youD = graphNodeEls['you'];
  if (!animated) setInstant(youD);
  animateNode(youD, graphCX, graphCY, 28, 1, 0);
  youD.g.classList.remove('is-home');

  // Hide tether
  var tether = document.getElementById('graphTether');
  if (!animated) tether.style.transition = 'none';
  else tether.style.transition = 'opacity ' + ANIM + 'ms ease';
  tether.style.opacity = '0';

  // Category nodes — orbital positions, full size
  cats.forEach(function(cat, i) {
    var nd = graphNodeEls[cat.id];
    if (!animated) setInstant(nd);
    animateNode(nd, nd.homeX, nd.homeY, nd.homeR, 1, animated ? i * 40 : 0);
  });

  // Entity nodes — collapse to parent, hidden
  for (var nid in graphNodeEls) {
    var nd = graphNodeEls[nid];
    if (nd.type !== 'entity') continue;
    if (!animated) setInstant(nd);
    animateNode(nd, nd.parentX, nd.parentY, 0, 0, 0);
  }

  // Background cursor
  document.querySelector('#graphSvg rect').style.cursor = 'default';
}

function applyClusterState(catId) {
  var cats = MOCK_GRAPH_DATA.categories;
  var col = graphColors[catId];

  // Edges — hide root edges, show child + inter-entity edges for this category
  graphEdgeEls.forEach(function(edge) {
    edge.style.transition = 'opacity ' + ANIM + 'ms ease';
    if (edge.dataset.type === 'child-edge' && edge.dataset.cat === catId) {
      edge.style.opacity = '0.2';
    } else if (edge.dataset.type === 'inter-edge' && edge.dataset.cat === catId) {
      edge.style.opacity = '0.15';
    } else if (edge.dataset.type === 'root-edge' && edge.dataset.cat === catId) {
      edge.style.opacity = '0.15';
    } else {
      edge.style.opacity = '0';
    }
  });

  // YOU node — move to top-left corner as a small "home" bubble
  var youD = graphNodeEls['you'];
  animateNode(youD, 50, 50, 18, 0.85, 0);
  youD.g.classList.add('is-home');

  // Tether line from YOU bubble to center category
  var tether = document.getElementById('graphTether');
  tether.setAttribute('stroke', col.glow.replace(/[\d.]+\)$/, '0.6)'));
  tether.setAttribute('x1', 50); tether.setAttribute('y1', 50);
  tether.setAttribute('x2', graphCX); tether.setAttribute('y2', graphCY);
  tether.style.opacity = '1';

  // Category nodes — clicked one moves to center and grows, others shrink to edges
  var otherIdx = 0;
  var otherCats = cats.filter(function(c) { return c.id !== catId; });
  var edgeR = Math.min(graphCX, graphCY) * 0.85;

  cats.forEach(function(cat) {
    var nd = graphNodeEls[cat.id];
    if (cat.id === catId) {
      // Animate to center, slightly smaller so children have room
      animateNode(nd, graphCX, graphCY, 24, 1, 0);
    } else {
      // Animate to periphery, shrink
      var angle = (otherIdx / otherCats.length) * Math.PI * 2 - Math.PI * 0.3;
      var ex = graphCX + Math.cos(angle) * edgeR;
      var ey = graphCY + Math.sin(angle) * edgeR;
      animateNode(nd, ex, ey, 8, 0.35, 0);
      otherIdx++;
    }
  });

  // Entity nodes for this category — expand from center to orbital positions
  var childNodes = MOCK_GRAPH_DATA.nodes[catId] || [];
  childNodes.forEach(function(cNode, i) {
    var nd = graphNodeEls[cNode.id];
    if (nd) {
      animateNode(nd, nd.homeX, nd.homeY, nd.homeR, 1, 80 + i * 35);
    }
  });

  // Entity nodes for OTHER categories — ensure hidden
  for (var nid in graphNodeEls) {
    var nd = graphNodeEls[nid];
    if (nd.type === 'entity' && nd.catId !== catId) {
      animateNode(nd, nd.parentX, nd.parentY, 0, 0, 0);
    }
  }

  // Background cursor
  document.querySelector('#graphSvg rect').style.cursor = 'pointer';
}

function graphNavigate(target) {
  closeGraphDetail();
  hideGraphTooltip();

  if (target === 'root') {
    graphState.level = 'root';
    graphState.currentCategory = null;
    graphState.currentEntity = null;
    updateBreadcrumb();
    applyRootState(true);
  } else {
    graphState.level = 'cluster';
    graphState.currentCategory = target;
    graphState.currentEntity = null;
    updateBreadcrumb();
    applyClusterState(target);
  }
}

function openGraphEntity(entityId, categoryId) {
  graphState.currentEntity = entityId;
  var found = findEntity(entityId);
  if (!found) return;

  var node = found.node;
  var col = graphColors[found.category];

  updateBreadcrumb();

  document.getElementById('graphDetailName').textContent = node.label;
  document.getElementById('graphDetailType').textContent = node.sub;

  var iconEl = document.getElementById('graphDetailIcon');
  iconEl.style.background = col.core;
  iconEl.style.borderColor = col.dim;
  iconEl.style.color = '#fff';
  iconEl.innerHTML = '&#9670;';

  var factsHtml = '';
  for (var i = 0; i < node.facts.length; i++) {
    factsHtml += '<div class="graph-fact-row"><span class="graph-fact-bullet">\u2022</span><span class="graph-fact-text">' + escapeHtml(node.facts[i]) + '</span></div>';
  }
  document.getElementById('graphDetailFacts').innerHTML = factsHtml;

  var relHtml = '';
  for (var i = 0; i < node.related.length; i++) {
    var rel = findEntity(node.related[i]);
    if (rel) {
      relHtml += '<button class="graph-related-pill" onclick="navigateToRelated(\'' + rel.node.id + '\', \'' + rel.category + '\')">' + escapeHtml(rel.node.label) + '</button>';
    }
  }
  document.getElementById('graphDetailRelated').innerHTML = relHtml;

  // Highlight the clicked node
  var nd = graphNodeEls[entityId];
  if (nd) {
    nd.g._circles[2].setAttribute('stroke', 'rgba(255,255,255,0.5)');
    nd.g._circles[2].setAttribute('stroke-width', '2');
  }

  document.getElementById('graphDetailPane').classList.add('open');
}

function closeGraphDetail() {
  document.getElementById('graphDetailPane').classList.remove('open');

  // Un-highlight any selected node
  if (graphState.currentEntity) {
    var nd = graphNodeEls[graphState.currentEntity];
    if (nd) {
      nd.g._circles[2].setAttribute('stroke', 'rgba(255,255,255,0.12)');
      nd.g._circles[2].setAttribute('stroke-width', '1');
    }
  }

  graphState.currentEntity = null;
  updateBreadcrumb();
}

function navigateToRelated(entityId, categoryId) {
  // Un-highlight current
  closeGraphDetail();

  if (categoryId !== graphState.currentCategory) {
    graphState.level = 'cluster';
    graphState.currentCategory = categoryId;
    updateBreadcrumb();
    applyClusterState(categoryId);
    setTimeout(function() {
      openGraphEntity(entityId, categoryId);
    }, ANIM + 50);
  } else {
    setTimeout(function() {
      openGraphEntity(entityId, categoryId);
    }, 100);
  }
}

function updateBreadcrumb() {
  var bc = document.getElementById('graphBreadcrumb');
  var html = '<button class="graph-crumb' + (graphState.level === 'root' ? ' active' : '') + '" onclick="graphNavigate(\'root\')">You</button>';

  if (graphState.currentCategory) {
    var cat = MOCK_GRAPH_DATA.categories.find(function(c) { return c.id === graphState.currentCategory; });
    html += '<span class="graph-crumb-sep">&rsaquo;</span>';
    html += '<button class="graph-crumb' + (!graphState.currentEntity ? ' active' : '') + '" onclick="graphNavigate(\'' + graphState.currentCategory + '\')">' + (cat ? cat.label : '') + '</button>';
  }

  if (graphState.currentEntity) {
    var found = findEntity(graphState.currentEntity);
    if (found) {
      html += '<span class="graph-crumb-sep">&rsaquo;</span>';
      html += '<button class="graph-crumb active">' + found.node.label + '</button>';
    }
  }

  bc.innerHTML = html;
}

function showGraphTooltip(nodeG, text) {
  var tip = document.getElementById('graphTooltip');
  var container = document.getElementById('graphContainer');
  var cr = container.getBoundingClientRect();
  var svg = document.getElementById('graphSvg');
  var vb = svg.viewBox.baseVal;
  var sx = cr.width / (vb.width || cr.width);
  var sy = cr.height / (vb.height || cr.height);

  var posG = nodeG._posG || nodeG.querySelector('[data-pos]');
  if (posG) {
    var t = posG.style.transform || posG.getAttribute('transform') || '';
    var m = t.match(/translate\(([\d.\-]+)(?:px)?\s*,\s*([\d.\-]+)(?:px)?\)/);
    if (m) {
      var ncx = parseFloat(m[1]) * sx;
      var ncy = parseFloat(m[2]) * sy;

      tip.textContent = text;
      tip.classList.add('show');

      var tipW = tip.offsetWidth;
      var left = ncx - tipW / 2;
      if (left < 4) left = 4;
      if (left + tipW > cr.width - 4) left = cr.width - tipW - 4;
      tip.style.left = left + 'px';
      tip.style.top = (ncy - 40) + 'px';
    }
  }
}

function hideGraphTooltip() {
  document.getElementById('graphTooltip').classList.remove('show');
}

// Drift animation
function startDriftLoop(svg) {
  if (driftRAF) cancelAnimationFrame(driftRAF);
  driftItems = [];

  // Collect all position groups
  var allPosGs = svg.querySelectorAll('[data-pos]');
  allPosGs.forEach(function(pg, i) {
    driftItems.push({
      el: pg,
      phase: i * 1.1 + Math.random() * 2,
      ampX: 1.5 + Math.random() * 2,
      ampY: 1.5 + Math.random() * 2,
      speed: 0.25 + Math.random() * 0.3,
      baseTransform: null // will be read each frame
    });
  });

  var t0 = performance.now();
  function tick(now) {
    var t = (now - t0) / 1000;
    for (var i = 0; i < driftItems.length; i++) {
      var d = driftItems[i];
      // Read the current base transform (set by animations)
      var raw = d.el.style.transform || d.el.getAttribute('transform') || 'translate(0,0)';
      var m = raw.match(/translate\(([\d.\-]+)(?:px)?\s*,\s*([\d.\-]+)(?:px)?\)/);
      if (!m) continue;
      var bx = parseFloat(m[1]), by = parseFloat(m[2]);

      var dx = Math.sin(t * d.speed + d.phase) * d.ampX;
      var dy = Math.cos(t * d.speed * 0.7 + d.phase + 1) * d.ampY;

      // We DON'T overwrite transform — drift is too subtle to fight the animation.
      // Instead we only apply drift when no CSS transition is active.
      // The visual drift is small enough that it works naturally.
    }
    driftRAF = requestAnimationFrame(tick);
  }
  // Drift disabled for now to avoid fighting transitions — the animated navigation IS the motion.
  // driftRAF = requestAnimationFrame(tick);
}

function editGraphEntity() {
  if (!graphState.currentEntity) return;
  var found = findEntity(graphState.currentEntity);
  if (!found) return;
  showToast('Editing ' + found.node.label + ' — coming soon');
}

function openCosimoForEntity() {
  if (!graphState.currentEntity) return;
  var found = findEntity(graphState.currentEntity);
  if (!found) return;

  var panelName = document.querySelector('.cosimo-panel-name');
  panelName.textContent = 'Edit: ' + found.node.label;

  var panelChat = document.getElementById('panelChat');
  panelChat.innerHTML =
    '<div class="panel-msg panel-msg-ai">' +
      '<div class="panel-msg-header">' +
        '<div class="badge badge-ai" style="width:16px;height:16px;font-size:9px;">◆</div>' +
        '<span class="panel-msg-sender">Cosimo</span>' +
      '</div>' +
      'I have <strong>' + escapeHtml(found.node.label) + '</strong> loaded. I can help you:' +
      '<br><br>' +
      '<strong>"Update the fee structure details"</strong><br>' +
      '<strong>"Add a new related contact"</strong><br>' +
      '<strong>"Correct the committed capital amount"</strong><br>' +
      '<strong>"Remove outdated information"</strong>' +
    '</div>';

  openCosimoPanel();
}

// Alias for backward compat
function renderGraph() {
  if (!graphBuilt) {
    buildGraph();
  } else {
    // Rebuild on resize
    graphBuilt = false;
    buildGraph();
  }
}

// Render graph when switching to graphs section
var origSwitchBrainSection = switchBrainSection;
switchBrainSection = function(section, el) {
  origSwitchBrainSection(section, el);
  if (section === 'graphs') {
    setTimeout(function() {
      if (!graphBuilt) buildGraph();
    }, 50);
  }
};

// Re-render on resize
var graphResizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(graphResizeTimer);
  graphResizeTimer = setTimeout(function() {
    if (document.getElementById('brain-graphs').classList.contains('active')) {
      graphBuilt = false;
      buildGraph();
    }
  }, 300);
});

// Detail pane resize via drag handle
(function() {
  var handle = document.getElementById('graphDetailResize');
  if (!handle) return;
  var pane = document.getElementById('graphDetailPane');
  var container = document.getElementById('graphContainer');
  var dragging = false;
  var startY = 0;
  var startH = 0;

  handle.addEventListener('mousedown', function(e) {
    e.preventDefault();
    dragging = true;
    startY = e.clientY;
    startH = pane.offsetHeight;
    pane.style.transition = 'none';
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  });

  window.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    var containerH = container.offsetHeight;
    var newH = startH + (startY - e.clientY);
    var minH = 120;
    var maxH = containerH * 0.85;
    newH = Math.max(minH, Math.min(maxH, newH));
    pane.style.height = newH + 'px';
  });

  window.addEventListener('mouseup', function() {
    if (!dragging) return;
    dragging = false;
    pane.style.transition = '';
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
})();

function toggleCardScope(btn, e) {
  e.stopPropagation(); // Don't open the lesson detail

  var card = btn.closest('.lesson-card');
  var lessonId = card.getAttribute('data-lesson');
  var data = lessonData[lessonId];
  if (!data) return;

  data.scope = data.scope === 'company' ? 'user' : 'company';
  card.setAttribute('data-scope', data.scope);

  var badge = card.querySelector('.lesson-scope-badge');
  badge.textContent = data.scope === 'company' ? 'Company' : 'Personal';
  badge.className = 'lesson-scope-badge ' + (data.scope === 'company' ? 'scope-company' : 'scope-user');

  showToast('Scope changed to ' + (data.scope === 'company' ? 'Company' : 'Personal'));

  // Re-apply filters in case scope filter is active
  filterLessons();
}
