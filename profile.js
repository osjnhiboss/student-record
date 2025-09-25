// profile.js - manage profile page

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('profileForm');
  const msg = document.getElementById('profileMsg');
  const logoutBtn = document.getElementById('logoutBtn');
  const updateBtn = document.getElementById('updateProfile');

  // populate if user logged in
  const cur = getCurrentUser();
  if (cur){
    document.getElementById('pUsername').value = cur.username;
    document.getElementById('pRole').value = cur.role || 'teacher';
  }

  updateBtn.addEventListener('click', ()=>{
    const un = document.getElementById('pUsername').value.trim();
    const pw = document.getElementById('pPassword').value;
    const role = document.getElementById('pRole').value;
    if (!un) { showMessage(msg,'Username required','warn'); return; }
    let users = getUsers();
    const uidx = users.findIndex(u => u.username === (cur?cur.username:'__tmp__'));
    if (uidx >= 0){
      users[uidx].username = un;
      if (pw) users[uidx].password = pw;
      users[uidx].role = role;
      saveUsers(users);
      // update current user
      localStorage.setItem(STORAGE.CURRENT_USER, JSON.stringify(users[uidx]));
      showMessage(msg,'Profile updated','info');
    } else {
      showMessage(msg,'No logged user','warn');
    }
  });

  logoutBtn.addEventListener('click', ()=>{
    logoutUser();
    alert('Logged out');
    window.location.href = 'index.html';
  });
});
