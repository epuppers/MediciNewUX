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
  const chatSidebar = document.getElementById('chatSidebar');
  const workflowSidebar = document.getElementById('workflowSidebar');
  const newBtn = document.getElementById('newBtn');
  if (mode === 'chat') {
    chatView.classList.add('active');
    workflowsView.classList.remove('active');
    chatSidebar.style.display = 'block';
    workflowSidebar.style.display = 'none';
    newBtn.textContent = '+ New Thread';
  } else {
    chatView.classList.remove('active');
    workflowsView.classList.add('active');
    chatSidebar.style.display = 'none';
    workflowSidebar.style.display = 'block';
    newBtn.textContent = '+ New Workflow';
    showWorkflowListing();
  }
}

function runGlobalSearch(q) {
  if (!q.trim()) return;
  alert('Global search: "' + q + '"\n\nSearches across threads, workflows, and documents.');
}

// ============================================
// THREAD SWITCHING
// ============================================
const threadTitles = {
  fund3: 'Fund III — Allocation Drift',
  hilgard: 'Hilgard — Fee Analysis',
  q4lp: 'Q4 LP Distribution Waterfall',
  k1: 'K-1 Document Extraction',
  erabor: 'Erabor Partnership Terms'
};

const threadHasFiles = {
  fund3: false,
  hilgard: true,
  q4lp: false,
  k1: false,
  erabor: false
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
function toggleTaskPanel() {
  const tp = document.getElementById('taskPanel');
  const cp = document.getElementById('calendarPanel');
  if (cp) cp.style.display = 'none';
  if (tp) tp.style.display = tp.style.display === 'none' ? 'block' : 'none';
}

function toggleCalendarPanel() {
  const cp = document.getElementById('calendarPanel');
  const tp = document.getElementById('taskPanel');
  if (tp) tp.style.display = 'none';
  if (cp) {
    if (cp.style.display === 'none') {
      buildMiniCalendar();
      cp.style.display = 'block';
    } else {
      cp.style.display = 'none';
    }
  }
}

function toggleProfileMenu() {
  alert('Profile menu:\n• Edit Profile\n• Notification Settings\n• Integrations\n• Sign Out');
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
});

function handleNew() {
  if (currentMode === 'chat') {
    alert('New thread would start here');
  } else {
    alert('New workflow creation dialog would open here');
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
  const text = input.value.trim();
  if (!text) return;

  const chat = document.getElementById('panelChat');

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'panel-msg panel-msg-user';
  userMsg.innerHTML = `
    <div class="panel-msg-header">
      <span class="panel-msg-sender">You</span>
      <div class="badge badge-human" style="width:16px;height:16px;font-size:9px;">E</div>
    </div>
    ${escapeHtml(text)}
  `;
  chat.appendChild(userMsg);
  input.value = '';

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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
