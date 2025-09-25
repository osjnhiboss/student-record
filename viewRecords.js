// viewRecords.js - display table, sort, search, export CSV, clear

document.addEventListener('DOMContentLoaded', ()=>{
  const tbody = document.querySelector('#recordsTable tbody');
  const search = document.getElementById('search');
  const sortBy = document.getElementById('sortBy');
  const exportBtn = document.getElementById('exportCsv');
  const clearAll = document.getElementById('clearAll');
  const alerts = document.getElementById('alerts');
  const stats = document.getElementById('stats');

  function render(){
    let recs = getRecords();
    // filter
    const q = (search && search.value || '').toLowerCase();
    if (q) recs = recs.filter(r => (r.name||'').toLowerCase().includes(q) || (r.exam||'').toLowerCase().includes(q) || (r.teacher||'').toLowerCase().includes(q));
    // sort
    const s = sortBy.value;
    if (s === 'scoreDesc') recs.sort((a,b)=>b.score - a.score);
    else if (s === 'scoreAsc') recs.sort((a,b)=>a.score - b.score);
    else if (s === 'attendanceDesc') recs.sort((a,b)=>b.attendance - a.attendance);
    else recs.sort((a,b)=>b.ts - a.ts);

    tbody.innerHTML = '';
    if (!recs.length) {
      tbody.innerHTML = '<tr><td colspan="8">No records found.</td></tr>';
      stats.textContent = '';
      return;
    }

    let below45 = 0;
    let totalScore = 0;
    recs.forEach(r=>{
      const tr = document.createElement('tr');
      if (Number(r.score) < 45) { tr.classList.add('low-score'); below45++; }
      totalScore += Number(r.score);
      tr.innerHTML = `
        <td>${escapeHtml(r.name)}</td>
        <td>${escapeHtml(r.exam)}</td>
        <td>${r.attendance}%</td>
        <td>${Number(r.score).toFixed(2)}</td>
        <td>${r.grade}</td>
        <td>${escapeHtml(r.teacher)}</td>
        <td>${new Date(r.ts).toLocaleString()}</td>
        <td><button class="btn small" data-id="${r.id}" data-action="delete">Delete</button></td>
      `;
      tbody.appendChild(tr);
    });

    stats.textContent = `Records: ${recs.length} • Avg Score: ${(totalScore/recs.length).toFixed(2)} • Low (<45%): ${below45}`;

    // attach delete handlers
    tbody.querySelectorAll('button[data-action="delete"]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        if (!confirm('Delete this record?')) return;
        let arr = getRecords().filter(x=>x.id !== id);
        saveRecords(arr);
        render();
      });
    });

    // show an alert if there are any below threshold
    if (below45 > 0) showMessage(alerts, `Warning: ${below45} record(s) have score below 45% — take action.`, 'danger');
  }

  // export CSV
  exportBtn.addEventListener('click', ()=> exportRecordsCSV());

  // clear all
  clearAll.addEventListener('click', ()=>{
    if (!confirm('Clear all records (this will delete data locally)?')) return;
    localStorage.removeItem(STORAGE.RECORDS);
    render();
  });

  // input handlers
  [search, sortBy].forEach(el => el && el.addEventListener('input', render));

  // utility: escape text to avoid XSS accidentally
  function escapeHtml(s){ return String(s || '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

  render();
});
