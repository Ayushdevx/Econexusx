import React from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Zap, Sun, BarChart2, X, Info } from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: string;
  onSelectTone: (tone: string) => void;
  onClose: () => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onSelectTone, onClose }) => {
  const tones = [
    { id: 'friendly', name: 'Friendly', description: 'Warm, approachable and conversational', icon: <User className="w-5 h-5" /> },
    { id: 'professional', name: 'Professional', description: 'Formal, precise and informative', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic, motivating and passionate', icon: <Zap className="w-5 h-5" /> },
    { id: 'simple', name: 'Simple', description: 'Clear, basic language for everyone', icon: <Sun className="w-5 h-5" /> },
    { id: 'expert', name: 'Expert', description: 'Technical, detailed and advanced', icon: <BarChart2 className="w-5 h-5" /> }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="card bg-base-300 shadow-xl mb-4"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-center">
          <h3 className="card-title text-lg">AI Response Style</h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm opacity-70 mb-3">Choose how you want the AI to respond to you:</p>
        
        <div className="grid gap-2">
          {tones.map((tone) => (
            <button
              key={tone.id}
              className={`btn btn-outline justify-start ${selectedTone === tone.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => onSelectTone(tone.id)}
            >
              <div className="mr-2">
                {tone.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{tone.name}</div>
                <div className="text-xs opacity-70">{tone.description}</div>
              </div>
              {selectedTone === tone.id && (
                <div className="badge badge-primary badge-sm ml-2">Selected</div>
              )}
            </button>
          ))}
        </div>
        
        <div className="alert alert-info text-xs mt-3">
          <Info className="w-4 h-4" />
          <span>The selected tone will apply to all future AI responses.</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ToneSelector; 