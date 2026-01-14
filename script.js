console.log("script.js loaded");

/* =========================
   REGISTER USER
========================= */
function registerUser() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!name || !email || !password) {
    alert("All fields are required");
    return;
  }

  fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      email,
      password
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Registration successful! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Registration failed");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
}

/* =========================
   LOGIN USER
========================= */
function loginUser() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem("user_id", data.user_id);
        alert("Login successful ✅");
        window.location.href = "index.html";
      } else {
        document.getElementById("error").innerText =
          "Invalid email or password";
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
}


// ---------------- LOGIN CHECK ----------------
function checkLogin() {
  if (!localStorage.getItem("user_id")) {
    window.location.href = "login.html";
  }
}

// ---------------- INDEX PAGE ----------------
function loadHomeEvents() {
  const container = document.getElementById("eventContainer");
  if (!container) return;

  fetch("http://localhost:3000/api/events")
    .then(res => res.json())
    .then(events => {
      container.innerHTML = "";

      events.forEach(e => {
        const date = new Date(e.event_date).toLocaleDateString("en-GB");

        container.innerHTML += `
          <div class="event-card">
            <h3>${e.event_name}</h3>
            <p>Date: ${date}</p>
            <p>Location: ${e.location}</p>
            <p>Price: ₹${e.price}</p>
            <a class="btn" href="event.html?id=${e.event_id}">View Details</a>
          </div>
        `;
      });
    })
    .catch(err => console.error("Index error:", err));
}

// ================= EVENT DETAILS =================
function loadEventDetails() {
  const id = new URLSearchParams(window.location.search).get("id");

  if (!id) {
    window.location.href="index.html";
    return;
  }

  fetch(`http://localhost:3000/api/events/${id}`)
    .then(res => res.json())
    .then(e => {
      document.getElementById("eventName").innerText = e.event_name;
      document.getElementById("eventDate").innerText =
        "Date: " + new Date(e.event_date).toLocaleDateString("en-GB");
      document.getElementById("eventLocation").innerText =
        "Location: " + e.location;
      document.getElementById("eventPrice").innerText =
        "Price: ₹" + e.price;

      document.getElementById("bookBtn").onclick = () =>
        bookEvent(e.event_id);
    })
    .catch(err => {
      console.error(err);
      alert("Failed to load event");
    });
}
// ================= BOOK EVENT =================
function bookEvent(eventId) {
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  fetch("http://localhost:3000/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      event_id: eventId
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message === "Booking successful") {
        alert("Event booked successfully ✅");
        window.location.href = "dashboard.html";
      } else {
        alert(data.message || "Booking failed");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Booking failed");
    });
}
// ---------------- DASHBOARD ----------------
function loadUserBookings() {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;

  fetch(`http://localhost:3000/api/bookings/${userId}`)
    .then(res => res.json())
    .then(bookings => {
      const list = document.getElementById("bookingList");
      if (!list) return;

      list.innerHTML = "";

      if (bookings.length === 0) {
        list.innerHTML = "<p>No bookings found</p>";
        return;
      }

      bookings.forEach(b => {
        list.innerHTML += `
          <div class="event-card">
            <h3>${b.event_name}</h3>
            <p>Date: ${new Date(b.event_date).toLocaleDateString("en-GB")}</p>
            <p>Location: ${b.location}</p>
            <p>Price: ₹${b.price}</p>
            <button class="cancel-btn"
              onclick="cancelBooking(${b.booking_id})">
              Cancel Booking
            </button>
          </div>
        `;
      });
    })
    .catch(err => console.error("Dashboard error:", err));
}

// ---------------- CANCEL BOOKING ----------------
function cancelBooking(id) {
  if (!confirm("Are you sure?")) return;

  fetch(`http://localhost:3000/api/bookings/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(() => {
      alert("Booking cancelled");
      loadUserBookings();
    })
    .catch(err => console.error("Cancel error:", err));
}

function addEvent() {
  const name = document.getElementById("eventName").value;
  const date = document.getElementById("eventDate").value;
  const location = document.getElementById("eventLocation").value;
  const price = document.getElementById("eventPrice").value;

  if (!name || !date || !location || !price) {
    alert("All fields are required");
    return;
  }

  fetch("http://localhost:3000/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_name: name,
      event_date: date,
      location,
      price
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message === "Event added successfully") {
        alert("Event added successfully ✅");

        // clear form
        document.getElementById("eventName").value = "";
        document.getElementById("eventDate").value = "";
        document.getElementById("eventLocation").value = "";
        document.getElementById("eventPrice").value = "";

        // 🔥 LOAD EVENTS BELOW
        loadAllEvents();
      } else {
        alert("Failed to add event");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
}
function loadAllEvents() {
  const list = document.getElementById("eventList");
  if (!list) return;

  fetch("http://localhost:3000/api/events")
    .then(res => res.json())
    .then(events => {
      list.innerHTML = "";

      if (events.length === 0) {
        list.innerHTML = "<p>No events available</p>";
        return;
      }

      events.forEach(e => {
        const date = new Date(e.event_date).toLocaleDateString("en-GB");

        list.innerHTML += `
          <div class="event-card">
            <h3>${e.event_name}</h3>
            <p>Date: ${date}</p>
            <p>Location: ${e.location}</p>
            <p>Price: ₹${e.price}</p>

            <button class="delete-btn"
              onclick="deleteEvent(${e.event_id})">
              Delete Event
            </button>
          </div>
        `;
      });
    })
    .catch(err => console.error(err));
}

function deleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;

  fetch(`http://localhost:3000/api/events/${eventId}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Event deleted successfully ✅");
        loadAllEvents(); // 🔥 refresh organizer list
      } else {
        alert("Failed to delete event");
      }
    })
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
}

// ---------------- AUTO LOAD ----------------
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("eventContainer")) loadHomeEvents();
  if (document.getElementById("bookingList")) loadUserBookings();
  if (document.getElementById("eventList")) loadAllEvents();
});
