import React, { Suspense } from 'react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  ChatComponent: React.LazyExoticComponent<React.ComponentType>;
}

const LoadingIndicator = () => (
  <div className="flex justify-center items-center h-48">
    <p className="text-white">Loading chat, please wait...</p>
  </div>
);

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, ChatComponent }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl bg-transparent rounded-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-300 z-10"
          aria-label="Close chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <Suspense fallback={<LoadingIndicator />}>
          <ChatComponent />
        </Suspense>
      </div>
    </div>
  );
};

export default ChatModal;