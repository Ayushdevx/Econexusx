import React from 'react';

interface FloatingChatButtonProps {
  onClick: () => void;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110"
    aria-label="Open chat"
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
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
      />
    </svg>
  </button>
);

export default FloatingChatButton;