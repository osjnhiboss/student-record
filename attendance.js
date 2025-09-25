// attendance.js - handle manual entry + CSV import

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('attendanceForm');
  const saveBtn = document.getElementById('saveRecord');
  const clearBtn = document.getElementById('clearForm');
  const feedback = document.getElementById('feedback');
  const importBtn = document.getElementById('importCsv');
  const csvFileInput = document.getElementById('csvFile');
  const markAllBtn = document.getElementById('markAllPresent');

  // manual save
  saveBtn.addEventListener('click', ()=>{
    const name = document.getElementById('studentName').value.trim();
    const attendance = Number(document.getElementById('attendancePct').value);
    const score = Number(document.getElementById('score').value);
    const exam = document.getElementById('examTitle').value.trim() || 'Exam';

    // validation
    if (!name) { showMessage(feedback,'Enter student name','warn'); return; }
    if (isNaN(attendance) || attendance < 0 || attendance > 100){ showMessage(feedback,'Attendance must be 0-100','warn'); return; }
    if (isNaN(score) || score < 0 || score > 100){ showMessage(feedback,'Score must be 0-100','warn'); return; }

    const cur = getCurrentUser();
    const teacher = cur ? cur.username : 'unknown';
    const rec = saveRecord({name, attendance, score, exam, teacher});
    showMessage(feedback, `Saved: ${rec.name} — ${rec.exam} — ${rec.score} (${rec.grade})`, 'info');

    // alert if below threshold
    if (Number(score) < 45) {
      showMessage(feedback, `ALERT: ${rec.name} scored below 45% (${rec.score}).`, 'danger');
    }

    form.reset();
  });

  clearBtn.addEventListener('click', ()=> form.reset());

  // CSV import (simple)
  importBtn.addEventListener('click', ()=> {
    const f = csvFileInput.files[0];
    if (!f) { showMessage(feedback,'Choose a CSV file first','warn'); return; }
    const reader = new FileReader();
    reader.onload = (evt)=>{
      try {
        const txt = evt.target.result;
        const lines = txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
        // assume header present if first line contains non-numeric
        let start = 0;
        const hdr = lines[0].split(',');
        const hasHeader = /name/i.test(hdr[0]);
        if (hasHeader) start = 1;
        const cur = getCurrentUser();
        let count=0;
        for (let i=start;i<lines.length;i++){
          const cols = lines[i].split(',').map(c=>c.trim().replace(/^"|"$/g,''));
          const name = cols[0]||'Unknown';
          const attendance = Number(cols[1]) || 0;
          const score = Number(cols[2]) || 0;
          const exam = cols[3] || 'Exam';
          saveRecord({name,attendance,score,exam,teacher: cur ? cur.username : 'unknown'});
          count++;
        }
        showMessage(feedback, `Imported ${count} records.`, 'info');
      } catch(e){ showMessage(feedback, 'Failed to parse CSV', 'danger'); }
    };
    reader.readAsText(f);
  });

  // mark all present helper: uses all loaded records (appends new "attendance-only" record)
  markAllBtn.addEventListener('click', ()=>{
    const name = prompt('Enter comma-separated student names to mark present (or Cancel):');
    if (!name) return;
    const list = name.split(',').map(s=>s.trim()).filter(Boolean);
    const cur = getCurrentUser();
    let n=0;
    list.forEach(nm => { saveRecord({name:nm, attendance:100, score:0, exam:'Attendance', teacher:cur?cur.username:'unknown'}); n++; });
    showMessage(feedback, `Marked ${n} students present.`, 'info');
  });
});
