import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const db = getFirestore();
let gameStart = null;

async function logUsage(type, id, duration = null) {
  const user = getAuth().currentUser;
  if (!user) return;
  await addDoc(collection(db, "usage_logs"), {
    userId: user.uid,
    type,
    gameId: id,
    ts: new Date().toISOString(),
    duration
  });
}

async function loadGames() {
  const res = await fetch("assets/data/games.json");
  const games = await res.json();

  const container = document.getElementById("gameList");
  container.innerHTML = "";

  games.forEach(game => {
    const div = document.createElement("div");
    div.className = "game-card";
    div.innerHTML = `
      <h3>${game.title}</h3>
      <p>${game.description}</p>
      <button onclick="startGame('${game.id}')">Play</button>
      <button onclick="endGame('${game.id}')">Finish</button>
    `;
    container.appendChild(div);
  });
}

window.startGame = (id) => {
  gameStart = Date.now();
  alert(`Game ${id} started`);
};

window.endGame = async (id) => {
  if (!gameStart) return alert("You must start first!");
  const duration = Math.round((Date.now() - gameStart) / 60000);
  await logUsage("game", id, duration);
  alert(`Game ${id} finished. Duration: ${duration} min`);
  gameStart = null;
};

loadGames();