let incomeData = null;
let incomeView = 'siteWork'; // 'siteWork' or 'contract'
let incomeEditMode = false;

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

function toggleIncomeEdit() {
  incomeEditMode = !incomeEditMode;
  renderIncome();
}

async function saveIncomeEdits() {
  const inputs = document.querySelectorAll('.income-edit-inc');
  const status = document.getElementById('income-edit-status');
  status.textContent = 'Saving...';
  status.style.color = '#9c9686';

  let saved = 0, failed = 0;

  for (const input of inputs) {
    const itemId = input.dataset.itemId;
    const achInput = document.querySelector(`.income-edit-ach[data-item-id="${itemId}"]`);
    const inc = parseFloat(input.value);
    const ach = parseFloat(achInput.value);

    if (isNaN(inc) || isNaN(ach)) continue;

    try {
      await api.apiFetch(`/api/income/item/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ ach, inc })
      });
      saved++;
    } catch (err) {
      failed++;
    }
  }

  status.textContent = `✅ ${saved} items saved${failed ? `, ❌ ${failed} failed` : ''}`;
  status.style.color = failed ? '#dc2626' : '#1a7a4c';

  incomeEditMode = false;
  await loadIncome();
}

function renderIncome() {
  const container = document.getElementById('income-tab');
  const data = incomeData;
  if (!data) return;

  const isOwner = localStorage.getItem('isOwner') === '1';
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

  if (isOwner) {
    html += `
      <div style="display:flex;gap:0.6rem;align-items:center;margin-bottom:0.8rem">
        <button class="toggle-btn" style="flex:none;padding:0.5rem 1rem" onclick="${incomeEditMode ? 'saveIncomeEdits()' : 'toggleIncomeEdit()'}">
          ${incomeEditMode ? '💾 Save Changes' : '✏️ Edit Figures'}
        </button>
        ${incomeEditMode ? `<button class="toggle-btn" style="flex:none;padding:0.5rem 1rem" onclick="toggleIncomeEdit()">✕ Cancel</button>` : ''}
        <span id="income-edit-status" style="font-size:0.85rem;color:#9c9686"></span>
      </div>
    `;
  }

  bills.forEach((bill, idx) => {
    const billTotal = bill.items.reduce((s, i) => s + (i.inc || 0), 0);
    const cardId = `income-bill-${idx}`;
    html += `
      <div class="bill-card" id="${cardId}${incomeEditMode ? ' open' : ''}">
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
                  <td>${incomeEditMode
                    ? `<input type="number" step="0.01" class="income-edit-ach" data-item-id="${item.id}" value="${item.ach}" style="width:5.5rem;padding:0.3rem;border-radius:0.4rem;border:1px solid #e5e3da" />`
                    : item.ach}</td>
                  <td>${incomeEditMode
                    ? `<input type="number" step="0.01" class="income-edit-inc" data-item-id="${item.id}" value="${item.inc}" style="width:7rem;padding:0.3rem;border-radius:0.4rem;border:1px solid #e5e3da" />`
                    : formatMoney(item.inc)}</td>
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
window.toggleIncomeEdit = toggleIncomeEdit;
window.saveIncomeEdits = saveIncomeEdits;
