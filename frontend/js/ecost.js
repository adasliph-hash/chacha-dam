async function loadEcost() {
  const container = document.getElementById('ecost-tab');
  container.innerHTML = '<p>Loading E-Cost data...</p>';

  try {
    const res = await api.apiFetch('/api/ecost');
    const data = res.data;

    let html = `
      <div class="stats">
        <div class="stat">
          <div class="label">Total Estimated</div>
          <div class="value">${formatMoney(data.totalEstimated)}</div>
        </div>
        <div class="stat">
          <div class="label">Total Actual</div>
          <div class="value">${formatMoney(data.totalActual)}</div>
        </div>
        <div class="stat">
          <div class="label">Variance</div>
          <div class="value" style="color:${data.totalVariance >= 0 ? '#f87171' : '#4ade80'}">
            ${formatMoney(data.totalVariance)} (${data.totalVariancePercent}%)
          </div>
        </div>
      </div>
    `;

    data.categories.forEach(cat => {
      const color = cat.status === 'over' ? '#f87171' : cat.status === 'under' ? '#4ade80' : '#38bdf8';
      html += `
        <div class="card">
          <h2>${cat.icon} ${cat.name}</h2>
          <table>
            <tr>
              <td>Estimated</td>
              <td>${formatMoney(cat.estimated)}</td>
            </tr>
            <tr>
              <td>Actual</td>
              <td>${formatMoney(cat.actual)}</td>
            </tr>
            <tr>
              <td>Variance</td>
              <td style="color:${color}">
                ${formatMoney(cat.variance)} (${cat.variancePercent}%)
              </td>
            </tr>
          </table>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="error">Error: ${err.message}</p>`;
  }
}

window.loadEcost = loadEcost;