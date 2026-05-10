/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import FieldDialog from '../modals/FieldDialog';
import { authClient } from '@/hooks/getcurrectuser';
import { Camera, Calendar, Shield, Clock, Trash2, Lock, Eye, EyeOff, CheckCircle, XCircle, RefreshCw, AlertCircle, Mail as MailIcon, Copy, ShieldAlert, Loader2, Bell, User, Settings, KeyRound, Monitor, FolderCog, Plus, Edit2, Building2, GraduationCap, Award } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import QRCode from "react-qr-code";
import Lottie from "react-lottie-player";
import { deleteUser, updateUserEmail, updateUserName } from '@/server/actions/user';
import { profile, aboutcards, companies, educationData } from '@/data/index';

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

type ProfileData = {
  id?: number;
  description: string;
  img?: string;
}

type AboutCard = {
  id: number;
  title: string;
  subtitle: string;
  icon?: string;
}

type Company = {
  id: number;
  name: string;
  logo: string;
}

type Education = {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  description?: string;
  category: string;
}

type LottieAnimationProps = {
  iconUrl?: string;
  className?: string;
};

const LottieAnimation = ({ iconUrl, className }: LottieAnimationProps) => {
  if (!iconUrl) return null;

  return (
    <Lottie
      path={iconUrl}
      className={className}
      loop
      play
    />
  );
};

// ========== MODAL COMPONENTS ==========

// Profile Dialog Modal
const ProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
  isSubmitting,
  editingProfile
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: { description: string; img: string };
  onSave: () => void;
  isSubmitting: boolean;
  editingProfile: any;
}) => {
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingProfile ? 'Edit Profile' : 'Create Profile'}</DialogTitle>
          <DialogDescription>
            {editingProfile ? 'Update your professional bio' : 'Add your professional bio'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="profile-description">Description *</Label>
            <textarea
              id="profile-description"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter your professional bio..."
              value={localProfile.description}
              onChange={(e) => setLocalProfile({ ...localProfile, description: e.target.value })}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-image">Profile Image URL (Optional)</Label>
            <Input
              id="profile-image"
              placeholder="https://example.com/image.jpg"
              value={localProfile.img}
              onChange={(e) => setLocalProfile({ ...localProfile, img: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSubmitting || !localProfile.description.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              editingProfile ? 'Update' : 'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// About Card Dialog Modal
const AboutCardDialog = ({
  open,
  onOpenChange,
  card,
  onSave,
  isSubmitting,
  editingCard
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: { title: string; subtitle: string; icon: string };
  onSave: () => void;
  isSubmitting: boolean;
  editingCard: any;
}) => {
  const [localCard, setLocalCard] = useState(card);

  useEffect(() => {
    setLocalCard(card);
  }, [card]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingCard ? 'Edit About Card' : 'Add About Card'}</DialogTitle>
          <DialogDescription>
            {editingCard ? 'Update your achievement or metric' : 'Add a new achievement or metric to showcase'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="card-title">Title *</Label>
            <Input
              id="card-title"
              placeholder="e.g., Projects Completed"
              value={localCard.title}
              onChange={(e) => setLocalCard({ ...localCard, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-subtitle">Subtitle / Value *</Label>
            <Input
              id="card-subtitle"
              placeholder="e.g., 50+"
              value={localCard.subtitle}
              onChange={(e) => setLocalCard({ ...localCard, subtitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-icon">Icon URL (Optional - Lottie JSON)</Label>
            <Input
              id="card-icon"
              placeholder="https://example.com/animation.json"
              value={localCard.icon}
              onChange={(e) => setLocalCard({ ...localCard, icon: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Provide a URL to a Lottie JSON animation file
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSubmitting || !localCard.title || !localCard.subtitle}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              editingCard ? 'Update' : 'Add'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Company Dialog Modal
const CompanyDialog = ({
  open,
  onOpenChange,
  company,
  onSave,
  isSubmitting,
  editingCompany
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: { name: string; logo: string };
  onSave: () => void;
  isSubmitting: boolean;
  editingCompany: any;
}) => {
  const [localCompany, setLocalCompany] = useState(company);

  useEffect(() => {
    setLocalCompany(company);
  }, [company]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingCompany ? 'Edit Company' : 'Add Company'}</DialogTitle>
          <DialogDescription>
            {editingCompany ? 'Update company information' : 'Add an organization you\'ve worked with'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              placeholder="e.g., Google, Microsoft"
              value={localCompany.name}
              onChange={(e) => setLocalCompany({ ...localCompany, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-logo">Logo URL (Optional)</Label>
            <Input
              id="company-logo"
              placeholder="https://example.com/logo.png"
              value={localCompany.logo}
              onChange={(e) => setLocalCompany({ ...localCompany, logo: e.target.value })}
            />
            {localCompany.logo && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded border overflow-hidden bg-muted">
                  <img src={localCompany.logo} alt="Preview" className="h-full w-full object-cover" />
                </div>
                <span className="text-xs text-muted-foreground">Logo preview</span>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSubmitting || !localCompany.name.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              editingCompany ? 'Update' : 'Add'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Education Dialog Modal
const EducationDialog = ({
  open,
  onOpenChange,
  education,
  onSave,
  isSubmitting,
  editingEducation
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  education: { title: string; subtitle: string; date: string; description: string; category: string };
  onSave: () => void;
  isSubmitting: boolean;
  editingEducation: any;
}) => {
  const [localEducation, setLocalEducation] = useState(education);

  useEffect(() => {
    setLocalEducation(education);
  }, [education]);

  const categories = ['education', 'certification', 'course'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingEducation ? 'Edit Education' : 'Add Education'}</DialogTitle>
          <DialogDescription>
            {editingEducation ? 'Update your academic background' : 'Add your academic background or certification'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edu-title">Title / Degree *</Label>
            <Input
              id="edu-title"
              placeholder="e.g., Bachelor of Science in Computer Science"
              value={localEducation.title}
              onChange={(e) => setLocalEducation({ ...localEducation, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edu-subtitle">Institution / Organization *</Label>
            <Input
              id="edu-subtitle"
              placeholder="e.g., Stanford University"
              value={localEducation.subtitle}
              onChange={(e) => setLocalEducation({ ...localEducation, subtitle: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edu-date">Date / Year *</Label>
            <Input
              id="edu-date"
              placeholder="e.g., 2020 - 2024"
              value={localEducation.date}
              onChange={(e) => setLocalEducation({ ...localEducation, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edu-category">Category</Label>
            <select
              id="edu-category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={localEducation.category}
              onChange={(e) => setLocalEducation({ ...localEducation, category: e.target.value })}
            >
              <option value="education">Education</option>
              <option value="certification">Certification</option>
              <option value="course">Course</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edu-description">Description (Optional)</Label>
            <textarea
              id="edu-description"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Additional details about your education..."
              value={localEducation.description}
              onChange={(e) => setLocalEducation({ ...localEducation, description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isSubmitting || !localEducation.title || !localEducation.subtitle || !localEducation.date}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              editingEducation ? 'Update' : 'Add'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Delete Confirmation Dialog
const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isDeleting
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting: boolean;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// ========== MAIN COMPONENT ==========

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
  const { data: session, isPending: sessionLoading, error: sessionError, refetch: refetchSession } = authClient.useSession();

  // Web settings states
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [aboutCardsData, setAboutCardsData] = useState<AboutCard[]>([]);
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [educationdata, setEducationData] = useState<Education[]>([]);

  // Dialog states
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showAboutCardDialog, setShowAboutCardDialog] = useState(false);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [showEducationDialog, setShowEducationDialog] = useState(false);

  // Edit states
  const [editingProfile, setEditingProfile] = useState<ProfileData | null>(null);
  const [editingAboutCard, setEditingAboutCard] = useState<AboutCard | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);

  // Form states
  const [newProfile, setNewProfile] = useState({ description: '', img: '' });
  const [newAboutCard, setNewAboutCard] = useState({ title: '', subtitle: '', icon: '' });
  const [newCompany, setNewCompany] = useState({ name: '', logo: '' });
  const [newEducation, setNewEducation] = useState({ title: '', subtitle: '', date: '', description: '', category: 'education' });

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: number; name?: string } | null>(null);

  // Initialize user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (sessionLoading) return;

      if (session?.user) {
        try {
          setIsLoading(true);

          const sessionData = await authClient.getSession();

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

          setTwoFactorEnabled(session.user.twoFactorEnabled || false);
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
        const result = await updateUserEmail(userData.id, value);
        if (!result.success) {
          toast.error(result.error || "Failed to update email");
          return;
        }
      } else if (field === 'image') {
        const result = await authClient.updateUser({ image: value });
        if (result.error) {
          toast.error(result.error.message || "Failed to update profile image");
          return;
        }
      } else if (field === 'name') {
        const result = await updateUserName(userData.id, value);
        if (!result.success) {
          toast.error(result.error || "Failed to update profile name");
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

  const storeImageInIndexedDB = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageDB', 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        const id = Date.now().toString();
        const putRequest = store.put(file, id);

        putRequest.onsuccess = () => {
          const url = URL.createObjectURL(file);
          resolve(url);
        };

        putRequest.onerror = reject;
      };

      request.onerror = reject;
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userData) return;

    try {
      setIsSubmitting(true);
      const imageUrl = await storeImageInIndexedDB(file);
      const updateResult = await authClient.updateUser({ image: imageUrl });

      if (updateResult.error) {
        toast.error(updateResult.error.message || "Failed to update profile image");
        return;
      }

      setUserData((prev) => (prev ? { ...prev, image: imageUrl } : null));
      toast.success("Profile image updated successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    const errors: string[] = [];

    if (!passwords.current) errors.push("Current password is required");
    if (!passwords.new) errors.push("New password is required");
    else if (passwords.new.length < 8) errors.push("New password must be at least 8 characters");
    if (passwords.new !== passwords.confirm) errors.push("New passwords do not match");
    if (passwordStrength < 75) errors.push("Password is not strong enough");

    setPasswordErrors(errors);
    if (errors.length > 0) return;

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
        const enableResult = await authClient.twoFactor.enable({
          password: twoFactorPassword,
          issuer: "Malesela's Portfolio",
        });

        if (enableResult?.error) {
          toast.error(enableResult.error.message || "Failed to enable two-factor authentication");
          return;
        }

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
        const result = await authClient.twoFactor.disable({ password: twoFactorPassword });

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
            preferences: { ...userData.preferences!, twoFactorEnabled: false }
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
        trustDevice: true,
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
          preferences: { ...userData.preferences!, twoFactorEnabled: true }
        });
      }

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
      if (type === 'email') {
        setEmailNotifications(!emailNotifications);
      } else {
        setAppNotifications(!appNotifications);
      }

      toast.success(`${type === 'email' ? 'Email' : 'App'} notifications updated`);
    } catch (error) {
      toast.error("Failed to update notification settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userData?.id) {
      toast.error("Unable to delete account");
      return;
    }

    const password = twoFactorPassword.trim();
    if (!password) {
      toast.error("Password required");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const result = await authClient.deleteUser({
        password: password,
        callbackURL: "/accountDeleted"
      });

      if (result.error) {
        if (result.error.message?.includes("password")) {
          toast.error("Incorrect password");
          setTwoFactorPassword("");
        } else {
          toast.error("Deletion failed", {
            description: result.error.message || "Unable to delete account."
          });
        }
        return;
      }

      toast.success("Account deleted successfully");
      setTwoFactorPassword("");
      await new Promise(resolve => setTimeout(resolve, 1000));
      await authClient.signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Account deletion error:", error);
      toast.error("Deletion failed");
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

  // Fetch web profile data
  useEffect(() => {
    if (userData?.id) {
      fetchWebProfileData();
    }
  }, [userData?.id]);

  const fetchWebProfileData = async () => {
    try {
      setIsLoading(true);
      const userProfile = profile.find(p => p.id === Number(userData?.id)) || profile[0];
      if (userProfile) {
        setProfileData({
          id: userProfile.id,
          description: userProfile.description,
          img: userProfile.img
        });
      }

      if (aboutcards && aboutcards.length > 0) {
        const mappedCards: AboutCard[] = aboutcards.map(card => ({
          id: card.id,
          title: card.title,
          subtitle: card.subtitle,
          icon: card.icon
        }));
        setAboutCardsData(mappedCards);
      }

      if (companies && companies.length > 0) {
        const mappedCompanies: Company[] = companies.map(company => ({
          id: company.id,
          name: company.name,
          logo: company.logo
        }));
        setCompaniesData(mappedCompanies);
      }

      if (educationData && educationData.length > 0) {
        const mappedEducation: Education[] = educationData.map(edu => ({
          id: edu.id,
          title: edu.title,
          subtitle: edu.subtitle,
          date: edu.date,
          description: edu.description || '',
          category: edu.category
        }));
        setEducationData(mappedEducation);
      }
    } catch (error) {
      console.error("Error fetching web profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsSubmitting(true);
      const imageUrl = await storeImageInIndexedDB(file);
      setProfileData(prev => prev ? { ...prev, img: imageUrl } : { description: '', img: imageUrl });
      toast.success("Profile image updated successfully");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProfile = async () => {
    if (!newProfile.description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate API call - replace with actual API
      const updatedProfile = {
        ...newProfile,
        id: editingProfile?.id || Date.now()
      };
      setProfileData(updatedProfile);
      setShowProfileDialog(false);
      setNewProfile({ description: '', img: '' });
      setEditingProfile(null);
      toast.success(editingProfile ? "Profile updated" : "Profile created");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAboutCard = async () => {
    if (!newAboutCard.title || !newAboutCard.subtitle) {
      toast.error("Title and subtitle are required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAboutCard) {
        // Update existing card
        setAboutCardsData(prev => prev.map(card => 
          card.id === editingAboutCard.id 
            ? { ...card, ...newAboutCard }
            : card
        ));
        toast.success("Card updated");
      } else {
        // Add new card
        const newCard: AboutCard = {
          id: Date.now(),
          title: newAboutCard.title,
          subtitle: newAboutCard.subtitle,
          icon: newAboutCard.icon || undefined
        };
        setAboutCardsData(prev => [...prev, newCard]);
        toast.success("Card added");
      }
      setShowAboutCardDialog(false);
      setNewAboutCard({ title: '', subtitle: '', icon: '' });
      setEditingAboutCard(null);
    } catch (error) {
      toast.error("Failed to save card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCompany = async () => {
    if (!newCompany.name) {
      toast.error("Company name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingCompany) {
        setCompaniesData(prev => prev.map(company => 
          company.id === editingCompany.id 
            ? { ...company, ...newCompany }
            : company
        ));
        toast.success("Company updated");
      } else {
        const newCompanyItem: Company = {
          id: Date.now(),
          name: newCompany.name,
          logo: newCompany.logo
        };
        setCompaniesData(prev => [...prev, newCompanyItem]);
        toast.success("Company added");
      }
      setShowCompanyDialog(false);
      setNewCompany({ name: '', logo: '' });
      setEditingCompany(null);
    } catch (error) {
      toast.error("Failed to save company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEducation = async () => {
    if (!newEducation.title || !newEducation.subtitle || !newEducation.date) {
      toast.error("Title, subtitle, and date are required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingEducation) {
        setEducationData(prev => prev.map(edu => 
          edu.id === editingEducation.id 
            ? { ...edu, ...newEducation }
            : edu
        ));
        toast.success("Education updated");
      } else {
        const newEducationItem: Education = {
          id: Date.now(),
          title: newEducation.title,
          subtitle: newEducation.subtitle,
          date: newEducation.date,
          description: newEducation.description,
          category: newEducation.category
        };
        setEducationData(prev => [...prev, newEducationItem]);
        toast.success("Education added");
      }
      setShowEducationDialog(false);
      setNewEducation({ title: '', subtitle: '', date: '', description: '', category: 'education' });
      setEditingEducation(null);
    } catch (error) {
      toast.error("Failed to save education");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAboutCard = async (id: number) => {
    try {
      setIsSubmitting(true);
      setAboutCardsData(prev => prev.filter(card => card.id !== id));
      toast.success("Card deleted");
    } catch (error) {
      toast.error("Failed to delete card");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCompany = async (id: number) => {
    try {
      setIsSubmitting(true);
      setCompaniesData(prev => prev.filter(company => company.id !== id));
      toast.success("Company deleted");
    } catch (error) {
      toast.error("Failed to delete company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteEducation = async (id: number) => {
    try {
      setIsSubmitting(true);
      setEducationData(prev => prev.filter(edu => edu.id !== id));
      toast.success("Education deleted");
    } catch (error) {
      toast.error("Failed to delete education");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'about') {
      deleteAboutCard(itemToDelete.id);
    } else if (itemToDelete.type === 'company') {
      deleteCompany(itemToDelete.id);
    } else if (itemToDelete.type === 'education') {
      deleteEducation(itemToDelete.id);
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const editProfile = () => {
    if (profileData) {
      setEditingProfile(profileData);
      setNewProfile({ description: profileData.description, img: profileData.img || '' });
    } else {
      setEditingProfile(null);
      setNewProfile({ description: '', img: '' });
    }
    setShowProfileDialog(true);
  };

  const editAboutCard = (card: AboutCard) => {
    setEditingAboutCard(card);
    setNewAboutCard({ title: card.title, subtitle: card.subtitle, icon: card.icon || '' });
    setShowAboutCardDialog(true);
  };

  const editCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({ name: company.name, logo: company.logo });
    setShowCompanyDialog(true);
  };

  const editEducation = (edu: Education) => {
    setEditingEducation(edu);
    setNewEducation({
      title: edu.title,
      subtitle: edu.subtitle,
      date: edu.date,
      description: edu.description || '',
      category: edu.category
    });
    setShowEducationDialog(true);
  };

  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="mx-auto px-2 py-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        </div>
        <div className="mx-auto px-2 py-2">
          <div className="space-y-6">
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Access Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to access your settings</p>
            <Button onClick={() => router.push("/auth")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#acc2ef]">
              <Settings className="h-5 w-5 text-gray-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto px-4 py-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted/50 p-1">
            <TabsTrigger value="profile" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <KeyRound className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="web-profile" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FolderCog className="h-4 w-4" />
              <span className="hidden sm:inline">Web settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                      <AvatarImage
                        src={userData.image || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name || 'user'}&backgroundColor=3b82f6`}
                        alt={userData.name}
                      />
                      <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                        {userData.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      id="imageUpload"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="imageUpload"
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-6 w-6 animate-spin text-background" />
                      ) : (
                        <Camera className="h-6 w-6 text-background" />
                      )}
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">{userData.name}</h2>
                      <Badge
                        variant="secondary"
                        className={userData.status === "Verified"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        }
                      >
                        {userData.status === "Verified" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <XCircle className="mr-1 h-3 w-3" />
                        )}
                        {userData.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Badge variant="outline" className="font-medium capitalize border border-[#acc2ef]">
                        {userData.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Member since {userData.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Full Name</Label>
                      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                        <span className="font-medium text-foreground truncate">{userData.name}</span>
                        <FieldDialog
                          title="Update Name"
                          fieldName="name"
                          currentValue={userData.name || ""}
                          onUpdate={(value) => handleFieldUpdate('name', value)}
                          userId={userData.id}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Email Address</Label>
                      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                        <span className="font-medium text-foreground truncate">{userData.email}</span>
                        <FieldDialog
                          title="Update Email"
                          fieldName="email"
                          currentValue={userData.email || ""}
                          onUpdate={(value) => handleFieldUpdate('email', value)}
                          userId={userData.id}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm font-medium">{userData.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Session Expires</p>
                      <p className="text-sm font-medium">{userData.sessionExpireAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Notifications</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive in-app notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={appNotifications}
                    onCheckedChange={() => handleNotificationToggle('app')}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#acc2ef] data-[state=unchecked]:bg-gray-300"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <MailIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Get updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={() => handleNotificationToggle('email')}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#acc2ef] data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Authentication</CardTitle>
                <CardDescription>Manage your password and two-factor authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between rounded-lg px-4 py-4 hover:bg-muted/50 transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Lock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Change</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter your current password and choose a new one</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="current">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current"
                              type={showPassword ? "text" : "password"}
                              value={passwords.current}
                              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                              placeholder="Enter current password"
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
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
                              <div className="flex gap-1">
                                {[25, 50, 75, 100].map((threshold) => (
                                  <div key={threshold} className={`h-1.5 flex-1 rounded-full transition-colors ${
                                    passwordStrength >= threshold
                                      ? passwordStrength >= 75 ? 'bg-emerald-500' : passwordStrength >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                      : 'bg-muted'
                                  }`} />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {passwordStrength >= 75 ? "Strong password" : passwordStrength >= 50 ? "Medium strength" : "Weak password"}
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
                            <p className="text-xs text-destructive">Passwords do not match</p>
                          )}
                        </div>
                        {passwordErrors.length > 0 && (
                          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <ul className="text-xs text-destructive space-y-1">
                              {passwordErrors.map((error, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <XCircle className="h-3 w-3" /> {error}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handlePasswordChange} disabled={isSubmitting}>
                          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Password"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex items-center justify-between rounded-lg px-4 py-4 hover:bg-muted/50 transition-colors -mx-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${twoFactorEnabled ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-primary/10'}`}>
                      <Shield className={`h-4 w-4 ${twoFactorEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">
                        {twoFactorEnabled ? "Currently enabled" : "Add extra security to your account"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleTwoFactorToggle}
                    disabled={isSubmitting}
                    className="data-[state=checked]:bg-[#acc2ef] data-[state=unchecked]:bg-gray-300"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Security Status</CardTitle>
                <CardDescription>Overview of your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`flex items-center gap-3 rounded-lg p-3 ${twoFactorEnabled ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                  {twoFactorEnabled ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${twoFactorEnabled ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
                      {twoFactorEnabled ? "Two-factor authentication is on" : "Enable two-factor authentication"}
                    </p>
                    <p className={`text-xs ${twoFactorEnabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                      {twoFactorEnabled ? "Your account has enhanced protection" : "Protect your account from unauthorized access"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Strong password</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">Your password meets security requirements</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Account created</p>
                    <p className="text-xs text-muted-foreground">{userData.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently remove your account and all associated data</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteAccountDialog(true)} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Active Sessions</CardTitle>
                    <CardDescription>{sessions.length} active session{sessions.length !== 1 ? 's' : ''} across your devices</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadActiveSessions} disabled={isLoadingSessions}>
                    <RefreshCw className={`h-4 w-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-2">
                    {sessions.map((sessionItem) => (
                      <div key={sessionItem.id} className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                        sessionItem.current ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted/50'
                      }`}>
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${sessionItem.current ? 'bg-primary/10' : 'bg-muted'}`}>
                            <Monitor className={`h-5 w-5 ${sessionItem.current ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{sessionItem.browser}</p>
                              <span>·</span>
                              <p className="text-sm text-muted-foreground">{sessionItem.os}</p>
                              {sessionItem.current && <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">This device</Badge>}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                              <span>{sessionItem.ip}</span>
                              <span>·</span>
                              <span>Active {sessionItem.lastActive.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        {!sessionItem.current && (
                          <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(sessionItem.id)} disabled={isSubmitting} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Monitor className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No active sessions found</p>
                  </div>
                )}
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-4 mt-4">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Security tip</p>
                    <p className="text-xs text-muted-foreground mt-0.5">If you see any unfamiliar sessions, revoke them immediately to protect your account.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web Profile Tab */}
          <TabsContent value="web-profile" className="space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Profile</CardTitle>
                    <CardDescription>Your professional bio and profile image</CardDescription>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-gray-600 bg-transparent border border-[#acc2ef] rounded-full hover:border-blue-500 hover:animate-pulse hover:opacity-95"
                    onClick={editProfile}
                    disabled={isSubmitting}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/20">
                      <AvatarImage src={profileData?.img || userData.image || `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name || 'user'}`} alt={userData.name} />
                      <AvatarFallback className="text-xl font-semibold bg-primary text-primary-foreground">
                        {userData.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <input type="file" id="profileImageUpload" className="hidden" onChange={handleProfileImageUpload} accept="image/*" disabled={isSubmitting} />
                    <label htmlFor="profileImageUpload" className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin text-background" /> : <Camera className="h-5 w-5 text-background" />}
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{userData.name}</p>
                    <p className="text-sm text-muted-foreground">{userData.email}</p>
                    <Badge variant="outline" className="mt-1 capitalize border-[#acc2ef]">{userData.role}</Badge>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {profileData?.description || "No bio added yet. Click edit to add your professional introduction."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* About Cards Section */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">About Cards</CardTitle>
                    <CardDescription>Key metrics and achievements displayed on your profile</CardDescription>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-gray-600 bg-transparent border border-[#acc2ef] rounded-full hover:border-blue-500 hover:animate-pulse hover:opacity-95"
                    onClick={() => setShowAboutCardDialog(true)}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {aboutCardsData && aboutCardsData.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {aboutCardsData.map((card) => (
                      <div key={card.id} className="relative rounded-lg border p-4 hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                              {card.icon ? (
                                <LottieAnimation iconUrl={card.icon} className="h-6 w-6" />
                              ) : (
                                <Award className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">{card.title}</h4>
                              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" onClick={() => editAboutCard(card)} className="h-8 w-8 p-0">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              setItemToDelete({ type: 'about', id: card.id, name: card.title });
                              setDeleteDialogOpen(true);
                            }} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Award className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No about cards added yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add cards to showcase your experience, projects, and support</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Companies Section */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Companies</CardTitle>
                    <CardDescription>Organizations you've worked with or partnered</CardDescription>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-gray-600 bg-transparent border border-[#acc2ef] rounded-full hover:border-blue-500 hover:animate-pulse hover:opacity-95"
                    onClick={() => setShowCompanyDialog(true)}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {companiesData && companiesData.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {companiesData.map((company) => (
                      <div key={company.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors group">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                          ) : (
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{company.name}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => editCompany(company)} className="h-8 w-8 p-0">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setItemToDelete({ type: 'company', id: company.id, name: company.name });
                            setDeleteDialogOpen(true);
                          }} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No companies added yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add organizations you've collaborated with</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education Section */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Education</CardTitle>
                    <CardDescription>Your academic background and certifications</CardDescription>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-gray-600 bg-transparent border border-[#acc2ef] rounded-full hover:border-blue-500 hover:animate-pulse hover:opacity-95"
                    onClick={() => setShowEducationDialog(true)}
                    disabled={isSubmitting}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {educationdata && educationdata.length > 0 ? (
                  <div className="space-y-4">
                    {educationdata.map((edu) => (
                      <div key={edu.id} className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors group">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{edu.title}</h4>
                            <Badge variant="secondary" className="text-xs capitalize">{edu.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{edu.subtitle}</p>
                          <p className="text-xs text-muted-foreground mt-1">{edu.date}</p>
                          {edu.description && <p className="text-xs text-muted-foreground mt-2">{edu.description}</p>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => editEducation(edu)} className="h-8 w-8 p-0">
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setItemToDelete({ type: 'education', id: edu.id, name: edu.title });
                            setDeleteDialogOpen(true);
                          }} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <GraduationCap className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No education added yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add your academic background and certifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

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
        <DialogContent className="sm:max-w-md">
          {!showQRCode ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {twoFactorDialogAction === 'enable' ? 'Enable Two-Factor Authentication' : 'Disable Two-Factor Authentication'}
                </DialogTitle>
                <DialogDescription>
                  {twoFactorDialogAction === 'enable' ? 'Enter your password to continue' : 'Confirm your password to disable 2FA'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="two-factor-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="two-factor-password"
                      value={twoFactorPassword}
                      onChange={(e) => setTwoFactorPassword(e.target.value)}
                      placeholder="•••••••••••"
                      type={showPassword ? "text" : "password"}
                      onKeyDown={(e) => { if (e.key === 'Enter' && twoFactorPassword.trim()) handleTwoFactorWithPassword(); }}
                      autoFocus
                      className="pr-10"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 hover:opacity-70 transition-opacity">
                      {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
                    </button>
                  </div>
                </div>
                {twoFactorDialogAction === 'enable' && (
                  <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                    <Shield className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">You'll need an authenticator app like Google Authenticator or Authy to complete setup.</p>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTwoFactorDialog(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleTwoFactorWithPassword} disabled={isSubmitting || !twoFactorPassword.trim()} variant={twoFactorDialogAction === 'disable' ? 'destructive' : 'default'}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {twoFactorDialogAction === 'enable' ? 'Verifying...' : 'Disabling...'}</> : twoFactorDialogAction === 'enable' ? 'Continue' : 'Disable 2FA'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Scan QR Code</DialogTitle>
                <DialogDescription>Use your authenticator app to scan this code</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="flex justify-center">
                  {qrData?.totpURI && (
                    <div className="rounded-lg border bg-background p-4">
                      <QRCode value={qrData.totpURI} size={180} />
                    </div>
                  )}
                </div>
                {qrData?.secret && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-medium text-center">Can't scan? Enter manually</summary>
                    <div className="mt-3 flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted p-2.5 text-xs font-mono break-all">{qrData.secret}</code>
                      <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(qrData.secret); toast.success("Copied!"); }}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </details>
                )}
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Enter the 6-digit code</Label>
                  <Input id="verification-code" type="text" placeholder="000000" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="text-center text-xl font-mono tracking-[0.5em]" autoFocus />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label className="text-sm font-medium">Trust this device</Label>
                    <p className="text-xs text-muted-foreground">Skip 2FA for 30 days</p>
                  </div>
                  <Switch checked={trustDevice} onCheckedChange={setTrustDevice} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setShowQRCode(false); setQrData(null); setVerificationCode(''); }}>Back</Button>
                <Button onClick={handleVerifyTwoFactor} disabled={isSubmitting || verificationCode.length !== 6}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : "Enable 2FA"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Account Alert Dialog */}
      <AlertDialog open={showDeleteAccountDialog} onOpenChange={(open) => {
        if (!isSubmitting) setShowDeleteAccountDialog(open);
        if (!open) setTwoFactorPassword('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delete-account-password">Password</Label>
              <Input id="delete-account-password" type="password" value={twoFactorPassword} onChange={(e) => setTwoFactorPassword(e.target.value)} placeholder="Enter your password to confirm" onKeyDown={(e) => { if (e.key === 'Enter' && twoFactorPassword.trim() && !isSubmitting) handleDeleteAccount(); }} autoFocus disabled={isSubmitting} />
              <p className="text-xs text-muted-foreground">Please enter your password to confirm account deletion</p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={isSubmitting || !twoFactorPassword.trim()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive">
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Web Profile Modals */}
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        profile={newProfile}
        onSave={updateProfile}
        isSubmitting={isSubmitting}
        editingProfile={editingProfile}
      />

      <AboutCardDialog
        open={showAboutCardDialog}
        onOpenChange={setShowAboutCardDialog}
        card={newAboutCard}
        onSave={addAboutCard}
        isSubmitting={isSubmitting}
        editingCard={editingAboutCard}
      />

      <CompanyDialog
        open={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        company={newCompany}
        onSave={addCompany}
        isSubmitting={isSubmitting}
        editingCompany={editingCompany}
      />

      <EducationDialog
        open={showEducationDialog}
        onOpenChange={setShowEducationDialog}
        education={newEducation}
        onSave={addEducation}
        isSubmitting={isSubmitting}
        editingEducation={editingEducation}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        description={`Are you sure you want to delete ${itemToDelete?.name ? `"${itemToDelete.name}"` : 'this item'}? This action cannot be undone.`}
        isDeleting={isSubmitting}
      />
    </div>
  );
};

export default UserManagement;