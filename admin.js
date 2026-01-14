
const BASE_URL = "http://localhost:3000/api/admin";

/* USERS */
fetch(`${BASE_URL}/users`)
  .then(res => res.json())
  .then(data => {
    const usersDiv = document.getElementById("users");
    usersDiv.innerHTML = "";

    if (data.length === 0) {
      usersDiv.innerHTML = "<p>No users found</p>";
      return;
    }

    data.forEach(u => {
      usersDiv.innerHTML += `
        <div class="item">
          <strong>${u.name}</strong><br>
          ${u.email} (${u.role})
        </div>
      `;
    });
  });

/* EVENTS */
fetch(`${BASE_URL}/events`)
  .then(res => res.json())
  .then(data => {
    const eventsDiv = document.getElementById("events");
    eventsDiv.innerHTML = "";

    if (data.length === 0) {
      eventsDiv.innerHTML = "<p>No events found</p>";
      return;
    }

    data.forEach(e => {
      eventsDiv.innerHTML += `
        <div class="item">
          <strong>${e.event_name}</strong><br>
          ${e.location} - ₹${e.price}
          <button onclick="deleteEvent(${e.event_id})">Delete</button>
        </div>
      `;
    });
  });

/* BOOKINGS */
fetch(`${BASE_URL}/bookings`)
  .then(res => res.json())
  .then(data => {
    const bookingsDiv = document.getElementById("bookings");
    bookingsDiv.innerHTML = "";

    if (data.length === 0) {
      bookingsDiv.innerHTML = "<p>No bookings</p>";
      return;
    }

    data.forEach(b => {
      bookingsDiv.innerHTML += `
        <div class="item">
          ${b.user_name} booked <strong>${b.event_name}</strong>
        </div>
      `;
    });
  });

/* DELETE EVENT */
function deleteEvent(id) {
  if (!confirm("Delete this event?")) return;

  fetch(`${BASE_URL}/events/${id}`, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(() => {
    alert("Event deleted");
    location.reload();
  });
}
