export const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };
  
    for (let key in intervals) {
      const value = Math.floor(seconds / intervals[key]);
      if (value > 0) {
        return `${value} ${key}${value !== 1 ? "s" : ""} ago`;
      }
    }
  
    return "Just now";
  };

// utils.jsx
export const getTimestamp = (chat) => {
  // Try BSON style
  if (chat.timeStamp?.$date?.$numberLong) return new Date(Number(chat.timeStamp.$date.$numberLong));
  if (chat.createdAt?.$date?.$numberLong) return new Date(Number(chat.createdAt.$date.$numberLong));
  if (chat.updatedAt?.$date?.$numberLong) return new Date(Number(chat.updatedAt.$date.$numberLong));

  // Try ISO date string or JS Date
  if (chat.timeStamp) return new Date(chat.timeStamp);
  if (chat.createdAt) return new Date(chat.createdAt);
  if (chat.updatedAt) return new Date(chat.updatedAt);

  return null;
};

