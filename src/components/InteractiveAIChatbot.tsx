import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Send, Mic, Sun, Volume2, Bot, User, Download, Copy, Moon, Eraser } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import jsPDF from 'jspdf';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';

const API_KEY = 'AIzaSyD8ycFuFWs7xEkTwGv7JIx__4j9ISAZJcg';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const WEATHER_API_KEY = '38bbd278ec684e78921132440240308';
const WEATHER_API_URL = 'http://api.weatherapi.com/v1/current.json';

const ChatMessage = ({ message, isUser, timestamp, onCopy }) => {
  const messageRef = useRef(null);

  useEffect(() => {
    if (messageRef.current) {
      Prism.highlightAllUnder(messageRef.current);
    }
  }, [message]);

  const sanitizedHtml = DOMPurify.sanitize(marked(message));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`chat ${isUser ? 'chat-end' : 'chat-start'} group mb-4`}
    >
      <div className="chat-image avatar">
        <motion.div 
          whileHover={{ scale: 1.1 }}
          className="w-10 rounded-full bg-gradient-to-r from-primary to-secondary"
        >
          {isUser ? 
            <User className="p-2 text-white" /> : 
            <Bot className="p-2 text-white" />
          }
        </motion.div>
      </div>
      <motion.div 
        ref={messageRef}
        className={`chat-bubble prose max-w-prose relative group ${
          isUser ? 'chat-bubble-primary' : 'chat-bubble-secondary'
        }`}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
      <div className="chat-footer opacity-50 text-xs flex items-center gap-2">
        {new Date(timestamp).toLocaleTimeString()}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onCopy(message)}
          className="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Copy className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const WeatherWidget = ({ weather }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card bg-gradient-to-r from-primary to-secondary text-primary-content mb-4"
  >
    <motion.div 
      className="card-body py-2"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Sun className="h-6 w-6" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{weather.current.temp_c}°C</span>
            <span className="text-xs opacity-80">{weather.current.condition.text}</span>
          </div>
        </div>
        <span className="text-sm font-semibold">{weather.location.name}</span>
      </div>
    </motion.div>
  </motion.div>
);

const InteractiveAIChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [theme, setTheme] = useState('dark');
  const chatContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    getCurrentWeather();
    document.documentElement.setAttribute('data-theme', theme);
    Prism.highlightAll();

    if (messages.length === 0) {
      setMessages([{
        text: "👋 Hello! I'm your AI assistant. How can I help you today?",
        isUser: false,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [theme]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getCurrentWeather = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
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

  const generateAIResponse = async (userInput) => {
    try {
      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: userInput }]
          }],
          generationConfig: {
            temperature: 0.7,
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

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { 
      text: userMessage, 
      isUser: true,
      timestamp: new Date().toISOString()
    }]);
    setIsLoading(true);

    const aiResponse = await generateAIResponse(userMessage);
    setMessages(prev => [...prev, { 
      text: aiResponse, 
      isUser: false,
      timestamp: new Date().toISOString()
    }]);
    
    if (window.speechSynthesis) {
      speak(aiResponse);
    }
    
    setIsLoading(false);
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      const toast = document.getElementById('toast');
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2000);
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
    setMessages([{
      text: "Chat cleared! How else can I help you?",
      isUser: false,
      timestamp: new Date().toISOString()
    }]);
  };

  const toggleSpeechRecognition = () => {
    if (!isListening) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          setInput(transcript);
        };

        recognition.onerror = (event) => {
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

  return (
    <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto bg-base-200 rounded-xl shadow-2xl overflow-hidden">
      <div className="navbar bg-base-300 px-4">
        <div className="flex-1">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="btn btn-ghost text-xl normal-case"
          >
            AI Assistant
          </motion.button>
        </div>
        <div className="flex-none gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="btn btn-ghost btn-circle"
            onClick={generatePDF}
            title="Download chat history"
          >
            <Download className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="btn btn-ghost btn-circle"
            onClick={clearChat}
          >
            <Eraser className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="btn btn-ghost btn-circle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </motion.button>
        </div>
      </div>

      {weather && <WeatherWidget weather={weather} />}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
              onCopy={copyToClipboard}
            />
          ))}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="flex justify-start"
            >
              <div className="chat-bubble bg-base-300">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        className="p-4 bg-base-300"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <div className="join w-full gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="join-item input input-bordered flex-1"
            placeholder="Type your message..."
          />
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`join-item btn ${isListening ? 'btn-error' : 'btn-secondary'}`}
            onClick={toggleSpeechRecognition}
          >
            <Mic className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className="join-item btn btn-primary"
          >
            <Send className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      <div id="toast" className="toast toast-top toast-center hidden">
        <div className="alert alert-success">
          <span>Copied to clipboard!</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveAIChatbot;
