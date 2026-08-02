async function loadIncome() {
  const container = document.getElementById('income-tab');
  container.innerHTML = '<p>Loading income data...</p>';

  try {
    const res = await api.apiFetch('/api/income');
    const data = res.data;

    let html = `
      <div class="stats">
        <div class="stat">
          <div class="label">Site Work</div>
          <div class="value">${formatMoney(data.siteWork)}</div>
        </div>
        <div class="stat">
          <div class="label">Contract</div>
          <div class="value">${formatMoney(data.contract)}</div>
        </div>
        <div class="stat">
          <div class="label">Total Income</div>
          <div class="value">${formatMoney(data.total)}</div>
        </div>
      </div>
    `;

    data.bills.forEach(bill => {
      const billTotal = bill.items.reduce((s, i) => s + (i.inc || 0), 0);
      html += `
        <div class="card">
          <h2>${bill.icon} ${bill.name}</h2>
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
          <p style="margin-top:0.8rem;text-align:right;font-weight:600">
            Subtotal: ${formatMoney(billTotal)}
          </p>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
}

function formatMoney(num) {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 2
  }).format(num);
}

window.loadIncome = loadIncome;