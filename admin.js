const loginForm = document.getElementById("adminLoginForm");
const tokenInput = document.getElementById("adminToken");
const loginStatus = document.getElementById("loginStatus");
const loginCard = document.getElementById("loginCard");
const dashboard = document.getElementById("dashboard");
const dashboardStatus = document.getElementById("dashboardStatus");
const tableBody = document.getElementById("rsvpTableBody");
const refreshButton = document.getElementById("refreshButton");
const exportButton = document.getElementById("exportButton");

let currentRows = [];
let adminToken = sessionStorage.getItem("bm_admin_token") || "";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  }).format(date);
}

function renderStats(rows) {
  const presentRows = rows.filter((row) => row.attendance === "Oui");
  document.getElementById("statResponses").textContent = rows.length;
  document.getElementById("statPresent").textContent = presentRows.length;
  document.getElementById("statAbsent").textContent = rows.filter((row) => row.attendance === "Non").length;
  document.getElementById("statGuests").textContent = presentRows.reduce((sum, row) => sum + Number(row.guestCount || 0), 0);
}

function renderTable(rows) {
  if (!rows.length) {
    tableBody.innerHTML = '<tr><td colspan="6" class="empty-cell">Aucune inscription enregistrée pour le moment.</td></tr>';
    return;
  }

  tableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(formatDate(row.createdAt || row.clientSubmittedAt))}</td>
      <td><strong>${escapeHtml(row.firstName)} ${escapeHtml(row.lastName)}</strong></td>
      <td class="${row.attendance === "Oui" ? "attendance-yes" : "attendance-no"}">${escapeHtml(row.attendance)}</td>
      <td>${escapeHtml(row.guestCount)}</td>
      <td>${escapeHtml(row.contactPerson === "maurice" ? "Maurice" : row.contactPerson === "vanessa" ? "Vanessa" : row.contactPerson)}</td>
      <td>${escapeHtml(row.message || "—")}</td>
    </tr>
  `).join("");
}

async function loadRsvps() {
  if (!adminToken) return;

  dashboardStatus.textContent = "Chargement…";
  dashboardStatus.classList.remove("error");

  try {
    const response = await fetch("/api/rsvps", {
      headers: { Authorization: `Bearer ${adminToken}` },
      cache: "no-store",
    });

    if (response.status === 401) {
      throw new Error("Code administrateur incorrect.");
    }

    if (!response.ok) {
      throw new Error(`Erreur serveur (${response.status}).`);
    }

    const data = await response.json();
    currentRows = data.rows || [];
    renderStats(currentRows);
    renderTable(currentRows);
    loginCard.hidden = true;
    dashboard.hidden = false;
    dashboardStatus.textContent = `${currentRows.length} réponse${currentRows.length > 1 ? "s" : ""} chargée${currentRows.length > 1 ? "s" : ""}.`;
  } catch (error) {
    sessionStorage.removeItem("bm_admin_token");
    loginCard.hidden = false;
    dashboard.hidden = true;
    loginStatus.textContent = error.message || "Impossible de charger les inscriptions.";
    loginStatus.classList.add("error");
  }
}

function csvValue(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function exportCsv() {
  if (!currentRows.length) return;

  const headers = ["Date", "Prénom", "Nom", "Présence", "Nombre de personnes", "Contact", "Message"];
  const lines = [headers.map(csvValue).join(";")];

  currentRows.forEach((row) => {
  const guestCountForCsv = row.attendance === "Non" ? 0 : row.guestCount;

  lines.push([
    formatDate(row.createdAt || row.clientSubmittedAt),
    row.firstName,
    row.lastName,
    row.attendance,
    guestCountForCsv,
    row.contactPerson,
    row.message,
  ].map(csvValue).join(";"));
});
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `rsvp-samuel-choukroun-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  adminToken = tokenInput.value.trim();
  if (!adminToken) return;
  sessionStorage.setItem("bm_admin_token", adminToken);
  loginStatus.textContent = "";
  loginStatus.classList.remove("error");
  loadRsvps();
});

refreshButton.addEventListener("click", loadRsvps);
exportButton.addEventListener("click", exportCsv);

if (adminToken) {
  tokenInput.value = adminToken;
  loadRsvps();
}
