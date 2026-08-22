const HOME_MENU_ITEMS = [
  { id: 'efficiency', icon: '⚙️', label: 'Efficiency' },
  { id: 'staff', icon: '👥', label: 'Staff' },
  { id: 'payroll', icon: '💵', label: 'Payroll' },
  { id: 'finance', icon: '📒', label: 'Finance' },
  { id: 'property-admin', icon: '🏢', label: 'Property Admin' },
  { id: 'payment-status', icon: '✅', label: 'Payment Status' }
];

const HOME_CENTER_ITEMS = [
  { id: 'report', icon: '📄', label: 'Report' },
  { id: 'payment', icon: '💳', label: 'Payment' },
  { id: 'standard', icon: '📐', label: 'Standard' }
];

let homeActiveSection = null;

// Productivity Standard reference data (Dump Truck / Loader / Excavator)
const STANDARD_SECTIONS = [
  {
    title: '1. Dump Truck Hauling Output',
    subsections: [
      {
        subtitle: '1.1 Sand (Hauling distance = 0.5 km)',
        rows: [
          ['Truck Capacity', '16 m³'],
          ['Loading time', '4 ደቂቃ'],
          ['Haul + Dump + Return + Spotting', '6 ደቂቃ'],
          ['ጠቅላላ Cycle Time', '10 ደቂቃ'],
          ['Biyajo per hour', '6'],
          ['Output (m³/hr)', '96'],
          ['Output (m³/Day)', '768']
        ]
      },
      {
        subtitle: '1.2 Gravel & Sand (cartaway) (Hauling distance = 0.3 km)',
        rows: [
          ['Truck Capacity', '16 m³'],
          ['Loading time', '4 ደቂቃ'],
          ['Haul + Dump + Return + Spotting', '≈ 2.67 ደቂቃ'],
          ['ጠቅላላ Cycle Time', '≈ 6.67 ደቂቃ'],
          ['Biyajo per hour', '9'],
          ['Output (m³/hr)', '144'],
          ['Output (m³/Day)', '1,152']
        ]
      }
    ]
  },
  {
    title: '2. Loader Loading Output',
    table: {
      columns: ['Description', 'm³/hr', 'Biyajo/hr', 'Cycle Time'],
      rows: [
        ['Sand sieving', '48', '3', '20 ደቂቃ'],
        ['Cart-away loading', '240', '15', '4 ደቂቃ'],
        ['Cart-away spreading', '192', '12', '5 ደቂቃ']
      ]
    }
  },
  {
    title: '3. Excavator Loading Output',
    table: {
      columns: ['Description', 'm³/hr', 'Biyajo/hr', 'Cycle Time', 'ምን ማለት ነው'],
      rows: [
        ['River Sand Production and Loading', '192', '12', '5 ደቂቃ', 'Moving the dump material']
      ]
    }
  }
];

const HOME_SECTION_DATA = {
  finance: {
    columns: ['Description', 'Debits (ETB)'],
    rows: [
      ['Machinery transport', 51591468.21],
      ['Over time', 137410.35],
      ['Wage daily laborers', 5800674.32],
      ['Perdiem and traveling cost', 27089416.44],
      ['Telephone, Water, ...', 425790.38],
      ['Entertainment — Irrigation project', 654898.10],
      ['Tyre & Inner tube', 325550.00],
      ['Fuel & Lubricants', null],
      ['House rent', 300000.00],
      ['Machinery rent', 9428309.11],
      ['Vehicle expense', 1149836.87],
      ['Repair vehicle, machinery', 741877.84],
      ['Medical expense', 291274.30],
      ['Penalty', 11927.00],
      ['Sub contractor', 574832.83],
      ['Other Costs', 1188651.73]
    ],
    total: 99711917.48
  },
  report: {
    columns: ['Description', 'Plan (Birr)', 'Executed (Birr)'],
    rows: [
      ['Income', 1890234761.77, 1890234761.77],
      ['Income (with escalation)', 1890234761.77, 1890234761.77],
      ['Expense', 9648269.36, 9648269.36]
    ]
  },
  'property-admin': {
    columns: ['Description', 'Amount (Birr)'],
    rows: [
      ['Machinery transport expense — AJIMA CHACHA — LOT-03', 51591468.21],
      ['Over time expense — AJIMA CHACHA PROJECT — LOT-03', 139889.85],
      ['Wage daily laborers — CHACHA IRRIGATION — LOT-03', 5806436.55],
      ['Perdiem and traveling cost — AJIMA CHACHA — LOT-03', 27089416.44],
      ['Telephone, Water, Electricity and internet — AJIMA CHACHA — LOT3', 394490.38],
      ['Entertainment — Irrigation project — AJIMA CHACHA — LOT-03', 654898.10],
      ['Pipe Expense — Building construction — Ajima Chacha Irrigation-3', 170083.57],
      ['Fitting Expense — Building construction — Ajima Chacha — 03', 63418.02],
      ['Spare part for pump, generator & cons. — Ajima Chacha — LOT-03', 103065.01],
      ['Other Construction material (nails, timber) — Ajima Chacha — LOT-3', 7254545.35],
      ['Camping Item (biret dist, stove, etc) — Ajima Chacha — LOT-03', 246876.81],
      ['Cleaning & Sanitation Expense — Ajima Chacha Irrigation — LOT-3', 173015.91],
      ['Supplies & Stationary Expense — Ajima Chacha Irrigation — LOT-03', 1038568.04],
      ['Uniform and Clothing Expense — Ajima Chacha Irrigation — LOT-03', 1183152.99],
      ['Receipt & Voucher Expense — Ajima Chacha Irrigation — LOT-03', 94944.14],
      ['Pharmaceutical, Treatment item & lab — Ajima Chacha Irrigation — LOT-3', 104005.37],
      ['Spare Part Expense — Ajima Chacha Irrigation — LOT-03', 18196084.34],
      ['Tyre & Inner tube Expense — Ajima Chacha Irrigation — LOT-3', 13756237.00],
      ['Fuel & Lubricants Expense — Ajima Chacha Irrigation — LOT-3', 126002900.76],
      ['Cement Expense — Ajima Chacha Irrigation — LOT-03', 1092612.91],
      ['Reinforcement Bar Expense — Ajima Chacha — LOT-03', 3260356.47],
      ['Local Construction material (sand, gravel, stone) — LOT-03', 25911831.59],
      ['Machinery rent expense — Chacha project — LOT-03', 9428309.11],
      ['Vehicle expense — Chacha project — LOT-03', 1149836.87],
      ['Generator Fuel & Lubricants Expense — AJIMA CHACHA — LOT-03', 6615130.84],
      ['Repair (vehicle, machinery) expense — Chacha project — LOT-03', 936877.84],
      ['Medical expense — Chacha project — LOT-03', 291274.30],
      ['Penalty expense — Chacha project — LOT-03', 11927.00],
      ['Sub contractor expense — Chacha project — LOT-03', 574832.83],
      ['Other Costs — Irrigation project — AJIMA CHACHA IRRIGATION — LOT-03', 1354859.56],
      ['House rent expense — Chacha LOT-03 project', 350000.00],
      ['DN2000mm PN10, Flanged butterfly valve', null],
      ['1.5m diameter Howell-Bunger Regulating valve', null],
      ['DN1500mm diameter 22.5 degree DCI double flanged bend', null],
      ['Electric Actuator for Butterfly Valve DN2000', null],
      ['Piezometer', null]
    ],
    total: 305041346.16
  }
};

function loadHome() {
  const container = document.getElementById('home-tab');

  container.innerHTML = `
    <button id="home-menu-btn" type="button" aria-label="Menu"
      style="position:fixed;top:3.2rem;left:0.9rem;z-index:15;width:2.4rem;height:2.4rem;border-radius:50%;
             border:none;background:rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.15);
             font-size:1.2rem;cursor:pointer;display:flex;align-items:center;justify-content:center">☰</button>

    <div id="home-drawer-overlay"
      style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:40"></div>

    <div id="home-drawer"
      style="position:fixed;top:0;left:0;bottom:0;width:78%;max-width:300px;background:#ffffff;
             box-shadow:2px 0 16px rgba(0,0,0,0.2);z-index:41;transform:translateX(-100%);
             transition:transform 0.25s ease;padding:1.2rem 0;overflow-y:auto">
      <div style="padding:0 1.2rem 1rem;border-bottom:1px solid #eee;margin-bottom:0.5rem">
        <div style="font-weight:700;font-size:1.05rem;margin-bottom:0.8rem">🌊 Chacha Dam</div>
        <button id="member-auth-btn" type="button"
          style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.7rem;width:100%;
                 border:none;border-radius:0.8rem;cursor:pointer;font-size:0.9rem;font-weight:700;
                 color:#fff;background:linear-gradient(135deg,#1a7a4c,#0f5c37)">
          🔑 Sign In / Sign Up
        </button>
      </div>
      ${HOME_MENU_ITEMS.map(item => `
        <button class="home-menu-item" data-id="${item.id}" type="button"
          style="display:flex;align-items:center;gap:0.8rem;width:100%;padding:0.8rem 1.2rem;
                 background:none;border:none;text-align:left;font-size:0.95rem;cursor:pointer;color:#1e2430">
          <span style="font-size:1.2rem">${item.icon}</span> ${item.label}
        </button>
      `).join('')}
    </div>

    <div id="home-content" style="padding-top:5.8rem">
      <div style="display:flex;flex-wrap:wrap;gap:0.7rem;justify-content:center;max-width:420px;margin:0 auto 0">
        ${HOME_CENTER_ITEMS.map(item => `
          <button class="home-center-item bill-card" data-id="${item.id}" type="button"
            style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.7rem 1.1rem;border:none;cursor:pointer;
                   font-size:0.95rem;font-weight:600;color:#1e2430;width:auto;white-space:nowrap">
            <span style="font-size:1.2rem">${item.icon}</span> ${item.label}
          </button>
        `).join('')}
      </div>
    </div>
  `;

  const menuBtn = document.getElementById('home-menu-btn');
  const drawer = document.getElementById('home-drawer');
  const overlay = document.getElementById('home-drawer-overlay');

  function openDrawer() {
    overlay.style.display = 'block';
    requestAnimationFrame(() => { drawer.style.transform = 'translateX(0)'; });
  }
  function closeDrawer() {
    drawer.style.transform = 'translateX(-100%)';
    setTimeout(() => { overlay.style.display = 'none'; }, 250);
  }

  menuBtn.addEventListener('click', openDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.querySelectorAll('.home-menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = HOME_MENU_ITEMS.find(m => m.id === id);
      homeActiveSection = id;
      renderHomeSection(item);
      closeDrawer();
    });
  });

  document.querySelectorAll('.home-center-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const item = HOME_CENTER_ITEMS.find(m => m.id === id);
      homeActiveSection = id;
      renderHomeSection(item);
    });
  });

  document.getElementById('member-auth-btn').addEventListener('click', () => {
    closeDrawer();
    openMemberAuthModal();
  });
}

function openMemberAuthModal() {
  const existing = document.getElementById('member-auth-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'member-auth-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:60;display:flex;align-items:center;justify-content:center;padding:1rem';

  overlay.innerHTML = `
    <div style="background:#ffffff;border-radius:1.2rem;padding:1.4rem;width:100%;max-width:360px;max-height:90vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <div id="member-modal-title" style="font-weight:700;font-size:1.1rem">🔑 Sign Up</div>
        <button id="member-modal-close" type="button" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:#9c9686">✕</button>
      </div>

      <div style="display:flex;gap:0.4rem;margin-bottom:1rem;background:#f3ecd4;border-radius:0.7rem;padding:0.25rem">
        <button id="member-tab-signup" type="button" style="flex:1;padding:0.5rem;border:none;border-radius:0.5rem;background:#fff;font-weight:700;cursor:pointer">Sign Up</button>
        <button id="member-tab-signin" type="button" style="flex:1;padding:0.5rem;border:none;border-radius:0.5rem;background:transparent;font-weight:700;cursor:pointer;color:#8a8574">Sign In</button>
      </div>

      <form id="member-signup-form">
        <input id="signup-name" type="text" placeholder="ሙሉ ስም" required
          style="width:100%;padding:0.7rem;margin-bottom:0.6rem;border-radius:0.6rem;border:1px solid #e5e3da" />
        <input id="signup-id" type="text" placeholder="መለያ ቁጥር (ID Number)" required
          style="width:100%;padding:0.7rem;margin-bottom:0.6rem;border-radius:0.6rem;border:1px solid #e5e3da" />
        <input id="signup-phone" type="tel" placeholder="ስልክ ቁጥር" required
          style="width:100%;padding:0.7rem;margin-bottom:0.6rem;border-radius:0.6rem;border:1px solid #e5e3da" />
        <input id="signup-password" type="password" placeholder="የይለፍ ቃል" required
          style="width:100%;padding:0.7rem;margin-bottom:0.8rem;border-radius:0.6rem;border:1px solid #e5e3da" />
        <button type="submit" style="width:100%;padding:0.8rem;border:none;border-radius:0.6rem;background:#1a7a4c;color:#fff;font-weight:700;cursor:pointer">Register</button>
      </form>

      <form id="member-signin-form" class="hidden">
        <input id="signin-id" type="text" placeholder="መለያ ቁጥር (ID Number)" required
          style="width:100%;padding:0.7rem;margin-bottom:0.6rem;border-radius:0.6rem;border:1px solid #e5e3da" />
        <input id="signin-password" type="password" placeholder="የይለፍ ቃል" required
          style="width:100%;padding:0.7rem;margin-bottom:0.8rem;border-radius:0.6rem;border:1px solid #e5e3da" />
        <button type="submit" style="width:100%;padding:0.8rem;border:none;border-radius:0.6rem;background:#1a7a4c;color:#fff;font-weight:700;cursor:pointer">Sign In</button>
      </form>

      <p id="member-modal-status" style="margin-top:0.8rem;font-size:0.88rem;text-align:center"></p>
    </div>
  `;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  document.getElementById('member-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const signupForm = document.getElementById('member-signup-form');
  const signinForm = document.getElementById('member-signin-form');
  const tabSignup = document.getElementById('member-tab-signup');
  const tabSignin = document.getElementById('member-tab-signin');
  const title = document.getElementById('member-modal-title');
  const status = document.getElementById('member-modal-status');

  tabSignup.addEventListener('click', () => {
    signupForm.classList.remove('hidden');
    signinForm.classList.add('hidden');
    tabSignup.style.background = '#fff';
    tabSignin.style.background = 'transparent';
    tabSignin.style.color = '#8a8574';
    tabSignup.style.color = '#1e2430';
    title.textContent = '🔑 Sign Up';
    status.textContent = '';
  });

  tabSignin.addEventListener('click', () => {
    signinForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    tabSignin.style.background = '#fff';
    tabSignup.style.background = 'transparent';
    tabSignup.style.color = '#8a8574';
    tabSignin.style.color = '#1e2430';
    title.textContent = '🔑 Sign In';
    status.textContent = '';
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Sending...';
    status.style.color = '#9c9686';

    try {
      const res = await fetch(`${window.API_BASE_URL}/api/members/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: document.getElementById('signup-name').value,
          idNumber: document.getElementById('signup-id').value,
          phoneNumber: document.getElementById('signup-phone').value,
          password: document.getElementById('signup-password').value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      status.style.color = '#1a7a4c';
      status.textContent = '✅ ' + data.message;
      signupForm.reset();
    } catch (err) {
      status.style.color = '#dc2626';
      status.textContent = '❌ ' + err.message;
    }
  });

  signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = 'Checking...';
    status.style.color = '#9c9686';

    try {
      const res = await fetch(`${window.API_BASE_URL}/api/members/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idNumber: document.getElementById('signin-id').value,
          password: document.getElementById('signin-password').value
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Sign in failed');

      status.style.color = '#1a7a4c';
      status.textContent = `✅ Welcome, ${data.member.fullName}!`;
    } catch (err) {
      status.style.color = '#dc2626';
      status.textContent = '❌ ' + err.message;
    }
  });
}

function renderHomeSection(item) {
  const content = document.getElementById('home-content');
  if (!content) return;

  content.style.display = 'block';
  content.style.textAlign = 'left';

  const backBtn = `
    <button id="home-back-btn" type="button"
      style="display:flex;align-items:center;gap:0.4rem;background:none;border:none;
             color:#1a7a4c;font-weight:600;font-size:0.95rem;cursor:pointer;margin-bottom:0.8rem;padding:0.3rem 0">
      ← Back
    </button>
  `;

  if (item.id === 'standard') {
    content.innerHTML = `
      ${backBtn}
      <div class="bill-name" style="margin-bottom:1rem;font-size:1.1rem">📐 Dump Truck • Loader • Excavator — Project Standard</div>
      ${STANDARD_SECTIONS.map(section => `
        <div class="bill-card" style="margin-bottom:1rem">
          <div class="bill-name" style="margin-bottom:0.7rem;color:#1a7a4c">${section.title}</div>
          ${section.subsections ? section.subsections.map(sub => `
            <div style="margin-bottom:1rem">
              <div style="font-weight:700;font-size:0.9rem;margin-bottom:0.4rem;color:#55503f">${sub.subtitle}</div>
              <table>
                <tbody>
                  ${sub.rows.map(row => `<tr><td>${row[0]}</td><td style="font-weight:700">${row[1]}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          `).join('') : ''}
          ${section.table ? `
            <table>
              <thead>
                <tr>${section.table.columns.map(c => `<th>${c}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${section.table.rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
              </tbody>
            </table>
          ` : ''}
        </div>
      `).join('')}
    `;
    document.getElementById('home-back-btn').addEventListener('click', () => {
      homeActiveSection = null;
      loadHome();
    });
    return;
  }

  const data = HOME_SECTION_DATA[item.id];

  if (data) {
    content.innerHTML = `
      ${backBtn}
      ${data.total != null ? `
        <div class="stats">
          <div class="stat">
            <div class="label">${item.label} Total</div>
            <div class="value">${formatMoney(data.total)}</div>
          </div>
        </div>
      ` : ''}
      <div class="bill-card">
        <table>
          <thead>
            <tr>${data.columns.map(c => `<th>${c}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${data.rows.map(row => `
              <tr>
                ${row.map((cell, i) => `<td>${i === 0 ? cell : (cell != null ? formatMoney(cell) : '—')}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    content.innerHTML = `
      ${backBtn}
      <div class="bill-card">
        <div class="bill-name" style="margin-bottom:0.6rem">${item.icon} ${item.label}</div>
        <p style="color:#9c9686;font-size:0.9rem">ውሂብ በቅርቡ ይታከላል...</p>
      </div>
    `;
  }

  document.getElementById('home-back-btn').addEventListener('click', () => {
    homeActiveSection = null;
    loadHome();
  });
}

function formatMoney(num) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 2
  }).format(num);
}

window.loadHome = loadHome;
