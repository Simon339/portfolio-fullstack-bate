"use client";
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  ModalFooter,
  Modal,
  ModalBody,
  ModalContent,
} from './ui/animated-modal';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        alert("Feedback sent. Thank you!");
        setFeedback('');
        onClose();
      } else {
        throw new Error('Failed to send feedback');
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <h2 className="text-lg font-semibold">Send Your Feedback</h2>
        <ModalBody>
          <Textarea
            placeholder="Write your feedback here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className="mr-2"  //create a feedback floating button
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp;
                Sending...
              </>
            ) : 'Send'}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FeedbackModal;
