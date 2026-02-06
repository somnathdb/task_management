const mobileUserModel  = require('../models/mobileUser/mobileUserModel');
const admin = require('./firebaseAdmin');

exports.sendPushNotification = async (userIds, title, body) => {
  if (!userIds || !userIds.length) return;

  // Fetch users with tokens
  const users = await mobileUserModel.find({
    _id: { $in: userIds },
    fcmToken: { $exists: true, $ne: [] }
  }).select("fcmToken");

  const tokens = users.flatMap(u => u.fcmToken);

  if (!tokens.length) return;

  const message = {
    tokens,
    notification: { title, body }
  };

  const response = await admin.messaging().sendEachForMulticast(message);

  // Remove invalid tokens
  response.responses.forEach(async (resp, index) => {
    if (!resp.success) {
      await mobileUserModel.updateMany(
        { fcmToken: tokens[index] },
        { $pull: { fcmToken: tokens[index] } }
      );
    }
  });
};
