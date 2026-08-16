const { admin, getDb } = require("../lib/firebase");

const CONTACTS = new Set(["maurice", "vanessa"]);
const ATTENDANCE = new Set(["Oui", "Non"]);

function cleanText(value, maxLength) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function isAllowedOrigin(req) {
  const configured = cleanText(process.env.ALLOWED_ORIGIN, 1000);
  if (!configured) return true;

  const allowed = configured
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const origin = cleanText(req.headers.origin, 500);
  if (!origin) return true;

  return allowed.includes(origin);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ ok: false, error: "Origin not allowed" });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

  // Honeypot anti-spam: answer successfully but do not store bots.
  if (cleanText(body.website, 200)) {
    return res.status(201).json({ ok: true });
  }

  const submissionId = cleanText(body.submissionId, 80);
  const firstName = cleanText(body.firstName, 80);
  const lastName = cleanText(body.lastName, 80);
  const contactPerson = cleanText(body.contactPerson, 20).toLowerCase();
  const attendance = cleanText(body.attendance, 10);
  const message = cleanText(body.message, 1500);
  const guestCount = Number.parseInt(body.guestCount, 10);
  const clientSubmittedAt = cleanText(body.clientSubmittedAt, 80);

  if (!submissionId || !/^[a-zA-Z0-9_-]{8,80}$/.test(submissionId)) {
    return res.status(400).json({ ok: false, error: "Invalid submission id" });
  }

  if (!firstName || !lastName || firstName.length < 2 || lastName.length < 2) {
    return res.status(400).json({ ok: false, error: "Name is required" });
  }

  if (!CONTACTS.has(contactPerson)) {
    return res.status(400).json({ ok: false, error: "Invalid WhatsApp contact" });
  }

  if (!ATTENDANCE.has(attendance)) {
    return res.status(400).json({ ok: false, error: "Invalid attendance value" });
  }

  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
    return res.status(400).json({ ok: false, error: "Invalid guest count" });
  }

  try {
    const db = getDb();

    // Deterministic document ID makes retries idempotent (no duplicate row).
    await db.collection("rsvps").doc(submissionId).set({
      submissionId,
      firstName,
      lastName,
      contactPerson,
      attendance,
      guestCount,
      message,
      clientSubmittedAt: clientSubmittedAt || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      source: "bm-samuel-choukroun",
      userAgent: cleanText(req.headers["user-agent"], 500) || null,
    });

    return res.status(201).json({ ok: true, submissionId });
  } catch (error) {
    console.error("RSVP storage error:", error);
    return res.status(500).json({ ok: false, error: "Storage unavailable" });
  }
};
