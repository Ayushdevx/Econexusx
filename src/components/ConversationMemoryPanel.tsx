import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Trash2, Edit, Save, X, Plus, Info } from 'lucide-react';

interface ConversationMemoryPanelProps {
  conversationMemory: string[];
  setConversationMemory: (memory: string[]) => void;
  onClose: () => void;
}

const ConversationMemoryPanel: React.FC<ConversationMemoryPanelProps> = ({ 
  conversationMemory, 
  setConversationMemory, 
  onClose 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableMemory, setEditableMemory] = useState<string[]>([...conversationMemory]);
  
  const handleSave = () => {
    // Filter out empty items
    const filteredMemory = editableMemory.filter(item => item.trim() !== '');
    setConversationMemory(filteredMemory);
    setIsEditing(false);
  };
  
  const handleAddPoint = () => {
    setEditableMemory([...editableMemory, '']);
  };
  
  const handleRemovePoint = (index: number) => {
    const updatedMemory = [...editableMemory];
    updatedMemory.splice(index, 1);
    setEditableMemory(updatedMemory);
  };
  
  const handleUpdatePoint = (index: number, value: string) => {
    const updatedMemory = [...editableMemory];
    updatedMemory[index] = value;
    setEditableMemory(updatedMemory);
  };
  
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all memory points? This will reset the AI\'s context awareness.')) {
      setConversationMemory([]);
      setEditableMemory([]);
      setIsEditing(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="card bg-base-300 shadow-xl mb-4"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-primary" />
            <h3 className="card-title text-lg">Conversation Memory</h3>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave} 
                  className="btn btn-sm btn-primary"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </button>
                <button 
                  onClick={() => {
                    setEditableMemory([...conversationMemory]);
                    setIsEditing(false);
                  }} 
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn btn-sm btn-ghost"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
            <button onClick={onClose} className="btn btn-sm btn-ghost">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Things I remember about you:</span>
            {isEditing && (
              <div className="flex gap-2">
                <button 
                  onClick={handleAddPoint} 
                  className="btn btn-xs btn-outline btn-primary"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Point
                </button>
                <button 
                  onClick={handleClearAll} 
                  className="btn btn-xs btn-outline btn-error"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </button>
              </div>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto p-2">
            {editableMemory.length > 0 ? (
              isEditing ? (
                // Edit mode
                editableMemory.map((point, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input 
                      type="text"
                      value={point}
                      onChange={(e) => handleUpdatePoint(index, e.target.value)}
                      className="input input-bordered input-sm flex-1"
                      placeholder="Add context point..."
                    />
                    <button 
                      onClick={() => handleRemovePoint(index)}
                      className="btn btn-ghost btn-sm text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                // View mode
                editableMemory.map((point, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-base-200 p-3 rounded-lg"
                  >
                    {point}
                  </motion.div>
                ))
              )
            ) : (
              <div className="text-center py-8 text-sm opacity-70">
                <Brain className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p>No memory points yet. As we chat, I'll remember important details about you.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="alert alert-info mt-4 text-xs">
          <Info className="w-4 h-4" />
          <span>
            These memory points help me maintain context throughout our conversation. 
            Edit them to customize what I know about you.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationMemoryPanel; 