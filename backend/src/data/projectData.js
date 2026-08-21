const db = require('../db/database');

// Bill IDs that belong to Contract
const CONTRACT_BILL_IDS = ['A', 'G'];

function getIncomeSummary() {
  const bills = db.prepare(`SELECT id, name, icon FROM bills ORDER BY id`).all();

  const itemsStmt = db.prepare(`
    SELECT id, no, description as d, ach, inc
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
      type: CONTRACT_BILL_IDS.includes(bill.id) ? 'contract' : 'siteWork',
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
  // Real "Overhead / Other Expenses" itemized breakdown
  const overheadItems = [
    { no: 1, description: 'Spare Part Expense – Ajima Chacha Irrigation Lot 3', amount: 23727540.32 },
    { no: 2, description: 'Tyre & Inner Tube Maintenance', amount: 1877257.00 },
    { no: 3, description: 'Fuel & Lubricants Expense – Ajima Chacha Irrigation Lot 3', amount: 800.00 },
    { no: 4, description: 'Mobile Card Expense', amount: 273723.16 },
    { no: 5, description: 'Car Guard', amount: 60100.00 },
    { no: 6, description: 'Local Construction Material (Sand, Gravel, Stone, Tree & Lot 3)', amount: 192036.43 },
    { no: 7, description: 'Camping Generator Fuel & Lubricants Expense', amount: 6217698.53 },
    { no: 8, description: 'Over Time', amount: 0 },
    { no: 9, description: 'Calibration of Total Station', amount: 100096.63 },
    { no: 10, description: 'Medical Expense', amount: 82479.27 },
    { no: 11, description: 'Other Cost (Qret)', amount: 27955.00 },
    { no: 12, description: 'Cement Expense Lot-3', amount: 0 },
    { no: 13, description: 'Test Cost', amount: 82317.90 },
    { no: 14, description: 'Service Cost', amount: 0 },
    { no: 15, description: 'Fuel for Welding', amount: 28713.10 },
    { no: 16, description: 'For Mestengdo', amount: 75806.40 },
    { no: 17, description: 'Travel Expense and Other', amount: 3551796.85 },
    { no: 18, description: 'DL for Green Legacy', amount: 4200.00 },
    { no: 19, description: 'Uniform and Clothing Expense – Ajima Chacha Irri Lot 3', amount: 16973.00 },
    { no: 20, description: 'Medical Expense (2)', amount: 149235.35 },
    { no: 21, description: 'Rent Cost of House, Storage Area, etc.', amount: 308500.00 },
    { no: 22, description: 'Transport Cost for Machinery (Low-Bed)', amount: 120000.00 },
    { no: 23, description: 'Other Costs – Irrigation Project AJIMA CHACHA LOT-03', amount: 312222.38 },
    { no: 24, description: 'Grease', amount: 6990.00 },
    { no: 25, description: 'Camp Maintenance (Timber, Poles, Nails, Chipwood, Purlin, etc.)', amount: 121541.44 },
    { no: 26, description: 'Office Desktop and Laptop', amount: 305798.17 },
    { no: 27, description: 'Benzine, Flasher, Brake Fluid, Transmission, Gear Oil, Grease, Coolant, ATF', amount: 5726696.73 },
    { no: 28, description: 'Car Guard (2)', amount: 35950.00 },
    { no: 29, description: 'Machinery Maintenance', amount: 60940.00 },
    { no: 30, description: 'Tyre & Inner Tube', amount: 13102339.85 },
    { no: 31, description: 'ጥገናr Tube', amount: 1559.85 },
  ];

  // Real "Machinery Cost" breakdown
  const machineryItems = [
    { no: 1, description: 'Dozer', amount: 8722732.48 },
    { no: 2, description: 'Excavator', amount: 31238561.23 },
    { no: 3, description: 'Loader', amount: 5767979.23 },
    { no: 4, description: 'Grader', amount: 915668.27 },
    { no: 5, description: 'Dump truck', amount: 77781197.15 },
    { no: 6, description: 'Fuel Track', amount: 2798061.23 },
    { no: 7, description: 'Shower truck', amount: 2837275.12 }
  ];

  const overheadTotal = overheadItems.reduce((s, i) => s + i.amount, 0);
  const machineryTotal = machineryItems.reduce((s, i) => s + i.amount, 0);

  return {
    overheadTotal,
    machineryTotal,
    grandTotal: overheadTotal + machineryTotal,
    categories: [
      {
        key: 'overhead',
        name: 'Overhead / Other Expenses',
        icon: '💸',
        total: overheadTotal,
        items: overheadItems
      },
      {
        key: 'machinery',
        name: 'Machinery Cost',
        icon: '🏗️',
        total: machineryTotal,
        items: machineryItems
      }
    ]
  };
}

module.exports = {
  CONTRACT_BILL_IDS,
  getIncomeSummary,
  getCostSummary,
  getPercentSummary,
  getEcostSummary
};
