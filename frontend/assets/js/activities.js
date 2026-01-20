import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const db = getFirestore();
let activityStart = null;

async function logUsage(type, id, duration = null) {
  const user = getAuth().currentUser;
  if (!user) return;
  await addDoc(collection(db, "usage_logs"), {
    userId: user.uid,
    type,
    activityId: id,
    ts: new Date().toISOString(),
    duration // minutes spent
  });
}

async function loadActivities() {
  const res = await fetch("assets/data/activities.json");
  const activities = await res.json();

  const container = document.getElementById("activityList");
  container.innerHTML = "";

  activities.forEach(activity => {
    const div = document.createElement("div");
    div.className = "activity-card";
    div.innerHTML = `
      <h3>${activity.title}</h3>
      <p>${activity.description}</p>
      <button onclick="startActivity('${activity.id}')">Start</button>
      <button onclick="endActivity('${activity.id}')">Finish</button>
    `;
    container.appendChild(div);
  });
}

window.startActivity = (id) => {
  activityStart = Date.now();
  alert(`Activity ${id} started`);
};

window.endActivity = async (id) => {
  if (!activityStart) return alert("You must start first!");
  const duration = Math.round((Date.now() - activityStart) / 60000); // minutes
  await logUsage("activity", id, duration);
  alert(`Activity ${id} finished. Duration: ${duration} min`);
  activityStart = null;
};

loadActivities();