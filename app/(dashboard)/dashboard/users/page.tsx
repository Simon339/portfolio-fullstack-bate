/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Trash2, } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import UsersCard from '@/components/Dashboard/UsersCard';
import UserModal from '@/components/Dashboard/modals/User';
import DeleteModal from '@/components/Dashboard/modals/DeleteModal';
import { deleteUser, getbyUserDetails } from '@/server/data/alldata';
import { toast } from 'sonner';


interface User {
  id: string;
  name: string;
  image: string;
  email: string;
  status: "Verified" | "Not Verified";
  createdAt: Date;
  color?: string;
  isSelected: boolean;
  onDelete?: () => void;
}


const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const totalPages = Math.ceil(users.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentUser = users.slice(startIndex, endIndex);

  const selectedCount = users.filter((user) => user.isSelected).length;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getbyUserDetails();
      setUsers(usersData || []);
    } catch (err) {
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setUsers((prevUser) =>
      prevUser.map((user) => ({ ...user, isSelected: checked }))
    );
  };

  const handleSelectuser = (id: string, checked: boolean) => {
    setUsers((prevUser) => {
      const updatedUser = prevUser.map((user) =>
        user.id === id ? { ...user, isSelected: checked } : user
      );
      
      const allSelected = updatedUser.every((user) => user.isSelected);
      setSelectAll(allSelected);

      return updatedUser;
    });
  };

  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedUsers = users.filter(u => u.isSelected);
      for (const user of selectedUsers) {
        const formData = new FormData();
        formData.append('userId', user.id);
        await deleteUser(formData);
      }
      setUsers(prevUsers => prevUsers.filter(u => !u.isSelected));
      toast("Users deleted",{
         description: "The selected users have been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting users:', error);
      toast("Error",{
         description: "There was an error deleting the users. Please try again.",
      
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-[#acc2ef]">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            id="select-all"
            className="border-gray-400 checkmark"
          />
          <h2 className="text-xl font-semibold text-gray-800">Users</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 bg-[#fff] rounded-xl border-[#acc2ef] hover:bg-[#fff] hover:border-[#acc2ef]"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={handleDelete}
            isDeleting={isDeleting}
            selectedUserNames={users.filter(u => u.isSelected).map(u => `${u.name}`).join(", ")}
          />

          <UserModal />
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-1">
        <ScrollArea className="h-full pr-2">
          <div className="flex-1 overflow-auto">
            {currentUser.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                <p className="text-2xl font-semibold mb-2">No Users yet</p>
                <p className="text-sm text-center">When a user signs up, they will appear here.</p>
              </div>
            ) : (
              currentUser.map((user) => (
                <div key={user.id} onClick={() => router.push(`/dashboard/users/${user.id}`)}>
                  <Link href={`/dashboard/users/${user.id}`}>
                  <UsersCard
                    id={user.id}
                    name={user.name}
                    image={user.image}
                    email={user.email}
                    createdAt={user.createdAt}
                    status={user.status}
                    color={user.color}
                    isSelected={user.isSelected}
                    onSelect={handleSelectuser}
                  />
                  </Link>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <footer className="flex justify-between text-gray-600 py-3 mt-auto">
        <div className="flex text-sm text-muted-foreground">
          {selectedCount} of {users.length} selected.
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronFirst className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronLast className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default Page;

