const db = require('../db/database');

// Bill IDs that belong to Contract
const CONTRACT_BILL_IDS = ['A', 'G'];

function getIncomeSummary() {
  const bills = db.prepare(`SELECT id, name, icon FROM bills ORDER BY id`).all();

  const itemsStmt = db.prepare(`
    SELECT no, description as d, ach, inc
    FROM bill_items
    WHERE bill_id = ?
    ORDER BY id
  `);

  let siteWork = 0;
  let contract = 0;

  const resultBills = bills.map(bill => {
    const items = itemsStmt.all(bill.id);
    const billTotal = items.reduce((sum, item) => sum + (item.inc || 0), 0);

    if (CONTRACT_BILL_IDS.includes(bill.id)) {
      contract += billTotal;
    } else {
      siteWork += billTotal;
    }

    return {
      id: bill.id,
      name: bill.name,
      icon: bill.icon,
      items
    };
  });

  return {
    siteWork,
    contract,
    total: siteWork + contract,
    bills: resultBills
  };
}

function getCostSummary() {
  const rows = db.prepare(`
    SELECT category, name, amount
    FROM cost_items
    ORDER BY category, id
  `).all();

  const categories = {};
  let total = 0;

  for (const row of rows) {
    if (!categories[row.category]) {
      categories[row.category] = { total: 0, items: [] };
    }
    categories[row.category].items.push({
      name: row.name,
      amount: row.amount
    });
    categories[row.category].total += row.amount;
    total += row.amount;
  }

  return { total, categories };
}

function getPercentSummary() {
  const getSetting = db.prepare(`SELECT value FROM project_settings WHERE key = ?`);

  const overall = parseFloat(getSetting.get('overall_progress')?.value || 72.8);
  const plannedMonths = parseInt(getSetting.get('planned_months')?.value || 36);
  const elapsedMonths = parseInt(getSetting.get('elapsed_months')?.value || 26);
  const timeProgress = Number(((elapsedMonths / plannedMonths) * 100).toFixed(1));

  // Category progress (can later be stored in DB too)
  const categories = [
    { name: 'GENERAL ITEMS', percent: 65.4, icon: '🔧' },
    { name: 'MAIN DAM', percent: 78.2, icon: '🌊' },
    { name: 'GROUTING AND FAULT TREATMENT', percent: 50.0, icon: '💧' },
    { name: 'INTAKE TOWER STRUCTURE', percent: 68.7, icon: '🗼' },
    { name: 'ACCESS BRIDGE', percent: 85.0, icon: '🛣️' },
    { name: 'IRRIGATION OUTLET WORKS', percent: 42.3, icon: '💧' },
    { name: 'LOW LEVEL OUTLET WORKS', percent: 95.0, icon: '⚙️' },
    { name: 'EMERGENCY CANAL', percent: 55.6, icon: '🏞️' },
    { name: 'PERMANENT ACCESS ROAD', percent: 71.2, icon: '🛣️' },
    { name: 'VALVE HOUSE STRUCTURE', percent: 63.8, icon: '🏠' }
  ];

  return {
    overall,
    timeProgress,
    plannedMonths,
    elapsedMonths,
    categories
  };
}

function getEcostSummary() {
  // For now we still compute estimated vs actual from cost data
  // You can later store estimated values in the database
  const costData = getCostSummary();

  const estimatedMap = {
    labour: 9500000,
    admin: 52000000,
    staff: 65000000,
    material: 185000000,
    machinery: 135000000,
    overhead: 35000000
  };

  const icons = {
    labour: '👷',
    admin: '📋',
    staff: '👔',
    material: '🧱',
    machinery: '🚜',
    overhead: '📊'
  };

  let totalEstimated = 0;
  let totalActual = 0;

  const detailed = Object.entries(costData.categories).map(([key, cat]) => {
    const estimated = estimatedMap[key] || cat.total;
    const actual = cat.total;
    const variance = actual - estimated;
    const variancePercent = estimated ? Number(((variance / estimated) * 100).toFixed(1)) : 0;

    totalEstimated += estimated;
    totalActual += actual;

    return {
      name: key.charAt(0).toUpperCase() + key.slice(1),
      estimated,
      actual,
      variance,
      variancePercent,
      status: variance > 0 ? 'over' : variance < 0 ? 'under' : 'on-track',
      icon: icons[key] || '📊'
    };
  });

  return {
    totalEstimated,
    totalActual,
    totalVariance: totalActual - totalEstimated,
    totalVariancePercent: totalEstimated
      ? Number((((totalActual - totalEstimated) / totalEstimated) * 100).toFixed(1))
      : 0,
    categories: detailed
  };
}

module.exports = {
  CONTRACT_BILL_IDS,
  getIncomeSummary,
  getCostSummary,
  getPercentSummary,
  getEcostSummary
};