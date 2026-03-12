// All MOCK_* and CONFIG_* data objects are in js/mock-data.js
// All SVG icons are in js/icons.js — use ICONS.name or icon(name, w, h)

// Inject icons from data-icon attributes on page load
injectIcons();

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
// THEME TOGGLE
// ============================================
(function() {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

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
// MESSAGE HOVER ACTIONS (#1)
// ============================================
(function() {
  // SVG icons — from shared ICONS object
  const icons = { copy: ICONS.copy, regen: ICONS.regen, del: ICONS.trash };

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
  const shareIcon = ICONS.share;
  const delIcon = ICONS.trash;

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
  chatSidebar.classList.add('hidden');
  workflowSidebar.classList.add('hidden');

  // Clear brain nav active state when switching modes
  document.querySelectorAll('.brain-nav-btn').forEach(b => b.classList.remove('active'));

  if (mode === 'chat') {
    chatView.classList.add('active');
    chatSidebar.classList.remove('hidden');
    newBtn.textContent = '+ New Thread';
    newBtn.classList.remove('hidden');
  } else if (mode === 'workflows') {
    workflowsView.classList.add('active');
    workflowSidebar.classList.remove('hidden');
    newBtn.textContent = '+ New Workflow';
    newBtn.classList.remove('hidden');
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
  document.getElementById('chatSidebar').classList.add('hidden');
  document.getElementById('workflowSidebar').classList.add('hidden');
  document.getElementById('newBtn').classList.add('hidden');

  // Switch brain content section
  document.querySelectorAll('.brain-section').forEach(function(s) { s.classList.remove('active'); });
  var target = document.getElementById('brain-' + section);
  if (target) target.classList.add('active');
}

function runGlobalSearch(q) {
  runGlobalSearchEnhanced(q);
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
  if (tp) tp.classList.add('hidden');
  if (cp) cp.classList.add('hidden');
  if (up) up.classList.add('hidden');
}

function toggleTaskPanel() {
  const tp = document.getElementById('taskPanel');
  const wasOpen = tp && !tp.classList.contains('hidden');
  closeAllPanels();
  if (!wasOpen && tp) tp.classList.remove('hidden');
}

function toggleCalendarPanel() {
  const cp = document.getElementById('calendarPanel');
  const wasOpen = cp && !cp.classList.contains('hidden');
  closeAllPanels();
  if (!wasOpen && cp) {
    buildMiniCalendar();
    cp.classList.remove('hidden');
  }
}

function toggleUsagePanel() {
  const up = document.getElementById('usagePanel');
  const wasOpen = up && !up.classList.contains('hidden');
  closeAllPanels();
  if (!wasOpen && up) up.classList.remove('hidden');
}

// Close top-bar dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.top-icon-btn') && !e.target.closest('.th-dropdown') && !e.target.closest('.top-profile')) {
    closeAllPanels();
    var pp = document.getElementById('profilePanel');
    if (pp) pp.classList.add('hidden');
  }
});

function toggleProfileMenu() {
  const pp = document.getElementById('profilePanel');
  const wasOpen = pp && !pp.classList.contains('hidden');
  closeAllPanels();
  if (pp) pp.classList.add('hidden');
  if (!wasOpen && pp) pp.classList.remove('hidden');
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
    if (tp) tp.classList.add('hidden');
  }
  if (!e.target.closest('#calendarBtn') && !e.target.closest('#calendarPanel')) {
    const cp = document.getElementById('calendarPanel');
    if (cp) cp.classList.add('hidden');
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
    results.classList.add('hidden');
    return;
  }

  results.classList.remove('hidden');
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
        '<div class="search-result-item" data-thread-id="' + m.id + '">' +
        m.title + '</div>'
      ).join('');
    } else {
      results.innerHTML = '<div class="search-no-results">No results for "' + escapeHtml(q) + '"</div>';
    }
  }, 200);
}

function closeSearch() {
  const results = document.getElementById('searchResults');
  if (results) results.classList.add('hidden');
}

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
// FEEDBACK BUTTONS (#9)
// ============================================
function giveFeedback(btn, type) {
  const container = btn.closest('.msg-feedback');
  container.querySelectorAll('.feedback-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  showToast(type === 'up' ? 'Thanks for the feedback' : 'Feedback noted — we\'ll improve');
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
  if (sendBtn) sendBtn.classList.toggle('hidden', show);
  if (stopBtn) stopBtn.classList.toggle('hidden', !show);
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
      thinking.classList.add('hidden');
      reasoning.classList.remove('hidden');

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
        reasoning.classList.add('hidden');
        document.getElementById('erabor-latency').classList.remove('hidden');

        eraborTimer(() => {
          reply.classList.remove('hidden');
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
  if (response) response.classList.add('hidden');

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
// WORKFLOW DETAIL
// ============================================
function showWorkflowDetail(id, el) {
  const data = MOCK_WORKFLOWS[id];
  if (!data) return;

  document.getElementById('wfDetailTitle').textContent = data.title;
  document.getElementById('wfDetailDesc').textContent = data.desc;

  document.getElementById('wfListing').classList.add('hidden');
  const detail = document.getElementById('wfDetail');
  detail.classList.remove('hidden');

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
  document.getElementById('wfListing').classList.remove('hidden');
  document.getElementById('wfDetail').classList.add('hidden');
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
      return '<span class="mem-trait-tag active">' + escapeHtml(t) + ' <span class="trait-x">&times;</span></span>';
    }).join('');
  }

  // Render preset traits (disable those that are selected)
  var traitPresets = document.getElementById('traitPresets');
  if (traitPresets) {
    traitPresets.innerHTML = MOCK_MEMORY.presetTraits.map(function(t) {
      var isSelected = MOCK_MEMORY.selectedTraits.indexOf(t) !== -1;
      return '<span class="mem-trait-tag' + (isSelected ? ' disabled' : '') + '">' + escapeHtml(t) + '</span>';
    }).join('');
  }

  // Render fact cards
  var factList = document.getElementById('memFactList');
  if (factList) {
    factList.innerHTML = MOCK_MEMORY.facts.map(function(f) {
      return '<div class="mem-fact-card" data-category="' + f.category + '">' +
        '<div class="mem-fact-top">' +
          '<span class="mem-fact-cat cat-' + f.category + '">' + f.category.charAt(0).toUpperCase() + f.category.slice(1) + '</span>' +
          '<button class="mem-fact-menu-btn">' +
            ICONS.dots +
          '</button>' +
          '<div class="mem-fact-menu">' +
            '<button class="mem-fact-edit">Edit</button>' +
            '<button class="mem-fact-delete">Delete</button>' +
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
  if (form.classList.contains('hidden')) {
    form.classList.remove('hidden');
    document.getElementById('memAddInput').focus();
  } else {
    form.classList.add('hidden');
  }
}

function cancelAddMemory() {
  document.getElementById('memAddForm').classList.add('hidden');
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
      '<button class="mem-fact-menu-btn">' +
        ICONS.dots +
      '</button>' +
      '<div class="mem-fact-menu">' +
        '<button class="mem-fact-edit">Edit</button>' +
        '<button class="mem-fact-delete">Delete</button>' +
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
  document.getElementById('memAddForm').classList.add('hidden');
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

  document.getElementById('memNoResults').classList.toggle('hidden', visibleCount > 0);
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
    '<button class="mem-delete-yes">Yes</button>' +
    '<button class="mem-delete-no">No</button>';

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
  var scopeArrowSvg = ICONS.arrowRight;
  list.innerHTML = Object.keys(MOCK_LESSONS).map(function(id) {
    var d = MOCK_LESSONS[id];
    var scopeClass = d.scope === 'company' ? 'scope-company' : 'scope-user';
    var scopeLabel = d.scope === 'company' ? 'Company' : 'Personal';
    return '<div class="lesson-card" data-scope="' + d.scope + '" data-lesson="' + id + '">' +
      '<div class="lesson-card-top">' +
        '<span class="lesson-scope-badge ' + scopeClass + '">' + scopeLabel + '</span>' +
        '<div class="lesson-card-top-right">' +
          '<span class="lesson-usage">Referenced ' + d.usage + ' times</span>' +
          '<button class="lesson-card-scope-btn" title="Change scope">' + scopeArrowSvg + '</button>' +
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

  document.getElementById('lessonNoResults').classList.toggle('hidden', visibleCount > 0);
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
  document.getElementById('lessonsListView').classList.add('hidden');
  document.getElementById('lessonDetailView').classList.remove('hidden');

  // Reset edit state
  lessonIsEditing = false;
  var editBtn = document.getElementById('lessonEditBtn');
  editBtn.innerHTML = ICONS.edit;
  editBtn.title = 'Edit Directly';
  editBtn.classList.remove('primary');
  document.getElementById('lessonDetailBody').removeAttribute('contenteditable');
}

function closeLessonDetail() {
  document.getElementById('lessonDetailView').classList.add('hidden');
  document.getElementById('lessonsListView').classList.remove('hidden');

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
    editBtn.innerHTML = ICONS.checkmark;
    editBtn.title = 'Save Changes';
    editBtn.classList.add('primary');
    showToast('Editing mode — click save when done');
  } else {
    body.removeAttribute('contenteditable');
    editBtn.innerHTML = ICONS.edit;
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
      relHtml += '<button class="graph-related-pill" data-entity-id="' + rel.node.id + '" data-entity-cat="' + rel.category + '">' + escapeHtml(rel.node.label) + '</button>';
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
  var html = '<button class="graph-crumb' + (graphState.level === 'root' ? ' active' : '') + '" data-nav="root">You</button>';

  if (graphState.currentCategory) {
    var cat = MOCK_GRAPH_DATA.categories.find(function(c) { return c.id === graphState.currentCategory; });
    html += '<span class="graph-crumb-sep">&rsaquo;</span>';
    html += '<button class="graph-crumb' + (!graphState.currentEntity ? ' active' : '') + '" data-nav="' + graphState.currentCategory + '">' + (cat ? cat.label : '') + '</button>';
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

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// EVENT LISTENERS (replaces all inline onclick handlers)
// ============================================
(function initEventListeners() {

  // --- Sidebar: Thread list (delegation) ---
  var threadList = document.querySelector('.thread-list');
  if (threadList) {
    threadList.addEventListener('click', function(e) {
      var item = e.target.closest('.thread-item');
      if (item) selectThread(item.dataset.threadId, item);
    });
  }

  // --- Sidebar: Workflow list (delegation) ---
  var wfSidebarList = document.querySelector('.workflow-sidebar-list');
  if (wfSidebarList) {
    wfSidebarList.addEventListener('click', function(e) {
      var item = e.target.closest('.wf-side-item');
      if (item) showWorkflowDetail(item.dataset.wfId, item);
    });
  }

  // --- Brain nav (delegation) ---
  var brainNav = document.getElementById('brainNav');
  if (brainNav) {
    brainNav.addEventListener('click', function(e) {
      var btn = e.target.closest('.brain-nav-btn');
      if (btn) switchBrainSection(btn.dataset.section, btn);
    });
  }

  // --- Top tabs ---
  var tabChat = document.getElementById('tabChat');
  var tabWorkflows = document.getElementById('tabWorkflows');
  if (tabChat) tabChat.addEventListener('click', function() { switchMode('chat', tabChat); });
  if (tabWorkflows) tabWorkflows.addEventListener('click', function() { switchMode('workflows', tabWorkflows); });

  // --- Header buttons ---
  var taskAlertBtn = document.getElementById('taskAlertBtn');
  var calendarBtn = document.getElementById('calendarBtn');
  var usageBtn = document.getElementById('usageBtn');
  var topProfile = document.querySelector('.top-profile');
  if (taskAlertBtn) taskAlertBtn.addEventListener('click', function() { toggleTaskPanel(); });
  if (calendarBtn) calendarBtn.addEventListener('click', function() { toggleCalendarPanel(); });
  if (usageBtn) usageBtn.addEventListener('click', function() { toggleUsagePanel(); });
  if (topProfile) topProfile.addEventListener('click', function() { toggleProfileMenu(); });

  // --- Profile menu (delegation) ---
  var profilePanel = document.getElementById('profilePanel');
  if (profilePanel) {
    profilePanel.addEventListener('click', function(e) {
      var themeToggle = e.target.closest('.profile-menu-theme');
      var signOut = e.target.closest('.profile-menu-signout');

      // Sign out
      if (signOut) { window.location.href = 'login.html'; return; }

      // Theme toggle (dark mode)
      if (themeToggle && themeToggle.querySelector('#themeToggleTrack')) {
        e.stopPropagation();
        toggleTheme();
        return;
      }

      // Dyslexia font toggle
      if (themeToggle && themeToggle.querySelector('#dyslexiaToggleTrack')) {
        e.stopPropagation();
        toggleDyslexiaFont();
        return;
      }

      // Reduced motion toggle
      if (themeToggle && themeToggle.querySelector('#motionToggleTrack')) {
        e.stopPropagation();
        toggleReducedMotion();
        return;
      }

      // High contrast toggle
      if (themeToggle && themeToggle.querySelector('#contrastToggleTrack')) {
        e.stopPropagation();
        toggleHighContrast();
        return;
      }

      // Contrast sections (stop propagation for sliders)
      if (e.target.closest('.profile-menu-contrast')) {
        e.stopPropagation();
        return;
      }
    });
  }

  // --- New button ---
  var newBtn = document.getElementById('newBtn');
  if (newBtn) newBtn.addEventListener('click', function() { handleNew(); });

  // --- Chat header buttons ---
  var filesBtn = document.getElementById('filesBtn');
  var exportBtn = document.getElementById('exportBtn');
  var shareBtn = document.getElementById('shareBtn');
  if (filesBtn) filesBtn.addEventListener('click', function() { openFilePanel('folder'); });
  if (exportBtn) exportBtn.addEventListener('click', function() { exportThread(); });
  if (shareBtn) shareBtn.addEventListener('click', function() { shareThread(); });

  // --- File attachment link in chat body ---
  document.addEventListener('click', function(e) {
    var attachment = e.target.closest('.file-attachment');
    if (attachment) openFilePanel('viewer');
  });

  // --- Feedback buttons (delegation on chat area) ---
  document.addEventListener('click', function(e) {
    var fbBtn = e.target.closest('.feedback-btn');
    if (fbBtn) {
      var type = fbBtn.classList.contains('up') ? 'up' : 'down';
      giveFeedback(fbBtn, type);
    }
  });

  // --- Attach options (delegation) ---
  document.addEventListener('click', function(e) {
    var attachOpt = e.target.closest('.attach-option');
    if (attachOpt) {
      if (attachOpt.title === 'From computer') attachFromComputer(attachOpt);
      else if (attachOpt.title === 'From cloud drive') attachFromDrive(attachOpt);
    }
  });

  // --- Model selector/options (delegation) ---
  document.addEventListener('click', function(e) {
    var modelBtn = e.target.closest('.model-selector-btn');
    if (modelBtn) { toggleModelDropdown(modelBtn); return; }
    var modelOpt = e.target.closest('.model-option');
    if (modelOpt) { selectModel(modelOpt); }
  });

  // --- Empty thread suggestion chips (delegation) ---
  var suggestions = document.querySelector('.empty-thread-suggestions');
  if (suggestions) {
    suggestions.addEventListener('click', function(e) {
      var chip = e.target.closest('.empty-thread-chip');
      if (chip) fillSuggestion(chip.dataset.suggestion);
    });
  }

  // --- Error retry button ---
  var k1RetryBtn = document.getElementById('k1RetryBtn');
  if (k1RetryBtn) k1RetryBtn.addEventListener('click', function() { retryK1(); });

  // --- Stop/cancel button ---
  var stopBtn = document.getElementById('erabor-stop-btn');
  if (stopBtn) stopBtn.addEventListener('click', function() { cancelErabor(); });

  // --- File panel ---
  var fpTabViewer = document.getElementById('fpTabViewer');
  var fpTabFolder = document.getElementById('fpTabFolder');
  var fpCloseBtn = document.getElementById('fpCloseBtn');
  if (fpTabViewer) fpTabViewer.addEventListener('click', function() { switchFilePanelTab('viewer'); });
  if (fpTabFolder) fpTabFolder.addEventListener('click', function() { switchFilePanelTab('folder'); });
  if (fpCloseBtn) fpCloseBtn.addEventListener('click', function() { closeFilePanel(); });

  // File item click (open viewer)
  var fpFileItem = document.querySelector('.fp-file-item');
  if (fpFileItem) fpFileItem.addEventListener('click', function() { switchFilePanelTab('viewer'); });

  // --- Workflow listing cards (delegation) ---
  var wfListing = document.getElementById('wfListing');
  if (wfListing) {
    wfListing.addEventListener('click', function(e) {
      var card = e.target.closest('.wf-card');
      if (card && card.dataset.wfId) showWorkflowDetail(card.dataset.wfId, card);
    });
  }

  // --- Workflow detail buttons ---
  var newWorkflowBtn = document.getElementById('newWorkflowBtn');
  var wfBackBtn = document.getElementById('wfBackBtn');
  var wfActionsBtn = document.getElementById('wfActionsBtn');
  var wfRunBtn = document.getElementById('wfRunBtn');
  if (newWorkflowBtn) newWorkflowBtn.addEventListener('click', function() { handleNew(); });
  if (wfBackBtn) wfBackBtn.addEventListener('click', function() { showWorkflowListing(); });
  if (wfActionsBtn) wfActionsBtn.addEventListener('click', function(e) { toggleDropdown(e); });
  if (wfRunBtn) wfRunBtn.addEventListener('click', function() { alert('Running workflow...'); });

  // --- Action dropdown (delegation) ---
  var actionDropdown = document.getElementById('actionDropdown');
  if (actionDropdown) {
    actionDropdown.addEventListener('click', function(e) {
      var item = e.target.closest('.dropdown-item');
      if (!item) return;
      var action = item.dataset.action;
      if (action === 'run-now') alert('Run triggered');
      else if (action === 'duplicate') alert('Duplicated');
      else if (action === 'edit-cosimo') openCosimoPanel();
      else if (action === 'delete') alert('Deleted');
    });
  }

  // --- Workflow detail tabs (delegation) ---
  var tabBar = document.querySelector('.tab-bar');
  if (tabBar) {
    tabBar.addEventListener('click', function(e) {
      var btn = e.target.closest('.tab-btn');
      if (btn && btn.dataset.tab) switchTab(btn.dataset.tab, btn);
    });
  }

  // --- Add source button ---
  var addSourceBtn = document.getElementById('addSourceBtn');
  if (addSourceBtn) addSourceBtn.addEventListener('click', function() { alert('Add source dialog would open here'); });

  // --- Brain Memory section ---
  var addMemoryBtn = document.getElementById('addMemoryBtn');
  var memCancelBtn = document.getElementById('memCancelBtn');
  var memSaveBtn = document.getElementById('memSaveBtn');
  var traitAddBtn = document.getElementById('traitAddBtn');
  if (addMemoryBtn) addMemoryBtn.addEventListener('click', function() { toggleAddMemory(); });
  if (memCancelBtn) memCancelBtn.addEventListener('click', function() { cancelAddMemory(); });
  if (memSaveBtn) memSaveBtn.addEventListener('click', function() { submitNewMemory(); });
  if (traitAddBtn) traitAddBtn.addEventListener('click', function() { addCustomTrait(); });

  // Memory category filters (delegation)
  var memCatFilters = document.getElementById('memCategoryFilters');
  if (memCatFilters) {
    memCatFilters.addEventListener('click', function(e) {
      var pill = e.target.closest('.mem-cat-pill');
      if (!pill) return;
      var categories = ['all', 'preference', 'workflow', 'contact', 'fund', 'style'];
      var idx = Array.from(memCatFilters.querySelectorAll('.mem-cat-pill')).indexOf(pill);
      if (idx >= 0 && idx < categories.length) filterByCategory(categories[idx], pill);
    });
  }

  // Memory fact list (delegation for menu, edit, delete, confirm/cancel)
  var memFactList = document.getElementById('memFactList');
  if (memFactList) {
    memFactList.addEventListener('click', function(e) {
      var menuBtn = e.target.closest('.mem-fact-menu-btn');
      if (menuBtn) { toggleFactMenu(menuBtn); return; }
      var editBtn = e.target.closest('.mem-fact-edit');
      if (editBtn) { editFact(editBtn); return; }
      var deleteBtn = e.target.closest('.mem-fact-delete');
      if (deleteBtn) { deleteFact(deleteBtn); return; }
      var yesBtn = e.target.closest('.mem-delete-yes');
      if (yesBtn) { confirmDelete(yesBtn); return; }
      var noBtn = e.target.closest('.mem-delete-no');
      if (noBtn) { cancelDelete(noBtn); return; }
    });
  }

  // Trait selected (delegation for removeTrait)
  var traitSelected = document.getElementById('traitSelected');
  if (traitSelected) {
    traitSelected.addEventListener('click', function(e) {
      var tag = e.target.closest('.mem-trait-tag');
      if (tag) removeTrait(tag);
    });
  }

  // Trait presets (delegation for toggleTrait)
  var traitPresets = document.getElementById('traitPresets');
  if (traitPresets) {
    traitPresets.addEventListener('click', function(e) {
      var tag = e.target.closest('.mem-trait-tag');
      if (tag) toggleTrait(tag);
    });
  }

  // --- Brain Lessons section ---
  var newLessonBtn = document.getElementById('newLessonBtn');
  var lessonBackBtn = document.getElementById('lessonBackBtn');
  var lessonEditBtn = document.getElementById('lessonEditBtn');
  var lessonCosimoBtn = document.getElementById('lessonCosimoBtn');
  var lessonDeleteBtn = document.getElementById('lessonDeleteBtn');
  var lessonScopeToggle = document.getElementById('lessonScopeToggle');
  if (newLessonBtn) newLessonBtn.addEventListener('click', function() { createNewLesson(); });
  if (lessonBackBtn) lessonBackBtn.addEventListener('click', function() { closeLessonDetail(); });
  if (lessonEditBtn) lessonEditBtn.addEventListener('click', function() { toggleLessonEdit(); });
  if (lessonCosimoBtn) lessonCosimoBtn.addEventListener('click', function() { openCosimoForLesson(); });
  if (lessonDeleteBtn) lessonDeleteBtn.addEventListener('click', function() { deleteLesson(); });
  if (lessonScopeToggle) lessonScopeToggle.addEventListener('click', function() { toggleLessonScope(); });

  // Lesson scope filters (delegation)
  var lessonScopeFilters = document.getElementById('lessonScopeFilters');
  if (lessonScopeFilters) {
    lessonScopeFilters.addEventListener('click', function(e) {
      var pill = e.target.closest('.mem-cat-pill');
      if (!pill) return;
      var scopes = ['all', 'user', 'company'];
      var idx = Array.from(lessonScopeFilters.querySelectorAll('.mem-cat-pill')).indexOf(pill);
      if (idx >= 0 && idx < scopes.length) filterLessonScope(scopes[idx], pill);
    });
  }

  // Lesson list (delegation for card clicks and scope toggle)
  var lessonList = document.getElementById('lessonList');
  if (lessonList) {
    lessonList.addEventListener('click', function(e) {
      var scopeBtn = e.target.closest('.lesson-card-scope-btn');
      if (scopeBtn) { toggleCardScope(scopeBtn, e); return; }
      var card = e.target.closest('.lesson-card');
      if (card) openLesson(card.dataset.lesson);
    });
  }

  // --- Brain Graphs section ---
  var graphEditBtn = document.getElementById('graphEditBtn');
  var graphCosimoBtn = document.getElementById('graphCosimoBtn');
  var graphCloseBtn = document.getElementById('graphCloseBtn');
  if (graphEditBtn) graphEditBtn.addEventListener('click', function() { editGraphEntity(); });
  if (graphCosimoBtn) graphCosimoBtn.addEventListener('click', function() { openCosimoForEntity(); });
  if (graphCloseBtn) graphCloseBtn.addEventListener('click', function() { closeGraphDetail(); });

  // Graph breadcrumbs (delegation)
  var graphBreadcrumb = document.querySelector('.graph-breadcrumb');
  if (graphBreadcrumb) {
    graphBreadcrumb.addEventListener('click', function(e) {
      var crumb = e.target.closest('.graph-crumb');
      if (crumb && crumb.dataset.nav) graphNavigate(crumb.dataset.nav);
    });
  }

  // Graph related pills (delegation)
  var graphDetailBody = document.getElementById('graphDetailBody');
  if (graphDetailBody) {
    graphDetailBody.addEventListener('click', function(e) {
      var pill = e.target.closest('.graph-related-pill');
      if (pill) navigateToRelated(pill.dataset.entityId, pill.dataset.entityCat);
    });
  }

  // --- Search results (delegation) ---
  var searchResults = document.getElementById('searchResults');
  if (searchResults) {
    searchResults.addEventListener('click', function(e) {
      var item = e.target.closest('.search-result-item');
      if (item && item.dataset.threadId) {
        selectThread(item.dataset.threadId, null);
        closeSearch();
      }
    });
  }

  // --- Cosimo panel ---
  var panelOverlay = document.getElementById('panelOverlay');
  var cosimoPanelClose = document.getElementById('cosimoPanelClose');
  var cosimoPanelSend = document.getElementById('cosimoPanelSend');
  if (panelOverlay) panelOverlay.addEventListener('click', function() { closeCosimoPanel(); });
  if (cosimoPanelClose) cosimoPanelClose.addEventListener('click', function() { closeCosimoPanel(); });
  if (cosimoPanelSend) cosimoPanelSend.addEventListener('click', function() { sendPanelMessage(); });

  // --- Input handlers (replaces inline oninput/onkeydown) ---
  var sidebarSearch = document.querySelector('.sidebar-search-input');
  if (sidebarSearch) sidebarSearch.addEventListener('input', function() { runGlobalSearch(this.value); });

  var purpleSlider = document.getElementById('purpleIntensitySlider');
  if (purpleSlider) purpleSlider.addEventListener('input', function() { applyPurpleIntensity(this.value); });

  var fontSizeSlider = document.getElementById('fontSizeSlider');
  if (fontSizeSlider) fontSizeSlider.addEventListener('input', function() { applyFontSizeBoost(this.value); });

  var memSearchInput = document.getElementById('memSearchInput');
  if (memSearchInput) memSearchInput.addEventListener('input', function() { filterMemories(); });

  var lessonSearchInput = document.getElementById('lessonSearchInput');
  if (lessonSearchInput) lessonSearchInput.addEventListener('input', function() { filterLessons(); });

  var traitInput = document.getElementById('traitInput');
  if (traitInput) traitInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { addCustomTrait(); e.preventDefault(); } });

  var memAddInput = document.getElementById('memAddInput');
  if (memAddInput) memAddInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { submitNewMemory(); e.preventDefault(); } });

  var panelInput = document.getElementById('panelInput');
  if (panelInput) panelInput.addEventListener('keydown', function(e) { handlePanelKey(e); });

})();
