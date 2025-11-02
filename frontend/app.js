// Frontend SPA - vanilla JS interacting with backend API
const API = 'http://localhost:5000/api';
const app = document.getElementById('app');

function isValidObjectId(id){
  return typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
}

const state = { user: null, rooms: [] };

function setUser(user){
  state.user = user;
  if(user){
    document.getElementById('btn-login').classList.add('hidden');
    document.getElementById('btn-logout').classList.remove('hidden');
    const prof = document.getElementById('btn-profile'); if(prof) prof.classList.remove('hidden');
    const adminBtn = document.getElementById('btn-admin');
    if(adminBtn) {
      if(user.isAdmin) adminBtn.classList.remove('hidden');
      else adminBtn.classList.add('hidden');
    }
  } else {
    document.getElementById('btn-login').classList.remove('hidden');
    document.getElementById('btn-logout').classList.add('hidden');
    const prof = document.getElementById('btn-profile'); if(prof) prof.classList.add('hidden');
    const adminBtn = document.getElementById('btn-admin'); if(adminBtn) adminBtn.classList.add('hidden');
  }
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  bindNav();
  const token = localStorage.getItem('token');
  if(token){
    try{
      const res = await fetch(API + '/users/me', { headers: { Authorization: 'Bearer ' + token }});
      if(res.ok){
        const user = await res.json();
        setUser(user);
      } else {
        localStorage.removeItem('token');
      }
    }catch(e){ console.error(e); }
  }
  await loadHome();
});

function bindNav(){
  document.getElementById('link-home').onclick = (e)=>{ e.preventDefault(); loadHome(); };
  document.getElementById('link-book').onclick = (e)=>{ e.preventDefault(); loadBooking(); };
  document.getElementById('link-info').onclick = (e)=>{ e.preventDefault(); loadHotelInfo(); };
  document.getElementById('link-reviews').onclick = (e)=>{ e.preventDefault(); loadReviews(); };
  document.getElementById('link-contact').onclick = (e)=>{ e.preventDefault(); loadContact(); };
  const adminBtn = document.getElementById('btn-admin');
  if(adminBtn) adminBtn.onclick = (e)=>{ e.preventDefault(); loadAdmin(); };
  document.getElementById('btn-login').onclick = (e)=>{ openAuthModal(); };
  document.getElementById('btn-logout').onclick = (e)=>{ localStorage.removeItem('token'); setUser(null); loadHome(); };
  const profBtn = document.getElementById('btn-profile'); if(profBtn) profBtn.onclick = (e)=>{ e.preventDefault(); loadProfile(); };
  // auth modal
  document.getElementById('close-auth').onclick = ()=>closeAuthModal();
  document.getElementById('toggle-auth').onclick = toggleAuth;
  document.getElementById('auth-form').onsubmit = submitAuth;
}

async function loadProfile(){
  // ensure home background removed on profile page
  try{ document.body.classList.remove('home-bg'); }catch(e){}
  const token = localStorage.getItem('token');
  if(!token){ openAuthModal(); return; }
  try{
    const res = await fetch(API + '/users/me', { headers: { Authorization: 'Bearer ' + token }});
    if(!res.ok){ alert('Could not load profile'); return; }
    const user = await res.json();
    // fetch booking summary
    const sumRes = await fetch(API + '/users/summary', { headers: { Authorization: 'Bearer ' + token }});
    const summary = sumRes.ok ? await sumRes.json() : { totalBookings: 0, totalSpent: 0, lastBooking: null };
    app.innerHTML = `<section style="max-width:900px;margin:24px auto">
      <div class="hero-card">
        <h2>${user.name}</h2>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
        <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
        <p><strong>Address:</strong> ${user.address || 'Not provided'}</p>
        <hr />
        <h3>Booking Summary</h3>
        <p><strong>Rooms booked:</strong> ${summary.totalBookings}</p>
        <p><strong>Total spent:</strong> ₹ ${summary.totalSpent}</p>
        <p><strong>Last booking:</strong> ${summary.lastBooking ? new Date(summary.lastBooking).toLocaleString() : 'No bookings yet'}</p>
      </div>
    </section>`;
  }catch(e){ console.error(e); alert('Network error'); }
}

async function loadHome(){
  // enable full-page background for home
  try{ document.body.classList.add('home-bg'); }catch(e){}
  // Modern hero with background image, CTA and an events section. Rooms removed from the home page.
  app.innerHTML = `<section class="hero">
    <div class="hero-card">
      <div class="eyebrow">Welcome to Cozy Stay</div>
      <h1 class="title">Stay where comfort meets elegance</h1>
      <p class="sub">Experience thoughtful service, modern amenities and a location close to the city's best attractions.</p>
      <div style="margin-top:16px">
        <button class="btn primary" id="view-rooms">View Rooms & Book</button>
        <button class="btn" id="learn-more">Learn More</button>
      </div>
    </div>
    <div class="hero-card">
      <h3>Today's Highlights</h3>
      <ul style="margin:8px 0 0 0;padding-left:18px;color:var(--muted)">
        <li>Complimentary breakfast for all bookings made this week</li>
        <li>Free airport shuttle for suites (T&C apply)</li>
        <li>Live music on Friday evenings at our rooftop lounge</li>
      </ul>
    </div>
  </section>

  <section class="home-events" style="margin-top:20px">
    <h2 style="margin-bottom:12px">Events & Offers</h2>
    <div class="events-grid">
      <div class="event-card">
        <!-- use local rooftop image for Rooftop Jazz Nights -->
        <img src="/images/rooftop.jpg" alt="Rooftop Jazz Nights" />
        <h4>Rooftop Jazz Nights</h4>
        <p class="muted">Every Friday — Live performers and signature cocktails.</p>
      </div>
      <div class="event-card">
        <!-- breakfast now uses the rooftop photo to match the brief -->
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=60&auto=format&fit=crop" alt="Breakfast" />
        <h4>Breakfast Buffet Special</h4>
        <p class="muted">Free for bookings this week — regional and continental options.</p>
      </div>
      <div class="event-card">
        <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=60&auto=format&fit=crop" alt="Spa" />
        <h4>Spa Weekend Packages</h4>
        <p class="muted">Relaxing spa packages with in-room treatments available.</p>
      </div>
    </div>
  </section>`;

  // Wire CTA to booking page
  document.getElementById('view-rooms').onclick = (e)=>{ e.preventDefault(); loadBooking(); };
  document.getElementById('learn-more').onclick = (e)=>{ e.preventDefault(); loadHotelInfo(); };
}

async function fetchRooms(){
  // default sample rooms used when API is unreachable or returns no data
  // default sample rooms used when API is unreachable or returns no data
  // NOTE: these demo rooms intentionally do NOT include a MongoDB _id — attempting to POST bookings
  // for them will be intercepted client-side to avoid ObjectId cast errors on the server.
  const defaultRooms = [
  { title: 'Budget Cozy Room', type: 'Below Average', price: 999, available: 5, total: 5, description: 'A compact room with basic amenities, great for short stays.', image: '/images/cozy.jpg' },
    { title: 'Classic Standard Room', type: 'Normal', price: 1499, available: 8, total: 8, description: 'Comfortable room with queen bed and free Wi-Fi.', image: '/images/wifi.jpg' },
    { title: 'Deluxe City View', type: 'Deluxe', price: 2499, available: 4, total: 4, description: 'Spacious room with city views and premium amenities.', image: '/images/deluxe.jpg' },
    { title: 'Super Deluxe Suite', type: 'Super Deluxe', price: 3999, available: 2, total: 2, description: 'Large suite with separate living area and luxury features.', image: '/images/super.jpg' }
  ];

  try{
    const res = await fetch(API + '/rooms');
    if (!res.ok) {
      console.warn('Failed to fetch rooms from API; using sample rooms:', res.status, res.statusText);
      state.rooms = defaultRooms;
      return;
    }
    const rooms = await res.json();
    // if API returned no rooms, fall back to sample rooms so UI is always populated
    if(!Array.isArray(rooms) || rooms.length === 0){
      console.info('API returned no rooms; using sample rooms');
      state.rooms = defaultRooms;
    } else {
      state.rooms = rooms;
    }
    console.log('Rooms loaded:', state.rooms);
  }catch(e){ 
    console.error('Error fetching rooms, falling back to sample rooms:', e);
    state.rooms = defaultRooms;
  }
}

function renderRooms(){
  const grid = document.getElementById('rooms-grid');
  grid.innerHTML = '';
  const tmpl = document.getElementById('room-card');
  // desired order: Below Average, Normal, Deluxe, Super Deluxe
  const order = ['Below Average', 'Normal', 'Deluxe', 'Super Deluxe'];
    const byOrder = [];
    order.forEach(type => {
      state.rooms.filter(r => r.type === type).forEach(r => byOrder.push(r));
    });
    // include any other types after
    state.rooms.filter(r => !order.includes(r.type)).forEach(r => byOrder.push(r));

    if(byOrder.length === 0){
      grid.innerHTML = '<p>No rooms available at the moment. Please check back later.</p>';
      return;
    }

    byOrder.forEach(r=>{
    const node = tmpl.content.cloneNode(true);
    // Set image for room
    const defaultImages = {
      // Normal room uses a nicer Unsplash image for a more realistic look
      'Normal': '/images/wifi.jpg',
      // nicer photo for budget/below-average category
      'Below Average': '/images/cozy.jpg',
      'Deluxe': '/images/deluxe.jpg',
      'Super Deluxe': '/images/super.jpg'
    };
    const imgUrl = r.image || defaultImages[r.type];
    const imgEl = node.querySelector('.room-img');
    imgEl.src = imgUrl;
    // Set same image for all sizes since we're using local images
    const small = imgUrl;
    const medium = imgUrl;
  imgEl.srcset = `${small} 400w, ${medium} 800w, ${imgUrl} 1200w`;
    node.querySelector('.room-title').textContent = r.title;
    node.querySelector('.room-type').textContent = r.type;
    node.querySelector('.room-desc').textContent = r.description || '';
    node.querySelector('.price').textContent = '₹ ' + (r.price || 0) + '/night';
    node.querySelector('.available').textContent = (typeof r.available === 'number' ? r.available : 0) + ' left';
  const btn = node.querySelector('.book-btn');
  // navigate to booking page for the selected room (opens full booking form)
  btn.onclick = ()=> loadBooking(r);
    grid.appendChild(node);
  });
}

function openBookingModal(room){
  if(!state.user){
    openAuthModal();
    return;
  }
  // small booking UI
  const html = document.createElement('div');
  html.innerHTML = `<div class="booking-card">
    <h3>Book ${room.title}</h3>
    <form id="booking-form">
      <input type="date" id="checkIn" required />
      <input type="number" id="nights" placeholder="Number of nights" min="1" value="1" required />
      <input type="number" id="guests" placeholder="Guests" min="1" value="1" />
      <div style="margin-top:8px">
        <button class="btn primary" type="submit">Confirm Booking</button>
      </div>
    </form>
  </div>`;
  app.prepend(html);
  document.getElementById('booking-form').onsubmit = async (e)=>{
    e.preventDefault();
    const checkIn = document.getElementById('checkIn').value;
    const nights = parseInt(document.getElementById('nights').value || '1');
    const guests = parseInt(document.getElementById('guests').value || '1');
    // Calculate check-out date
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + nights);
    const checkOut = checkOutDate.toISOString().split('T')[0];
    const token = localStorage.getItem('token');
    // For demo/sample rooms without a real MongoDB ObjectId, simulate booking locally and avoid server POST.
    if(!isValidObjectId(room._id)){
      alert('This is a demo room (not persisted in the database). Booking simulated locally — no backend booking was created. To enable real bookings, add rooms via the admin panel or seed the database.');
      html.remove();
      return;
    }

    try{
      const res = await fetch(API + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ roomId: room._id, fullName: state.user.name, email: state.user.email, phone: state.user.phone, checkIn, checkOut, guests })
      });
      if(res.ok){
        alert('Booking confirmed!');
        await fetchRooms(); renderRooms();
        html.remove();
      } else {
        const err = await res.json();
        alert('Error: ' + (err.message || 'Could not book'));
      }
    }catch(e){ alert('Network error') }
  }
}

function openAuthModal(){
  const modal = document.getElementById('auth-modal');
  modal.classList.remove('hidden');
  // ensure layout display is correct (flex for centering)
  modal.style.display = 'flex';
  // default to login view
  document.getElementById('auth-title').textContent = 'Login';
  document.getElementById('name').style.display = 'none';
  document.getElementById('phone').style.display = 'none';
  const addrEl = document.getElementById('address'); if(addrEl) addrEl.style.display = 'none';
  document.getElementById('toggle-auth').textContent = 'Switch to Signup';
  document.getElementById('auth-submit').textContent = 'Login';
}

function closeAuthModal(){
  const modal = document.getElementById('auth-modal');
  if(!modal) return;
  // add hidden class and also explicitly hide via style to avoid CSS conflicts
  modal.classList.add('hidden');
  modal.style.display = 'none';
  // reset form to initial (login) state
  const form = document.getElementById('auth-form');
  if(form) form.reset();
  // ensure inputs hidden for login
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const addrEl = document.getElementById('address');
  if(name) name.style.display = 'none';
  if(phone) phone.style.display = 'none';
  if(addrEl) addrEl.style.display = 'none';
  const toggle = document.getElementById('toggle-auth');
  if(toggle) toggle.textContent = 'Switch to Signup';
  const title = document.getElementById('auth-title');
  if(title) title.textContent = 'Login';
  const submit = document.getElementById('auth-submit');
  if(submit) submit.textContent = 'Login';
}

function toggleAuth(){
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const addrEl = document.getElementById('address');
  const title = document.getElementById('auth-title');
  const submit = document.getElementById('auth-submit');
  // toggle between signup and login view
  const isSignup = !(name.style.display === 'block');
  if(isSignup){
    name.style.display = 'block';
    phone.style.display = 'block';
    if(addrEl) addrEl.style.display = 'block';
    title.textContent = 'Signup';
    submit.textContent = 'Signup';
    this.textContent = 'Switch to Login';
  } else {
    name.style.display = 'none';
    phone.style.display = 'none';
    if(addrEl) addrEl.style.display = 'none';
    title.textContent = 'Login';
    submit.textContent = 'Login';
    this.textContent = 'Switch to Signup';
  }
}

async function submitAuth(e){
  e.preventDefault();
  const isSignup = document.getElementById('name').style.display === 'block';
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address') ? document.getElementById('address').value : '';
  try{
    const url = API + (isSignup ? '/auth/register' : '/auth/login');
  const res = await fetch(url, { method: 'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ name, email, password, phone, address })});
    const data = await res.json().catch(()=>({}));
    if(!res.ok){ alert((data && data.message) || 'Auth failed'); return; }
    // store token and update UI
    if(data.token) localStorage.setItem('token', data.token);
    if(data.user) setUser(data.user);
    // ensure modal is fully closed and reset
    closeAuthModal();
    // reload home to refresh UI
    await loadHome();
  }catch(e){ alert('Network error'); }
}

async function loadBooking(room){
  // remove home background when on booking pages
  try{ document.body.classList.remove('home-bg'); }catch(e){}
  if(!state.user){
    // if not logged in, open auth modal; after login, user can click Book again
    openAuthModal();
    return;
  }

  // If a room is provided, show the booking form for that room
  if(room){
    app.innerHTML = `<section style="max-width:800px;margin:24px auto">
      <div class="booking-card">
        <h3>Book ${room.title}</h3>
        <form id="booking-form">
          <input type="hidden" id="roomId" value="${room._id}" />
          <label>Check-in<input type="date" id="checkIn" required /></label>
          <label>Number of nights<input type="number" id="nights" placeholder="Number of nights" min="1" value="1" required /></label>
          <label>Guests<input type="number" id="guests" placeholder="Guests" min="1" value="1" /></label>
          <div style="margin-top:12px"><button class="btn primary" type="submit">Confirm Booking</button></div>
        </form>
      </div>
    </section>`;

    document.getElementById('booking-form').onsubmit = async (e)=>{
      e.preventDefault();
      const checkIn = document.getElementById('checkIn').value;
      const nights = parseInt(document.getElementById('nights').value || '1');
      const guests = parseInt(document.getElementById('guests').value || '1');
      // Calculate check-out date
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkInDate.getDate() + nights);
      const checkOut = checkOutDate.toISOString().split('T')[0];
      const token = localStorage.getItem('token');
      // If the room doesn't have a valid ObjectId, it's a demo/sample room — simulate booking locally.
      if(!isValidObjectId(room._id)){
        alert('This is a demo/sample room. Booking has been simulated locally — no backend booking was made. To enable real bookings, add rooms in the admin panel or seed the database.');
        // redirect to bookings list (empty) or just return to booking list
        loadBooking();
        return;
      }

      try{
        const res = await fetch(API + '/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ roomId: room._id, fullName: state.user.name, email: state.user.email, phone: state.user.phone, checkIn, checkOut, guests })
        });
        if(res.ok){
          alert('Booking confirmed!');
          await fetchRooms(); renderRooms();
          // redirect to bookings list
          loadBooking();
        } else {
          const err = await res.json();
          alert('Error: ' + (err.message || 'Could not book'));
        }
      }catch(e){ alert('Network error') }
    }
    return;
  }

  // No room provided: show available rooms for booking
  app.innerHTML = `<section class="booking-hero">
    <div class="hero-card">
      <div class="eyebrow">Book Your Stay</div>
      <h1 class="title">Find Your Perfect Room</h1>
      <p class="sub">Browse our collection of rooms with various types and price ranges. All room types are available for booking.</p>
    </div>
  </section>

  <section class="booking-rooms">
    <div class="rooms-grid" id="booking-rooms-grid"></div>
  </section>`;

  // Fetch rooms if not loaded
  if(state.rooms.length === 0) await fetchRooms();

  // Initial render
  renderBookingRooms();
}

async function renderBookingRooms(){
  const grid = document.getElementById('booking-rooms-grid');
  grid.innerHTML = '';

  // desired order: Below Average, Normal, Deluxe, Super Deluxe
  const order = ['Below Average', 'Normal', 'Deluxe', 'Super Deluxe'];
  const byOrder = [];
  order.forEach(type => {
    state.rooms.filter(r => r.type === type).forEach(r => byOrder.push(r));
  });
  // include any other types after
  state.rooms.filter(r => !order.includes(r.type)).forEach(r => byOrder.push(r));

  if(byOrder.length === 0){
    grid.innerHTML = '<p>No rooms available at the moment. Please check back later.</p>';
    return;
  }

  const tmpl = document.getElementById('room-card');
  byOrder.forEach(r=>{
    const node = tmpl.content.cloneNode(true);
    // Set image for room
    const defaultImages = {
      'Normal': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80&auto=format&fit=crop',
      // nicer photo for budget/below-average category
      'Below Average': 'https://images.unsplash.com/photo-1505691723518-36a7b6a5f0b4?w=1200&q=80&auto=format&fit=crop',
      'Deluxe': '/images/deluxe.jpg',
      'Super Deluxe': '/images/super.jpg'
    };
    const imgUrl = r.image || defaultImages[r.type];
    const imgEl = node.querySelector('.room-img');
    imgEl.src = imgUrl;
    // Set same image for all sizes since we're using local images
    const small = imgUrl;
    const medium = imgUrl;
    imgEl.srcset = `${small} 400w, ${medium} 800w, ${imgUrl} 1200w`;
    node.querySelector('.room-title').textContent = r.title;
    node.querySelector('.room-type').textContent = r.type;
    node.querySelector('.room-desc').textContent = r.description || '';
    node.querySelector('.price').textContent = '₹ ' + (r.price || 0) + '/night';
    node.querySelector('.available').textContent = (typeof r.available === 'number' ? r.available : 0) + ' left';
    const btn = node.querySelector('.book-btn');
    // navigate to booking page for the selected room (opens full booking form)
    btn.onclick = ()=> loadBooking(r);
    grid.appendChild(node);
  });
}

async function loadMyBookings(){
  const token = localStorage.getItem('token');
  try{
    const res = await fetch(API + '/bookings/mine', { headers: { Authorization: 'Bearer ' + token }});
    const bookings = await res.json();
    const el = document.getElementById('my-bookings');
    if(bookings.length === 0) el.innerHTML = '<p>No bookings yet.</p>';
    else {
      el.innerHTML = bookings.map(b => `<div class="booking-card" style="margin-bottom:12px">
        <h4>${b.room.title}</h4>
        <p>${new Date(b.checkIn).toLocaleDateString()} → ${new Date(b.checkOut).toLocaleDateString()}</p>
        <p>Guests: ${b.guests} | ₹ ${b.totalPrice}</p>
      </div>`).join('');
    }
  }catch(e){ console.error(e); }
}

function loadHotelInfo(){
  // remove home background for other pages
  try{ document.body.classList.remove('home-bg'); }catch(e){}

  app.innerHTML = `<section>
    <h2>About the Hotel</h2>
    <div class="hotel-images">
      <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop" alt="Hotel Exterior" style="width:100%;max-width:800px;margin-bottom:16px;border-radius:12px;">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-bottom:24px;">
        <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop" alt="Hotel Lobby" style="border-radius:8px;">
        <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop" alt="Hotel Room" style="border-radius:8px;">
        <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop" alt="Hotel Restaurant" style="border-radius:8px;">
      </div>
    </div>
    <p>Cozy Stay offers comfortable accommodation with great service, free Wi-Fi, breakfast options and friendly staff.</p>
    <ul><li>Check-in: 12:00 PM</li><li>Check-out: 11:00 AM</li><li>Parking: Available</li></ul>
    <h3>Location</h3>
    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.001!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0x73b6b3d4e4c8c8b!2sMG%20Road%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin" width="100%" height="300" style="border:0;border-radius:8px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
  </section>`;
}

function loadContact(){
  // remove home background for other pages
  try{ document.body.classList.remove('home-bg'); }catch(e){}

  app.innerHTML = `<section><h2>Contact Us</h2>
  <p>Email: contact@sunrisehotel.example</p>
  <p>Phone: +91 90000 00000</p>
  <form id="contact-form">
    <input type="text" id="cname" placeholder="Your name" required />
    <input type="email" id="cemail" placeholder="Email" required />
    <textarea id="cmsg" placeholder="Message" style="width:100%;min-height:120px;margin-top:8px"></textarea>
    <div style="margin-top:8px"><button class="btn primary" type="submit">Send</button></div>
  </form></section>`;
  document.getElementById('contact-form').onsubmit = (e)=>{
    e.preventDefault();
    alert('Message sent (demo).');
    document.getElementById('contact-form').reset();
  }
}

async function loadAdmin(){
  // remove home background for admin pages
  try{ document.body.classList.remove('home-bg'); }catch(e){}
  if(!state.user?.isAdmin) return loadHome();
  
  try {
    const token = localStorage.getItem('token');
    const headers = { Authorization: 'Bearer ' + token };
    
    // Fetch both users and rooms in parallel
    const [usersRes, roomsRes] = await Promise.all([
      fetch(API + '/admin/users', { headers }),
      fetch(API + '/admin/rooms', { headers })
    ]);
    
    if(!usersRes.ok || !roomsRes.ok) throw new Error('Failed to fetch data');
    
    const [users, rooms] = await Promise.all([
      usersRes.json(),
      roomsRes.json()
    ]);

    app.innerHTML = `
      <div class="admin-dashboard">
        <section class="admin-section">
          <h2>Room Management</h2>
          <button class="btn primary" onclick="openAddRoomForm()">Add New Room</button>
          <div class="admin-grid">
            ${rooms.map(room => `
              <div class="admin-card">
                <img src="${room.image || '/images/placeholder.jpg'}" alt="${room.title}" class="admin-thumb">
                <h3>${room.title}</h3>
                <p>Type: ${room.type}</p>
                <p>Price: ₹${room.price}/night</p>
                <p>Available: ${room.available}/${room.total}</p>
                <div class="admin-actions">
                  <button class="btn" onclick="editRoom('${room._id}')">Edit</button>
                  <button class="btn" onclick="deleteRoom('${room._id}')">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="admin-section">
          <h2>User Management</h2>
          <div class="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(user => `
                  <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${user.isAdmin ? 'Admin' : 'User'}</td>
                    <td>
                      <button class="btn small" onclick="editUser('${user._id}')">Edit</button>
                      <button class="btn small" onclick="deleteUser('${user._id}')">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;

    // Add global functions for room and user management
    window.editRoom = async (id) => {
      const room = rooms.find(r => r._id === id);
      if(!room) return;
      
      const html = `
        <div class="modal-overlay">
          <div class="modal-content">
            <h3>Edit Room</h3>
            <form id="edit-room-form">
              <input type="text" name="title" value="${room.title}" required placeholder="Room Title">
              <select name="type" required>
                ${['Below Average', 'Normal', 'Deluxe', 'Super Deluxe'].map(type => 
                  `<option value="${type}" ${room.type === type ? 'selected' : ''}>${type}</option>`
                ).join('')}
              </select>
              <input type="number" name="price" value="${room.price}" required placeholder="Price per night">
              <input type="number" name="total" value="${room.total}" required placeholder="Total rooms">
              <input type="number" name="available" value="${room.available}" required placeholder="Available rooms">
              <textarea name="description" placeholder="Description">${room.description || ''}</textarea>
              <div class="form-actions">
                <button type="submit" class="btn primary">Save Changes</button>
                <button type="button" class="btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
      
      document.getElementById('edit-room-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
          const res = await fetch(API + '/admin/rooms/' + id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token
            },
            body: JSON.stringify(data)
          });
          
          if(!res.ok) throw new Error('Failed to update room');
          e.target.closest('.modal-overlay').remove();
          loadAdmin();
        } catch(err) {
          alert('Error updating room: ' + err.message);
        }
      };
    };

    window.deleteRoom = async (id) => {
      if(!confirm('Are you sure you want to delete this room?')) return;
      
      try {
        const res = await fetch(API + '/admin/rooms/' + id, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token }
        });
        
        if(!res.ok) throw new Error('Failed to delete room');
        loadAdmin();
      } catch(err) {
        alert('Error deleting room: ' + err.message);
      }
    };

    window.editUser = async (id) => {
      const user = users.find(u => u._id === id);
      if(!user) return;
      
      const html = `
        <div class="modal-overlay">
          <div class="modal-content">
            <h3>Edit User</h3>
            <form id="edit-user-form">
              <input type="text" name="name" value="${user.name}" required placeholder="Full Name">
              <input type="email" name="email" value="${user.email}" required placeholder="Email">
              <input type="text" name="phone" value="${user.phone || ''}" placeholder="Phone">
              <input type="text" name="address" value="${user.address || ''}" placeholder="Address">
              <label>
                <input type="checkbox" name="isAdmin" ${user.isAdmin ? 'checked' : ''}>
                Admin privileges
              </label>
              <div class="form-actions">
                <button type="submit" class="btn primary">Save Changes</button>
                <button type="button" class="btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
      
      document.getElementById('edit-user-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          ...Object.fromEntries(formData),
          isAdmin: formData.get('isAdmin') === 'on'
        };
        
        try {
          const res = await fetch(API + '/admin/users/' + id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token
            },
            body: JSON.stringify(data)
          });
          
          if(!res.ok) throw new Error('Failed to update user');
          e.target.closest('.modal-overlay').remove();
          loadAdmin();
        } catch(err) {
          alert('Error updating user: ' + err.message);
        }
      };
    };

    window.deleteUser = async (id) => {
      if(!confirm('Are you sure you want to delete this user?')) return;
      
      try {
        const res = await fetch(API + '/admin/users/' + id, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token }
        });
        
        if(!res.ok) throw new Error('Failed to delete user');
        loadAdmin();
      } catch(err) {
        alert('Error deleting user: ' + err.message);
      }
    };

    window.openAddRoomForm = () => {
      const html = `
        <div class="modal-overlay">
          <div class="modal-content">
            <h3>Add New Room</h3>
            <form id="add-room-form">
              <input type="text" name="title" required placeholder="Room Title">
              <select name="type" required>
                <option value="">Select Type</option>
                <option value="Below Average">Below Average</option>
                <option value="Normal">Normal</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Super Deluxe">Super Deluxe</option>
              </select>
              <input type="number" name="price" required placeholder="Price per night">
              <input type="number" name="total" required placeholder="Total rooms">
              <input type="number" name="available" required placeholder="Available rooms">
              <textarea name="description" placeholder="Description"></textarea>
              <div class="form-actions">
                <button type="submit" class="btn primary">Add Room</button>
                <button type="button" class="btn" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', html);
      
      document.getElementById('add-room-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
          const res = await fetch(API + '/admin/rooms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + token
            },
            body: JSON.stringify(data)
          });
          
          if(!res.ok) throw new Error('Failed to create room');
          e.target.closest('.modal-overlay').remove();
          loadAdmin();
        } catch(err) {
          alert('Error creating room: ' + err.message);
        }
      };
    };
    
  } catch(err) {
    console.error(err);
    app.innerHTML = '<p>Error loading admin dashboard</p>';
  }
}

// Reviews page: list reviews and allow logged-in users to post
async function loadReviews(){
  // remove home background when viewing reviews
  try{ document.body.classList.remove('home-bg'); }catch(e){}
  try{
    const res = await fetch(API + '/reviews');
    if(!res.ok) throw new Error('Failed to load reviews');
    const reviews = await res.json();

    app.innerHTML = `
      <section class="reviews-section">
        <div class="hero-card">
          <h2>Guest Reviews</h2>
          <p>See what our guests have to say about their stays</p>
          ${state.user ? `
            <form id="review-form" class="review-form">
              <div class="rating-input">
                <label>Rating:</label>
                <select name="rating" required>
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
              </div>
              <div class="comment-input">
                <label>Comment:</label>
                <textarea name="comment" rows="4" placeholder="Share your experience..."></textarea>
              </div>
              <button type="submit" class="btn primary">Submit Review</button>
            </form>
          ` : '<p>Please <a href="#" id="login-to-review">login</a> to leave a review.</p>'}
        </div>

        <div class="reviews-grid">
          ${reviews.map(review => `
            <div class="review-card">
              <div class="review-header">
                <span class="reviewer-name">${review.name || 'Anonymous'}</span>
                <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
              ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `;

    // wire up login link
    const loginLink = document.getElementById('login-to-review');
    if(loginLink) loginLink.onclick = (e)=>{ e.preventDefault(); openAuthModal(); };

    if(state.user){
      const form = document.getElementById('review-form');
      form.onsubmit = async (e) => {
        e.preventDefault();
        const rating = parseInt(form.rating.value);
        const comment = form.comment.value.trim();
        try{
          const token = localStorage.getItem('token');
          const r = await fetch(API + '/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ rating, comment })
          });
          if(!r.ok){ const data = await r.json().catch(()=>({})); alert(data.message || 'Could not post review'); return; }
          // reload reviews to show new one
          await loadReviews();
        }catch(err){ console.error(err); alert('Network error'); }
      };
    }

  }catch(err){
    console.error(err);
    app.innerHTML = '<section><p>Error loading reviews.</p></section>';
  }
}
