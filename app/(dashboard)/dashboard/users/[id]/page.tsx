/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from 'react';
import UserDetails from "@/components/Dashboard/UserDetails";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { getUserDetails } from '@/server/data/alldata'; // Assuming you'll create this function

// Enhanced User type to match the schema
type User = {
  id: string;
  name: string;
  image: string;
  email: string;
  status: "Verified" | "Not Verified";
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  
  // Additional fields from schema
  sessions?: {
    all: Array<{
      id: string;
      expiresAt: Date;
      ipAddress: string | null;
      userAgent: string | null;
      createdAt: Date;
      activeOrganizationId: string | null;
      activeTeamId: string | null;
    }>;
    current: any | null;
    stats: {
      total: number;
      active: number;
    };
  };
  
  accounts?: Array<{
    id: string;
    providerId: string;
    accountId: string;
    createdAt: Date;
    scope: string | null;
  }>;
  
  organizations?: Array<{
    membershipId: string;
    role: "member" | "admin" | "owner";
    joinedAt: Date;
    organization: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
    };
  }>;
  
  invitations?: {
    sent: Array<{
      id: string;
      email: string;
      organizationId: string;
      role: "member" | "admin" | "owner";
      status: "pending" | "accepted" | "rejected" | "cancelled";
      createdAt: Date;
      expiresAt: Date;
      organization: {
        name: string;
        slug: string;
      };
    }>;
    stats: {
      pending: number;
      accepted: number;
      total: number;
    };
  };
  
  activity?: {
    auditLogs: Array<{
      id: number;
      action: string;
      tableName: string;
      recordId: string;
      timestamp: Date;
      ipAddress: string | null;
      userAgent: string | null;
      details: any;
    }>;
    submissions: {
      contactForms: Array<any>;
      ratings: Array<any>;
      serviceInquiries: Array<any>;
    };
    stats: {
      totalActions: number;
      formSubmissions: number;
      lastActive: Date;
    };
  };
  
  stats?: {
    sessionCount: number;
    activeSessionCount: number;
    linkedAccountCount: number;
    organizationCount: number;
    sentInvitationCount: number;
    contactFormCount: number;
    ratingCount: number;
    serviceInquiryCount: number;
    auditLogCount: number;
    lastActive: Date;
  };
  
  verification?: {
    email: boolean;
    accounts: boolean;
    hasPassword: boolean;
  };
  
  // For backward compatibility
  role?: string;
  isSelected?: boolean;
};

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const userId = params.id as string;

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // You'll need to implement this function in your server actions
      // It should call the getUserDetails function from the schema
      const userData = await getUserDetails(userId);
      
      // Transform the data to match the User type
      const transformedUser: User = {
        id: userData.id,
        name: userData.name || "",
        email: userData.email || "",
        image: userData.image || '',
        status: userData.emailVerified ? 'Verified' : 'Not Verified',
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
        emailVerified: userData.emailVerified,
        
        // Additional data
        sessions: userData.sessions,
        accounts: userData.accounts,
        organizations: userData.organizations,
        invitations: userData.invitations,
        activity: userData.activity,
        stats: userData.stats,
        verification: userData.verification,
        
        // For compatibility with existing components
        role: userData.organizations?.[0]?.role?.toUpperCase() || 'USER',
        isSelected: false
      };
      
      setUser(transformedUser);
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError(err instanceof Error ? err.message : "Failed to fetch user details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#acc2ef]">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#acc2ef]">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">Error</h2>
          </div>
          <Button onClick={fetchUserDetails} >
            Retry
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4 max-w-md">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-lg font-medium text-red-800">Unable to load user</h3>
              <p className="text-red-600 mt-2">{error}</p>
            </div>
            <Button onClick={fetchUserDetails} >
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-[#acc2ef]">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-800">User Not Found</h2>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-lg font-medium text-yellow-800">User not found</h3>
              <p className="text-yellow-600 mt-2">
                The user with ID "{userId}" could not be found. They may have been deleted or you may have followed an incorrect link.
              </p>
            </div>
            <Button onClick={handleBack} >
              Back to Users
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-gray-50 shadow-md overflow-hidden min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#acc2ef] bg-white">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
            <p className="text-sm text-gray-500 mt-1">
              Viewing details for {user.name}
            </p>
          </div>
        </div>
        
        {/* Quick Stats Summary */}
        <div className="hidden md:flex items-center gap-4">
          {user.stats && (
            <>
              <div className="text-center px-3 py-1 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">{user.stats.organizationCount}</div>
                <div className="text-xs text-blue-500">Organizations</div>
              </div>
              <div className="text-center px-3 py-1 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-700">{user.stats.sessionCount}</div>
                <div className="text-xs text-green-500">Sessions</div>
              </div>
              <div className="text-center px-3 py-1 bg-purple-50 rounded-lg">
                <div className="text-lg font-semibold text-purple-700">{user.stats.linkedAccountCount}</div>
                <div className="text-xs text-purple-500">Linked Accounts</div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* User Details Component */}
      <div className="flex-1 p-4 md:p-6">
        <UserDetails user={user} />
      </div>
      
      {/* Refresh Button */}
      <div className="p-4 border-t border-[#acc2ef] bg-white">
        <div className="flex justify-between items-center">
          <Button 
            onClick={fetchUserDetails} 
             
           
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Refresh Data'
            )}
          </Button>
          
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;