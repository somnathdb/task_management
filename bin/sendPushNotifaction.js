const admin = require("../config/firebaseAdmin");

module.exports = async function sendPushNotification(
  tokens,
  title,
  body,
  data = {}
) {
  try {
    if (!Array.isArray(tokens) || tokens.length === 0) {
      console.log("⚠️ No valid FCM tokens");
      return;
    }

    const cleanTokens = [...new Set(tokens.filter(t => typeof t === "string"))];

    console.log("🔔 Sending notification to:", cleanTokens);

    const message = {
      notification: { title, body },
      data, // ⚠️ strings only
      tokens: cleanTokens,
    };
    await admin.messaging().sendEachForMulticast(message);
    // await admin.messaging().sendMulticast(message);

  } catch (err) {
    console.error("🔥 FCM Error:", err.message);
  }
};
