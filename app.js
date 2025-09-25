// app.js - utilities and constants

const STORAGE = {
  USERS: 'ats_users_v1',
  CURRENT_USER: 'ats_current_user',
  RECORDS: 'ats_records_v1'
};

// default admin (created if none exist)
function ensureDefaultAdmin(){
  let u = getUsers();
  if (!u || !u.length) {
    u = [{ id: 'u-admin', username:'admin', password:'admin123', role:'admin'}];
    localStorage.setItem(STORAGE.USERS, JSON.stringify(u));
  }
}

function getUsers(){
  try { return JSON.parse(localStorage.getItem(STORAGE.USERS)) || []; } catch(e){ return []; }
}
function saveUsers(arr){ localStorage.setItem(STORAGE.USERS, JSON.stringify(arr)); }

function loginUser(username, password){
  const u = getUsers().find(x => x.username === username && x.password === password);
  if (!u) return null;
  localStorage.setItem(STORAGE.CURRENT_USER, JSON.stringify(u));
  return u;
}
function logoutUser(){ localStorage.removeItem(STORAGE.CURRENT_USER); }
function getCurrentUser(){ try{ return JSON.parse(localStorage.getItem(STORAGE.CURRENT_USER)) || null;}catch(e){return null;} }

// storage helpers for records
function getRecords(){
  try { return JSON.parse(localStorage.getItem(STORAGE.RECORDS)) || []; } catch(e) { return []; }
}
function saveRecords(arr){ localStorage.setItem(STORAGE.RECORDS, JSON.stringify(arr)); }

// id generator
function uid(prefix='r'){
  return prefix + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random()*10000).toString(36);
}

// grade mapping (standard US +/-). returns letter grade
function gradeFromScore(score){
  const s = Number(score);
  if (s >= 70) return 'A';
  if (s >= 60) return 'B';
  if (s >= 50) return 'C';
  if (s >= 40) return 'D';
  if (s >= 35) return 'E';
  return 'F';
}

// save single student record (object fields: name, attendance, score, exam)
function saveRecord(record){
  // validation & normalization
  const r = {
    id: record.id || uid('r'),
    name: String(record.name).trim(),
    attendance: Number(record.attendance) || 0,
    score: Number(record.score) || 0,
    exam: record.exam || 'Exam',
    teacher: record.teacher || (getCurrentUser()?getCurrentUser().username:'unknown'),
    ts: record.ts || Date.now(),
    grade: gradeFromScore(Number(record.score))
  };
  const arr = getRecords();
  arr.unshift(r); // newest first
  saveRecords(arr);
  return r;
}

// export records as CSV string
function buildCSV(rows){
  return rows.map(r => r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
}
function exportRecordsCSV(){
  const recs = getRecords();
  const rows = [['id','name','attendance','score','grade','exam','teacher','timestamp']];
  recs.forEach(r => rows.push([r.id,r.name,r.attendance,r.score,r.grade,r.exam,r.teacher,new Date(r.ts).toISOString()]));
  const csv = buildCSV(rows);
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'students_records.csv'; a.click();
  URL.revokeObjectURL(url);
}

// quick helper for alerts area
function showMessage(targetEl, text, type='info'){
  if (!targetEl) return;
  targetEl.innerHTML = `<div class="alert ${type==='warn'?'warn':type==='danger'?'danger':'info'}">${text}</div>`;
  setTimeout(()=> { targetEl.innerHTML = ''; }, 6000);
}

// bootstrap default: create default admin if needed
document.addEventListener('DOMContentLoaded', ()=> ensureDefaultAdmin());
