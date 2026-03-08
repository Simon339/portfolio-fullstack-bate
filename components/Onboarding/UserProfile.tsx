/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Users, Plus, Search, MoreVertical, Shield, Trash2, Edit2, Mail, X, Check, Loader2, Link, Copy, CheckCheck, DoorOpen, LogOut, Filter, Eye, UserPlus, Calendar, Clock, Crown, Key, ImageIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authClient, signOut } from "@/hooks/getcurrectuser";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import AllUsersList from "./AllUsersList";
import { Separator } from "@/components/ui/separator";
import { deleteOrganization } from "@/server/actions/authactions";

// Types
type Organization = {
  id: string;
  name: string;
  slug: string;
  memberCount: number;
  logo?: string;
  metadata?: Record<string, any>;
  isActive?: boolean;
  members?: Member[];
  userId?: string;
  keepCurrentActiveOrganization?: boolean;
}

type Member = {
  id: string;
  name: string;
  email: string;
  role: "member" | "admin" | "owner";
  avatar?: string;
  userId?: string;
  status?: 'active' | 'pending' | 'invited';
  createdAt?: string;
}

type Invitation = {
  id: string;
  email: string;
  role: "member" | "admin" | "owner";
  status: string;
  createdAt: string;
  invitedBy?: string;
  expiresAt?: string;
  organizationId?: string;
  inviterId?: string;
}

type UserOrgRole = {
  organizationId: string;
  role: "member" | "admin" | "owner";
}

type FormData = {
  name: string;
  email: string;
  image: string;
}

// Form Schemas
const createOrganizationSchema = z.object({
  name: z.string()
    .min(1, "Organization name is required")
    .min(3, "Organization name must be at least 3 characters")
    .max(50, "Organization name must be less than 50 characters"),
  slug: z.string()
    .min(1, "Slug is required")
    .min(3, "Slug must be at least 3 characters")
    .max(30, "Slug must be less than 30 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  keepCurrentActiveOrganization: z.boolean().default(false),
  logo: z.string().url().optional().or(z.literal(''))
});

const inviteMemberSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["member", "admin", "owner"]),
  organizationId: z.string().min(1, "Please select an organization")
});

type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;
type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

// Delete Dialog Component
interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading: boolean;
  type?: "organization" | "member" | "invitation";
  entityName?: string;
}

const DeleteDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading,
  type = "organization",
  entityName = ""
}: DeleteDialogProps) => {
  const getIcon = () => {
    switch (type) {
      case "organization": return <Building2 className="w-5 h-5" />;
      case "member": return <Users className="w-5 h-5" />;
      case "invitation": return <Mail className="w-5 h-5" />;
      default: return <Trash2 className="w-5 h-5" />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case "organization": return "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800";
      case "member": return "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800";
      case "invitation": return "bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700";
      default: return "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900 flex items-center gap-2">
            <div className="p-2 rounded-full bg-red-50">
              {getIcon()}
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-slate-600 pt-2">
            {description}
          </DialogDescription>
          {entityName && (
            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-md">
              <p className="text-sm font-medium text-red-800">
                {type === "organization" ? "Organization:" : type === "member" ? "Member:" : "Invitation:"}
              </p>
              <p className="text-sm text-red-700 mt-1">{entityName}</p>
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className={getConfirmButtonColor()}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UserProfile = () => {
  const {
    data: session,
    isPending: sessionLoading,
    error: sessionError,
    refetch: refetchSession
  } = authClient.useSession();

  const [activeTab, setActiveTab] = useState("organizations")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [isSettingActive, setIsSettingActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [isGeneratingSlug, setIsGeneratingSlug] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [showLeaveOrgDialog, setShowLeaveOrgDialog] = useState(false);
  const [orgToLeave, setOrgToLeave] = useState<Organization | null>(null);
  const router = useRouter();

  // Delete dialogs state
  const [showDeleteOrgDialog, setShowDeleteOrgDialog] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [showDeleteMemberDialog, setShowDeleteMemberDialog] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [showDeleteInvitationDialog, setShowDeleteInvitationDialog] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<Invitation | null>(null);

  // Edit dialog state
  const [showEditOrgDialog, setShowEditOrgDialog] = useState(false);
  const [orgToEdit, setOrgToEdit] = useState<Organization | null>(null);

  // In the UserProfile component, add state for image uploading
const [isUploadingImage, setIsUploadingImage] = useState(false);
const [imagePreview, setImagePreview] = useState<string | null>(null);


// Or use a simpler approach - just store base64
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Check file type
  if (!file.type.startsWith('image/')) {
    toast.error('Please select an image file');
    return;
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image size should be less than 5MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64String = event.target?.result as string;

    // Set the logo in forms
    createOrganizationForm.setValue('logo', base64String);
    editOrganizationForm.setValue('logo', base64String);
    setImagePreview(base64String);
    
    toast.success('Image selected');
  };
  reader.readAsDataURL(file);
};

// Remove image function
const handleRemoveImage = () => {
  createOrganizationForm.setValue('logo', '');
  editOrganizationForm.setValue('logo', '');
  setImagePreview(null);
};

  // Create org form
  const createOrganizationForm = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      keepCurrentActiveOrganization: false
    }
  });

  // Edit org form
  const editOrganizationForm = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      logo: "",
      keepCurrentActiveOrganization: false
    }
  });

  // Watch name to auto-generate slug
  const orgName = createOrganizationForm.watch("name");
  const editOrgName = editOrganizationForm.watch("name");

  // Invite form
  const inviteMemberForm = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
      organizationId: ""
    }
  });

  // User form state
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    image: ""
  });

  // State for data
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [userOrgRoles, setUserOrgRoles] = useState<UserOrgRole[]>([]);
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState<InviteMemberFormValues | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Derive user from session
  const user = useMemo(() => {
    if (!session?.user) return null;

    const [firstName, ...lastNameParts] = (session.user.name || "").split(" ");
    const lastName = lastNameParts.join(" ");

    return {
      id: session.user.id,
      name: session.user.name || "",
      firstName: firstName || "",
      lastName: lastName || "",
      email: session.user.email || "",
      image: session.user.image || "",
      status: session.user.emailVerified ? "VERIFIED" : "PENDING",
      createdAt: session.user.createdAt ? new Date(session.user.createdAt) : new Date(),
      emailVerified: session.user.emailVerified || false,
    };
  }, [session?.user]);

  // Get user's role in selected organization
  const getUserRoleInOrg = (orgId: string): "member" | "admin" | "owner" | null => {
    const userRole = userOrgRoles.find(role => role.organizationId === orgId);
    return userRole?.role || null;
  };

  // Check if user is owner/admin of selected organization
  const isOwner = selectedOrg ? getUserRoleInOrg(selectedOrg.id) === "owner" : false;
  const isAdmin = selectedOrg ? getUserRoleInOrg(selectedOrg.id) === "admin" : false;
  const canInvite = isOwner || isAdmin;
  const canManage = isOwner;

  // Auto-generate slug from organization name
  const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
};

  // Effect to auto-generate slug when name changes
useEffect(() => {
  if (orgName && !isGeneratingSlug) {
    setIsGeneratingSlug(true);
    const generatedSlug = generateSlug(orgName);
    createOrganizationForm.setValue("slug", generatedSlug);
    setTimeout(() => setIsGeneratingSlug(false), 100);
  }
}, [orgName]);

// For editing existing organization
useEffect(() => {
  if (editOrgName && orgToEdit && !isGeneratingSlug) {
    setIsGeneratingSlug(true);
    const generatedSlug = generateSlug(editOrgName);
    editOrganizationForm.setValue("slug", generatedSlug);
    setTimeout(() => setIsGeneratingSlug(false), 100);
  }
}, [editOrgName]);

  // Copy slug to clipboard
  const copySlugToClipboard = () => {
    const slug = createOrganizationForm.getValues("slug");
    navigator.clipboard.writeText(slug).then(() => {
      setCopiedSlug(slug);
      toast.success("Slug copied to clipboard");
      setTimeout(() => setCopiedSlug(null), 2000);
    }).catch(() => {
      toast.error("Failed to copy slug");
    });
  };

  const copyEditSlugToClipboard = () => {
    const slug = editOrganizationForm.getValues("slug");
    navigator.clipboard.writeText(slug).then(() => {
      setCopiedSlug(slug);
      toast.success("Slug copied to clipboard");
      setTimeout(() => setCopiedSlug(null), 2000);
    }).catch(() => {
      toast.error("Failed to copy slug");
    });
  };

  // Generate random slug
  const generateRandomSlug = () => {
    const randomString = Math.random().toString(36).substring(2, 8);
    const name = createOrganizationForm.getValues("name") || "organization";
    const baseSlug = generateSlug(name);
    const randomSlug = `${baseSlug}-${randomString}`.substring(0, 30);
    createOrganizationForm.setValue("slug", randomSlug);
  };

  const generateRandomEditSlug = () => {
    const randomString = Math.random().toString(36).substring(2, 8);
    const name = editOrganizationForm.getValues("name") || "organization";
    const baseSlug = generateSlug(name);
    const randomSlug = `${baseSlug}-${randomString}`.substring(0, 30);
    editOrganizationForm.setValue("slug", randomSlug);
  };

  // Main initialization effect
  useEffect(() => {
    if (sessionLoading) return;

    if (!session) {
      router.push("/auth");
      return;
    }

    if (user && isInitialLoad) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        image: user.image || "",
      })
      loadUserOrganizations()
      setIsInitialLoad(false);
    }
  }, [session, sessionLoading, user, router, isInitialLoad])

  // Cleanup loading state on unmount
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, []);

  const loadUserOrganizations = useCallback(async () => {
    setLoadingOrgs(true);
    try {
      const { data, error } = await authClient.organization.list();
      if (error) throw error;

      const orgsArray = Array.isArray(data) ? data : (data?.data || data?.organizations || []);
      const mapped = orgsArray.map((org: any) => ({
        id: org.id || org.organizationId || org.organization?.id,
        name: org.name || org.organization?.name || 'Unnamed',
        slug: org.slug || org.organization?.slug || '',
        logo: org.logo || org.organization?.logo || '',
        isActive: org.keepCurrentActiveOrganization || false,
        userId: org.userId,
        keepCurrentActiveOrganization: org.keepCurrentActiveOrganization
      }));

      setOrganizations(mapped);
      if (mapped.length > 0 && !selectedOrg) {
        const initialOrg = mapped.find((o: any) => o.isActive) || mapped[0];
        setSelectedOrg(initialOrg);
        inviteMemberForm.setValue("organizationId", initialOrg.id);
        await loadOrganizationDetails(initialOrg.id);
      }
    } catch (error: any) {
      console.error("Error loading organizations:", error);
      toast.error("Failed to load organizations");
    } finally {
      setLoadingOrgs(false);
    }
  }, [selectedOrg, inviteMemberForm]);

  const loadOrganizationDetails = async (orgId: string) => {
    if (!orgId) return;

    try {
      await loadMembers(orgId);
      await loadOrganizationInvitations(orgId);
    } catch (error) {
      console.error("Error loading organization details:", error);
    }
  };

  const loadMembers = async (orgId: string) => {
    if (!orgId) {
      setMembers([]);
      return;
    }

    try {
      setLoadingMembers(true);
      const { data, error } = await authClient.organization.listMembers({
        query: {
          organizationId: orgId,
          limit: 100,
          offset: 0,
          sortBy: "createdAt",
          sortDirection: "desc",
        },
      });

      if (error) throw error;

      let membersArray: any[] = [];

      if (data) {
        if (Array.isArray(data)) {
          membersArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          membersArray = data.data;
        } else if (data.members && Array.isArray(data.members)) {
          membersArray = data.members;
        } else if (typeof data === 'object') {
          membersArray = [data];
        }

        const membersData: Member[] = membersArray
          .filter(member => member && (member.id || member.userId || member.email))
          .map((member: any) => ({
            id: member.id || member.memberId || member.userId || '',
            name: member.user?.name || member.name || member.email || 'Unknown User',
            email: member.email || member.user?.email || 'No email',
            role: (member.role || 'member') as "member" | "admin" | "owner",
            avatar: member.user?.image || member.avatar,
            userId: member.userId || member.user?.id,
            status: member.status || 'active',
            createdAt: member.createdAt
          }));

        setMembers(membersData);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      console.error("Error loading members:", error);
      toast.error(error.message || "Failed to load members");
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadOrganizationInvitations = async (organizationId: string) => {
    if (!organizationId) {
      setInvitations([]);
      return;
    }

    setLoadingInvitations(true);
    try {
      const { data, error } = await authClient.organization.listInvitations({
        query: {
          organizationId: organizationId,
        },
      });

      if (error) throw error;

      let invitationsArray: any[] = [];

      if (data) {
        if (Array.isArray(data)) {
          invitationsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          invitationsArray = data.data;
        } else if (data.invitations && Array.isArray(data.invitations)) {
          invitationsArray = data.invitations;
        } else if (typeof data === 'object') {
          invitationsArray = [data];
        }

        const invitationsData: Invitation[] = invitationsArray
          .filter(inv => inv && inv.id)
          .map((inv: any) => ({
            id: inv.id || '',
            email: inv.email || '',
            role: (inv.role || 'member') as "member" | "admin" | "owner",
            status: inv.status || 'pending',
            createdAt: inv.createdAt || new Date().toISOString(),
            expiresAt: inv.expiresAt,
            organizationId: inv.organizationId,
            inviterId: inv.inviterId,
            invitedBy: inv.invitedBy?.name || inv.invitedByName
          }));

        setInvitations(invitationsData);
      } else {
        setInvitations([]);
      }
    } catch (error: any) {
      console.error("Error loading invitations:", error);
      toast.error(error.message || "Failed to load invitations");
      setInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  }

  const handleSwitchOrganization = async (org: Organization) => {
    setSelectedOrg(org);
    setInviteData(prev => ({ ...prev, organizationId: org.id }));
    inviteMemberForm.setValue("organizationId", org.id);
    await loadOrganizationDetails(org.id);
    toast.success(`Now viewing ${org.name}`);
  }

  // Update onCreateOrganizationSubmit to include image
const onCreateOrganizationSubmit = async (data: CreateOrganizationFormValues) => {
  try {
    setIsLoading(true);

    const { data: result, error } = await authClient.organization.create({
      name: data.name,
      slug: data.slug,
      logo: data.logo,
      keepCurrentActiveOrganization: data.keepCurrentActiveOrganization,
    });

    if (error) throw error;

    if (result) {
      toast.success(`${data.name} has been created successfully.`);
      createOrganizationForm.reset();
      setImagePreview(null); // Clear preview
      setIsCreating(false);
      await loadUserOrganizations();
    }
  } catch (error: any) {
    const errorMsg = error.message || "Failed to create organization. Please try again.";

    if (error.message?.includes("slug") || error.message?.includes("already exists")) {
      toast.error("This slug is already taken. Please try a different one.");
      createOrganizationForm.setError("slug", {
        type: "manual",
        message: "This slug is already taken"
      });
    } else {
      toast.error(errorMsg);
    }
  } finally {
    setIsLoading(false);
  }
}

// Update onEditOrganizationSubmit to include image
const onEditOrganizationSubmit = async (data: CreateOrganizationFormValues) => {
  if (!orgToEdit) return;

  try {
    setIsLoading(true);
    const { data: result, error } = await authClient.organization.update({
      data: {
        name: data.name,
        slug: data.slug,
        logo: data.logo, 
        metadata: orgToEdit.metadata,
      },
      organizationId: orgToEdit.id,
    });

    if (error) throw error;

    if (result) {
      setOrganizations(organizations.map(org =>
        org.id === orgToEdit.id ? { 
          ...org, 
          name: data.name, 
          slug: data.slug,
          logo: data.logo,
        } : org
      ));

      // Update selectedOrg if it's the one being edited
      if (selectedOrg?.id === orgToEdit.id) {
        setSelectedOrg(prev => prev ? { 
          ...prev, 
          name: data.name, 
          slug: data.slug,
          logo: data.logo, 
        } : null);
      }

      toast.success("Organization updated successfully");
      setShowEditOrgDialog(false);
      setOrgToEdit(null);
      setImagePreview(null); // Clear preview
      editOrganizationForm.reset();
    }
  } catch (error: any) {
    const errorMsg = error.message || "Failed to update organization. Please try again.";

    if (error.message?.includes("slug") || error.message?.includes("already exists")) {
      toast.error("This slug is already taken. Please try a different one.");
      editOrganizationForm.setError("slug", {
        type: "manual",
        message: "This slug is already taken"
      });
    } else {
      toast.error(errorMsg);
    }
  } finally {
    setIsLoading(false);
  }
}

  const handleLeaveOrganization = async (orgId: string) => {
    if (!orgId) return;

    setIsLoading(true);
    try {
      const { data, error } = await authClient.organization.leave({
        organizationId: orgId,
      });

      if (error) throw error;

      if (data) {
        toast.success(`You have left ${orgToLeave?.name || 'the organization'}.`);
        setShowLeaveOrgDialog(false);
        setOrgToLeave(null);
        await loadUserOrganizations();

        if (selectedOrg?.id === orgId) {
          setSelectedOrg(null);
          setMembers([]);
          setInvitations([]);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to leave organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleSetActiveOrganization = async (orgId: string) => {
    try {
      setIsSettingActive(true);
      const { data, error } = await authClient.organization.setActive({
        organizationId: orgId,
      });

      if (error) throw error;

      if (data) {
        setOrganizations(organizations.map(org => ({
          ...org,
          isActive: org.id === orgId
        })));
        const selected = organizations.find(org => org.id === orgId);
        if (selected) {
          setSelectedOrg(selected);
          setInviteData(prev => ({ ...prev, organizationId: orgId }));
          inviteMemberForm.setValue("organizationId", orgId);
          await loadOrganizationDetails(orgId);
        }
        toast.success("Organization set as active");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to set active organization");
    } finally {
      setIsSettingActive(false);
    }
  };

  // Update handleUpdateOrganization to set image preview
const handleUpdateOrganization = async (org: Organization) => {
  setOrgToEdit(org);
  editOrganizationForm.reset({
    name: org.name,
    slug: org.slug,
    logo: org.logo || '',
    keepCurrentActiveOrganization: false
  });
  setImagePreview(org.logo || null);
  setShowEditOrgDialog(true);
};

  const handleDeleteOrganization = async (id: string) => {
  try {
    setIsLoading(true);
    const orgName = organizations.find(o => o.id === id)?.name;

    // Use server action
    const result = await deleteOrganization(id);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete organization');
    }

    // Update local state
    setOrganizations(organizations.filter(org => org.id !== id));
    toast.success(`Organization "${orgName}" deleted successfully`);

    // Handle selected org cleanup
    if (selectedOrg?.id === id) {
      const newSelected = organizations.find(org => org.id !== id);
      if (newSelected) {
        setSelectedOrg(newSelected);
        inviteMemberForm.setValue("organizationId", newSelected.id);
        await loadOrganizationDetails(newSelected.id);
      } else {
        setSelectedOrg(null);
        setMembers([]);
        setInvitations([]);
      }
    }
  } catch (error: any) {
    toast.error(error.message || "Failed to delete organization");
  } finally {
    setIsLoading(false);
    setShowDeleteOrgDialog(false);
    setOrgToDelete(null);
  }
};

  const onInviteMemberSubmit = async (data: InviteMemberFormValues) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await authClient.organization.inviteMember({
        email: data.email,
        role: data.role,
        organizationId: data.organizationId,
        resend: true,
      });
      if (error) throw error;
      toast.success("Invitation sent");
      setIsInviting(false);
      inviteMemberForm.reset({ ...data, email: "" });
      if (selectedOrg) loadOrganizationInvitations(selectedOrg.id);
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { data, error } = await authClient.organization.cancelInvitation({
        invitationId: invitationId,
      });

      if (error) throw error;

      if (data) {
        setInvitations(invitations.filter(inv => inv.id !== invitationId));
        toast.success("Invitation cancelled");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel invitation");
    } finally {
      setShowDeleteInvitationDialog(false);
      setInvitationToDelete(null);
    }
  };

  const handleRemoveMember = async (memberIdOrEmail: string) => {
    try {
      const { data, error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberIdOrEmail,
        organizationId: selectedOrg?.id || "",
      });

      if (error) throw error;

      if (data) {
        const memberName = members.find(m => m.id === memberIdOrEmail || m.email === memberIdOrEmail)?.name;
        setMembers(members.filter(member =>
          member.id !== memberIdOrEmail && member.email !== memberIdOrEmail
        ));
        toast.success(`Member "${memberName}" removed successfully`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    } finally {
      setShowDeleteMemberDialog(false);
      setMemberToDelete(null);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { data, error } = await authClient.organization.updateMemberRole({
        role: [newRole], // Correct: role is an array
        memberId: memberId,
        organizationId: selectedOrg?.id || "",
      });

      if (error) throw error;

      if (data) {
        setMembers(members.map(m =>
          m.id === memberId ? { ...m, role: newRole as "member" | "admin" | "owner" } : m
        ));
        toast.success("Member role updated successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update member role");
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      setTimeout(() => {
        toast.success("Logged out successfully");
        window.location.href = "/auth";
        setIsLoggingOut(false);
      }, 1000);
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "organizations": return "Search organizations by name or slug...";
      case "members": return "Search members by name, email, or role...";
      case "invitations": return "Search invitations by email or role...";
      default: return `Search ${activeTab}...`;
    }
  };

  // Filter data based on search query
  const filteredOrgs = organizations.filter(org =>
    org && org.name && org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug && org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMembers = members.filter(member =>
    member && (
      (member.name && member.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (member.role && member.role.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  ).filter(member => {
    if (roleFilter === "all") return true;
    return member.role === roleFilter;
  }).filter(member => {
    if (statusFilter === "all") return true;
    return member.status === statusFilter;
  })

  const filteredInvitations = invitations.filter(inv =>
    inv && (
      (inv.email && inv.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.role && inv.role.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  )

  // Helper functions for UI
  const getRoleBadge = (role: string) => {
    const variants = {
      owner: "bg-purple-50 text-purple-700 border-purple-200",
      admin: "bg-blue-50 text-blue-700 border-blue-200",
      member: "bg-slate-50 text-slate-700 border-slate-200"
    };

    return (
      <Badge
        variant="outline"
        className={`text-xs px-2 py-0.5 ${variants[role as keyof typeof variants] || variants.member}`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };


  const getInvitationStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
      expired: "bg-red-50 text-red-700 border-red-200",
      cancelled: "bg-slate-50 text-slate-700 border-slate-200"
    };

    return (
      <Badge
        variant="outline"
        className={`text-xs px-2 py-0.5 ${variants[status as keyof typeof variants] || variants.pending}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Handle session loading and errors
  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto bg-white border-slate-200 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-slate-900" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse rounded-full"></div>
            </div>
            <span className="mt-6 text-slate-700 font-medium">Loading your profile...</span>
            <p className="text-sm text-slate-500 mt-2 text-center">Preparing your dashboard</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto bg-white border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-slate-900">Session Error</CardTitle>
            <CardDescription className="text-slate-600">
              {sessionError.message || "Failed to load session"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 p-6">
              <Button onClick={() => refetchSession()} variant="default" className="w-full bg-slate-900 hover:bg-slate-800">
                Retry Loading
              </Button>
              <Button onClick={() => router.push("/auth")} variant="outline" className="w-full border-slate-200">
                Return to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto bg-white border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-slate-900">User Profile</CardTitle>
            <CardDescription className="text-slate-600">
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 p-6">
              <Avatar className="h-20 w-20 mb-4 border-4 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-300 text-slate-700 text-2xl">
                  ?
                </AvatarFallback>
              </Avatar>
              <Button
                onClick={() => router.push("/auth")}
                className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-sm"
              >
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex flex-col h-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header with User Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Organization Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Manage organizations, members, and invitations in one place
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-slate-100 group-hover:ring-slate-200 transition-all">
                    <AvatarImage src={user?.image || `https://api.dicebear.com/6.x/initials/svg?seed=${user?.email}`} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-300 text-slate-700 font-medium">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name || "User"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {user?.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">{user?.email || ""}</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-white border-slate-200 shadow-xl rounded-lg">
                <div className="flex items-center gap-3 p-4">
                  <Avatar className="h-11 w-11 ring-2 ring-slate-100">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-300 text-slate-700">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || ""}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge
                        variant="outline"
                        className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {user?.emailVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-slate-100" />

                {/* Organization Selector */}
                {organizations.length > 0 && selectedOrg && (
                  <div className="px-3 py-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="organization-select" className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Active Organization
                      </Label>
                      <Select
                        value={selectedOrg.id}
                        onValueChange={(value) => handleSetActiveOrganization(value)}
                        disabled={isSettingActive}
                      >
                        <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200 shadow-lg">
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id} className="text-xs">
                              <div className="flex items-center justify-between w-full">
                                <span className="truncate">{org.name}</span>
                                {org.isActive && (
                                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 ml-2">
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {isSettingActive && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Setting active...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <DropdownMenuSeparator className="bg-slate-100" />

                {/* Leave Organization Option */}
                {organizations.length > 0 && selectedOrg && (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setOrgToLeave(selectedOrg);
                        setShowLeaveOrgDialog(true);
                      }}
                      className="gap-2 cursor-pointer text-sm text-amber-600 hover:bg-amber-50 focus:text-amber-600"
                    >
                      <DoorOpen className="w-4 h-4" />
                      Leave Organization
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100" />
                  </>
                )}

                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="gap-2 cursor-pointer text-sm text-red-600 hover:bg-red-50 focus:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white border-slate-200 hover:border-slate-300 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Organizations</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{organizations.length}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:border-slate-300 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Members</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {members.length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-emerald-50">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 hover:border-slate-300 transition-all duration-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending Invites</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {invitations.filter(inv => inv.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-amber-50">
                  <Mail className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Search */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
            <TabsList className="bg-white p-1 w-full sm:w-auto border border-slate-200 shadow-sm">
              <TabsTrigger
                value="organizations"
                className="gap-2 flex-1 sm:flex-none data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
              >
                <Building2 className="w-4 h-4" />
                <span className="text-sm">Organizations</span>
                {organizations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {organizations.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className="gap-2 flex-1 sm:flex-none data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Members</span>
                {members.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {members.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="invitations"
                className="gap-2 flex-1 sm:flex-none data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">Invitations</span>
                {invitations.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {invitations.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Create Organization Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button
                  className="gap-2 w-full sm:w-auto bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white shadow-sm hover:shadow transition-all"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Organization</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white border-slate-200">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Create New Organization
                  </DialogTitle>
                  <DialogDescription className="text-slate-800">
                    Create a new organization to manage your team and projects.
                  </DialogDescription>
                </DialogHeader>

                <Form {...createOrganizationForm}>
                  <form onSubmit={createOrganizationForm.handleSubmit(onCreateOrganizationSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={createOrganizationForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Organization Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter organization name"
                              {...field}
                              className="bg-white text-slate-900 border-slate-200 focus:ring-slate-900"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={createOrganizationForm.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Organization Slug *</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  placeholder="organization-slug"
                                  {...field}
                                  className="pr-10 bg-white text-slate-900 border-slate-200 focus:ring-slate-900"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                  {isGeneratingSlug && (
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-slate-100 text-slate-900"
                                    onClick={copySlugToClipboard}
                                    title="Copy to clipboard"
                                  >
                                    {copiedSlug === field.value ? (
                                      <CheckCheck className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                      <Copy className="h-4 w-4 text-slate-500" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generateRandomSlug}
                                className="whitespace-nowrap  border-slate-200 hover:bg-slate-100"
                              >
                                Randomize
                              </Button>
                            </div>
                          </FormControl>
                          <div className="text-xs text-slate-800 mt-1">
                            Slug will be auto-generated from the name. Must contain only lowercase letters, numbers, and hyphens.
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
  control={createOrganizationForm.control}
  name="logo"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-slate-700">Organization Image</FormLabel>
      <FormControl>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 rounded-lg object-cover border border-slate-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-500 mb-2">Upload organization image</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors"
              >
                <Upload className="h-4 w-4" />
                {isUploadingImage ? 'Uploading...' : 'Select Image'}
              </Label>
              <p className="text-xs text-slate-400 mt-2">JPG, PNG, GIF up to 5MB</p>
            </div>
          )}
          <Input
            type="hidden"
            {...field}
            value={field.value || ''}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

                    <FormField
                      control={createOrganizationForm.control}
                      name="keepCurrentActiveOrganization"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-slate-700 cursor-pointer">
                            Keep current organization active
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <DialogFooter className="pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-200 text-slate-700 hover:bg-slate-100"
                        onClick={() => {
                          setIsCreating(false);
                          createOrganizationForm.reset();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700"
                        disabled={isLoading || !createOrganizationForm.formState.isValid}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : "Create Organization"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search and Filters Bar */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder={getPlaceholder()}
                  className="pl-10 bg-white border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </Button>
                )}
              </div>

              {/* Additional filters for members tab */}
              {activeTab === "members" && (
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32 bg-white border-slate-200">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32 bg-white border-slate-200">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="invited">Invited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="mt-0 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrgs.map((org) => (
                <Card
                  key={org.id}
                  className={`bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 ${org.isActive ? 'ring-1 ring-emerald-500' : ''
                    }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg truncate text-slate-900 flex items-center gap-2">
                        <Avatar className="h-10 w-10 ring-1 ring-[#acc2ef]">
                          <AvatarImage
                            src={org.logo || `https://api.dicebear.com/6.x/initials/svg?seed=${org.name}`}
                            alt={`${org.name}`}
                          />
                          <AvatarFallback>
                            {org.name}
                          </AvatarFallback>
                        </Avatar>

                        {org.name}
                        {org.isActive && (
                          <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                            Active
                          </Badge>
                        )}
                      </CardTitle>
                      <EntityActions
                        org={org}
                        onEdit={() => handleUpdateOrganization(org)}
                        onDelete={() => {
                          setOrgToDelete(org);
                          setShowDeleteOrgDialog(true);
                        }}
                        onSetActive={org.isActive ? undefined : () => handleSetActiveOrganization(org.id)}
                        onLeave={() => {
                          setOrgToLeave(org);
                          setShowLeaveOrgDialog(true);
                        }}
                      />
                    </div>
                    <CardDescription className="truncate flex items-center gap-2 text-slate-500">
                      <Link className="w-3 h-3 text-slate-500" />
                      /{org.slug}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {org.userId === user.id ? getRoleBadge("owner") : getRoleBadge("member")}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSwitchOrganization(org)}
                        className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredOrgs.length === 0 && (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <Building2 className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">No organizations found</h3>
                  <p className="text-slate-500 text-center mb-6 max-w-md">
                    {searchQuery ? "Try a different search term" : "Create your first organization to get started"}
                  </p>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-sm"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    {isLoading ? "Creating..." : "Create Organization"}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="mt-0 space-y-6">
            {selectedOrg ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Members</h3>
                    <p className="text-sm text-slate-600">
                      {members.length} members in <span className="font-medium">{selectedOrg.name}</span>
                    </p>
                  </div>
                  {canInvite && (
                    <Dialog open={isInviting} onOpenChange={setIsInviting}>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-sm">
                          <UserPlus className="w-4 h-4" />
                          Invite Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white border-slate-200">
                        <DialogHeader>
                          <DialogTitle className="text-slate-900">Invite Member</DialogTitle>
                          <DialogDescription className="text-slate-600">
                            Send an invitation to join {selectedOrg.name}
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...inviteMemberForm}>
                          <form onSubmit={inviteMemberForm.handleSubmit(onInviteMemberSubmit)} className="space-y-4">
                            <FormField
                              control={inviteMemberForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700">Email Address</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="member@example.com"
                                      {...field}
                                      className="bg-white border-slate-200"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={inviteMemberForm.control}
                              name="role"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-slate-700">Role</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-white border-slate-200">
                                        <SelectValue placeholder="Select a role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="member">Member</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsInviting(false)}
                                className="border-slate-200"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                className="bg-slate-900 hover:bg-slate-800"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : "Send Invitation"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <Card className="bg-white border-slate-200 overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-300 text-slate-700">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900 truncate">{member.name}</span>
                              {member.userId === selectedOrg.userId && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Creator
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-slate-600 truncate">{member.email}</span>
                              {member.createdAt && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(member.createdAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                            disabled={!canManage || member.role === 'owner'}
                          >
                            <SelectTrigger className="w-28 h-8 text-sm bg-white border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-slate-200">
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                            </SelectContent>
                          </Select>
                          {canManage && member.role !== 'owner' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setMemberToDelete(member);
                                setShowDeleteMemberDialog(true);
                              }}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredMembers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="p-4 rounded-full bg-slate-100 mb-4">
                        <Users className="w-12 h-12 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No members found</h3>
                      <p className="text-slate-500 text-center mb-6">
                        {searchQuery || roleFilter !== "all" || statusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Invite team members to collaborate"}
                      </p>
                      {canInvite && (
                        <Button
                          onClick={() => setIsInviting(true)}
                          className="gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700"
                        >
                          <UserPlus className="w-4 h-4" />
                          Invite Member
                        </Button>
                      )}
                    </div>
                  )}
                </Card>

                {/* All Users Section */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Available Users</h3>
                    <p className="text-sm text-slate-600">
                      Users not in {selectedOrg.name} - Invite them to join
                    </p>
                  </div>

                  <AllUsersList
                    selectedOrgId={selectedOrg.id}
                    organizationName={selectedOrg.name}
                    currentOrgMembers={members.map(member => ({
                      id: member.id,
                      email: member.email,
                      name: member.name
                    }))}
                  />
                </div>
              </>
            ) : (
              <Card className="bg-white border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <Users className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Select an Organization</h3>
                  <p className="text-slate-500 text-center mb-6">
                    Choose an organization from the dropdown to view members
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations" className="mt-0">
            {selectedOrg ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Invitations</h3>
                    <p className="text-sm text-slate-600">
                      {invitations.length} invitations for <span className="font-medium">{selectedOrg.name}</span>
                    </p>
                  </div>
                  {canInvite && (
                    <Button
                      onClick={() => setIsInviting(true)}
                      className="gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 shadow-sm"
                    >
                      <Mail className="w-4 h-4" />
                      New Invitation
                    </Button>
                  )}
                </div>

                <Card className="bg-white border-slate-200">
                  <div className="divide-y divide-slate-100">
                    {filteredInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-slate-900 truncate">{invitation.email}</span>
                              {getRoleBadge(invitation.role)}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                Invited {new Date(invitation.createdAt).toLocaleDateString()}
                              </span>
                              {invitation.expiresAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                              {invitation.invitedBy && (
                                <span className="flex items-center gap-1">
                                  <UserPlus className="w-3.5 h-3.5" />
                                  By {invitation.invitedBy}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {getInvitationStatusBadge(invitation.status)}
                          {invitation.status === 'pending' && canInvite && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setInvitationToDelete(invitation);
                                setShowDeleteInvitationDialog(true);
                              }}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredInvitations.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="p-4 rounded-full bg-slate-100 mb-4">
                        <Mail className="w-12 h-12 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">No invitations found</h3>
                      <p className="text-slate-500 text-center mb-6 max-w-md">
                        {searchQuery ? "Try a different search term" : "Send invitations to add new members to your organization"}
                      </p>
                      {canInvite && (
                        <Button
                          onClick={() => setIsInviting(true)}
                          className="gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700"
                        >
                          <Mail className="w-4 h-4" />
                          Send Invitation
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </>
            ) : (
              <Card className="bg-white border-slate-200">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 rounded-full bg-slate-100 mb-4">
                    <Mail className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Select an Organization</h3>
                  <p className="text-slate-500 text-center mb-6">
                    Choose an organization from the dropdown to view invitations
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Leave Organization Dialog */}
      <Dialog open={showLeaveOrgDialog} onOpenChange={setShowLeaveOrgDialog}>
        <DialogContent className="sm:max-w-[425px] bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-amber-600" />
              Leave Organization
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Are you sure you want to leave <span className="font-semibold text-slate-900">{orgToLeave?.name}</span>?
              You'll need to be re-invited to rejoin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-100"
              onClick={() => {
                setShowLeaveOrgDialog(false);
                setOrgToLeave(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
              onClick={() => orgToLeave && handleLeaveOrganization(orgToLeave.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Leaving...
                </>
              ) : "Leave Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={showEditOrgDialog} onOpenChange={setShowEditOrgDialog}>
        <DialogContent className="sm:max-w-[500px] bg-white text-slate-900 border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Edit Organization
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Update organization details for {orgToEdit?.name}
            </DialogDescription>
          </DialogHeader>

          <Form {...editOrganizationForm}>
            <form onSubmit={editOrganizationForm.handleSubmit(onEditOrganizationSubmit)} className="space-y-4 py-4">
              <FormField
                control={editOrganizationForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Organization Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter organization name"
                        {...field}
                        className="bg-white border-slate-200 focus:ring-slate-900"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editOrganizationForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Organization Slug *</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            placeholder="organization-slug"
                            {...field}
                            className="pr-10 bg-white border-slate-200 focus:ring-slate-900"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {isGeneratingSlug && (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-slate-100"
                              onClick={copyEditSlugToClipboard}
                              title="Copy to clipboard"
                            >
                              {copiedSlug === field.value ? (
                                <CheckCheck className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4 text-slate-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={generateRandomEditSlug}
                          className="whitespace-nowrap border-slate-200 text-slate-200 hover:bg-slate-100"
                        >
                          Randomize
                        </Button>
                      </div>
                    </FormControl>
                    <div className="text-xs text-slate-500 mt-1">
                      Slug will be auto-generated from the name. Must contain only lowercase letters, numbers, and hyphens.
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
  control={createOrganizationForm.control}
  name="logo"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-slate-700">Organization Image</FormLabel>
      <FormControl>
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 rounded-lg object-cover border border-slate-200"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-sm text-slate-500 mb-2">Upload organization image</p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors"
              >
                <Upload className="h-4 w-4" />
                {isUploadingImage ? 'Uploading...' : 'Select Image'}
              </Label>
              <p className="text-xs text-slate-400 mt-2">JPG, PNG, GIF up to 5MB</p>
            </div>
          )}
          <Input
            type="hidden"
            {...field}
            value={field.value || ''}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-200 text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setShowEditOrgDialog(false);
                    setOrgToEdit(null);
                    editOrganizationForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700"
                  disabled={isLoading || !editOrganizationForm.formState.isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : "Update Organization"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Organization Dialog */}
      <DeleteDialog
        isOpen={showDeleteOrgDialog}
        onOpenChange={setShowDeleteOrgDialog}
        onConfirm={() => orgToDelete && handleDeleteOrganization(orgToDelete.id)}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This action cannot be undone. All members will be removed and all data will be permanently deleted."
        isLoading={isLoading}
        type="organization"
        entityName={orgToDelete?.name}
      />

      {/* Delete Member Dialog */}
      <DeleteDialog
        isOpen={showDeleteMemberDialog}
        onOpenChange={setShowDeleteMemberDialog}
        onConfirm={() => memberToDelete && handleRemoveMember(memberToDelete.id)}
        title="Remove Member"
        description={`Are you sure you want to remove this member from ${selectedOrg?.name}? They will lose access to all organization resources and data.`}
        isLoading={isLoading}
        type="member"
        entityName={memberToDelete ? `${memberToDelete.name} (${memberToDelete.email})` : ''}
      />

      {/* Delete Invitation Dialog */}
      <DeleteDialog
        isOpen={showDeleteInvitationDialog}
        onOpenChange={setShowDeleteInvitationDialog}
        onConfirm={() => invitationToDelete && handleCancelInvitation(invitationToDelete.id)}
        title="Cancel Invitation"
        description="Are you sure you want to cancel this invitation? The recipient will no longer be able to join the organization using this invitation."
        isLoading={isLoading}
        type="invitation"
        entityName={invitationToDelete?.email}
      />
    </div>
  )
}

function EntityActions({
  org,
  onEdit,
  onDelete,
  onSetActive,
  onLeave
}: {
  org: Organization | null;
  onEdit: () => void;
  onDelete: () => void;
  onSetActive?: () => void;
  onLeave?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          <MoreVertical className="w-4 h-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border-slate-200 w-48 shadow-xl">
        {onSetActive && (
          <DropdownMenuItem
            onClick={onSetActive}
            className="gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-100"
          >
            <Check className="w-4 h-4" />
            Set Active
          </DropdownMenuItem>
        )}
        {onLeave && org && org.isActive && (
          <DropdownMenuItem
            onClick={onLeave}
            className="gap-2 cursor-pointer text-sm text-amber-600 hover:bg-amber-50"
          >
            <DoorOpen className="w-4 h-4" />
            Leave Organization
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={onEdit}
          className="gap-2 cursor-pointer text-sm text-slate-700 hover:bg-slate-100"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-slate-100" />
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 text-red-600 cursor-pointer hover:bg-red-50 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserProfile