"use client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Heartbeat() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const setOnline = async () => {
      await fetch("https://localhost:8080/api/users/heartbeat", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, online_status: 1 }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    };
    
    setOnline();
    // const handleBeforeUnload = async () => {
    //   await fetch("https://localhost:8080/api/users/heartbeat", {
    //     method: "POST",
    //     body: JSON.stringify({ userId: user.id }),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });
    // };
    const handleBeforeUnload = () => {
      // Use sendBeacon instead of fetch - it's guaranteed to send
      navigator.sendBeacon(
        "https://localhost:8080/api/users/heartbeat",
        JSON.stringify({ userId: user.id, online_status: 0 })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  return null;
}
