/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CategoriesModal from "../modals/CategoriesModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import CategoryCard from "../CategoryCard";
import CategoriesDeleteModal from "../modals/CategoriesDelet";
import { deleteCategories, editCategory, fetchCategories } from "@/server/data/projectactions";

interface Category {
  id: string;
  name: string;
  isSelected: boolean;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectAll, setSelectAll] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const totalPages = Math.ceil(categories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCategories = categories.slice(startIndex, endIndex);

  const selectedCount = categories.filter((categories) => categories.isSelected).length;

  useEffect(() => {
    const loadCatergories = async () => {
      setLoading(true);
      try {
        const fetchedtCategories = await fetchCategories();
        setCategories(fetchedtCategories.map(c => ({ ...c, isSelected: false })));
      } catch (error) {
        console.error("Error fetching Catergories:", error);
        toast.error("Failed to load Catergories");
      } finally {
        setLoading(false);
      }
    };
    loadCatergories();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setCategories((prevCategories) =>
      prevCategories.map((categories) => ({ ...categories, isSelected: checked }))
    );
  };

  const handleSelectCategories = (id: string, checked: boolean) => {
    setCategories((prevCategories) => {
      const updatedCategories = prevCategories.map((categories) =>
        categories.id === id ? { ...categories, isSelected: checked } : categories
      );

      const allSelected = updatedCategories.every((categories) => categories.isSelected);
      setSelectAll(allSelected);

      return updatedCategories;
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const selectedCategoryIds = categories
        .filter((category) => category.isSelected)
        .map((category) => category.id)
  
      const result = await deleteCategories(selectedCategoryIds)
  
      if (result.success) {
        setCategories((prevCategories) => 
          prevCategories.filter((category) => !category.isSelected)
        )
      toast.success("categories deleted", {
        description: "The selected categories have been successfully deleted.",
      });
    } else {
      throw new Error(result.message)
    }
  } catch (error) {
    console.error("Error deleting categories:", error)
      toast.error("Error", {
        description: "There was an error deleting the categories. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleEdit = async (id: string, data: FormData) => {
    try {
      const result = await editCategory(id, data);
      if (result) {
        setCategories(prev =>
          prev.map(cat =>
            cat.id === id ? { ...cat, ...result.category } : cat
          )
        );
        toast.success("Category updated successfully");
      }
    } catch (error) {
      console.error("Error updating Category:", error);
      toast.error("Failed to update Category");
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
          <h2 className="text-center text-xl font-bold">Category</h2>
          <span className="text-center text-gray-600">Manage your  Categories</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:bg-[#fff]hover:border-[#acc2ef]"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={selectedCount === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <CategoriesDeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            selectedCount={selectedCount}
            isDeleting={isDeleting}
          />
          <CategoriesModal />
        </div>
      </div>

      <div className="flex-1 overflow-hidden mt-1">
        <ScrollArea className="h-full pr-2">
          <div className="flex-1 overflow-auto">
            {currentCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                <p className="text-2xl font-semibold mb-2">No Categories yet</p>
                <p className="text-sm text-center">When you start creating one, they will appear here.</p>
              </div>
            ) : (
              currentCategories.map((categories) => (
                <CategoryCard
                  key={categories.id}
                  id={categories.id}
                  name={categories.name}
                  isSelected={categories.isSelected}
                  onSelect={handleSelectCategories}
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <footer className="flex justify-between text-gray-600 py-3 mt-auto">
        <div className="flex text-sm text-muted-foreground">
          {selectedCount} of {categories.length} selected.
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
export default Categories
