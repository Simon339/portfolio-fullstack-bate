/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import TechstackModal from '../modals/TechstackModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import TechstackCard from '../TechstackCard';
import { toast } from "sonner";
import { fetchTechstacks, deleteTechstacks, editTechstack } from '@/server/data/projectactions';
import DeleteTechstackDialog from "../modals/DeleteTechstackDialog";

interface Techstack {
  id: string;
  name: string;
  image: string;
  isSelected: boolean;
}

const Techstack = () => {
  const [techstacks, setTechstacks] = useState<Techstack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectAll, setSelectAll] = useState(false);
  const [pageSize, setPageSize] = useState(7);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const totalPages = Math.ceil(techstacks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTechstacks = techstacks.slice(startIndex, endIndex);

  const selectedCount = techstacks.filter((techstack) => techstack.isSelected).length;

  useEffect(() => {
    const loadTechstacks = async () => {
      setLoading(true);
      try {
        const fetchedTechstacks = await fetchTechstacks();
        setTechstacks(fetchedTechstacks.map(t => ({ ...t, isSelected: false })));
      } catch (error) {
        console.error("Error fetching techstacks:", error);
        toast.error("Failed to load techstacks");
      } finally {
        setLoading(false);
      }
    };
    loadTechstacks();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setTechstacks((prevTechstacks) =>
      prevTechstacks.map((techstack) => ({ ...techstack, isSelected: checked }))
    );
  };

  const handleSelectTechstack = (id: string, checked: boolean) => {
    setTechstacks((prevTechstacks) => {
      const updatedTechstacks = prevTechstacks.map((techstack) =>
        techstack.id === id ? { ...techstack, isSelected: checked } : techstack
      );

      const allSelected = updatedTechstacks.every((techstack) => techstack.isSelected);
      setSelectAll(allSelected);

      return updatedTechstacks;
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const selectedTechstackIds = techstacks.filter((u) => u.isSelected).map((u) => u.id);
      await deleteTechstacks(selectedTechstackIds);
      setTechstacks((prevTechstacks) => prevTechstacks.filter((techstack) => !techstack.isSelected));
      toast.success("Techstacks deleted", {
        description: "The selected techstacks have been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting techstacks:", error);
      toast.error("Error", {
        description: "There was an error deleting the techstacks. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEdit = async (id: string, data: FormData) => {
    try {
      const result = await editTechstack(id, data);
      setTechstacks(prev =>
        prev.map(tech =>
          tech.id === id ? { ...tech, ...result.techstack } : tech
        )
      );
      toast.success("Techstack updated successfully");
    } catch (error) {
      console.error("Error updating techstack:", error);
      toast.error("Failed to update techstack");
    }
  };

  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            id="select-all"
            className="border-gray-400 checkmark"
          />
        </div>
        <div className="relative items-center">
          <h2 className="text-center text-xl font-bold">Techstack</h2>
          <span className="text-center text-gray-600">Manage your Techstack</span>
        </div>
        <div className="flex items-center gap-2">
        <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-[#fff] hover:border-[#acc2ef]"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <DeleteTechstackDialog
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            selectedCount={selectedCount}
            isDeleting={isDeleting}
          />
          <TechstackModal />
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-1">
        <ScrollArea className="h-full pr-2">
          <div className="flex-1 overflow-auto">
            {currentTechstacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                <p className="text-2xl font-semibold mb-2">No Techstack yet</p>
                <p className="text-sm text-center">When you start creating one, they will appear here.</p>
              </div>
            ) : (
              currentTechstacks.map((techstack) => (
                <TechstackCard
                  key={techstack.id}
                  id={techstack.id}
                  name={techstack.name}
                  image={techstack.image}
                  isSelected={techstack.isSelected}
                  onSelect={handleSelectTechstack}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <footer className="flex justify-between text-gray-600 py-3 mt-auto">
        <div className="flex text-sm text-muted-foreground">
          {selectedCount} of {techstacks.length} selected.
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

export default Techstack;

