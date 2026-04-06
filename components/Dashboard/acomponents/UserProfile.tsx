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
import { UploadIcon, Calendar, Shield, Clock, Key, Trash2, Building, Mail, User, Lock, Eye, EyeOff, CheckCircle, XCircle, ChevronDown, Users, Check, LogOut, Settings, Plus, Edit, UserPlus, Eye as EyeIcon, MoreVertical, Search, Filter, Download, RefreshCw, AlertCircle, Mail as MailIcon, UserCheck, UserX, Link, Copy, Globe, ShieldAlert, FileText, Briefcase, Loader2, Bell, BellOff, CreditCard, DownloadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import QRCode from "react-qr-code";

type User = {
  id: string;
  name: string;
  email: string;
  role: string | "admin" | "user" | "owner";
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

type Session = {
  id: string;
  browser: string;
  os: string;
  ip: string;
  createdAt: Date;
  lastActive: Date;
  current: boolean;
  userId?: string;
}

type BackupCode = {
  code: string;
  used: boolean;
}

const UserManagement = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // User data
  const [userData, setUserData] = useState<User | null>(null);
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

  // Search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Alert dialogs
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [twoFactorDialogAction, setTwoFactorDialogAction] = useState<'enable' | 'disable'>('enable');

  // 2FA QR Code and verification states
  const [qrData, setQrData] = useState<{ totpURI: string; secret: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);

  // Sessions
  const [sessions, setSessions] = useState<Session[]>([]);

  // Auth hooks
  const {
    data: session,
    isPending: sessionLoading,
    error: sessionError,
    refetch: refetchSession
  } = authClient.useSession();

  // Initialize user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (sessionLoading) return;

      if (session?.user) {
        try {
          setIsLoading(true);

          // Fetch user's session data first
          const sessionData = await authClient.getSession();

          // Set user data
          setUserData({
            id: session.user.id || '',
            name: session.user.name || "User",
            email: session.user.email || "",
            image: session.user.image || "",
            role: session.user.role || "user",
            status: session.user.emailVerified ? "Verified" : "Not Verified",
            sessionExpireAt: sessionData.data?.session?.expiresAt ? new Date(sessionData.data.session.expiresAt) : new Date(),
            createdAt: session.user.createdAt ? new Date(session.user.createdAt) : new Date(),
            preferences: await getUserPreferences()
          });

          // Set two factor enabled state
          setTwoFactorEnabled(session.user.twoFactorEnabled || false);

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

  // Helper function to get user preferences
  const getUserPreferences = async () => {
    try {
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
      const sessionsResponse = await authClient.listSessions?.();

      if (sessionsResponse?.data) {
        const mappedSessions: Session[] = sessionsResponse.data.map((sess: any) => ({
          id: sess.id,
          browser: sess.userAgent || "Unknown Browser",
          os: sess.os || "Unknown OS",
          ip: sess.ip || "Unknown IP",
          createdAt: new Date(sess.createdAt),
          lastActive: new Date(sess.lastActiveAt || sess.createdAt),
          current: sess.isCurrent || false,
          userId: sess.userId
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

  // === USER PROFILE HANDLERS ===

  const handleFieldUpdate = async (field: keyof User, value: string) => {
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

  // === TWO FACTOR AUTHENTICATION HANDLERS ===

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

    if (isEnabling) {
      // First, call enable to generate the secret and get the totpURI
      const enableResult = await authClient.twoFactor.enable({
        password: twoFactorPassword,
      });

      if (enableResult?.error) {
        toast.error(enableResult.error.message || "Failed to enable two-factor authentication");
        return;
      }
      
      // Check if we have valid data from enable response
      if (enableResult?.data?.totpURI) {
        setQrData({ 
          totpURI: enableResult.data.totpURI, 
          secret: enableResult.data.totpURI
        });
        setShowQRCode(true);
      } else {
        toast.error("Failed to get QR code data");
        return;
      }
    } else {
      // Disable 2FA
      const result = await authClient.twoFactor.disable({
        password: twoFactorPassword,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to disable two-factor authentication");
        return;
      }

      setTwoFactorEnabled(false);
      setTwoFactorPassword('');
      setShowTwoFactorDialog(false);
      
      if (userData) {
        setUserData({
          ...userData,
          preferences: {
            ...userData.preferences!,
            twoFactorEnabled: false
          }
        });
      }

      toast.success("Two-factor authentication disabled");
    }
  } catch (error) {
    console.error("2FA Error:", error);
    toast.error("Failed to process two-factor authentication");
  } finally {
    setIsSubmitting(false);
  }
};

  const handleVerifyTwoFactor = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await authClient.twoFactor.verifyTotp({
        code: verificationCode,
        trustDevice: trustDevice,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid verification code");
        return;
      }

      setTwoFactorEnabled(true);
      setTwoFactorPassword('');
      setVerificationCode('');
      setShowQRCode(false);
      setShowTwoFactorDialog(false);
      setTrustDevice(false);
      setQrData(null);


      if (userData) {
        setUserData({
          ...userData,
          preferences: {
            ...userData.preferences!,
            twoFactorEnabled: true
          }
        });
      }

      // Refresh session to update 2FA status
      await refetchSession();

      toast.success("Two-factor authentication enabled successfully");
    } catch (error) {
      toast.error("Failed to verify two-factor authentication");
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

  const handleRevokeSession = async (sessionId?: string) => {
    try {
      setIsSubmitting(true);

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

  const handleFileUpload = (file: File, isUpdate = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return null;
    }

    return file;
  };

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
        <p className="text-gray-600 mt-2">Manage your profile and security settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full md:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
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
                    <AvatarImage src={userData.image || `https://api.dicebear.com/6.x/initials/svg?seed=${userData.name || 'user'}`} alt={userData.name} />
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
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                  <span>{session.ip}</span>
                                  <span>•</span>
                                  <span>Last active: {session.lastActive.toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!session.current && (
                                <Button
                                  variant="destructive"
                                  className='bg-red-50 border border-[#acc2ef] hover:bg-red-100 text-red-700'
                                  size="sm"
                                  onClick={() => handleRevokeSession(session.id)}
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

      {/* Two-Factor Authentication Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={(open) => {
  if (!open) {
    setShowTwoFactorDialog(false);
    setTwoFactorPassword('');
    setVerificationCode('');
    setShowQRCode(false);
    setQrData(null);
    setTrustDevice(false);
  }
}}>
  <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0">
    {!showQRCode ? (
      <>
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          <DialogHeader className="px-0">
            <DialogTitle>
              {twoFactorDialogAction === 'enable' 
                ? 'Enable Two-Factor Authentication' 
                : 'Disable Two-Factor Authentication'}
            </DialogTitle>
            <DialogDescription>
              {twoFactorDialogAction === 'enable'
                ? 'Verify your password to enable 2FA'
                : 'Confirm your password to disable 2FA'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="two-factor-password">Password</Label>
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
                autoFocus
              />
            </div>

            {twoFactorDialogAction === 'enable' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-2">
                  <ShieldAlert className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700">
                    After enabling, scan a QR code with Google Authenticator or similar app to complete setup
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg">
          <DialogFooter className="sm:justify-between">
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
              className={twoFactorDialogAction === 'enable' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-orange-600 hover:bg-orange-700'}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {twoFactorDialogAction === 'enable' ? 'Verifying...' : 'Disabling...'}
                </>
              ) : twoFactorDialogAction === 'enable' ? 'Continue' : 'Disable 2FA'}
            </Button>
          </DialogFooter>
        </div>
      </>
    ) : (
      <>
        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4">
          <DialogHeader className="px-0">
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* QR Code */}
            <div className="flex justify-center">
              {qrData?.totpURI && (
                <div className="p-3 bg-white border rounded-lg">
                  <QRCode value={qrData.totpURI} size={180} />
                </div>
              )}
            </div>

            {/* Manual Setup - Collapsible */}
            {qrData?.secret && (
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-900 font-medium">
                  Manual setup option
                </summary>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                    {qrData.secret}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(qrData.secret);
                      toast.success("Copied!");
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </details>
            )}

            {/* Verification Code */}
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-wider"
                autoFocus
              />
            </div>

            {/* Trust Device */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <Label className="text-sm">Trust this device</Label>
                <p className="text-xs text-gray-500">No 2FA for 30 days</p>
              </div>
              <Switch checked={trustDevice} onCheckedChange={setTrustDevice} />
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg">
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setShowQRCode(false);
                setQrData(null);
                setVerificationCode('');
              }}
            >
              Back
            </Button>
            <Button
              onClick={handleVerifyTwoFactor}
              disabled={isSubmitting || verificationCode.length !== 6}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : "Enable 2FA"}
            </Button>
          </DialogFooter>
        </div>
      </>
    )}
  </DialogContent>
</Dialog>


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

export default UserManagement;
