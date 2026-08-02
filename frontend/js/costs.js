async function loadCosts() {
  const container = document.getElementById('costs-tab');
  container.innerHTML = '<p>Loading costs data...</p>';

  try {
    const res = await api.apiFetch('/api/costs');
    const data = res.data;

    let html = `
      <div class="stats">
        <div class="stat">
          <div class="label">Total Cost</div>
          <div class="value">${formatMoney(data.total)}</div>
        </div>
      </div>
    `;

    for (const [key, cat] of Object.entries(data.categories)) {
      html += `
        <div class="card">
          <h2>${key.toUpperCase()} — ${formatMoney(cat.total)}</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Amount (ETB)</th>
              </tr>
            </thead>
            <tbody>
              ${cat.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${formatMoney(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
}

window.loadCosts = loadCosts;