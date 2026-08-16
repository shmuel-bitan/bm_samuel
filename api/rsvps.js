const { getDb } = require("../lib/firebase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const expectedToken = process.env.ADMIN_TOKEN;
  const authorization = req.headers.authorization || "";
  const suppliedToken = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!expectedToken || suppliedToken !== expectedToken) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    const db = getDb();
    const snapshot = await db
      .collection("rsvps")
      .orderBy("createdAt", "desc")
      .limit(1000)
      .get();

    const rows = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        submissionId: data.submissionId || doc.id,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        contactPerson: data.contactPerson || "",
        attendance: data.attendance || "",
        guestCount: data.guestCount || 0,
        message: data.message || "",
        clientSubmittedAt: data.clientSubmittedAt || null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      };
    });

    return res.status(200).json({ ok: true, rows });
  } catch (error) {
    console.error("RSVP admin read error:", error);
    return res.status(500).json({ ok: false, error: "Unable to read RSVP list" });
  }
};
