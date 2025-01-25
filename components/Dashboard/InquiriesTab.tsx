/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, MailOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { getAllServiceInquiry } from '@/server/actions/notification';
import Link from 'next/link';
import InquiriesCard from './InquiriesCard';

interface ServiceInquiry {
    id: string;
    name: string;
    companyName: string;
    service: string;
    createdAt: Date;
    isSelected?: boolean;
    isRead?: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onToggleRead: (id: string) => void;
  }

const InquiriesTab = () => {

    const [selectAll, setSelectAll] = React.useState(false);
        const [pageSize, setPageSize] = React.useState(5);
        const [currentPage, setCurrentPage] = React.useState(1);
        const [allServiceInquiry, setAllServiceInquiry] = React.useState<ServiceInquiry[]>([]);
        const totalPages = Math.ceil(allServiceInquiry.length / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const currentMessages = allServiceInquiry.slice(startIndex, endIndex);
        const selectedCount = allServiceInquiry.filter((message) => message.isSelected).length;
    
        React.useEffect(() => {
            fetchNotifications();
        }, []);
    
        const fetchNotifications = async () => {
            const notifications = await getAllServiceInquiry();
            setAllServiceInquiry(notifications);
        };
    
        const handleSelectAll = (checked: boolean) => {
            setSelectAll(checked);
            setAllServiceInquiry((prevMessages) =>
                prevMessages.map((message) => ({ ...message, isSelected: checked }))
            );
        };
    
        const handleSelectMessage = (id: string, checked: boolean) => {
            setAllServiceInquiry((prevMessages) => {
                const updatedMessages = prevMessages.map((message) =>
                    message.id === id ? { ...message, isSelected: checked } : message
                );
    
                const allSelected = updatedMessages.every((message) => message.isSelected);
                setSelectAll(allSelected);
    
                return updatedMessages;
            });
        };
    
        const handleToggleRead = (id: string) => {
            setAllServiceInquiry((prevMessages) =>
                prevMessages.map((message) =>
                    message.id === id ? { ...message, isRead: !message.isRead } : message
                )
            );
        };
    
        const handleMarkAsRead = () => {
            setAllServiceInquiry((prevMessages) =>
                prevMessages.map((message) =>
                    message.isSelected ? { ...message, isRead: true } : message
                )
            );
        };
    

  return (
    <div className='flex flex-col border-none'>
            <div className="flex items-center justify-between p-2 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        id="select-all"
                        className="border-gray-400 checkmark"
                    />
                    <h2 className="text-xl font-semibold text-gray-800">Services Requests</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:bg-[#fff] hover:border-[#acc2ef]"
                        onClick={handleMarkAsRead}
                        disabled={selectedCount === 0}
                    >
                        <MailOpen className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                    <div className="flex-1 overflow-auto">
                        {currentMessages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                                <p className="text-lg font-medium">No services have been requested yet</p>
                                <p className="text-sm">When messages are received, they will appear here.</p>
                            </div>
                        ) : (
                            currentMessages.map((message) => (
                                <div key={message.id}>
                                    <Link href={`/dashboard/mails/inquiries/${message.id}`}>
                                        <InquiriesCard
                                            key={message.id}
                                            id={message.id}
                                            name={message.name}
                                            companyName={message.companyName}
                                            service={message.service}
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
                    {selectedCount} of {allServiceInquiry.length} selected.
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
        </div>
  )
}

export default InquiriesTab
