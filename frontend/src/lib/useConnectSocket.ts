import { useAuth } from "@/hooks/useAuth";
import { useSocketStore } from "@/store/useNotificationSocket";
import { useEffect } from "react";

export default function  useConnectSocket() {
  const { user } = useAuth();
  const { connect, disconnect } = useSocketStore();
  useEffect(() => {
    if (user) connect(user.id);
    else disconnect();

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);
}
