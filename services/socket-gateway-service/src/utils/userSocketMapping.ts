const userSocketMap = new Map<string, Set<string>>();
const socketUserMap = new Map<string, string>();

export function setMapping(userId: string, socketId: string) {
    if (!userSocketMap.has(userId))
        userSocketMap.set(userId, new Set());
    userSocketMap.get(userId)!.add(socketId);
    socketUserMap.set(socketId, userId);
}

export function removeMapping(socketId: string) {
    const userId = socketUserMap.get(socketId);
    if (userId) {
        userSocketMap.get(userId)?.delete(socketId);
        if (userSocketMap.get(userId)?.size === 0)
            userSocketMap.delete(userId);
    }
    socketUserMap.delete(socketId);
}