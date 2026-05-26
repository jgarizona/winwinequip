/* ============================================
   WinWin Equipment Exchange — script.js
   ============================================ */

const MODELS = [
  {
    group: 'Thor — Current Generation',
    items: [
      'Thor VM1A',
      'Thor VM1',
      'Thor VM2',
      'Thor VM3',
      'Thor VM3A',
      'Thor VMC3',
    ]
  },
  {
    group: 'Thor VX — Legacy Series',
    items: [
      'Thor VX6',
      'Thor VX7',
      'Thor VX8',
      'Thor VX9',
    ]
  },
  {
    group: 'Intermec (Honeywell) — CV Series',
    items: [
      'Intermec CV31',
      'Intermec CV41',
      'Intermec CV60',
      'Intermec CV61',
    ]
  },
  {
    group: 'LXE — Legacy Series',
    items: [
      'LXE MX3X',
      'LXE MX7',
      'LXE VX6',
      'LXE VX7',
    ]
  }
];

/* ---- Build <select> options HTML ---- */
function buildModelOptions() {
  let html = '<option value="">Select model…</option>';
  MODELS.forEach(g => {
    html += `<optgroup label="${g.group}">`;
    g.items.forEach(m => {
      html += `<option value="${m}">${m}</option>`;
    });
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
      ${!isFirst ? `<button type="button" class="btn-remove" onclick="removeRow('erow_${idx}')">✕ Remove</button>` : ''}
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
        <label for="year_${idx}">Year Purchased</label>
        <input type="number" id="year_${idx}" name="year_${idx}" min="1995" max="2025" placeholder="e.g. 2018">
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
    </div>
    <div class="form-grid" style="margin-top:14px">
      <div class="form-group">
        <label for="eos_${idx}">Estimated End-of-Service Date</label>
        <input type="month" id="eos_${idx}" name="eos_${idx}">
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
  `;
  container.appendChild(row);
  renumberRows();
}

function removeRow(id) {
  const el = document.getElementById(id);
  if (el) { el.remove(); renumberRows(); }
}

function renumberRows() {
  const rows = document.querySelectorAll('.equipment-row');
  rows.forEach((r, i) => {
    const lbl = r.querySelector('.equipment-row-label');
    if (lbl) lbl.textContent = `Unit Group ${i + 1}`;
  });
}

/* ---- Compile equipment rows into text for email ---- */
function compileEquipmentSummary() {
  const rows = document.querySelectorAll('.equipment-row');
  const lines = [];
  rows.forEach((row, i) => {
    const model = row.querySelector('select[id^="model_"]')?.value || '—';
    const qty   = row.querySelector('input[id^="qty_"]')?.value   || '—';
    const yr    = row.querySelector('input[id^="year_"]')?.value  || '—';
    const cond  = row.querySelector('select[id^="cond_"]')?.value || '—';
    const eos   = row.querySelector('input[id^="eos_"]')?.value   || '—';
    const age   = row.querySelector('select[id^="age_"]')?.value  || '—';
    lines.push(
      `[Group ${i+1}] Model: ${model} | Qty: ${qty} | Yr Purchased: ${yr} | Age: ${age} | Condition: ${cond} | Est. End-of-Service: ${eos}`
    );
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

/* ---- Shared form submit helper ---- */
async function submitForm(formEl, summaryHiddenId, btnId, spinnerId, successId, errorId, extraPrep) {
  const btn     = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);

  if (extraPrep && !extraPrep()) return; // validation hook

  btn.disabled = true;
  spinner.style.display = 'inline-block';

  try {
    const fd = new FormData(formEl);
    const res = await fetch('https://formsubmit.co/ajax/info@winwinequip.com', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: fd
    });
    if (res.ok) {
      document.getElementById(successId).classList.add('show');
      formEl.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else { throw new Error(); }
  } catch {
    document.getElementById(errorId).classList.add('show');
    btn.disabled = false;
    spinner.style.display = 'none';
  }
}
