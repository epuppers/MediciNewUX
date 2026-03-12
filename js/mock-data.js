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

// Map: which tokens also need an RGB triplet companion
var CONFIG_RGB_COMPANIONS = {
  '--violet-3': '--violet-3-rgb',
  '--berry-3': '--berry-3-rgb'
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
