/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, MailOpen, Trash2 } from 'lucide-react';
import MessageCard from '@/components/Dashboard/MessageCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllContactMessages, deleteRecords } from '@/server/actions/notification';
import Link from 'next/link';
import { Tooltip } from '@heroui/react';
import DeleteMessage from './modals/DeleteMessage';

const MessageTab = () => {
    const [selectAll, setSelectAll] = React.useState(false);
    const [pageSize, setPageSize] = React.useState(5);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [allContactMessages, setAllContactMessages] = React.useState<Message[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const totalPages = Math.ceil(allContactMessages.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentMessages = allContactMessages.slice(startIndex, endIndex);
    const selectedCount = allContactMessages.filter((message) => message.isSelected).length;

    React.useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        const notifications = await getAllContactMessages();
        setAllContactMessages(notifications);
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setAllContactMessages((prevMessages) =>
            prevMessages.map((message) => ({ ...message, isSelected: checked }))
        );
    };

    const handleSelectMessage = (id: string, checked: boolean) => {
        setAllContactMessages((prevMessages) => {
            const updatedMessages = prevMessages.map((message) =>
                message.id === id ? { ...message, isSelected: checked } : message
            );

            const allSelected = updatedMessages.every((message) => message.isSelected);
            setSelectAll(allSelected);

            return updatedMessages;
        });
    };

    const handleToggleRead = (id: string) => {
        setAllContactMessages((prevMessages) =>
            prevMessages.map((message) =>
                message.id === id ? { ...message, isRead: !message.isRead } : message
            )
        );
    };

    const handleMarkAsRead = () => {
        setAllContactMessages((prevMessages) =>
            prevMessages.map((message) =>
                message.isSelected ? { ...message, isRead: true } : message
            )
        );
    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        const selectedIds = allContactMessages.filter((message) => message.isSelected).map((message) => message.id);
        await deleteRecords({ contactFormIds: selectedIds });
        setIsDeleteDialogOpen(false);
        setIsDeleting(false);
        fetchNotifications(); // Refresh the list after deletion
    };

    return (
        <div className='flex flex-col border-none'>
            <div className="flex items-center justify-between p-2 border-b border-[#acc2ef]">
                <div className="flex items-center gap-4">
                    <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        id="select-all"
                        className="border-gray-400 checkmark"
                    />
                    <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
                </div>

                <div className="relative flex items-center justify-items-end gap-2">
                    <Tooltip color="danger" content="Delete Selected Message">
                        <span className="text-sm text-danger cursor-pointer active:opacity-50" onClick={handleDeleteClick}>
                            <Trash2 className="mr-2 h-4 w-4" />
                        </span>
                    </Tooltip>
                    <Tooltip color="foreground" content="Mark as read">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:bg-[#fff] hover:border-[#acc2ef]"
                            onClick={handleMarkAsRead}
                            disabled={selectedCount === 0}
                        >
                            <MailOpen className="h-4 w-4" />
                        </Button>
                    </Tooltip>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="flex-1 overflow-auto h-[400px]">
                        {currentMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                                <p className="text-lg font-medium">No messages yet</p>
                                <p className="text-sm">When you receive messages, they will appear here.</p>
                            </div>
                        ) : (
                            currentMessages.map((message) => (
                                <div key={message.id}>
                                    <Link href={`/dashboard/mails/${message.id}`}>
                                        <MessageCard
                                            key={message.id}
                                            id={message.id}
                                            name={message.name}
                                            email={message.email}
                                            topic={message.topic}
                                            message={message.message}
                                            createdAt={message.createdAt}
                                            isSelected={message.isSelected}
                                            isRead={message.isRead}
                                            onSelect={handleSelectMessage}
                                            onToggleRead={handleToggleRead}
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
                    {selectedCount} of {allContactMessages.length} selected.
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

            {/* Delete Confirmation Dialog */}
            <DeleteMessage
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onDelete={handleDeleteConfirm}
                isDeleting={isDeleting}
            />
        </div>
    )
}

export default MessageTab;