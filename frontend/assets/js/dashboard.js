import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirestore, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const db = getFirestore();
const emotionChartCtx = document.getElementById("emotionChart").getContext("2d");
const trendChartCtx = document.getElementById("trendChart").getContext("2d");
const usageChartCtx = document.getElementById("usageChart").getContext("2d");
const durationChartCtx = document.getElementById("durationChart").getContext("2d");
const recentList = document.getElementById("recentEmotions");
const summaryBox = document.getElementById("summary");
const recentUsageList = document.getElementById("recentUsage");

async function loadDashboard() {
  const user = getAuth().currentUser;
  if (!user) {
    recentList.innerHTML = "<li>Please login first!</li>";
    return;
  }

  // Fetch emotions
  const q = query(collection(db, "emotion_history"), orderBy("ts", "desc"), limit(20));
  const snapshot = await getDocs(q);

  const emotions = [];
  const timestamps = [];
  snapshot.forEach((doc) => {
    emotions.push(doc.data().emotion);
    timestamps.push(new Date(doc.data().ts).toLocaleString());
    const li = document.createElement("li");
    li.textContent = `${doc.data().emotion} (${doc.data().ts})`;
    recentList.appendChild(li);
  });

  // Frequency counts
  const emotionCounts = emotions.reduce((acc, e) => {
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});

  // Bar chart: emotion frequency
  new Chart(emotionChartCtx, {
    type: "bar",
    data: {
      labels: Object.keys(emotionCounts),
      datasets: [{
        label: "Emotion Frequency",
        data: Object.values(emotionCounts),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"]
      }]
    },
    options: { plugins: { title: { display: true, text: "Emotion Frequency" } } }
  });

  // Line chart: emotion trend
  new Chart(trendChartCtx, {
    type: "line",
    data: {
      labels: timestamps.reverse(),
      datasets: [{
        label: "Emotions over time",
        data: emotions.reverse().map(e => Object.keys(emotionCounts).indexOf(e)),
        borderColor: "#36A2EB",
        fill: false
      }]
    },
    options: {
      plugins: { title: { display: true, text: "Emotion Trend" } },
      scales: {
        y: {
          ticks: { callback: (val) => Object.keys(emotionCounts)[val] || "" }
        }
      }
    }
  });

  // Usage logs
  const usageSnapshot = await getDocs(query(collection(db, "usage_logs"), orderBy("ts", "desc"), limit(50)));
  let activityCount = 0, gameCount = 0;
  const durations = {}; // {id: [durations]}
  recentUsageList.innerHTML = "";

  usageSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.type === "activity") activityCount++;
    if (data.type === "game") gameCount++;

    const li = document.createElement("li");
    li.textContent = `${data.type.toUpperCase()} - ${data.activityId || data.gameId} (${data.ts})` +
                     (data.duration ? ` | Duration: ${data.duration} min` : "");
    recentUsageList.appendChild(li);

    const id = data.activityId || data.gameId;
    if (!durations[id]) durations[id] = [];
    if (data.duration) durations[id].push(data.duration);
  });

  // Pie chart: activity vs game usage
  new Chart(usageChartCtx, {
    type: "pie",
    data: {
      labels: ["Activities", "Games"],
      datasets: [{
        data: [activityCount, gameCount],
        backgroundColor: ["#4BC0C0", "#FFCE56"]
      }]
    },
    options: { plugins: { title: { display: true, text: "Activity vs Game Usage" } } }
  });

  // Average duration chart
  const avgDurations = Object.entries(durations).map(([id, arr]) => ({
    id,
    avg: arr.reduce((a,b) => a+b, 0) / arr.length
  }));

  new Chart(durationChartCtx, {
    type: "bar",
    data: {
      labels: avgDurations.map(d => d.id),
      datasets: [{
        label: "Average Duration (min)",
        data: avgDurations.map(d => d.avg),
        backgroundColor: "#9966FF"
      }]
    },
    options: { plugins: { title: { display: true, text: "Average Duration per Activity/Game" } } }
  });

  // Summary
  const mostCommon = Object.entries(emotionCounts).sort((a,b) => b[1]-a[1])[0];
  if (mostCommon) {
    summaryBox.textContent = `Most common emotion recently: ${mostCommon[0]} (${mostCommon[1]} times)`;
  }
}
// After fetching usage logs
let totalActivityMinutes = 0, totalGameMinutes = 0;
usageSnapshot.forEach(doc => {
  const data = doc.data();
  if (data.duration) {
    if (data.type === "activity") totalActivityMinutes += data.duration;
    if (data.type === "game") totalGameMinutes += data.duration;
  }
});

// Weekly summary
const weeklySummary = document.createElement("p");
weeklySummary.textContent = `This week you spent ${totalActivityMinutes} minutes on activities and ${totalGameMinutes} minutes on games.`;
document.getElementById("summary").appendChild(weeklySummary);

loadDashboard();