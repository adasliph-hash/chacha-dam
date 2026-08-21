const db = require('./database');

// Clear existing data (for clean seed)
db.exec(`
  DELETE FROM bill_items;
  DELETE FROM bills;
  DELETE FROM cost_items;
  DELETE FROM project_settings;
`);

// ==================== BILLS (Income) ====================
const insertBill = db.prepare(`INSERT INTO bills (id, name, icon) VALUES (?, ?, ?)`);
const insertItem = db.prepare(`
  INSERT INTO bill_items (bill_id, no, description, ach, inc)
  VALUES (?, ?, ?, ?, ?)
`);

const bills = [
  {
    id: 'A', name: 'GENERAL ITEMS', icon: '🔧',
    items: [
      { no: '1.30', d: 'Provision of safety clothing for staff and visitors', ach: 1.20, inc: 1375777.99 },
      { no: '1.12.5', d: 'Office furniture and equipment', ach: 1.04, inc: 615820.05 },
      { no: '1.12.8', d: 'Temporary utilities (electricity, water, telephone)', ach: 0.72, inc: 9141575.07 },
      { no: '1.13.3', d: 'Security provisions', ach: 0.72, inc: 1425815.46 },
      { no: '1.14', d: 'Compensation payment estimation expenses', ach: 0.76, inc: 1140234.71 },
      { no: '1.16', d: 'Provisional sum for miscellaneous work', ach: 0.07, inc: 124470.14 },   
    ]
  },
  {
    id: 'B', name: 'MAIN DAM', icon: '🌊',
    items: [
      { no: '2.3.1', d: 'Core zone fill & compaction with clay (max 5 km)', ach: 42102.17, inc: 12186894.13 },
      { no: '2.4.1', d: 'Shell zone fill & compaction with selected material', ach: 65994.70, inc: 17220657.02 },
      { no: '2.5.1', d: 'Filter material (Finer) zone 2A', ach: 10050.93, inc: 12390786.50 },
      { no: '2.5.2', d: 'Filter material (coarser) zone 2B', ach: 5043.00, inc: 6228357.15 },
      { no: '2.5.4', d: 'Riprap zone 5', ach: 5547.59, inc: 4502368.57 },
      { no: '2.6.1', d: 'Rock zone 4 fill & compaction', ach: 103018.56, inc: 87547233.68 },
      { no: '2.9.4', d: 'Vibrating Wire Piezometer', ach: 3.00, inc: 561600.00 },
      { no: '2.9.5', d: 'Vibrating Wire settlement sensor', ach: 1.00, inc: 117000.00 },
      { no: '2.9.8', d: 'Vibrating wire cable', ach: 307.94, inc: 288231.84 }
    ]
  },
  {
    id: 'C', name: 'GROUTING AND FAULT TREATMENT', icon: '💧',
    items: [
      { no: '3.A.1', d: 'Mobilization and Demobilization', ach: 0.50, inc: 292789.65 }
    ]
  },
  {
    id: 'D', name: 'INTAKE TOWER STRUCTURE', icon: '🗼',
    items: [
      { no: '4.2.4', d: 'Base slab', ach: 3.17, inc: 16324.64 },
      { no: '4.2.5', d: 'Shaft work', ach: 17.44, inc: 106271.53 },
      { no: '4.2.7', d: 'C-15 mass concrete', ach: 69.11, inc: 265855.80 },
      { no: '4.3.5', d: 'φ16mm bar', ach: 2538.11, inc: 173454.10 },
      { no: '4.3.6', d: 'φ14mm bar', ach: 13.33, inc: 911.18 },
      { no: '4.3.7', d: 'φ10mm bar', ach: 203.07, inc: 32063.76 },
      { no: '4.3.9', d: '10mm thick steel conduit', ach: 4.00, inc: 343639.40 }
    ]
  },
  {
    id: 'E', name: 'ACCESS BRIDGE', icon: '🛣️',
    items: [
      { no: '5.2.4', d: 'Safety Hand Rail (50mm GS Pipe)', ach: 60.00, inc: 88090.20 }
    ]
  },
  {
    id: 'F', name: 'IRRIGATION OUTLET WORKS', icon: '💧',
    items: [
      { no: '6.2.1', d: 'C-10 lean concrete', ach: 8.10, inc: 1003.75 },
      { no: '6.3.3', d: 'φ16mm bar', ach: 631.60, inc: 43163.54 },
      { no: '6.3.6', d: 'φ10mm bar', ach: 183.52, inc: 12541.76 }
    ]
  },
  {
    id: 'G', name: 'LOW LEVEL OUTLET WORKS', icon: '⚙️',
    items: [
      { no: '7.7.6', d: 'Howell-Bunger Regulating valve', ach: 1.00, inc: 39710720.00 },
      { no: '7.7.7', d: 'DN1500mm DCI bend', ach: 1.00, inc: 13441280.00 },
      { no: '7.7.8', d: 'DN2000mm Butterfly valve', ach: 1.00, inc: 19557120.00 },
      { no: '7.7.9', d: 'Material production inspection', ach: 1.00, inc: 2800000.00 }
    ]
  },
  {
    id: 'H', name: 'EMERGENCY CANAL', icon: '🏞️',
    items: [
      { no: '8.5.1', d: 'C-25 concrete work', ach: 8.50, inc: 45602.50 },
      { no: '8.5.3', d: 'Reinforcement bars', ach: 278.70, inc: 19046.36 }
    ]
  },
  {
    id: 'K', name: 'PERMANENT ACCESS ROAD', icon: '🛣️',
    items: [
      { no: '11.7.1', d: 'Ordinary Soil Excavation', ach: 156.60, inc: 12935.16 },
      { no: '11.7.2', d: 'Stone masonry work', ach: 404.81, inc: 932097.57 },
      { no: '11.7.3', d: 'C-25 concrete slab', ach: 32.80, inc: 194254.72 },
      { no: '11.7.5', d: 'Reinforcement bars ø14mm', ach: 5182.52, inc: 354173.42 },
      { no: '11.7.6', d: 'Cart away excavated material', ach: 96.00, inc: 4304.64 },
      { no: '11.7.8', d: 'Back fill with shell material', ach: 240.00, inc: 42801.60 }
    ]
  },
  {
    id: 'N', name: 'VALVE HOUSE STRUCTURE', icon: '🏠',
    items: [
      { no: '2.10', d: 'C-10 lean concrete', ach: 82.56, inc: 10230.84 },
      { no: '2.30', d: 'C-30 Reinforced concrete', ach: 92.59, inc: 477114.42 },
      { no: '3.10', d: 'φ24mm bar', ach: 15009.95, inc: 1051146.59 },
      { no: '3.20', d: 'φ20mm bar', ach: 728.34, inc: 51005.93 },
      { no: '3.30', d: 'φ16mm bar', ach: 4918.99, inc: 336163.78 }
    ]
  },  
];

const insertMany = db.transaction(() => {
  for (const bill of bills) {
    insertBill.run(bill.id, bill.name, bill.icon);
    for (const item of bill.items) {
      insertItem.run(bill.id, item.no, item.d, item.ach, item.inc);
    }
  }
});

insertMany();
console.log('✅ Bills seeded');

// ==================== COST ITEMS ====================
const insertCost = db.prepare(`INSERT INTO cost_items (category, name, amount) VALUES (?, ?, ?)`);

const costs = [
  // labour
  ['labour', 'Mason', 337587.97],
  ['labour', 'Barbender', 168023.27],
  ['labour', 'Carpenter', 209881.82],
  ['labour', 'Time Keeper', 108195.00],
  ['labour', 'Surveyor', 41850.00],
  ['labour', 'Guard', 1419665.00],
  ['labour', 'Dl', 1370721.24],
  ['labour', 'Curer', 9750.00],
  ['labour', 'Labor cost For Camp & minsbet', 1807826.00],
  ['labour', 'Material inspection team', 2800000.00],

  // admin
  ['admin', 'INTERTEMENTS', 1200826.14],
  ['admin', 'Travel Expense and Other', 3625072.28],
  ['admin', 'Spare part for pump, generator & cons.mater', 16957.01],
  ['admin', 'Camping Item', 119636.76],
  ['admin', 'Supplies & Stationary Expense', 1395837.09],
  ['admin', 'Uniform and Clothing Expense', 1682799.51],
  ['admin', 'Spare Part Expense', 36211711.56],
  ['admin', 'Fuel & Lubricants Expense', 800.00],
  ['admin', 'Camping Generator Fuel & Lubricants', 5736053.99],
  ['admin', 'Rent cost of house, storage area etc.', 308500.00],
  ['admin', 'Machinery Maintenance', 60940.00],

  // staff
  ['staff', 'Construction staff', 15568391.57],
  ['staff', 'Equipment staff', 47378425.54],

  // material
  ['material', 'Cement', 841975.86],
  ['material', 'Sand', 1577454.61],
  ['material', 'Reinf.', 4693066.23],
  ['material', 'Fuel', 97963930.91],
  ['material', 'Sand With Rental D.Truck', 10738897.14],
  ['material', 'DN2000mm Flanged butterfly valve', 19557120.00],
  ['material', 'Howell-Bunger Regulating valve', 39710720.00],
  ['material', 'DN1500mm DCI bend', 13441280.00],

  // machinery
  ['machinery', 'Dozer', 8722732.48],
  ['machinery', 'Excavator', 31238561.23],
  ['machinery', 'Loader', 5767979.23],
  ['machinery', 'Grader', 915668.27],
  ['machinery', 'Dump truck', 77781197.15],
  ['machinery', 'Fuel Track', 2798061.23],
  ['machinery', 'Shower truck', 2837275.12],

  // overhead
  ['overhead', 'Overhead 20%', 34454047.00]
];

const insertCosts = db.transaction(() => {
  for (const [cat, name, amount] of costs) {
    insertCost.run(cat, name, amount);
  }
});

insertCosts();
console.log('✅ Cost items seeded');

// ==================== SETTINGS (Percent & E-cost helpers) ====================
const insertSetting = db.prepare(`INSERT INTO project_settings (key, value) VALUES (?, ?)`);
insertSetting.run('overall_progress', '72.8');
insertSetting.run('planned_months', '36');
insertSetting.run('elapsed_months', '26');

console.log('✅ Settings seeded');
console.log('🎉 Database seeding completed successfully!');
