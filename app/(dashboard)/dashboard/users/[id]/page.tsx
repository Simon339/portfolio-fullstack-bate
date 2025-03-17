/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import UserDetails from "@/components/Dashboard/UserDetails";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getbyUserDetails } from '@/server/data/alldata';

type User = {
  id: string;
  name: string;
  surname: string;
  image: string;
  email: string;
  role: "USER" | "SUPER_USER" | "ADMIN";
  status: "Verified" | "Not Verified";
  approval: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: Date;
  lastActivityDate: Date;
  phone: string;
  country: string;
  isSelected: boolean;
};

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const userId = params.id;
  
  const user = users.find((m) => m.id === userId);

  useEffect(() => {
    fetchUsers();
  }, [userId]); 

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getbyUserDetails();
      setUsers(usersData);
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">Back to Users</h2>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">Error</h2>
          </div>
        </div>
        <div className="items-center mb-10">
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-center">{error}</h2>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 mb-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">Back to Users</h2>
          </div>
        </div>

        <div className="items-center mb-10">
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-center">User not found</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-2 mb-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl text-gray-800">Back to Users</h2>
        </div>
      </div>
      <UserDetails user={user} />
    </section>
  );
};

export default Page;
