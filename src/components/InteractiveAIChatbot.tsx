import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Send, Mic, Sun, Volume2, Bot, User, Download, Copy, Moon, Eraser, Brain, Zap, Settings, Paperclip, X, Upload, Image, File, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import jsPDF from 'jspdf';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import ToneSelector from './ToneSelector';
import ChatHeader from './ChatHeader';
import ConversationMemoryPanel from './ConversationMemoryPanel';

// Define interfaces for TypeScript
interface Message {
  text: string;
  isUser: boolean;
  timestamp: string;
  files?: UploadedFile[];
}

interface DetectedUserInfo {
  name?: string;
  interests?: string[];
}

interface Weather {
  location: {
    name: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
    };
    feelslike_c: number;
    humidity: number;
    wind_kph: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
        }
      }
    }>;
  };
}

// Add interface for uploaded files
interface UploadedFile {
  id: string;
  name: string;
  type: string;
  url: string;
  content?: string; // For text files
  isImage: boolean;
}

const API_KEY = 'AIzaSyD8ycFuFWs7xEkTwGv7JIx__4j9ISAZJcg';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const WEATHER_API_KEY = '38bbd278ec684e78921132440240308';
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json';

const ChatMessage: React.FC<{
  message: string;
  isUser: boolean;
  timestamp: string;
  files?: UploadedFile[];
  onCopy: (text: string) => void;
  onSpeak?: (text: string) => void;
}> = ({ message, isUser, timestamp, files, onCopy, onSpeak }) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    if (messageRef.current) {
      // Use highlight instead of highlightAllUnder
      const codeBlocks = messageRef.current.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        Prism.highlight(
          block.textContent || '',
          Prism.languages.javascript,
          'javascript'
        );
      });
    }
  }, [message]);

  // Handle the marked function properly - it can return either a string or a Promise<string>
  const getHtml = () => {
    try {
      const result = marked(message);
      if (typeof result === 'string') {
        return DOMPurify.sanitize(result);
      } else {
        // If it's a Promise, we'll return empty string and handle it in a useEffect
        return '';
      }
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return '';
    }
  };

  const [sanitizedHtml, setSanitizedHtml] = useState('');

  useEffect(() => {
    const processMarkdown = async () => {
      try {
        const result = await marked(message);
        setSanitizedHtml(DOMPurify.sanitize(result));
      } catch (error) {
        console.error('Error processing markdown:', error);
        setSanitizedHtml('');
      }
    };
    
    processMarkdown();
  }, [message]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`chat ${isUser ? 'chat-end' : 'chat-start'} group mb-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="chat-image avatar">
        <motion.div 
          whileHover={{ scale: 1.1, rotate: isUser ? 0 : 10 }}
          className={`w-10 rounded-full ${isUser ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-info to-success'}`}
        >
          {isUser ? 
            <User className="p-2 text-white" /> : 
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Bot className="p-2 text-white" />
            </motion.div>
          }
        </motion.div>
      </div>
      <div className="flex flex-col gap-2">
        <motion.div 
          ref={messageRef}
          whileHover={{ scale: 1.01 }}
          className={`chat-bubble prose max-w-prose relative group shadow-lg ${
            isUser ? 'chat-bubble-primary text-primary-content' : 'chat-bubble-accent text-accent-content'
          } border border-opacity-10 ${isUser ? 'border-primary' : 'border-accent'}`}
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
        
        {/* Display attached files */}
        {files && files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1 max-w-xs md:max-w-md">
            {files.map(file => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
              >
                <FileMessage 
                  file={file} 
                  isInChat={true}
                />
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="chat-footer opacity-50 text-xs flex items-center gap-2">
          {new Date(timestamp).toLocaleTimeString()}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex gap-1"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onCopy(message)}
                  className="btn btn-xs btn-ghost btn-circle"
                  title="Copy to clipboard"
                >
                  <Copy className="w-3 h-3" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-xs btn-ghost btn-circle"
                  title="Read aloud"
                  onClick={() => onSpeak && onSpeak(message)}
                >
                  <Volume2 className="w-3 h-3" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const WeatherWidget: React.FC<{weather: Weather}> = ({ weather }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-4 overflow-hidden"
    whileHover={{ scale: 1.02 }}
  >
    <motion.div 
      className="card-body py-3 px-4"
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="bg-white/20 p-2 rounded-full"
          >
            <Sun className="h-6 w-6" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{weather.current.temp_c}°C</span>
            <span className="text-xs opacity-80">{weather.current.condition.text}</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold">{weather.location.name}</span>
          <span className="text-xs opacity-80">Humidity: {weather.current.humidity}%</span>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// Add a typing indicator animation component
const TypingIndicator: React.FC = () => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }} 
    exit={{ opacity: 0 }} 
    className="flex justify-start mb-4"
  >
    <div className="chat chat-start">
      <div className="chat-image avatar">
        <div className="w-10 rounded-full bg-gradient-to-r from-info to-success">
          <Bot className="p-2 text-white" />
        </div>
      </div>
      <div className="chat-bubble bg-base-300 flex items-center gap-1 min-h-0 h-auto py-2">
        <motion.div 
          animate={{ y: [0, -5, 0] }} 
          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
          className="w-2 h-2 rounded-full bg-base-content opacity-60"
        />
        <motion.div 
          animate={{ y: [0, -5, 0] }} 
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          className="w-2 h-2 rounded-full bg-base-content opacity-60"
        />
        <motion.div 
          animate={{ y: [0, -5, 0] }} 
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
          className="w-2 h-2 rounded-full bg-base-content opacity-60"
        />
      </div>
    </div>
  </motion.div>
);

// Add SettingsPanel component
const SettingsPanel: React.FC<{
  onClose: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  clearChat: () => void;
}> = ({ onClose, darkMode, toggleDarkMode, clearChat }) => {
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
            <Settings className="w-5 h-5 mr-2 text-primary" />
            <h3 className="card-title text-lg">Settings</h3>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div className="form-control">
            <label className="label cursor-pointer justify-start gap-4">
              <span className="label-text">Dark Mode</span>
              <input 
                type="checkbox" 
                className="toggle toggle-primary" 
                checked={darkMode}
                onChange={toggleDarkMode}
              />
            </label>
          </div>
          
          <button 
            onClick={clearChat}
            className="btn btn-error btn-outline btn-sm"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Clear Chat History
          </button>
          
          <div className="alert alert-info text-xs">
            <Info className="w-4 h-4" />
            <span>Chat history is stored in your browser and is not sent to our servers.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Add FileMessage component for rendering uploaded files
const FileMessage: React.FC<{
  file: UploadedFile;
  onRemove?: () => void;
  isInChat?: boolean;
}> = ({ file, onRemove, isInChat = false }) => {
  return (
    <div className={`${isInChat ? 'chat-bubble bg-primary/10 backdrop-blur-sm border border-primary/20' : 'bg-base-200'} p-3 rounded-lg flex items-center gap-3 transition-all duration-300`}>
      {file.isImage ? (
        <div className="relative w-full max-w-xs">
          <img 
            src={file.url} 
            alt={file.name} 
            className="rounded-md object-cover max-h-48 w-full hover:shadow-lg transition-shadow duration-300" 
          />
          {!isInChat && onRemove && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="absolute top-1 right-1 btn btn-circle btn-xs btn-error"
            >
              <X className="w-3 h-3" />
            </motion.button>
          )}
          <div className="text-xs mt-1 opacity-80">{file.name}</div>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <div className="bg-primary/20 p-2 rounded-full">
            <File className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="font-medium text-sm truncate">{file.name}</div>
            <div className="text-xs opacity-70">{file.type}</div>
          </div>
          {!isInChat && onRemove && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onRemove}
              className="btn btn-ghost btn-xs text-error"
            >
              <X className="w-3 h-3" />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

const InteractiveAIChatbot: React.FC = () => {
  // Messages state with proper typing
  const [messages, setMessages] = useState<Message[]>([{
    text: "👋 Hello! I'm your EcoNexus Assistant. I'm here to help you with sustainability and energy management topics. Feel free to ask me anything or share your name so I can address you personally!",
    isUser: false,
    timestamp: new Date().toISOString()
  }]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [theme, setTheme] = useState('dark');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [showToneSelector, setShowToneSelector] = useState(false);
  const [selectedTone, setSelectedTone] = useState('friendly');
  
  // Add required states for ChatHeader component
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showConversationMemory, setShowConversationMemory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationMemory, setConversationMemory] = useState<string[]>([]);
  const [detectedUserInfo, setDetectedUserInfo] = useState<DetectedUserInfo | null>(null);
  const [showMemoryPanel, setShowMemoryPanel] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentWeather();
    document.documentElement.setAttribute('data-theme', theme);
    
    // Use highlight instead of highlightAll
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach((block) => {
      Prism.highlight(
        block.textContent || '',
        Prism.languages.javascript,
        'javascript'
      );
    });
  }, [theme]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Update context whenever messages change
    if (messages.length > 1) {
      updateDetectedUserInfo(messages);
    }
  }, [messages]);

  const getCurrentWeather = async () => {
    try {
      // Properly type the position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const response = await fetch(
        `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=${position.coords.latitude},${position.coords.longitude}`
      );
      
      if (!response.ok) throw new Error('Weather API request failed');
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const updateDetectedUserInfo = (messages: Message[]) => {
    // Name detection
    let name = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.isUser) {
        const nameMatch = message.text.match(/(?:my name is|I'm|I am|call me) (\w+)/i);
        if (nameMatch && nameMatch[1]) {
          name = nameMatch[1];
          break;
        }
      }
    }

    // Interest detection
    const detectedInterests: string[] = [];
    
    // First look for direct mentions of interests
    const interestPatterns = [
      /I (?:like|love|enjoy|am interested in) (\w+(?:\s\w+){0,3})/gi,
      /My hobby is (\w+(?:\s\w+){0,3})/gi,
      /I'm passionate about (\w+(?:\s\w+){0,3})/gi
    ];
    
    // Check user messages for interest patterns
    for (const message of messages) {
      if (message.isUser) {
        for (const pattern of interestPatterns) {
          const patternCopy = new RegExp(pattern.source, pattern.flags);
          let match;
          while ((match = patternCopy.exec(message.text)) !== null) {
            if (match[1] && !detectedInterests.includes(match[1])) {
              detectedInterests.push(match[1]);
            }
          }
        }
      }
    }
    
    // Also extract interests from conversation memory
    if (conversationMemory.length > 0) {
      for (const point of conversationMemory) {
        if (point.toLowerCase().includes('interested in') || 
            point.toLowerCase().includes('likes') || 
            point.toLowerCase().includes('enjoys') ||
            point.toLowerCase().includes('hobby')) {
          
          for (const pattern of interestPatterns) {
            const patternCopy = new RegExp(pattern.source, pattern.flags);
            let match;
            while ((match = patternCopy.exec(point)) !== null) {
              if (match[1] && !detectedInterests.includes(match[1])) {
                detectedInterests.push(match[1]);
              }
            }
          }
        }
      }
    }
    
    // Limit to top 3 interests
    const finalInterests = detectedInterests.slice(0, 3);
    
    // Update state if anything changed
    if ((name && (!detectedUserInfo || detectedUserInfo.name !== name)) ||
        (finalInterests.length > 0 && (!detectedUserInfo || !detectedUserInfo.interests || 
         JSON.stringify(finalInterests) !== JSON.stringify(detectedUserInfo.interests)))) {
      
      const updatedInfo: DetectedUserInfo = {
        name: name || (detectedUserInfo?.name || ''),
        interests: finalInterests.length > 0 ? finalInterests : (detectedUserInfo?.interests || [])
      };
      
      setDetectedUserInfo(updatedInfo);
      
      // Add to conversation memory if not already there
      if (name && !conversationMemory.some(point => point.includes(`name is ${name}`))) {
        setConversationMemory([...conversationMemory, `User's name is ${name}`]);
      }
      
      if (finalInterests.length > 0) {
        const interestPoint = `User is interested in ${finalInterests.join(', ')}`;
        if (!conversationMemory.some(point => point.includes('interested in'))) {
          setConversationMemory([...conversationMemory, interestPoint]);
        } else {
          // Update existing interest point
          const updatedMemory = conversationMemory.map(point => 
            point.includes('interested in') ? interestPoint : point
          );
          setConversationMemory(updatedMemory);
        }
      }
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      // Check for user's name directly in messages to ensure immediate recognition
      const namePattern = /(?:my name is|I'm|I am|call me) (\w+)/i;
      let userName = detectedUserInfo?.name;
      
      // Check the latest message (userInput) for a name
      if (!userName && namePattern.test(userInput)) {
        const match = userInput.match(namePattern);
        if (match && match[1]) {
          userName = match[1];
          // We found a name in this message, update the state immediately
          const updatedInfo = { ...(detectedUserInfo || {}), name: userName } as DetectedUserInfo;
          setDetectedUserInfo(updatedInfo);
          
          // Add to conversation memory
          if (!conversationMemory.includes(`User's name is ${userName}`)) {
            setConversationMemory([...conversationMemory, `User's name is ${userName}`]);
          }
        }
      }
      
      // Create a conversation history for better context
      let conversationContext = "";
      
      // Include up to 5 recent messages for context
      const recentMessages = messages.slice(-5);
      if (recentMessages.length > 0) {
        conversationContext += "Previous conversation:\n";
        recentMessages.forEach(msg => {
          conversationContext += `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}\n`;
        });
        conversationContext += "\n";
      }
      
      // Add direct name reference if we have it
      if (userName) {
        conversationContext += `User's name: ${userName}\n\n`;
      }
      
      // Add conversation memory if available
      if (conversationMemory.length > 0) {
        conversationContext += "Important context to remember:\n";
        conversationMemory.forEach(point => {
          conversationContext += `- ${point}\n`;
        });
        conversationContext += "\n";
      }
      
      // Add a specific instruction based on tone
      let toneInstruction = "";
      switch(selectedTone) {
        case 'friendly':
          toneInstruction = "Respond in a friendly, warm, and personable manner. Use the user's name if you know it.";
          break;
        case 'professional':
          toneInstruction = "Respond professionally and formally with precise information.";
          break;
        case 'enthusiastic':
          toneInstruction = "Respond with enthusiasm and energy. Be encouraging and upbeat.";
          break;
        case 'simple':
          toneInstruction = "Use simple, clear language that anyone can understand. Avoid complex terminology.";
          break;
        case 'expert':
          toneInstruction = "Respond with detailed technical information showing expertise in the subject.";
          break;
        default:
          toneInstruction = "Respond in a friendly, helpful manner.";
      }
      
      // Construct the final prompt with all context
      const finalPrompt = `${toneInstruction}\n\n${conversationContext}User: ${userInput}\n\nAssistant:`;
      
      console.log("Sending prompt with context:", finalPrompt);
      
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: finalPrompt }]
          }],
          generationConfig: {
            temperature: selectedTone === 'expert' ? 0.3 : 
                         selectedTone === 'enthusiastic' ? 0.9 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) throw new Error('AI API request failed');
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
        '**Error:** I apologize, but I couldn\'t generate a proper response.';
    } catch (error) {
      console.error('AI response error:', error);
      return '**Error:** I apologize, but I encountered an error. Please try again.';
    }
  };

  // Add function to handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const newFile: UploadedFile = {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            type: file.type,
            url: event.target.result as string,
            isImage
          };
          
          // For text files, try to extract content
          if (file.type === 'text/plain' || file.type === 'application/json' || 
              file.type === 'text/csv' || file.type === 'text/html') {
            try {
              newFile.content = event.target.result as string;
            } catch (error) {
              console.error('Error reading file content:', error);
            }
          }
          
          setUploadedFiles(prev => [...prev, newFile]);
        }
      };
      
      if (isImage) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Function to remove a file from the upload list
  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };
  
  // Modify the existing handleSendMessage to include file information
  const handleSendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    const userMessage = input;
    setInput('');
    
    // Create message text that includes info about the uploaded files
    let messageText = userMessage;
    
    if (uploadedFiles.length > 0) {
      // Add file information to the message
      const fileDescriptions = uploadedFiles.map(file => 
        `[File: ${file.name} (${file.isImage ? 'Image' : file.type})]`
      ).join('\n');
      
      messageText = messageText.trim() ? 
        `${messageText}\n\n${fileDescriptions}` : 
        fileDescriptions;
    }
    
    // Add message with any attached files
    const updatedMessages = [...messages, { 
      text: messageText, 
      isUser: true,
      timestamp: new Date().toISOString(),
      files: [...uploadedFiles]
    }];
    
    setMessages(updatedMessages);
    setIsLoading(true);
    
    // Prepare special prompt for image analysis if needed
    let aiPrompt = userMessage;
    
    if (uploadedFiles.length > 0) {
      const imageFiles = uploadedFiles.filter(file => file.isImage);
      const textFiles = uploadedFiles.filter(file => !file.isImage && file.content);
      
      if (imageFiles.length > 0) {
        aiPrompt += "\n\nI've uploaded " + 
          (imageFiles.length === 1 ? "an image" : `${imageFiles.length} images`) + 
          " for you to analyze.";
      }
      
      if (textFiles.length > 0) {
        // For text files, include content in the prompt
        aiPrompt += "\n\nI've uploaded " + 
          (textFiles.length === 1 ? "a file" : `${textFiles.length} files`) + 
          " with the following content:\n\n";
          
        textFiles.forEach(file => {
          aiPrompt += `--- File: ${file.name} ---\n`;
          // Truncate very large files
          const contentPreview = file.content && file.content.length > 1000 ? 
            file.content.substring(0, 1000) + "... (content truncated)" : 
            file.content;
          aiPrompt += contentPreview + "\n\n";
        });
      }
    }
    
    // Get AI response
    const aiResponse = await generateAIResponse(aiPrompt);
    
    // Add the AI response
    setMessages(prev => [...prev, { 
      text: aiResponse, 
      isUser: false,
      timestamp: new Date().toISOString()
    }]);
    
    if (window.speechSynthesis) {
      speak(aiResponse);
    }
    
    // Clear uploaded files
    setUploadedFiles([]);
    setShowFileUpload(false);
    setIsLoading(false);
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(!isSpeaking);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const toast = document.getElementById('toast');
      if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.text('Chat History Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Add timestamp
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 20;

    // Add messages
    pdf.setFontSize(11);
    messages.forEach((message) => {
      const prefix = message.isUser ? 'You: ' : 'AI: ';
      const timestamp = new Date(message.timestamp).toLocaleString();
      const text = `${prefix}${message.text}`;
      
      // Split text into lines that fit the page width
      const textLines = pdf.splitTextToSize(text, pageWidth - (2 * margin));
      
      // Check if we need a new page
      if (yPosition + (textLines.length * 7) > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      // Add timestamp
      pdf.setFontSize(8);
      pdf.setTextColor(128);
      pdf.text(timestamp, margin, yPosition);
      yPosition += 10;
      
      // Add message text
      pdf.setFontSize(11);
      pdf.setTextColor(0);
      pdf.text(textLines, margin, yPosition);
      yPosition += (textLines.length * 7) + 10;
    });

    // Save the PDF
    pdf.save('chat-history.pdf');
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      setMessages([{
        text: "👋 Hello! I'm your EcoNexus Assistant. I'm here to help you with sustainability and energy management topics. Feel free to ask me anything or share your name so I can address you personally!",
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
      setConversationMemory([]);
      setDetectedUserInfo(null);
      setShowSettings(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!isListening) {
      // Define SpeechRecognition types for TypeScript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          setInput(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
      }
    } else {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="card bg-base-200 shadow-xl h-full flex flex-col overflow-hidden border border-base-300">
      <ChatHeader 
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showVoiceSettings={showVoiceSettings}
        setShowVoiceSettings={setShowVoiceSettings}
        showPromptLibrary={showPromptLibrary}
        setShowPromptLibrary={setShowPromptLibrary}
        showConversationMemory={showMemoryPanel}
        setShowConversationMemory={setShowMemoryPanel}
        showToneSelector={showToneSelector}
        setShowToneSelector={setShowToneSelector}
        isSpeaking={isSpeaking}
        toggleSpeech={toggleSpeech}
        conversationMemory={conversationMemory}
        detectedUserInfo={detectedUserInfo}
        selectedTone={selectedTone}
      />
      
      {detectedUserInfo?.name && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-base-300/50 backdrop-blur-sm px-4 py-2 border-b border-base-300"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="badge badge-primary gap-1">
              <User className="w-3 h-3" /> {detectedUserInfo.name}
            </span>
            {detectedUserInfo.interests && detectedUserInfo.interests.length > 0 && (
              <span className="badge badge-secondary gap-1">
                <Zap className="w-3 h-3" /> {detectedUserInfo.interests.join(', ')}
              </span>
            )}
          </div>
        </motion.div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 py-4 relative" ref={chatContainerRef}>
        <AnimatePresence>
          {showSettings && (
            <SettingsPanel
              onClose={() => setShowSettings(false)}
              darkMode={theme === 'dark'}
              toggleDarkMode={toggleDarkMode}
              clearChat={clearChat}
            />
          )}
          
          {showToneSelector && (
            <ToneSelector
              selectedTone={selectedTone}
              onSelectTone={setSelectedTone}
              onClose={() => setShowToneSelector(false)}
            />
          )}
          
          {showMemoryPanel && (
            <ConversationMemoryPanel
              conversationMemory={conversationMemory}
              setConversationMemory={setConversationMemory}
              onClose={() => setShowMemoryPanel(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Weather widget if available */}
        {weather && (
          <WeatherWidget weather={weather} />
        )}
        
        <AnimatePresence>
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
              files={message.files}
              onCopy={copyToClipboard}
              onSpeak={speak}
            />
          ))}
          {isLoading && <TypingIndicator />}
        </AnimatePresence>
      </div>

      <motion.div 
        className="p-4 bg-base-300/80 backdrop-blur-sm border-t border-base-300"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        {/* File upload preview with enhanced styling */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 bg-base-200 rounded-lg shadow-inner border border-base-300"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} attached
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUploadedFiles([])}
                  className="btn btn-ghost btn-xs"
                >
                  <X className="w-3 h-3 mr-1" /> Clear all
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map(file => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <FileMessage 
                      file={file} 
                      onRemove={() => removeFile(file.id)} 
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Control buttons with enhanced styling */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMemoryPanel(!showMemoryPanel)}
            className={`btn btn-sm gap-1 transition-colors ${showMemoryPanel ? 'btn-primary' : 'btn-outline btn-primary'}`}
            title="View Conversation Memory"
          >
            <Brain className="w-4 h-4" /> Memory
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowToneSelector(!showToneSelector)}
            className={`btn btn-sm gap-1 transition-colors ${showToneSelector ? 'btn-secondary' : 'btn-outline btn-secondary'}`}
            title="Change AI Tone"
          >
            <Zap className="w-4 h-4" /> Tone
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className={`btn btn-sm gap-1 transition-colors ${showSettings ? 'btn-accent' : 'btn-outline btn-accent'}`}
            title="Settings"
          >
            <Settings className="w-4 h-4" /> Settings
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generatePDF}
            className="btn btn-sm btn-outline gap-1"
            title="Download Conversation as PDF"
          >
            <Download className="w-4 h-4" /> PDF
          </motion.button>
        </div>
        
        {/* Message input area with enhanced styling */}
        <div className="join w-full shadow-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="join-item input input-bordered flex-1 bg-base-100/90 backdrop-blur-sm"
            placeholder="Type your message..."
          />
          
          {/* File upload button */}
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            multiple
            accept="image/*,.txt,.pdf,.doc,.docx,.csv,.json"
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="join-item btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Attach files or images"
          >
            <Paperclip className="h-5 w-5" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`join-item btn ${isListening ? 'btn-error' : 'btn-secondary'}`}
            onClick={toggleSpeechRecognition}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            <Mic className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="join-item btn btn-primary"
            disabled={(input.trim() === '' && uploadedFiles.length === 0) || isLoading}
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      <div id="toast" className="toast toast-top toast-center hidden">
        <div className="alert alert-success shadow-lg">
          <span className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copied to clipboard!
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveAIChatbot;
