const userSocketMap = new Map<string, string | null>();
const socketUserMap = new Map<string, string>();

export function setUserSocket(userId: string, socketId: string) {
  userSocketMap.set(userId, socketId);
  socketUserMap.set(socketId, userId);
}

export function setUserSocketNull(socketId: string) {
  const userId = socketUserMap.get(socketId);
  if (userId) {
    userSocketMap.set(userId, null);
  }
}

export function removeUserSocket(socketId: string) {
  const userId = socketUserMap.get(socketId);
  if (userId && !userSocketMap.get(userId)) {
    userSocketMap.delete(userId);
  }
  socketUserMap.delete(socketId);
}

export function getUserSocketId(userId: string) {
  return userSocketMap.get(userId);
}

export function getUserId(socketId: string) {
  return socketUserMap.get(socketId);
}
