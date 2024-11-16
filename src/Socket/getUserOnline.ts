export const getUserOnline = (userId: string): boolean => {
  return global.onlineUsers.has(userId);
};
