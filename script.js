/* ============================================
   WinWin Equipment Exchange — script.js
   ============================================ */

const MODELS = [
  {
    group: 'Thor — Current Generation',
    items: ['Thor VM1A','Thor VM1','Thor VM2','Thor VM3','Thor VM3A','Thor VMC3']
  },
  {
    group: 'Thor VX — Legacy Series',
    items: ['Thor VX6','Thor VX7','Thor VX8','Thor VX9']
  },
  {
    group: 'Intermec (Honeywell) — CV Series',
    items: ['Intermec CV31','Intermec CV41','Intermec CV60','Intermec CV61']
  },
  {
    group: 'LXE — Legacy Series',
    items: ['LXE MX3X','LXE MX7','LXE VX6','LXE VX7']
  }
];

/* ---- Lead ID: VM-MDDYY-HHMM  (e.g. VM-52626-1423) ---- */
function getLeadID() {
  const now = new Date();
  const m   = String(now.getMonth() + 1);
  const d   = String(now.getDate()).padStart(2, '0');
  const yy  = String(now.getFullYear()).slice(-2);
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  return `VM-${m}${d}${yy}-${hh}${mm}`;
}

function buildSubject(type) {
  // type = 'Equipment Sale' or 'Spare Parts'
  return `Honeywell ${getLeadID()} | ${type} Inquiry`;
}

/* ---- Build <select> option HTML ---- */
function buildModelOptions() {
  let html = '<option value="">Select model…</option>';
  MODELS.forEach(g => {
    html += `<optgroup label="${g.group}">`;
    g.items.forEach(m => { html += `<option value="${m}">${m}</option>`; });
    html += '</optgroup>';
  });
  return html;
}

/* ---- Equipment rows (sell page) ---- */
let rowCount = 0;

function addRow() {
  const container = document.getElementById('equipmentRows');
  if (!container) return;
  const idx = rowCount++;
  const isFirst = idx === 0;
  const row = document.createElement('div');
  row.className = 'equipment-row';
  row.id = `erow_${idx}`;
  row.innerHTML = `
    <div class="equipment-row-header">
      <span class="equipment-row-label">Unit Group ${idx + 1}</span>
      ${!isFirst ? `<button type="button" class="btn-remove" onclick="removeRow('erow_${idx}')">&#x2715; Remove</button>` : ''}
    </div>
    <div class="form-grid">
      <div class="form-group span-full">
        <label for="model_${idx}">Model <span class="req">*</span></label>
        <select id="model_${idx}" name="model_${idx}" required onchange="this.style.borderColor=''">
          ${buildModelOptions()}
        </select>
      </div>
    </div>
    <div class="form-grid--3" style="margin-top:14px">
      <div class="form-group">
        <label for="qty_${idx}">Quantity</label>
        <input type="number" id="qty_${idx}" name="qty_${idx}" min="1" placeholder="# of units">
      </div>
      <div class="form-group">
        <label for="cond_${idx}">Condition</label>
        <select id="cond_${idx}" name="cond_${idx}">
          <option value="">Select…</option>
          <option>Excellent — Like new, fully functional</option>
          <option>Good — Normal wear, fully functional</option>
          <option>Fair — Noticeable wear, functional</option>
          <option>Poor — Heavy wear or partial issues</option>
          <option>For Parts / Non-functional</option>
        </select>
      </div>
      <div class="form-group">
        <label for="age_${idx}">Approx. Age of Equipment</label>
        <select id="age_${idx}" name="age_${idx}">
          <option value="">Select…</option>
          <option>Less than 2 years</option>
          <option>2–4 years</option>
          <option>4–6 years</option>
          <option>6–8 years</option>
          <option>8–10 years</option>
          <option>10+ years</option>
        </select>
      </div>
    </div>
    <div class="form-grid" style="margin-top:14px">
      <div class="form-group span-full">
        <label for="eos_${idx}">Estimated Remove From Service</label>
        <select id="eos_${idx}" name="eos_${idx}">
          <option value="">Select timeline…</option>
          <option>Less than 6 months</option>
          <option>6 months – 1 year</option>
          <option>1–2 years</option>
          <option>2+ years</option>
        </select>
      </div>
    </div>
    <div style="margin-top:14px">
      <label class="pic-check-row" for="pics_${idx}">
        <input type="checkbox" id="pics_${idx}" name="pics_${idx}" value="Yes — can provide pictures">
        <span class="pic-check-label">Can you provide pictures if needed?</span>
      </label>
    </div>
  `;
  container.appendChild(row);
  renumberRows();
}

function removeRow(id) {
  const el = document.getElementById(id);
  if (el) { el.remove(); renumberRows(); }
}

function renumberRows() {
  document.querySelectorAll('.equipment-row').forEach((r, i) => {
    const lbl = r.querySelector('.equipment-row-label');
    if (lbl) lbl.textContent = `Unit Group ${i + 1}`;
  });
}

function compileEquipmentSummary() {
  const rows = document.querySelectorAll('.equipment-row');
  const lines = [];
  rows.forEach((row, i) => {
    const model = row.querySelector(`select[id^="model_"]`)?.value || '—';
    const qty   = row.querySelector(`input[id^="qty_"]`)?.value   || '—';
    const cond  = row.querySelector(`select[id^="cond_"]`)?.value || '—';
    const eos   = row.querySelector(`select[id^="eos_"]`)?.value  || '—';
    const age   = row.querySelector(`select[id^="age_"]`)?.value  || '—';
    const pics  = row.querySelector(`input[id^="pics_"]`)?.checked ? 'Yes' : 'No';
    lines.push(`[Group ${i+1}] Model: ${model} | Qty: ${qty} | Age: ${age} | Condition: ${cond} | Est. Remove From Service: ${eos} | Pictures Available: ${pics}`);
  });
  return lines.join('\n');
}

/* ---- Build model checkboxes (parts page) ---- */
function buildModelCheckboxes(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let html = '';
  MODELS.forEach(g => {
    html += `<div class="model-section-label">${g.group}</div>`;
    g.items.forEach(m => {
      const id = 'mc_' + m.replace(/[\s\/\(\)]+/g, '_');
      html += `
        <div>
          <input type="checkbox" class="model-check-option" id="${id}" value="${m}">
          <label for="${id}" class="model-check-label">${m}</label>
        </div>`;
    });
  });
  container.innerHTML = html;
}

/* ---- Part rows (parts page) ---- */
let partRowCount = 0;

function addPartRow() {
  const container = document.getElementById('partRows');
  if (!container) return;
  const idx = partRowCount++;
  const isFirst = idx === 0;
  const row = document.createElement('div');
  row.className = 'part-row';
  row.id = `prow_${idx}`;
  row.innerHTML = `
    <div class="equipment-row-header">
      <span class="equipment-row-label">Part / Component ${idx + 1}</span>
      ${!isFirst ? `<button type="button" class="btn-remove" onclick="removePartRow('prow_${idx}')">&#x2715; Remove</button>` : ''}
    </div>
    <div class="form-group" style="margin-bottom:10px">
      <label for="pdesc_${idx}">Description <span class="req">*</span></label>
      <textarea id="pdesc_${idx}" rows="2" style="min-height:60px"
        placeholder="e.g. Replacement display screen, docking station, keyboard assembly, power supply…"></textarea>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label for="pn_${idx}">Part Number (If Known)</label>
        <input type="text" id="pn_${idx}" placeholder="e.g. VM3055CABLE">
      </div>
      <div class="form-group">
        <label for="pqty_${idx}">Quantity Needed</label>
        <input type="text" id="pqty_${idx}" placeholder="e.g. 12, approx 20">
      </div>
    </div>
  `;
  container.appendChild(row);
  renumberPartRows();
}

function removePartRow(id) {
  const el = document.getElementById(id);
  if (el) { el.remove(); renumberPartRows(); }
}

function renumberPartRows() {
  document.querySelectorAll('.part-row').forEach((r, i) => {
    const lbl = r.querySelector('.equipment-row-label');
    if (lbl) lbl.textContent = `Part / Component ${i + 1}`;
  });
}
