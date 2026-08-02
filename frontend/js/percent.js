async function loadPercent() {
  const container = document.getElementById('percent-tab');
  container.innerHTML = '<p style="padding:1rem;color:#8a8574">Loading...</p>';

  try {
    const res = await api.apiFetch('/api/percent');
    const data = res.data;

    let html = `
      <div class="stats">
        <div class="stat">
          <div class="label">Overall Progress</div>
          <div class="value">${data.overall}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${data.overall}%"></div>
          </div>
        </div>
        <div class="stat">
          <div class="label">Time Progress</div>
          <div class="value">${data.timeProgress}%</div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${data.timeProgress}%"></div>
          </div>
        </div>
        <div class="stat">
          <div class="label">Elapsed / Planned</div>
          <div class="value">${data.elapsedMonths} / ${data.plannedMonths} months</div>
        </div>
      </div>
    `;

    data.categories.forEach(cat => {
      html += `
        <div class="bill-card">
          <div class="bill-row" style="cursor:default">
            <div class="bill-icon">${cat.icon || '📊'}</div>
            <div class="bill-info" style="width:100%">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div class="bill-name">${cat.name}</div>
                <div class="bill-meta">${cat.percent}%</div>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${cat.percent}%"></div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<p class="error" style="padding:1rem">Error: ${err.message}</p>`;
  }
}

window.loadPercent = loadPercent;