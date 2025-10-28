(function(){
  const API_BASE = 'http://localhost:3000/api';
  const tokenKey = 'admin_token';

  // Helpers
  const $ = (sel) => document.querySelector(sel);
  const getToken = () => localStorage.getItem(tokenKey) || '';
  const setToken = (t) => { localStorage.setItem(tokenKey, t); }
  const clearToken = () => { localStorage.removeItem(tokenKey); }
  const authHeaders = () => {
    const t = getToken();
    return t ? { 'Authorization': (t.startsWith('Bearer ') ? t : 'Bearer ' + t) } : {};
  }

  // DOM refs
  const tokenInput = $('#tokenInput');
  const saveTokenBtn = $('#saveToken');
  const clearTokenBtn = $('#clearToken');

  const roomsContainer = $('#roomsContainer');
  const bookingsContainer = $('#bookingsContainer');
  const usersContainer = $('#usersContainer');

  const refreshRoomsBtn = $('#refreshRooms');
  const newRoomBtn = $('#newRoomBtn');
  const refreshBookingsBtn = $('#refreshBookings');
  const refreshUsersBtn = $('#refreshUsers');

  // Initialize token input
  tokenInput.value = getToken();
  saveTokenBtn.addEventListener('click', ()=>{
    setToken(tokenInput.value.trim());
    alert('Token saved locally.');
  });
  clearTokenBtn.addEventListener('click', ()=>{ clearToken(); tokenInput.value=''; alert('Token cleared.'); });

  // Overview cards
  function renderOverview(counts = {}){
    const cards = [
      { title: 'Today Arrival', value: counts.todayArrival || 0 },
      { title: 'Today Departure', value: counts.todayDeparture || 0 },
      { title: 'Total Booked', value: counts.totalBooked || 0 },
      { title: 'Available Rooms', value: counts.availableRooms || 0 }
    ];
    const container = $('#overviewCards');
    container.innerHTML = cards.map(c=>`<div class="card"><div class="muted">${c.title}</div><div style="font-size:20px;font-weight:700;margin-top:8px">${c.value}</div></div>`).join('');
  }

  // Rooms
  async function fetchRooms(){
    roomsContainer.innerHTML = 'Loading...';
    try{
      const res = await fetch(`${API_BASE}/admin/rooms`, { headers: { 'Content-Type':'application/json', ...authHeaders() } });
      if(!res.ok) return roomsContainer.innerHTML = `Error: ${res.status} ${res.statusText}`;
      const rooms = await res.json();
      renderRooms(rooms);
      renderOverview({ availableRooms: rooms.filter(r=>!r.booked).length, totalBooked: rooms.filter(r=>r.booked).length });
    }catch(e){ roomsContainer.innerHTML = 'Fetch failed: '+e.message }
  }

  function renderRooms(rooms){
    if(!rooms || rooms.length===0){ roomsContainer.innerHTML = '<div class="muted">No rooms found</div>'; return }
    const tiles = rooms.map(r=>`
      <div class="room-tile" data-id="${r._id}">
        <div class="title">${escapeHtml(r.name||'Untitled')}</div>
        <div class="muted">${escapeHtml(r.type||'—')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px"><div class="muted">$${r.price||0}</div><div class="row-actions"><button class="edit">Edit</button><button class="delete">Del</button></div></div>
      </div>`).join('');
    roomsContainer.innerHTML = `<div class="room-grid">${tiles}</div>`;

    roomsContainer.querySelectorAll('button.edit').forEach(btn=>btn.addEventListener('click', async (e)=>{
      const id = e.target.closest('.room-tile').dataset.id;
      const room = rooms.find(r=>r._id===id);
      if(!room) return alert('Room not found');
      const name = prompt('Name', room.name)||room.name;
      const type = prompt('Type', room.type)||room.type;
      const price = parseFloat(prompt('Price', room.price||0))||room.price;
      try{
        const res = await fetch(`${API_BASE}/admin/rooms/${id}`, { method: 'PUT', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ name, type, price }) });
        if(!res.ok) return alert('Update failed: '+res.status);
        alert('Updated'); fetchRooms();
      }catch(err){ alert('Error: '+err.message) }
    }));

    roomsContainer.querySelectorAll('button.delete').forEach(btn=>btn.addEventListener('click', async (e)=>{
      if(!confirm('Delete this room?')) return;
      const id = e.target.closest('.room-tile').dataset.id;
      try{
        const res = await fetch(`${API_BASE}/admin/rooms/${id}`, { method: 'DELETE', headers: { ...authHeaders() } });
        if(!res.ok) return alert('Delete failed: '+res.status);
        alert('Deleted'); fetchRooms();
      }catch(err){ alert('Error: '+err.message) }
    }));
  }

  // Create new room
  newRoomBtn.addEventListener('click', async ()=>{
    const name = prompt('Room name'); if(!name) return;
    const type = prompt('Type (e.g. Normal)')||'Normal';
    const price = parseFloat(prompt('Price','0'))||0;
    try{
      const res = await fetch(`${API_BASE}/admin/rooms`, { method:'POST', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ name, type, price }) });
      if(!res.ok) return alert('Create failed: '+res.status);
      alert('Created'); fetchRooms();
    }catch(err){ alert('Error: '+err.message) }
  });

  // Bookings
  async function fetchBookings(){
    bookingsContainer.innerHTML = 'Loading...';
    try{
      const res = await fetch(`${API_BASE}/bookings`, { headers: { 'Content-Type':'application/json', ...authHeaders() } });
      if(!res.ok) return bookingsContainer.innerHTML = `Error: ${res.status}`;
      const data = await res.json();
      if(!Array.isArray(data)) return bookingsContainer.innerHTML = '<div class="muted">No bookings</div>';
      const rows = data.map(b=>`<div style="padding:8px;border-bottom:1px solid #f1f3f6"><strong>${b._id}</strong><div class="muted">Room: ${b.room||''} • User: ${b.user||''}</div></div>`).join('');
      bookingsContainer.innerHTML = `<div>${rows}</div>`;
    }catch(e){ bookingsContainer.innerHTML = 'Fetch failed: '+e.message }
  }

  // Users
  async function fetchUsers(){
    usersContainer.innerHTML = 'Loading...';
    try{
      const res = await fetch(`${API_BASE}/admin/users`, { headers: { 'Content-Type':'application/json', ...authHeaders() } });
      if(!res.ok) return usersContainer.innerHTML = `Error: ${res.status}`;
      const users = await res.json();
      if(!Array.isArray(users)) return usersContainer.innerHTML = '<div class="muted">No users</div>';
      const rows = users.map(u=>`<div style="padding:8px;border-bottom:1px solid #f1f3f6;display:flex;justify-content:space-between;align-items:center"><div><strong>${escapeHtml(u.name||u.email||'User')}</strong><div class="muted">${escapeHtml(u.email||'')}</div></div><div class="row-actions"><button data-id="${u._id}" class="editUser">Edit</button><button data-id="${u._1d}" class="delUser">Del</button></div></div>`).join('');
      usersContainer.innerHTML = `<div>${rows}</div>`;

      usersContainer.querySelectorAll('button.editUser').forEach(btn=>btn.addEventListener('click', async (e)=>{
        const id = e.target.dataset.id;
        const user = users.find(u=>u._id===id);
        if(!user) return alert('User not found');
        const name = prompt('Name', user.name)||user.name;
        const email = prompt('Email', user.email)||user.email;
        try{
          const res = await fetch(`${API_BASE}/admin/users/${id}`, { method:'PUT', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ name, email }) });
          if(!res.ok) return alert('Update failed: '+res.status);
          alert('User updated'); fetchUsers();
        }catch(err){ alert('Error: '+err.message) }
      }));

      usersContainer.querySelectorAll('button.delUser').forEach(btn=>btn.addEventListener('click', async (e)=>{
        if(!confirm('Delete this user?')) return;
        const id = e.target.dataset.id;
        try{
          const res = await fetch(`${API_BASE}/admin/users/${id}`, { method:'DELETE', headers: {...authHeaders()} });
          if(!res.ok) return alert('Delete failed: '+res.status);
          alert('Deleted'); fetchUsers();
        }catch(err){ alert('Error: '+err.message) }
      }));

    }catch(e){ usersContainer.innerHTML = 'Fetch failed: '+e.message }
  }

  // Utilities
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // Wire refresh buttons
  refreshRoomsBtn.addEventListener('click', fetchRooms);
  refreshBookingsBtn.addEventListener('click', fetchBookings);
  refreshUsersBtn.addEventListener('click', fetchUsers);

  // Initial load
  renderOverview(); fetchRooms(); fetchBookings(); fetchUsers();

  // Expose quick debug
  window.adminPanel = { fetchRooms, fetchBookings, fetchUsers, setToken: (t)=>{ setToken(t); tokenInput.value=t; } };
})();
