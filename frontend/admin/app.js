// Admin frontend logic (plain JS, no React) - renders the dashboard and fetches admin APIs
// Admin frontend logic (plain JS, no React) - renders the dashboard and fetches admin APIs
(function(){
  const API_BASE = window.ADMIN_API_BASE || 'http://localhost:4000';
  const tokenKey = 'admin_token';

  const $ = (sel) => document.querySelector(sel);
  const getToken = () => localStorage.getItem(tokenKey) || '';
  const setToken = (t) => { localStorage.setItem(tokenKey, t); }
  const clearToken = () => { localStorage.removeItem(tokenKey); }
  const authHeaders = () => {
    const t = getToken();
    return t ? { 'Authorization': (t.startsWith('Bearer ') ? t : 'Bearer ' + t) } : {};
  }

  // --- Bookings Manage view ---
  function showBookingsView(){
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="panel"><div class="panel-title">Bookings</div>
        <div class="panel-body" id="bookingsTable">Loading bookings...</div>
      </div>`;
    const main = document.querySelector('.grid');
    main.parentNode.replaceChild(content, main);
    (async ()=>{
      const el = document.getElementById('bookingsTable');
      // Require admin login to view bookings (admin bookings endpoint is protected)
      if(!await ensureAuth()){
        el.innerHTML = '<div class="muted">You must be logged in to view bookings. Click <a href="login.html">Login</a>.</div>';
        return;
      }

      try{
        // try admin bookings first
        const res = await fetch(API_BASE + '/admin/bookings', { headers: { 'Content-Type':'application/json', ...authHeaders() } });
        if(!res.ok){
          // surface non-OK response for diagnostics
          let body = await safeReadBody(res);
          console.warn('Admin bookings fetch failed', res.status, body);
          el.innerHTML = `<div class="muted">Unable to load bookings: ${res.status} ${escapeHtml(String(body||res.statusText))}</div>`;
          return;
        }
        let data = await res.json();
        if(!Array.isArray(data)) data = data ? [data] : [];
        if(!data.length) return el.innerHTML = '<div class="muted">No bookings found</div>';
        const rows = data.map(b=>`<div class="booking-row"><div class="left"><strong>${escapeHtml(b._id||b.id||'BK')}</strong><div class="muted">Room: ${escapeHtml((b.room && (b.room.title||b.room.number))||b.room||'—')} • Guest: ${escapeHtml(b.fullName||b.name||b.user||'Guest')}</div></div><div>${escapeHtml(String(b.totalPrice||b.total || ''))} <div class="muted">${escapeHtml((b.checkIn||b.arrival||'')+' → '+(b.checkOut||b.departure||''))}</div></div></div>`).join('');
        el.innerHTML = rows;
      }catch(err){ console.error(err); el.innerText = 'Error: '+err.message }
    })();
  }

  // Helper to safely read response body as json or text
  async function safeReadBody(res){
    try{ const j = await res.json(); return JSON.stringify(j); }catch(e){}
    try{ const t = await res.text(); return t; }catch(e){}
    return null;
  }

  // --- Reviews Manage view (with delete) ---
  function showReviewsView(){
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="panel"><div class="panel-title">Reviews</div>
        <div class="panel-body" id="reviewsTable">Loading reviews...</div>
      </div>`;
    const main = document.querySelector('.grid');
    main.parentNode.replaceChild(content, main);

    (async ()=>{
      try{
        let data = [];
        const res = await fetch(API_BASE + '/admin/reviews', { headers: { 'Content-Type':'application/json', ...authHeaders() } });
        if(res.ok) data = await res.json();
        else {
          const r2 = await fetch('http://localhost:3000/reviews');
          if(r2.ok) data = await r2.json();
        }
        if(!Array.isArray(data)) data = data ? [data] : [];
        const el = document.getElementById('reviewsTable');
        if(!data.length) return el.innerHTML = '<div class="muted">No reviews found</div>';
        const rows = data.map(r=>`<div class="review-row" style="margin-bottom:12px"><div><strong>${escapeHtml(r.name||r.user||'User')}</strong> <span class="muted">(${escapeHtml(String(r.rating||''))})</span><div class="muted">${escapeHtml(r.comment||'')}</div></div><div><button data-id="${r._id||r.id||''}" class="btn del-review">Delete</button></div></div>`).join('');
        el.innerHTML = rows;
        el.querySelectorAll('button.del-review').forEach(b=>b.addEventListener('click', async (e)=>{
          if(!confirm('Delete review?')) return;
          const id = e.target.dataset.id;
          try{
            if(!await ensureAuth()) return alert('You must be logged in to delete reviews. Use the login page.');
            const dRes = await fetch(API_BASE + '/admin/reviews/' + id, { method: 'DELETE', headers:{ ...authHeaders(), 'Content-Type':'application/json' } });
            if(!dRes.ok){ let txt=''; try{ const b=await dRes.json(); txt=b && (b.error||b.message) ? (b.error||b.message) : JSON.stringify(b);}catch(_){ txt=dRes.statusText } return alert('Delete failed: '+txt); }
            alert('Deleted'); showReviewsView();
          }catch(err){ alert('Delete error: '+err.message) }
        }));
      }catch(err){ const el = document.getElementById('reviewsTable'); el.innerText = 'Error: '+err.message }
    })();
  }

  // Ensure we have a token. Returns true when token is present.
  async function ensureAuth(){
    return Boolean(getToken());
  }

  const statsEl = $('#stats');
  const summaryEl = $('#summary');
  const refreshBtn = $('#refreshBtn');
  const newRoomBtn = $('#newRoomBtn');

  
  // Note: token input controls removed from header; token is managed via login page or auto-login

  refreshBtn.addEventListener('click', fetchAll);
  newRoomBtn.addEventListener('click', async ()=>{
    const number = prompt('Room number (e.g. 101)'); if(!number) return;
    const type = prompt('Type (single/double)')||'single';
    const price = parseFloat(prompt('Price','0'))||0;
    try{
  if(!await ensureAuth()) return alert('You must be logged in to create a room. Use Auto-login or paste a token.');
  console.info('Creating room, Authorization header:', authHeaders());
  const res = await fetch(API_BASE + '/admin/rooms', { method:'POST', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ number, type, price }) });
      if(!res.ok){ let txt=''; try{ const b=await res.json(); txt=b && (b.error||b.message) ? (b.error||b.message) : JSON.stringify(b); }catch(e){ txt=res.statusText } return alert('Create failed: '+txt); }
      alert('Room created'); fetchAll();
    }catch(err){ alert('Error: '+err.message) }
  });

  async function fetchAll(){
    renderStatsPlaceholder();
  // arrival/departure panels removed; no-op
    summaryEl.innerHTML = 'Loading...';

    try{
      // Rooms (admin API)
      const roomsRes = await fetch(API_BASE + '/admin/rooms', { headers: { 'Content-Type':'application/json', ...authHeaders() } });
      let rooms = roomsRes.ok ? await roomsRes.json() : [];
      // normalize: some responses may wrap results in an object - ensure rooms is an array
      if(!Array.isArray(rooms)){
        if(rooms && Array.isArray(rooms.value)) rooms = rooms.value;
        else if(rooms && Array.isArray(rooms.results)) rooms = rooms.results;
        else if(rooms && rooms.data && Array.isArray(rooms.data)) rooms = rooms.data;
        else rooms = Array.isArray(rooms) ? rooms : (rooms ? [rooms] : []);
      }

      // Bookings: try admin endpoint first, then fallback to main server's API
      let bookings = [];
      try{
        const bRes = await fetch(API_BASE + '/admin/bookings', { headers: { 'Content-Type':'application/json', ...authHeaders() } });
        if(bRes.ok) bookings = await bRes.json();
        else {
          // fallback to common API path on main server
          const b2 = await fetch('http://localhost:3000/api/bookings', { headers: { 'Content-Type':'application/json', ...authHeaders() } });
          if(b2.ok) bookings = await b2.json();
        }
      }catch(e){
        // tolerate failure
        try{ const b3 = await fetch('http://localhost:3000/bookings'); if(b3.ok) bookings = await b3.json(); }catch(_){}
      }

      // Reviews: attempt admin reviews, fallback to public reviews endpoint
      let reviews = [];
      try{
        const rRes = await fetch(API_BASE + '/admin/reviews', { headers: { 'Content-Type':'application/json', ...authHeaders() } });
        if(rRes.ok) reviews = await rRes.json();
        else {
          const r2 = await fetch('http://localhost:3000/reviews');
          if(r2.ok) reviews = await r2.json();
        }
      }catch(e){ try{ const r3 = await fetch('http://localhost:3000/reviews'); if(r3.ok) reviews = await r3.json(); }catch(_){} }

      renderStats(rooms, bookings, reviews);
  // renderArrivalDeparture function removed; bookings are accessible via Bookings view
      renderSummary(rooms, bookings);
    }catch(err){
      console.error(err);
      statsEl.innerHTML = '<div class="muted">Unable to load data. Check servers and token.</div>';
      arrivalContainer.innerHTML = '';
      departureContainer.innerHTML = '';
      summaryEl.innerHTML = '';
    }
  }

  // --- Rooms Manage view ---
  function showRoomsView(){
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="panel"><div class="panel-title">Rooms Manage</div>
        <div class="panel-body" id="roomsTable">Loading rooms...</div>
      </div>`;
    // replace main panels with rooms view
    const main = document.querySelector('.grid');
    main.parentNode.replaceChild(content, main);

    // fetch and render rooms
    fetch(API_BASE + '/admin/rooms', { headers: { 'Content-Type':'application/json', ...authHeaders() } })
      .then(r=>r.json()).then(renderRoomsTable).catch(err=>{ document.getElementById('roomsTable').innerText = 'Error: '+err.message });
  }

  function renderRoomsTable(rooms){
    const el = document.getElementById('roomsTable');
    // normalize unexpected shapes
    if(!Array.isArray(rooms)){
      if(rooms && Array.isArray(rooms.value)) rooms = rooms.value;
      else if(rooms && Array.isArray(rooms.results)) rooms = rooms.results;
      else if(rooms && rooms.data && Array.isArray(rooms.data)) rooms = rooms.data;
      else rooms = rooms ? [rooms] : [];
    }
    if(!rooms || rooms.length===0){ el.innerHTML = '<div class="muted">No rooms found</div>'; return }

    // Debug: if rooms items don't have expected fields, show raw JSON to help diagnose
    console.log('rooms response for roomsTable:', rooms);
    const first = rooms[0];
    const missingFields = first && (first.title === undefined && first.number === undefined && first._id === undefined);
    if(missingFields){
      el.innerHTML = '<div class="muted">Unexpected rooms shape — raw response below for debugging:</div><pre style="white-space:pre-wrap">'+escapeHtml(JSON.stringify(rooms, null, 2))+'</pre>';
      return;
    }

    const rows = rooms.map(r=>`<div class="room-row"><div class="left"><strong>${escapeHtml(r.title||r.number||r._id)}</strong><div class="muted">${escapeHtml(r.type||'')}</div></div><div>${escapeHtml(String(r.price||''))} <button data-id="${r._id}" class="btn edit">Edit</button> <button data-id="${r._id}" class="btn del">Delete</button></div></div>`).join('');
    el.innerHTML = rows;
    el.querySelectorAll('button.del').forEach(b=>b.addEventListener('click', async (e)=>{
      if(!confirm('Delete room?')) return;
      const id = e.target.dataset.id;
      try{
  if(!await ensureAuth()) return alert('You must be logged in to delete a room. Use Auto-login or paste a token.');
  console.info('Deleting room', id, 'Authorization header:', authHeaders());
  const res = await fetch(API_BASE + '/admin/rooms/' + id, { method:'DELETE', headers: {...authHeaders(), 'Content-Type':'application/json'} });
        if(!res.ok){
          let txt = '';
          try{ const body = await res.json(); txt = body && (body.error || body.message) ? (body.error||body.message) : JSON.stringify(body); }catch(e){ txt = res.statusText }
          console.error('Delete failed', res.status, txt);
          return alert('Delete failed: '+txt);
        }
        alert('Deleted'); showRoomsView();
      }catch(err){ console.error(err); alert('Delete error: '+err.message) }
    }));
    el.querySelectorAll('button.edit').forEach(b=>b.addEventListener('click', async (e)=>{
      const id = e.target.dataset.id;
      const room = rooms.find(r=>r._id===id);
      if(!room) return alert('Room not found');
      const title = prompt('Title', room.title||room.number)||room.title;
      const price = parseFloat(prompt('Price', room.price||0));
      if(Number.isNaN(price)) return alert('Invalid price');
      try{
  if(!await ensureAuth()) return alert('You must be logged in to update a room. Use Auto-login or paste a token.');
  console.info('Updating room', id, 'Authorization header:', authHeaders());
  const res = await fetch(API_BASE + '/admin/rooms/' + id, { method:'PUT', headers: { 'Content-Type':'application/json', ...authHeaders() }, body: JSON.stringify({ title, price }) });
        if(!res.ok){
          let txt = '';
          try{ const body = await res.json(); txt = body && (body.error || body.message) ? (body.error||body.message) : JSON.stringify(body); }catch(e){ txt = res.statusText }
          console.error('Update failed', res.status, txt);
          return alert('Update failed: '+txt);
        }
        const updated = await res.json();
        console.info('Room updated', updated);
        alert('Updated'); showRoomsView();
      }catch(err){ console.error(err); alert('Update error: '+err.message) }
    }));
  }

  // Wire navigation: Rooms Manage link in sidebar -> showRoomsView
  document.querySelectorAll('.sidebar nav a').forEach(a=>{
    if(a.textContent.trim().startsWith('Rooms')){
      a.addEventListener('click', (e)=>{ e.preventDefault(); showRoomsView(); });
    }
    if(a.textContent.trim().startsWith('Bookings')){
      a.addEventListener('click', (e)=>{ e.preventDefault(); showBookingsView(); });
    }
    if(a.textContent.trim().startsWith('Reviews')){
      a.addEventListener('click', (e)=>{ e.preventDefault(); showReviewsView(); });
    }
    if(a.textContent.trim().startsWith('Dashboard')){
      a.addEventListener('click', (e)=>{ e.preventDefault(); window.location.reload(); });
    }
  });

  // Auto-login demo controls removed — use the login page to obtain a token.

  function renderStats(rooms, bookings, reviews){
    const totalRooms = rooms.length || 0;
    const occupied = rooms.filter(r=>r.status==='occupied').length;
    const dirty = rooms.filter(r=>r.status==='dirty').length;
    const clean = rooms.filter(r=>r.status==='clean').length;

    statsEl.innerHTML = '';
    const cards = [
      { label: 'RMS TO SELL', num: totalRooms },
      { label: 'TOTAL OCC', num: occupied },
      { label: 'DIRTY', num: dirty },
      { label: 'CLEAN', num: clean },
      { label: 'BOOKINGS', num: (bookings && bookings.length) || 0 }
    ];

    cards.forEach(c=>{
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `<div><div class="num">${c.num}</div><div class="label">${c.label}</div></div>`;
      statsEl.appendChild(div);
    });
  }

  function renderStatsPlaceholder(){
    statsEl.innerHTML = '<div class="card">Loading...</div><div class="card">Loading...</div><div class="card">Loading...</div>';
  }

  // Arrival/departure UI removed per request; bookings are accessible via Bookings view

  function renderSummary(rooms, bookings){
    const roomsCount = rooms.length || 0;
    const bookingsCount = (bookings && bookings.length) || 0;
    summaryEl.innerHTML = `
      <div class="summary-item rooms">Rooms: <strong>${roomsCount}</strong></div>
      <div class="summary-item bookings">Bookings: <strong>${bookingsCount}</strong></div>
    `;
  }

  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // Initial fetch
  fetchAll();
})();