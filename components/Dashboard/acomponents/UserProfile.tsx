/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { SettingsSchema } from "@/types";
import FieldDialog from '../modals/FieldDialog';
import { Badge } from "@/components/ui/badge";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { authClient } from '@/hooks/getcurrectuser';
import { UploadIcon, Calendar, Shield, Clock, Key, Trash2, Building, Mail, User, Lock, Eye, EyeOff, CheckCircle, XCircle, ChevronDown, Users, Check, LogOut, Settings, Plus, Edit, UserPlus, Eye as EyeIcon, MoreVertical, Search, Filter, Download, RefreshCw, AlertCircle, Mail as MailIcon, UserCheck, UserX, Link, Copy, Globe, ShieldAlert, FileText, Briefcase, Loader2, Bell, BellOff, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuGroup } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import QRCode from "react-qr-code";

type Users = {
  id: string;
  name: string;
  email: string;
  role: "member" | "admin" | "owner";
  image: string;
  status: "Verified" | "Not Verified";
  sessionExpireAt: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
  preferences?: {
    notifications: boolean;
    twoFactorEnabled: boolean;
    emailNotifications: boolean;
  };
}

type Organization = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  role: "member" | "admin" | "owner";
  memberCount?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date;
  description?: string;
  billingEmail?: string;
  website?: string;
}

interface OrgForm {
  name: string;
  slug: string;
  logo: string | File | null;
  metadata: Record<string, any>;
  keepCurrentActiveOrganization: boolean;
  logoUrl?: string;
}

type Member = {
  id: string;
  userId: string;
  email: string;
  name: string;
  image?: string;
  role: ("member" | "admin" | "owner")[];
  status: "active" | "pending" | "invited" | "suspended";
  joinedAt: Date;
  lastActive?: Date;
}

type Invitation = {
  id: string;
  email: string;
  role: ("member" | "admin" | "owner") | "member";
  status: "pending" | "accepted" | "expired" | "revoked";
  invitedBy: string;
  invitedAt: Date;
  expiresAt: Date;
  invitationUrl?: string;
}

type Session = {
  id: string;
  browser: string;
  os: string;
  ip: string;
  createdAt: Date;
  lastActive: Date;
  current: boolean;
}

const UserManagement = () => {
  const router = useRouter();

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isLoadingOrgDetails, setIsLoadingOrgDetails] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // User data
  const [userData, setUserData] = useState<Users | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);

  // Password change
  const [showPassword, setShowPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Organization management
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [showUpdateOrgDialog, setShowUpdateOrgDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [orgMembers, setOrgMembers] = useState<Member[]>([]);
  const [orgInvitations, setOrgInvitations] = useState<Invitation[]>([]);
  const [orgRoles, setOrgRoles] = useState<string[]>([]);
  const [orgSessions, setOrgSessions] = useState<Session[]>([]);

  // Forms
  const [newOrg, setNewOrg] = useState<OrgForm>({
    name: "",
    slug: "",
    logo: null,
    metadata: {},
    keepCurrentActiveOrganization: false,
  });

  const [updateOrg, setUpdateOrg] = useState<OrgForm>({
    name: "",
    slug: "",
    logo: null,
    metadata: {},
    keepCurrentActiveOrganization: false,
  });

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "member",
    message: "",
  });

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Alert dialogs
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false);
  const [showLeaveOrgDialog, setShowLeaveOrgDialog] = useState(false);
  const [showRemoveMemberDialog, setShowRemoveMemberDialog] = useState(false);
  const [showRevokeInviteDialog, setShowRevokeInviteDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = useState<Invitation | null>(null);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [twoFactorDialogAction, setTwoFactorDialogAction] = useState<'enable' | 'disable'>('enable');

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);

  // Auth hooks
  const {
    data: session,
    isPending: sessionLoading,
    error: sessionError,
    refetch: refetchSession
  } = authClient.useSession();

  const { data: activeOrganization, refetch: refetchActiveOrg } = authClient.useActiveOrganization();
  const { data: orgsList, isPending: orgsListLoading, refetch: refetchOrgsList } = authClient.useListOrganizations();

  // Initialize user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (sessionLoading) return;

      if (session?.user) {
        try {
          setIsLoading(true);

          // Fetch user's session data first
          const sessionData = await authClient.getSession();

          // Load organizations in parallel with user data
          const [orgsResponse, userPreferences] = await Promise.all([
            fetchOrganizations(),
            getUserPreferences()
          ]);

          // Set user data
          setUserData({
            id: session.user.id || '',
            name: session.user.name || "User",
            email: session.user.email || "",
            image: session.user.image || "",
            role: orgsResponse.userRole || "member",
            status: session.user.emailVerified ? "Verified" : "Not Verified",
            sessionExpireAt: sessionData.data?.expireAt ? new Date(sessionData.data.expireAt) : new Date(),
            createdAt: session.user.createdAt ? new Date(session.user.createdAt) : new Date(),
            preferences: userPreferences
          });

          // Set organizations
          setOrganizations(orgsResponse.organizations);

          // Load active sessions
          await loadActiveSessions();

        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load user data");
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, sessionLoading]);

  // Helper function to fetch organizations with roles
  const fetchOrganizations = async () => {
    try {
      if (!session?.user?.id) {
        return { organizations: [], userRole: "member" as const };
      }

      let userRole: "member" | "admin" | "owner" = "member";

      // Get all organizations
      const { data: orgsResponse } = await authClient.organization.list();

      console.log("Organizations response:", orgsResponse);

      // Check if orgsResponse.data exists and is an array
      if (!orgsResponse || !Array.isArray(orgsResponse)) {
        return { organizations: [], userRole: "member" as const };
      }

      // Get active organization
      const { data: activeOrg } = await authClient.organization.getFullOrganization();
      const activeOrgId = activeOrg?.id;

      // Fetch roles for each organization in parallel
      const orgPromises = orgsResponse.map(async (org: any) => {
        try {
          // Get user's role in this organization
          const roleResponse = await authClient.organization.getActiveMemberRole({
            query: {
              organizationId: org.id,
              userId: session.user.id
            },
          });

          const role = (roleResponse.data?.role as "member" | "admin" | "owner") || "member";

          // If this is the active organization, set user role
          const isActive = org.id === activeOrgId;
          if (isActive) {
            userRole = role;
          }

          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            image: org.logo || undefined,
            metadata: org.metadata || {},
            createdAt: org.createdAt ? new Date(org.createdAt) : undefined,
            role: role, // Adding role to the organization object
          };
        } catch (error) {
          console.error(`Error fetching role for org ${org.id}:`, error);
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            image: org.logo || undefined,
            metadata: org.metadata || {},
            createdAt: org.createdAt ? new Date(org.createdAt) : undefined,
            role: "member" as const, // Default role on error
          };
        }
      });

      const organizations = await Promise.all(orgPromises);

      return { organizations, userRole };
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return { organizations: [], userRole: "member" as const };
    }
  };

  // Helper function to get user preferences
  const getUserPreferences = async () => {
    try {
      // This is a placeholder - adjust based on your actual API
      return {
        notifications: true,
        twoFactorEnabled: session?.user?.twoFactorEnabled || false,
        emailNotifications: true
      };
    } catch (error) {
      return {
        notifications: true,
        twoFactorEnabled: false,
        emailNotifications: true
      };
    }
  };

  // Refresh organizations list
  const refreshOrganizations = async () => {
    try {
      setIsLoadingOrgs(true);
      const orgsResponse = await fetchOrganizations();
      setOrganizations(orgsResponse.organizations || []);

      // Update user role if needed
      if (userData) {
        setUserData(prev => prev ? {
          ...prev,
          role: orgsResponse.userRole
        } : null);
      }
    } catch (error) {
      console.error("Error refreshing organizations:", error);
      toast.error("Failed to refresh organizations");
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  // Password strength calculator
  useEffect(() => {
    const calculateStrength = (password: string) => {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      setPasswordStrength(strength);
    };

    if (passwords.new) {
      calculateStrength(passwords.new);
    }
  }, [passwords.new]);

  // Load active sessions
  const loadActiveSessions = async () => {
    try {
      setIsLoadingSessions(true);
      // Fetch sessions from Better Auth
      const sessionsResponse = await authClient.listSessions?.();

      if (sessionsResponse?.data) {
        const mappedSessions: Session[] = sessionsResponse.data.map((sess: any) => ({
          id: sess.id,
          browser: sess.userAgent || "Unknown Browser",
          os: sess.os || "Unknown OS",
          ip: sess.ip || "Unknown IP",
          createdAt: new Date(sess.createdAt),
          lastActive: new Date(sess.lastActiveAt || sess.createdAt),
          current: sess.isCurrent || false
        }));
        setSessions(mappedSessions);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Load organization details with Better Auth API
  const loadOrganizationDetails = async (org: Organization) => {
    try {
      setIsLoadingOrgDetails(true);
      setSelectedOrg(org);

      // Load organization details using Better Auth
      const orgDetails = await authClient.organization.getFullOrganization({
        query: {
          organizationId: org.id,
          organizationSlug: org.slug,
          membersLimit: 100,
        },
      });

      // Load members
      const membersResponse = await authClient.organization.listMembers({
        query: {
          organizationId: org.id,
          limit: 100,
          sortBy: "createdAt",
          sortDirection: "desc"
        },
      });

      // Load invitations
      const invitationsResponse = await authClient.organization.listInvitations({
        query: { organizationId: org.id },
      });

      // Load user's role in this organization
      const roleResponse = await authClient.organization.getActiveMemberRole({
        query: { organizationId: org.id, userId: session?.user.id || '' },
      });

      if (roleResponse.data?.role) {
        setOrgRoles(Array.isArray(roleResponse.data.role) ? roleResponse.data.role : [roleResponse.data.role]);
      }

      // Set members
      if (membersResponse.data?.members) {
        const members: Member[] = membersResponse.data.members.map((member: any) => ({
          id: member.id,
          userId: member.userId,
          email: member.email,
          name: member.name,
          image: member.image,
          role: Array.isArray(member.role) ? member.role : [member.role || "member"],
          status: member.status || 'active',
          joinedAt: new Date(member.createdAt || member.joinedAt),
          lastActive: member.lastActiveAt ? new Date(member.lastActiveAt) : undefined
        }));
        setOrgMembers(members);
      }

      // Set invitations
      if (invitationsResponse.data?.invitations && Array.isArray(invitationsResponse.data.invitations)) {
        const invitations: Invitation[] = invitationsResponse.data.invitations.map((inv: any) => ({
          id: inv.id,
          email: inv.email,
          role: (inv.role as "member" | "admin" | "owner") || "member",
          status: inv.status,
          invitedBy: inv.invitedBy,
          invitedAt: new Date(inv.createdAt),
          expiresAt: new Date(inv.expiresAt),
          invitationUrl: inv.invitationUrl
        }));
        setOrgInvitations(invitations);
      }

      toast.success("Organization details loaded");
    } catch (error) {
      console.error("Error loading organization details:", error);
      toast.error("Failed to load organization details");
    } finally {
      setIsLoadingOrgDetails(false);
    }
  };

  // === USER PROFILE HANDLERS ===

  const handleFieldUpdate = async (field: keyof Users, value: string) => {
    if (!userData) return;

    try {
      setIsSubmitting(true);

      if (field === 'email') {
        const result = await authClient.changeEmail({
          newEmail: value,
        });

        if (result.error) {
          toast.error(result.error.message || "Failed to update email");
          return;
        }
      } else if (field === 'image') {
        const result = await authClient.updateUser({
          image: value,
        });

        if (result.error) {
          toast.error(result.error.message || "Failed to update profile image");
          return;
        }
      } else {
        const updateData: any = {};
        updateData[field] = value;

        const result = await authClient.updateUser(updateData);

        if (result.error) {
          toast.error(result.error.message || `Failed to update ${field}`);
          return;
        }
      }

      setUserData((prev) => (prev ? { ...prev, [field]: value } : null));

      if (field === 'email') {
        await refetchSession();
      }

      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (error) {
      toast.error(`Failed to update ${field}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userData) return;

    try {
      setIsSubmitting(true);

      const result = SettingsSchema.shape.image.safeParse(file);
      if (!result.success) {
        toast.error(result.error.errors[0]?.message || "Invalid image file");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        const updateResult = await authClient.updateUser({
          image: base64String,
        });

        if (updateResult.error) {
          toast.error(updateResult.error.message || "Failed to update profile image");
          return;
        }

        setUserData((prev) => (prev ? { ...prev, image: base64String } : null));
        await refetchSession();

        toast.success("Profile image updated successfully");
        setIsSubmitting(false);
      };

      reader.readAsDataURL(file);

    } catch (error) {
      toast.error("Failed to upload image");
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    const errors: string[] = [];

    if (!passwords.current) {
      errors.push("Current password is required");
    }

    if (!passwords.new) {
      errors.push("New password is required");
    } else if (passwords.new.length < 8) {
      errors.push("New password must be at least 8 characters");
    }

    if (passwords.new !== passwords.confirm) {
      errors.push("New passwords do not match");
    }

    if (passwordStrength < 75) {
      errors.push("Password is not strong enough");
    }

    setPasswordErrors(errors);

    if (errors.length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await authClient.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to change password");
        return;
      }

      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordErrors([]);
      setPasswordDialogOpen(false);

      toast.success("Password changed successfully");
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Replace the handleTwoFactorToggle function with this:
  const handleTwoFactorToggle = () => {
    const newState = !twoFactorEnabled;
    setTwoFactorDialogAction(newState ? 'enable' : 'disable');
    setShowTwoFactorDialog(true);
  };

  const handleTwoFactorWithPassword = async () => {
    if (!twoFactorPassword.trim()) {
      toast.error("Password is required");
      return;
    }

    try {
      setIsSubmitting(true);
      const isEnabling = twoFactorDialogAction === 'enable';

      let result;
      if (isEnabling) {
        result = await authClient.twoFactor.enable({
          password: twoFactorPassword,
          issuer: "Malesela's-Portfolio",
        });
      } else {
        result = await authClient.twoFactor.disable({
          password: twoFactorPassword,
        });
      }

      if (result.error) {
        toast.error(result.error.message || `Failed to ${isEnabling ? 'enable' : 'disable'} two-factor authentication`);
        return;
      }

      setTwoFactorEnabled(isEnabling);
      setTwoFactorPassword('');
      setShowTwoFactorDialog(false);

      if (userData) {
        setUserData({
          ...userData,
          preferences: {
            ...userData.preferences!,
            twoFactorEnabled: isEnabling
          }
        });
      }

      toast.success(`Two-factor authentication ${isEnabling ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to update two-factor authentication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationToggle = async (type: 'email' | 'app') => {
    try {
      setIsSubmitting(true);

      const updateData: any = {};
      if (type === 'email') {
        updateData.emailNotifications = !emailNotifications;
        setEmailNotifications(!emailNotifications);
      } else {
        updateData.appNotifications = !appNotifications;
        setAppNotifications(!appNotifications);
      }

      const result = await authClient.updateUser(updateData);

      if (result.error) {
        toast.error(result.error.message || "Failed to update notification settings");
        return;
      }

      if (userData) {
        setUserData({
          ...userData,
          preferences: {
            ...userData.preferences!,
            ...(type === 'email' ? { emailNotifications: !emailNotifications } : { notifications: !appNotifications })
          }
        });
      }

      toast.success(`${type === 'email' ? 'Email' : 'App'} notifications ${type === 'email' ? !emailNotifications : !appNotifications ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to update notification settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userData?.id) {
      toast.error("No user ID found");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await authClient.deleteUser();

      if (result.error) {
        toast.error(result.error.message || "Failed to delete account");
        return;
      }

      toast.success("Account deleted", {
        description: "Your account has been deleted successfully.",
      });

      await authClient.signOut();
      router.push("/auth");
    } catch (error) {
      toast.error("Deletion failed", {
        description: "There was an error deleting your account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSession = async () => {
    try {
      setIsSubmitting(true);

      const sessionId = session?.user.id;

      const result = await authClient.revokeSession?.({ token: sessionId || "" });

      if (result?.error) {
        toast.error(result.error.message || "Failed to revoke session");
        return;
      }

      setSessions(prev => prev.filter(s => s.id !== sessionId));

      toast.success("Session revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke session");
    } finally {
      setIsSubmitting(false);
    }
  };

  // === ORGANIZATION HANDLERS ===

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleFileUpload = (file: File, isUpdate = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return null;
    }

    if (isUpdate) {
      setUpdateOrg(prev => ({
        ...prev,
        logo: file,
        logoUrl: URL.createObjectURL(file)
      }));
    } else {
      setNewOrg(prev => ({
        ...prev,
        logo: file,
        logoUrl: URL.createObjectURL(file)
      }));
    }

    return file;
  };

  const handleCreateOrganization = async () => {
    if (!newOrg.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      let logoString = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(newOrg.name)}`;

      if (newOrg.logo && newOrg.logo instanceof File) {
        logoString = await compressAndConvertImage(newOrg.logo, 100);
      }

      const result = await authClient.organization.create({
        name: newOrg.name,
        slug: newOrg.slug || generateSlug(newOrg.name),
        logo: logoString,
        metadata: newOrg.metadata,
        keepCurrentActiveOrganization: newOrg.keepCurrentActiveOrganization,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to create organization");
        return;
      }

      toast.success("Organization created successfully");
      setShowCreateOrgDialog(false);
      setNewOrg({
        name: "",
        slug: "",
        logo: null,
        metadata: {},
        keepCurrentActiveOrganization: false
      });

      await refreshOrganizations();

    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg || !updateOrg.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      let logoString = selectedOrg.image || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(selectedOrg.name)}`;

      if (updateOrg.logo instanceof File) {
        logoString = await compressAndConvertImage(updateOrg.logo, 100);
      } else if (updateOrg.logo === null) {
        logoString = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(updateOrg.name)}`;
      }

      const result = await authClient.organization.update({
        data: {
          name: updateOrg.name,
          slug: updateOrg.slug || generateSlug(updateOrg.name),
          logo: logoString,
          metadata: updateOrg.metadata,
        },
        organizationId: selectedOrg.id,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to update organization");
        return;
      }

      toast.success("Organization updated successfully");
      setShowUpdateOrgDialog(false);

      await refreshOrganizations();
      if (selectedOrg.isActive) {
        await refetchActiveOrg();
      }

    } catch (error) {
      console.error("Error updating organization:", error);
      toast.error("Failed to update organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const compressAndConvertImage = async (file: File, maxSizeKB = 500): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          const maxWidth = 500;
          const maxHeight = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          const base64String = canvas.toDataURL('image/jpeg', 0.7);

          const sizeKB = (base64String.length * 3) / 4 / 1024;

          if (sizeKB > maxSizeKB) {
            const quality = Math.max(0.1, 0.7 * (maxSizeKB / sizeKB));
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(base64String);
          }
        };

        img.onerror = () => {
          const reader2 = new FileReader();
          reader2.onloadend = () => resolve(reader2.result as string);
          reader2.onerror = reject;
          reader2.readAsDataURL(file);
        };
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const openUpdateDialog = (org: Organization) => {
    setSelectedOrg(org);
    setUpdateOrg({
      name: org.name || "",
      slug: org.slug || "",
      logo: org.image || null,
      metadata: org.metadata || {},
      keepCurrentActiveOrganization: false,
    });
    setShowUpdateOrgDialog(true);
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrg) return;

    try {
      setIsSubmitting(true);

      const result = await authClient.organization.delete({
        organizationId: selectedOrg.id,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to delete organization");
        return;
      }

      toast.success("Organization deleted successfully");
      setShowDeleteOrgDialog(false);
      setSelectedOrg(null);

      await refreshOrganizations();

    } catch (error) {
      toast.error("Failed to delete organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveOrganization = async () => {
    if (!selectedOrg) return;

    try {
      setIsSubmitting(true);

      const result = await authClient.organization.leave({
        organizationId: selectedOrg.id,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to leave organization");
        return;
      }

      toast.success("You have left the organization");
      setShowLeaveOrgDialog(false);
      setSelectedOrg(null);

      await refreshOrganizations();

    } catch (error) {
      toast.error("Failed to leave organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchOrganization = async (orgId: string, orgSlug?: string) => {
    try {
      setIsLoadingOrgs(true);
      const result = await authClient.organization.setActive({
        organizationId: orgId,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to switch organization");
        return;
      }

      toast.success("Organization switched");

      await Promise.all([
        refetchSession(),
        refreshOrganizations(),
        refetchActiveOrg()
      ]);

    } catch (error) {
      toast.error("Failed to switch organization");
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const handleInviteMember = async () => {
    if (!selectedOrg || !inviteForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await authClient.organization.inviteMember({
        organizationId: selectedOrg.id,
        email: inviteForm.email,
        role: inviteForm.role as any,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send invitation");
        return;
      }

      toast.success("Invitation sent successfully");
      setShowInviteDialog(false);
      setInviteForm({ email: "", role: "member", message: "" });

      if (selectedOrg) {
        await loadOrganizationDetails(selectedOrg);
      }

    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!selectedOrg || !memberToRemove) return;

    try {
      setIsSubmitting(true);

      const result = await authClient.organization.removeMember({
        memberIdOrEmail: memberToRemove.email,
        organizationId: selectedOrg.id,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to remove member");
        return;
      }

      toast.success("Member removed successfully");
      setShowRemoveMemberDialog(false);
      setMemberToRemove(null);

      if (selectedOrg) {
        await loadOrganizationDetails(selectedOrg);
      }

    } catch (error) {
      toast.error("Failed to remove member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeInvitation = async () => {
    if (!selectedOrg || !inviteToRevoke) return;

    try {
      setIsSubmitting(true);

      const result = await authClient.organization.cancelInvitation({
        invitationId: inviteToRevoke.id,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to revoke invitation");
        return;
      }

      toast.success("Invitation revoked successfully");
      setShowRevokeInviteDialog(false);
      setInviteToRevoke(null);

      if (selectedOrg) {
        await loadOrganizationDetails(selectedOrg);
      }

    } catch (error) {
      toast.error("Failed to revoke invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRoles: string[]) => {
    if (!selectedOrg) return;

    try {
      setIsSubmitting(true);

      const result = await authClient.organization.updateMemberRole({
        role: newRoles,
        memberId: memberId,
        organizationId: selectedOrg.id,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to update member role");
        return;
      }

      toast.success("Member role updated successfully");

      if (selectedOrg) {
        await loadOrganizationDetails(selectedOrg);
      }

    } catch (error) {
      toast.error("Failed to update member role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInvitationLink = (invitation: Invitation) => {
    if (invitation.invitationUrl) {
      navigator.clipboard.writeText(invitation.invitationUrl);
      toast.success("Invitation link copied to clipboard");
    }
  };

  const filteredMembers = orgMembers.filter(member => {
    const matchesSearch = searchQuery === "" ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" ||
      (["member", "admin", "owner"].includes(roleFilter) && member.role.includes(roleFilter as "member" | "admin" | "owner"));

    return matchesSearch && matchesRole;
  });

  const filteredInvitations = orgInvitations.filter(inv => {
    return searchQuery === "" ||
      inv.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStrengthColor = (strength: number) => {
    if (strength < 50) return "bg-red-500";
    if (strength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
      case "active":
      case "accepted":
        return "bg-green-500";
      case "pending":
      case "invited":
        return "bg-yellow-500";
      case "Not Verified":
      case "suspended":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading || sessionLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData || !session) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Access Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your profile</p>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/auth")}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your profile, organizations, and security settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full md:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 border-[#acc2ef]">
          <Card className="border-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 border-none">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-[#acc2ef] shadow-lg">
                    <AvatarImage src={userData.image} alt={userData.name} />
                    <AvatarFallback className="text-3xl">
                      {userData.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                    <Button
                      size="sm"
                      className="h-10 w-10 rounded-full"
                      disabled={isSubmitting}
                    >
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UploadIcon className="h-4 w-4" />
                        )}
                      </label>
                    </Button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Profile Picture</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    JPG, PNG or WebP. Max size 5MB.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${userData.status === "Verified" ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-700"} font-medium`}
                    >
                      {userData.status === "Verified" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {userData.status}
                    </Badge>
                    {userData.role && (
                      <Badge className="bg-blue-100 text-blue-800 font-medium">
                        {userData.role}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator className='bg-[#acc2ef]' />

              <div className="space-y-6">
                <h3 className="font-medium text-gray-900 text-lg">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-[#acc2ef]">
                      <span className="font-medium">{userData.name}</span>
                      <FieldDialog
                        title="Update Name"
                        fieldName="name"
                        currentValue={userData.name || ""}
                        onUpdate={(value) => handleFieldUpdate('name', value)}
                        userId={userData.id}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-[#acc2ef]">
                      <span className="font-medium">{userData.email}</span>
                      <FieldDialog
                        title="Update Email"
                        fieldName="email"
                        currentValue={userData.email || ""}
                        onUpdate={(value) => handleFieldUpdate('email', value)}
                        userId={userData.id}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className='bg-[#acc2ef]' />

              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-lg">Account Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member Since
                    </Label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-[#acc2ef] ">
                      <span className="font-medium">{userData.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Session Expires
                    </Label>
                    <div className="p-3 bg-gray-50 rounded-lg border border-[#acc2ef]">
                      <span className="font-medium">{userData.sessionExpireAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Notifications</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 border-none">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-900 flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    App Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications within the application
                  </p>
                </div>
                <Switch
                  checked={appNotifications}
                  onCheckedChange={() => handleNotificationToggle('app')}
                  disabled={isSubmitting}
                />
              </div>

              <Separator className='bg-[#acc2ef]' />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-900 flex items-center">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-600">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={() => handleNotificationToggle('email')}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="space-y-6">
          <Card className="border-none">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold">Organizations</CardTitle>
                  <CardDescription>
                    Manage your organizations and memberships
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateOrgDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Organization
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {organizations.filter(org => org.isActive).length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Active Organization</h3>
                  {organizations
                    .filter(org => org.isActive)
                    .map((activeOrg) => (
                      <div key={activeOrg.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-[#acc2ef] mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                              {activeOrg.image ? (
                                <img
                                  src={activeOrg.image}
                                  alt={activeOrg.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <Building className="h-6 w-6 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-lg">{activeOrg.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200 font-medium">
                                  {activeOrg.role}
                                </Badge>
                                <span className="text-sm text-green-600 flex items-center">
                                  <Check className="h-4 w-4 mr-1" />
                                  Active
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => loadOrganizationDetails(activeOrg)}
                              disabled={isLoadingOrgDetails}
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Switch className="h-4 w-4 mr-2" />
                                  Switch To...
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {organizations
                                  .filter(org => !org.isActive)
                                  .map((org) => (
                                    <DropdownMenuItem
                                      key={org.id}
                                      onClick={() => handleSwitchOrganization(org.id, org.slug)}
                                      disabled={isLoadingOrgs}
                                    >
                                      {org.name}
                                      <Badge className="ml-2">{org.role}</Badge>
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {organizations.filter(org => org.isActive).length > 0
                      ? "Your Organizations"
                      : "Organizations"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      className="text-gray-600 bg-yellow-100 border-yellow-200 hover:bg-yellow-200 hover:border-yellow-300"
                      size="sm"
                      onClick={() => refreshOrganizations()}
                      disabled={isLoadingOrgs}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingOrgs ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>

                {organizations.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <Building className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h4 className="text-xl font-medium text-gray-700 mb-2">No Organizations</h4>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      You're not a member of any organization yet. Create your first organization or ask to join one.
                    </p>
                    <Button onClick={() => setShowCreateOrgDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Organization
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {organizations
                      .filter(org => !org.isActive)
                      .map((org) => (
                        <Card key={org.id} className="overflow-hidden hover:shadow-md transition-shadow border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                  {org.image ? (
                                    <img src={org.image} alt={org.name} className="h-8 w-8 rounded-full" />
                                  ) : (
                                    <Building className="h-5 w-5 text-gray-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium truncate max-w-[140px]">{org.name}</p>
                                  <p className="text-xs text-gray-500">{org.slug}</p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleSwitchOrganization(org.id, org.slug)}
                                    disabled={isLoadingOrgs}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Set as Active
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openUpdateDialog(org)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => loadOrganizationDetails(org)}
                                  >
                                    <EyeIcon className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedOrg(org);
                                      setShowLeaveOrgDialog(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Leave
                                  </DropdownMenuItem>
                                  {org.role === "owner" && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedOrg(org);
                                        setShowDeleteOrgDialog(true);
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex items-center justify-between text-sm mb-3">
                              <Badge className='text-gray-600 border-[#acc2ef] bg-yellow-100'>{org.role}</Badge>
                              <div className="flex items-center text-gray-500">
                                <Users className="h-3 w-3 mr-1" />
                                <span>{org.memberCount || 0} members</span>
                              </div>
                            </div>

                            {org.createdAt && (
                              <div className="mt-3 text-xs text-gray-500">
                                Created {org.createdAt.toLocaleDateString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-900">Password</Label>
                      <p className="text-sm text-gray-600">Last changed 30 days ago</p>
                    </div>
                    <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex items-center bg-blue-600 hover:bg-blue-700 text-white">
                          <Lock className="h-4 w-4 mr-2" />
                          Change
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your current password and set a new one
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="current">Current Password</Label>
                            <div className="relative">
                              <Input
                                id="current"
                                type={showPassword ? "text" : "password"}
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                placeholder="Enter current password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute bg-black-100 text-white hover:bg-slate-800 right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="new">New Password</Label>
                            <Input
                              id="new"
                              type={showPassword ? "text" : "password"}
                              value={passwords.new}
                              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                              placeholder="Enter new password"
                            />
                            {passwords.new && (
                              <div className="space-y-2">
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${getStrengthColor(passwordStrength)} transition-all duration-300`}
                                    style={{ width: `${passwordStrength}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600">
                                  Password strength: {passwordStrength >= 75 ? "Strong" : passwordStrength >= 50 ? "Medium" : "Weak"}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm">Confirm New Password</Label>
                            <Input
                              id="confirm"
                              type={showPassword ? "text" : "password"}
                              value={passwords.confirm}
                              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                              placeholder="Confirm new password"
                            />
                            {passwords.confirm && passwords.new !== passwords.confirm && (
                              <p className="text-xs text-red-600">Passwords do not match</p>
                            )}
                          </div>

                          {passwordErrors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-red-800 mb-1">Please fix the following:</p>
                              <ul className="text-xs text-red-700 list-disc list-inside">
                                {passwordErrors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              setPasswordDialogOpen(false);
                              setPasswords({ current: '', new: '', confirm: '' });
                              setPasswordErrors([]);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handlePasswordChange}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : "Update Password"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Separator className='bg-[#acc2ef]' />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-900">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">
                      {twoFactorEnabled ? "Enabled" : "Add an extra layer of security"}
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleTwoFactorToggle}
                    disabled={isSubmitting}
                  />
                </div>

                <Separator className='bg-[#acc2ef]' />

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Security Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Enable Two-Factor Authentication</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Strong Password</p>
                        <p className="text-xs text-green-700 mt-1">
                          Your password meets security requirements
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Account Information</CardTitle>
                  <CardDescription>
                    Your account details and activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Member since</span>
                      </div>
                      <span className="font-medium">{userData.createdAt.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Session expires</span>
                      </div>
                      <span className="font-medium">{userData.sessionExpireAt.toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Shield className="h-4 w-4 mr-2" />
                        <span>Account status</span>
                      </div>
                      <Badge
                        variant={userData.status === "Verified" ? "default" : "outline"}
                        className={userData.status === "Verified" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                      >
                        {userData.status}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        <span>Active organization</span>
                      </div>
                      <span className="font-medium">
                        {activeOrganization?.data?.name || "None"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-red-700">Danger Zone</CardTitle>
                  <CardDescription className="text-red-600">
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-2">Delete Account</p>
                    <p className="text-xs text-red-700 mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowDeleteAccountDialog(true)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card className="border-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Current Sessions</h3>
                    <p className="text-sm text-gray-600">
                      {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={loadActiveSessions}
                    disabled={isLoadingSessions}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <div className="border rounded-lg">
                  {isLoadingSessions ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
                    </div>
                  ) : sessions.length > 0 ? (
                    <div className="divide-y">
                      {sessions.map((session) => (
                        <div key={session.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${session.current ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                {session.current ? (
                                  <CheckCircle className="h-5 w-5 text-blue-600" />
                                ) : (
                                  <Shield className="h-5 w-5 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium inline">
                                  {session.browser} • {session.os}
                                </p>
                                {session.current && (
                                  <Badge className="ml-2 text-xs bg-blue-100 text-blue-800">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>{session.ip}</span>
                                <span>•</span>
                                <span>Last active: {session.lastActive.toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!session.current && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRevokeSession(session?.user?.id)}
                                  disabled={isSubmitting}
                                >
                                  Revoke
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">No active sessions found</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-blue-50 border border-[#acc2ef] rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Security Notice</p>
                      <p className="text-xs text-blue-700 mt-1">
                        If you see any unfamiliar sessions, revoke them immediately. This will log out that device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateOrgDialog} onOpenChange={setShowCreateOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name *</Label>
              <Input
                id="org-name"
                placeholder="Acme Inc."
                value={newOrg.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setNewOrg(prev => ({
                    ...prev,
                    name,
                    slug: generateSlug(name)
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug *</Label>
              <Input
                id="org-slug"
                placeholder="acme-inc"
                value={newOrg.slug}
                onChange={(e) => setNewOrg({
                  ...newOrg,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                })}
              />
              <p className="text-xs text-gray-500">
                This will be used in URLs. Auto-generated from name or customize it.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="org-logo">Logo (Optional)</Label>
              <div className="flex items-center space-x-4">
                {newOrg.logo ? (
                  <div className="relative w-16 h-16">
                    <img
                      src={
                        newOrg.logo instanceof File
                          ? URL.createObjectURL(newOrg.logo)
                          : newOrg.logo || ''
                      }
                      alt="Logo preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => setNewOrg({ ...newOrg, logo: null })}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                    {newOrg.name ? (
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newOrg.name)}`}
                        alt="Auto generated logo"
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">No logo</span>
                    )}
                  </div>
                )}

                <div className="flex-1">
                  <Input
                    id="org-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, false);
                    }}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image (max 5MB). JPG, PNG, SVG, etc.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="keep-current-org"
                  checked={newOrg.keepCurrentActiveOrganization}
                  onChange={(e) => setNewOrg({
                    ...newOrg,
                    keepCurrentActiveOrganization: e.target.checked
                  })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="keep-current-org" className="text-sm">
                  Keep current organization active
                </Label>
              </div>
              <p className="text-xs text-gray-500">
                If checked, you'll stay in your current organization after creating this one.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateOrgDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrganization}
              disabled={isSubmitting || !newOrg.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : "Create Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Organization Dialog */}
      <Dialog open={showUpdateOrgDialog} onOpenChange={setShowUpdateOrgDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Organization</DialogTitle>
            <DialogDescription>
              Update organization details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="update-org-name">Organization Name *</Label>
              <Input
                id="update-org-name"
                value={updateOrg.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setUpdateOrg(prev => ({
                    ...prev,
                    name,
                    slug: generateSlug(name)
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-org-slug">Slug *</Label>
              <Input
                id="update-org-slug"
                value={updateOrg.slug}
                onChange={(e) => setUpdateOrg({
                  ...updateOrg,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update-org-logo">Logo</Label>
              <div className="flex items-center space-x-4">
                {updateOrg.logo ? (
                  <div className="relative w-16 h-16">
                    <img
                      src={
                        updateOrg.logo instanceof File
                          ? updateOrg.logoUrl
                          : updateOrg.logo || ''
                      }
                      alt="Logo preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    {updateOrg.logo && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                        onClick={() => setUpdateOrg({
                          ...updateOrg,
                          logo: null
                        })}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No logo</span>
                  </div>
                )}

                <div className="flex-1">
                  <Input
                    id="update-org-logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, true);
                    }}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedOrg?.image ? "Upload a new image to replace current logo" : "Upload an image (max 5MB)"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpdateOrgDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateOrganization}
              disabled={isSubmitting || !updateOrg.name.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : "Update Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address *</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="member@example.com"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                className="flex h-10 w-full rounded-md border border-[#acc2ef] bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                {orgRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-message">Personal Message (Optional)</Label>
              <Textarea
                id="invite-message"
                placeholder="Add a personal message to the invitation"
                value={inviteForm.message}
                onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => setShowInviteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteMember}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Two-Factor Authentication Password Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {twoFactorDialogAction === 'enable' ? 'Enable Two-Factor Authentication' : 'Disable Two-Factor Authentication'}
            </DialogTitle>
            <DialogDescription>
              {twoFactorDialogAction === 'enable'
                ? 'Enter your password to enable two-factor authentication for enhanced security.'
                : 'Enter your password to disable two-factor authentication.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="two-factor-password">Password *</Label>
              <div className="relative">
                <Input
                  id="two-factor-password"
                  type="password"
                  value={twoFactorPassword}
                  onChange={(e) => setTwoFactorPassword(e.target.value)}
                  placeholder="Enter your password"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && twoFactorPassword.trim()) {
                      handleTwoFactorWithPassword();
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {twoFactorDialogAction === 'enable'
                  ? 'For security reasons, please verify your identity to enable two-factor authentication.'
                  : 'To disable two-factor authentication, please confirm your password.'}
              </p>
            </div>

            {twoFactorDialogAction === 'enable' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Security Notice</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Two-factor authentication adds an extra layer of security. After enabling, you'll need to:
                      1. Scan a QR code with an authenticator app
                      2. Enter the generated code to complete setup
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTwoFactorDialog(false);
                setTwoFactorPassword('');
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTwoFactorWithPassword}
              disabled={isSubmitting || !twoFactorPassword.trim()}
              className={twoFactorDialogAction === 'enable' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {twoFactorDialogAction === 'enable' ? 'Enabling...' : 'Disabling...'}
                </>
              ) : twoFactorDialogAction === 'enable' ? 'Enable Two-Factor' : 'Disable Two-Factor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Alert Dialog */}
      <AlertDialog open={showDeleteOrgDialog} onOpenChange={setShowDeleteOrgDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedOrg?.name}"? This action cannot be undone.
              All data, members, and settings will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrganization}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : "Delete Organization"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Organization Alert Dialog */}
      <AlertDialog open={showLeaveOrgDialog} onOpenChange={setShowLeaveOrgDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave "{selectedOrg?.name}"? You will need to be invited again to rejoin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeaveOrganization}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Leaving...
                </>
              ) : "Leave Organization"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove Member Alert Dialog */}
      <AlertDialog open={showRemoveMemberDialog} onOpenChange={setShowRemoveMemberDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{memberToRemove?.name}" ({memberToRemove?.email}) from the organization?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : "Remove Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Invitation Alert Dialog */}
      <AlertDialog open={showRevokeInviteDialog} onOpenChange={setShowRevokeInviteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invitation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the invitation sent to "{inviteToRevoke?.email}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeInvitation}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : "Revoke Invitation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Alert Dialog */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure? This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};


function UserCard({ password }: { password: string }){
  const { data: session } = client.useSession();
	const { data: qr } = useQuery({
		queryKey: ["two-factor-qr"],
		queryFn: async () => {
			const res = await authClient.twoFactor.getTotpUri({ password });
			return res.data;
		},
		enabled: !!session?.user.twoFactorEnabled,
	});
    return (
      <QRCode value={qr?.totpURI || ""} />
   )
}

export default UserManagement;