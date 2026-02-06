const isWithinLoginTime = () => {
  const now = new Date();

  const currentHour = now.getHours(); // 0 - 23

  // Allowed window: 9 AM (09) to 7 PM (19)
  return currentHour >= 9 && currentHour < 19;
};

module.exports = isWithinLoginTime;
