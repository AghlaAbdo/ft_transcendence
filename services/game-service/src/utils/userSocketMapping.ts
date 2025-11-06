const userSocketMap = new Map<string, string | null>();
const socketUserMap = new Map<string, string>();

export function setUserSocket(userId: string, socketId: string) {
  userSocketMap.set(userId, socketId);
  socketUserMap.set(socketId, userId);
  // console.log("called serUserSocket: ", userSocketMap);
}

export function setUserSocketNull(socketId: string) {
  const userId = socketUserMap.get(socketId);
  if (userId && socketId === userSocketMap.get(userId)) {
    userSocketMap.set(userId, null);
  }
}

export function removeUserSocket(socketId: string) {
  const userId = socketUserMap.get(socketId);
  if (userId && !userSocketMap.get(userId)) {
    userSocketMap.delete(userId);
  }
  socketUserMap.delete(socketId);
  // console.log("called removeUserSocket: ", userSocketMap);
}

export function getUserSocketId(userId: string | null) {
  // console.log("userSocketMap in getUserSocketId: ", userSocketMap);
  // console.log('uerId in getuserSocketId: ', userId);
  if (!userId) return;
  return userSocketMap.get(userId);
}

export function getUserId(socketId: string) {
  return socketUserMap.get(socketId);
}
