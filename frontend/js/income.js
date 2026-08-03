let incomeData = null;
let incomeView = 'siteWork'; // 'siteWork' or 'contract'

async function loadIncome() {
  const container = document.getElementById('income-tab');
  container.innerHTML = '<p style="padding:1rem;color:#8a8574">Loading...</p>';

  try {
    const res = await api.apiFetch('/api/income');
    incomeData = res.data;
    renderIncome();
  } catch (err) {
    container.innerHTML = `<p class="error" style="padding:1rem">Error: ${err.message}</p>`;
  }
}

function setIncomeView(view) {
  incomeView = view;
  renderIncome();
}

function renderIncome() {
  const container = document.getElementById('income-tab');
  const data = incomeData;
  if (!data) return;

  const bills = (data.bills || []).filter(b => b.type === incomeView);

  let html = `
    <div class="stats">
      <div class="stat">
        <div class="label">Total Income</div>
        <div class="value">${formatMoney(data.total)}</div>
      </div>
    </div>

    <div class="toggle-row">
      <button class="toggle-btn ${incomeView === 'siteWork' ? 'active' : ''}" onclick="setIncomeView('siteWork')">🏗️ Site Work</button>
      <button class="toggle-btn ${incomeView === 'contract' ? 'active' : ''}" onclick="setIncomeView('contract')">📄 Contract</button>
    </div>
  `;

  bills.forEach((bill, idx) => {
    const billTotal = bill.items.reduce((s, i) => s + (i.inc || 0), 0);
    const cardId = `income-bill-${idx}`;
    html += `
      <div class="bill-card" id="${cardId}">
        <div class="bill-row" onclick="document.getElementById('${cardId}').classList.toggle('open')">
          <div class="bill-icon">${bill.icon || '📁'}</div>
          <div class="bill-info">
            <div class="bill-name">${bill.name}</div>
            <div class="bill-meta">${formatMoney(billTotal)} <span class="count">(${bill.items.length} items)</span></div>
          </div>
          <div class="bill-chevron">▼</div>
        </div>
        <div class="bill-items">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Description</th>
                <th>Achieved</th>
                <th>Amount (ETB)</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map(item => `
                <tr>
                  <td>${item.no}</td>
                  <td>${item.d}</td>
                  <td>${item.ach}</td>
                  <td>${formatMoney(item.inc)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function formatMoney(num) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 2
  }).format(num);
}

window.loadIncome = loadIncome;
window.setIncomeView = setIncomeView;