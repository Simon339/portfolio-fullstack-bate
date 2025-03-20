/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const SESSION_TIMEOUT = 60 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 1* 60 * 1000; // 15 minutes in milliseconds

export const useSessionTimeout = () => {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout for session expiration
    const id = setTimeout(() => {
      toast.error("Your session has expired. Please log in again.");
      signOut({ callbackUrl: "/auth" });
    }, SESSION_TIMEOUT);

    setTimeoutId(id);

    // Show a warning 15 minutes before session expires
    setTimeout(() => {
      toast.warning("You have 1 minute left before your session expires due to inactivity.");
    }, WARNING_TIME);
  };

  useEffect(() => {
    // Reset the timer on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    const handleActivity = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity));

    // Initialize the timer
    resetTimer();

    // Cleanup event listeners
    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return null;
};