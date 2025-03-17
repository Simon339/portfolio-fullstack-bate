/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getUserByEmail } from "@/server/data/user";

type User = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
  image: string;
  country: string;
  status: "PENDING" | "REJECTED" | "APPROVED";
  lastActivityDate: string;
  createdAt: Date;
};

export const getCurrentUser = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null); // Add proper typing for `user`
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const userData = await getUserByEmail(session.user.email);
          setUser(userData);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session, status]);

  return { user, loading };
};