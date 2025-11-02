# Admin UI Dark Theme and Booked Rooms Display Task

## Approved Plan

- Change admin UI to dark theme by updating CSS variables and styles.
- Add display of booked rooms in the admin dashboard by adding a new panel.
- Fix bugs by adding missing admin routes for bookings and reviews in routes/admin.js.

## Steps to Complete

- [x] Add admin routes for bookings and reviews in routes/admin.js (GET /bookings, GET /reviews, DELETE /reviews/:id).
- [x] Update frontend/admin/styles.css to dark theme (change :root variables, backgrounds, text colors, etc.).
- [x] Modify frontend/admin/index.html to add a "Booked Rooms" panel in the grid.
- [x] Update frontend/admin/app.js to fetch bookings and render booked rooms in the new panel.
- [x] Test the changes by running the server and checking the admin UI for dark theme, displayed booked rooms, and no errors.
- [x] Enable admin seeding by removing environment check in server-admin/routes/auth.js.
- [x] Create admin user using seed script.
- [x] Add Settings page with logout functionality.
- [x] Fix HTML escaping in escapeHtml function.
