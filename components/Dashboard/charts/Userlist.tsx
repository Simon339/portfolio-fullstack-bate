"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Mail, Shield, ShieldCheck, Ban, CheckCircle2, XCircle, Key, UserPen, MessageSquare, UserX, UserCheck, Clock, UserCog, UserMinus, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { deleteUser, impersonateUser, stopImpersonating } from '@/server/actions/user';
import { toast } from 'sonner';

interface UserlistProps {
  id: string;
  name: string;
  image: string;
  banned: boolean;
  twofactorenabled: boolean;
  email: string;
  role: "user" | "owner" | "admin";
  status?: 'Verified' | 'Not Verified';
  createdAt: Date;
  isImpersonating?: boolean;
  onAction?: (action: string, userId: string) => void;
}

const Userlist = (props: UserlistProps) => {
  const router = useRouter();
  const { name, email, role, status = 'Not Verified', banned, twofactorenabled, createdAt, id, image, isImpersonating = false } = props;
  const [expanded, setExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [impersonateDialogOpen, setImpersonateDialogOpen] = useState(false);
  const [stopImpersonateDialogOpen, setStopImpersonateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isVerified = status === 'Verified';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin': return { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', icon: ShieldCheck };
      case 'owner': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', icon: Shield };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20', icon: null };
    }
  };
  const roleConfig = getRoleConfig(role);

   const handleView = () => {
    router.push(`/dashboard/users/${id}`);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userId", id);
      const result = await deleteUser(formData);
      
      if (result.success) {
        toast.success(result.message || "User deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the user");
    } finally {
      setLoading(false);
      setExpanded(false);
    }
  };

  const handleImpersonate = async () => {
    setLoading(true);
    setImpersonateDialogOpen(false);
    
    try {
      const result = await impersonateUser(id);
      
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to impersonate user");
      }
    } catch (error) {
      toast.error("An error occurred while impersonating user");
    } finally {
      setLoading(false);
      setExpanded(false);
    }
  };

  const handleStopImpersonating = async () => {
    setLoading(true);
    setStopImpersonateDialogOpen(false);
    
    try {
      const result = await stopImpersonating();
      
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/users");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to stop impersonating");
      }
    } catch (error) {
      toast.error("An error occurred while stopping impersonation");
    } finally {
      setLoading(false);
      setExpanded(false);
    }
  };

  return (
    <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => { setIsHovered(false); setExpanded(false); }}>
      <div className={cn("relative rounded-xl transition-all duration-300 overflow-hidden bg-white border border-[#acc2ef]", isHovered && "bg-gray-50 shadow-md", expanded && "bg-gray-50 shadow-lg", banned && "bg-red-50/50 border-red-500/20")}>
        <div className={cn("absolute left-0 top-3 bottom-3 w-0.5 rounded-full transition-all duration-300", banned ? "bg-red-500" : isVerified ? "bg-emerald-500" : "bg-gray-300", isHovered && "h-auto")} />
        <div className="p-4 pl-5">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <Avatar className={cn("h-11 w-11 ring-2 transition-all duration-300 ring-[#acc2ef]", isHovered && "ring-emerald-500/30")}>
                <AvatarImage src={image || `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=e5e7eb&textColor=6b7280`} alt={name} />
                <AvatarFallback className="bg-gray-100 text-gray-500 text-sm font-medium">{initials}</AvatarFallback>
              </Avatar>
              <div className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white", banned ? "bg-red-500" : "bg-emerald-500")}>
                {!banned && <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className={cn("text-sm font-semibold truncate transition-colors", banned ? "text-gray-400 line-through" : "text-gray-900")}>{name}</h3>
                <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border", roleConfig.bg, roleConfig.text, roleConfig.border)}>
                  {roleConfig.icon && <roleConfig.icon className="w-2.5 h-2.5" />}{role}
                </span>
                {twofactorenabled && <div className="flex items-center justify-center w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/20" title="2FA Enabled"><Key className="w-2.5 h-2.5 text-cyan-600" /></div>}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5 truncate"><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{email}</span></span>
                <span className="hidden sm:flex items-center gap-1.5"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border", isVerified ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-gray-100 text-gray-500 border-[#acc2ef]")}>
                {isVerified ? <><CheckCircle2 className="w-3 h-3" /><span>Verified</span></> : <><XCircle className="w-3 h-3" /><span>Unverified</span></>}
              </div>
              {banned && <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20"><Ban className="w-3 h-3" /><span>Banned</span></div>}
            </div>
            <button onClick={() => setExpanded(!expanded)} className={cn("flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 text-gray-400 hover:text-gray-600", expanded ? "bg-gray-200 text-gray-700" : "hover:bg-gray-100")} aria-label="Toggle actions menu">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
        {expanded && (
          <div className="border-t border-[#acc2ef] bg-gray-50 p-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={handleView} icon={UserPen} label="View" />
             <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-white text-red-600 border border-red-500/30 hover:bg-red-500/20">
                      <UserMinus className="w-3 h-3" />
                      Delete
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Permanently delete {name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account and remove all associated
                        data including sessions, organizations memberships, and audit logs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              {!isImpersonating ? (
                  <AlertDialog open={impersonateDialogOpen} onOpenChange={setImpersonateDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-white text-amber-600 border border-amber-500/30 hover:bg-amber-500/20">
                        <UserX className="w-3 h-3" />
                        Impersonate
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Impersonate {name}?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p className="text-gray-600 mt-2">
                            Are you sure you want to impersonate this user?
                            <span className="text-xs italic font-medium text-amber-800">  Warning: This action will be audited</span>
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleImpersonate}
                          className="bg-amber-600 hover:bg-amber-700"
                        >
                          Yes, Impersonate User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <AlertDialog open={stopImpersonateDialogOpen} onOpenChange={setStopImpersonateDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-amber-500/20 text-amber-700 border border-amber-500/30 hover:bg-amber-500/30">
                        <UserCog className="w-3 h-3" />
                        Stop Impersonating
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Stop Impersonating?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="font-medium text-blue-800">Return to your original account</p>
                              <p className="text-blue-700 mt-1">
                                You will stop acting as {name} and return to your administrator account.
                                Any unsaved changes will be lost.
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-2">
                            Are you sure you want to stop impersonating?
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleStopImpersonating}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Yes, Stop Impersonating
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

const ActionButton = ({ onClick, icon: Icon, label, variant = 'default' }: { onClick: () => void; icon: React.ElementType; label: string; variant?: 'default' | 'success' | 'warning' | 'danger' }) => {
  const variants = { default: "hover:bg-gray-200 hover:text-gray-800 border-[#acc2ef]", success: "hover:bg-emerald-500/20 hover:text-emerald-600 border-emerald-500/30", warning: "hover:bg-amber-500/20 hover:text-amber-600 border-amber-500/30", danger: "hover:bg-red-500/20 hover:text-red-600 border-red-500/30" };
  return <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 bg-white text-gray-600 border", variants[variant])}><Icon className="w-3 h-3" />{label}</button>;
};

export default Userlist;