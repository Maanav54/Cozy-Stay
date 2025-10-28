// Frontend SPA - vanilla JS interacting with backend API
const API = window.location.origin + '/api';
const app = document.getElementById('app');

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
  app.innerHTML = `<section class="hero">
    <div class="hero-card">
      <div class="eyebrow">Welcome to Sunrise Hotel</div>
      <h1 class="title">Comfortable stays — best prices</h1>
      <p class="sub">Choose from deluxe, super deluxe, normal or budget rooms. Animated UI with availability and easy bookings.</p>
    </div>
    <div class="hero-card">
      <h3>Quick Info</h3>
      <p>Contact: +91 90000 00000</p>
      <p>Address: MG Road, City</p>
    </div>
  </section>
  <section>
    <h2 style="margin-bottom:12px">Rooms</h2>
    <div class="rooms-grid" id="rooms-grid"></div>
  </section>`;
  await fetchRooms();
  renderRooms();
}

async function fetchRooms(){
  try{
    const res = await fetch(API + '/rooms');
    if (!res.ok) {
      console.error('Failed to fetch rooms:', res.status, res.statusText);
      return;
    }
    state.rooms = await res.json();
    console.log('Fetched rooms:', state.rooms);
  }catch(e){ 
    console.error('Error fetching rooms:', e);
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

    byOrder.forEach(r=>{
    const node = tmpl.content.cloneNode(true);
    // Set image for room
    const defaultImages = {
      'Normal': '/images/normal.jpg',
      'Below Average': '/images/below.jpg',
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
      // redirect to booking page with selected room
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
      <input type="date" id="checkOut" required />
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
    const checkOut = document.getElementById('checkOut').value;
    const guests = parseInt(document.getElementById('guests').value || '1');
    const token = localStorage.getItem('token');
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

function loadBooking(room){
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
          <label>Check-out<input type="date" id="checkOut" required /></label>
          <label>Guests<input type="number" id="guests" placeholder="Guests" min="1" value="1" /></label>
          <div style="margin-top:12px"><button class="btn primary" type="submit">Confirm Booking</button></div>
        </form>
      </div>
    </section>`;

    document.getElementById('booking-form').onsubmit = async (e)=>{
      e.preventDefault();
      const checkIn = document.getElementById('checkIn').value;
      const checkOut = document.getElementById('checkOut').value;
      const guests = parseInt(document.getElementById('guests').value || '1');
      const token = localStorage.getItem('token');
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

  // No room provided: show user's bookings
  app.innerHTML = `<section><h2>Your Bookings</h2><div id="my-bookings"></div></section>`;
  loadMyBookings();
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
  app.innerHTML = `<section><h2>About the Hotel</h2>
  <p>Sunrise Hotel offers comfortable accommodation with great service, free Wi-Fi, breakfast options and friendly staff.</p>
  <ul><li>Check-in: 12:00 PM</li><li>Check-out: 11:00 AM</li><li>Parking: Available</li></ul>
  </section>`;
}

function loadContact(){
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
