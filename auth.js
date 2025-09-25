// auth.js - login page wiring and simple user management

document.addEventListener('DOMContentLoaded', ()=>{
  const loginForm = document.getElementById('loginForm');
  if (loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      const user = loginUser(u,p);
      if (!user) { alert('Invalid credentials'); return; }
      alert('Welcome, ' + user.username + ' (' + user.role + ')');
      window.location.href = 'index.html';
    });

    document.getElementById('createDemoAdmin').addEventListener('click', ()=>{
      const users = getUsers();
      if (users.find(x=>x.username==='admin')) { alert('Admin exists'); return; }
      users.push({id:'u-admin', username:'admin', password:'admin123', role:'admin'});
      saveUsers(users);
      alert('Demo admin created: admin / admin123');
    });
  }
});
