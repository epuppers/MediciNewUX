// ============================================
// MODE SWITCHING
// ============================================
let currentMode = 'chat';

function switchMode(mode, btn) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

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
    // Reset to listing view
    showWorkflowListing();
  }
}

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
