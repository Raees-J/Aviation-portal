'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Calendar, Clock, Plane, Users } from 'lucide-react';
import { format, addDays, parse } from 'date-fns';

interface Message {
  id: number;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface AvailabilityData {
  date: string;
  availableSlots: { time: string; resources: string[] }[];
  availableInstructors: string[];
  availableAircraft: string[];
}

const INSTRUCTORS = [
  'Peter Erasmus', 'Jondré Kallis', 'Tristan Storkey', 'Jason Rossouw',
  'Sarah Smit', 'Christo Smit', 'Rhyno Louw', 'Bernard Leicher',
  'Emil Wissink', 'Alwyn Vorster', 'Alewyn Burger', 'Charles Peck'
];

const AIRCRAFT = [
  'ZS-OHH (C172 N)', 'ZS-OHI (C172 N)', 'ZS-SLM (C172 P)', 
  'ZS-SMS (C172 R)', 'ZS-KUI (C172RG Cutlass)'
];

const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`);

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'assistant',
      text: "Hi! I'm your flight scheduling assistant. I can help you:\n• Check available time slots\n• Find available instructors or aircraft\n• Create bookings\n• Answer questions about the schedule\n\nJust ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBookingsForDate = (dateStr: string): Record<string, any[]> => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem('aviationBookings');
    if (!stored) return {};
    const allBookings = JSON.parse(stored);
    return allBookings[dateStr] || {};
  };

  const checkAvailability = (dateStr: string, time?: string): AvailabilityData => {
    const bookings = getBookingsForDate(dateStr);
    
    const availableSlots = TIME_SLOTS.map(slot => {
      const availableResources: string[] = [];
      
      // Check aircraft
      AIRCRAFT.forEach(aircraft => {
        const aircraftId = aircraft.split(' ')[0].toLowerCase().replace('-', '');
        const aircraftBookings = bookings[aircraftId] || [];
        const isBooked = aircraftBookings.some(b => b.startTime === slot);
        if (!isBooked) availableResources.push(aircraft);
      });
      
      // Check instructors
      INSTRUCTORS.forEach(instructor => {
        const instructorId = 'inst-' + instructor.split(' ')[0].toLowerCase();
        const instructorBookings = bookings[instructorId] || [];
        const isBooked = instructorBookings.some(b => b.startTime === slot);
        if (!isBooked) availableResources.push(instructor);
      });
      
      return { time: slot, resources: availableResources };
    });

    const availableInstructors = INSTRUCTORS.filter(instructor => {
      const instructorId = 'inst-' + instructor.split(' ')[0].toLowerCase();
      if (!time) return true;
      const instructorBookings = bookings[instructorId] || [];
      return !instructorBookings.some(b => b.startTime === time);
    });

    const availableAircraft = AIRCRAFT.filter(aircraft => {
      const aircraftId = aircraft.split(' ')[0].toLowerCase().replace('-', '');
      if (!time) return true;
      const aircraftBookings = bookings[aircraftId] || [];
      return !aircraftBookings.some(b => b.startTime === time);
    });

    return { date: dateStr, availableSlots, availableInstructors, availableAircraft };
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Get all bookings from localStorage
      const stored = typeof window !== 'undefined' ? localStorage.getItem('aviationBookings') : null;
      const allBookings = stored ? JSON.parse(stored) : {};

      // Call AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.text
          })),
          bookings: allBookings,
          pendingBooking: pendingBooking
        }),
      });

      const data = await response.json();
      
      // If AI created or updated a booking, save it to localStorage
      if (data.booking) {
        const { date, time, aircraft, instructor, type, duration, isUpdate, bookingId: existingBookingId } = data.booking;
        
        console.log('Booking data received:', { date, time, aircraft, instructor, type, duration, isUpdate, needsMoreInfo: data.needsMoreInfo });
        
        // If this is a pending booking that needs more info, don't save to localStorage yet
        // Just store it in state for later completion
        if (data.needsMoreInfo && !isUpdate) {
          console.log('Storing as pending booking (not saved to localStorage yet)');
          setPendingBooking(data.booking);
        } else {
          // Complete booking - save to localStorage
          console.log('Saving complete booking to localStorage');
          
          // Get current bookings
          const stored = typeof window !== 'undefined' ? localStorage.getItem('aviationBookings') : null;
          const allBookings = stored ? JSON.parse(stored) : {};
          
          if (!allBookings[date]) {
            allBookings[date] = {};
          }
          
          const aircraftId = aircraft.split(' ')[0].toLowerCase().replace('-', '');
          if (!allBookings[date][aircraftId]) {
            allBookings[date][aircraftId] = [];
          }
          
          const bookingId = existingBookingId || `booking-${Date.now()}`;
          const bookingData = {
            id: bookingId,
            date,
            startTime: time,
            duration: duration || 2,
            pilot: 'AI Booking',
            instructor: instructor || 'TBD',
            bookingType: type || 'Training',
            aircraft,
            title: `${type || 'Training'} - AI Booking`
          };
          
          console.log('Creating booking:', bookingData);
          
          if (isUpdate && existingBookingId) {
            // Update existing pending booking (first time saving to localStorage)
            console.log('Update mode: saving pending booking to localStorage');
            allBookings[date][aircraftId].push(bookingData);
            
            // Add instructor booking if specified
            if (instructor && instructor !== 'None' && instructor !== 'TBD') {
              const instructorId = 'inst-' + instructor.split(' ')[0].toLowerCase();
              if (!allBookings[date][instructorId]) {
                allBookings[date][instructorId] = [];
              }
              allBookings[date][instructorId].push({
                ...bookingData,
                id: `${bookingId}-inst`
              });
              console.log('Added instructor booking for:', instructorId);
            }
            
            setPendingBooking(null);
          } else if (!data.needsMoreInfo) {
            // Complete booking from the start - save immediately
            console.log('Complete booking mode: saving directly');
            allBookings[date][aircraftId].push(bookingData);
            
            // If instructor specified, book for instructor too
            if (instructor && instructor !== 'None' && instructor !== 'TBD') {
              const instructorId = 'inst-' + instructor.split(' ')[0].toLowerCase();
              if (!allBookings[date][instructorId]) {
                allBookings[date][instructorId] = [];
              }
              allBookings[date][instructorId].push({
                ...bookingData,
                id: `${bookingId}-inst`
              });
              console.log('Added instructor booking for:', instructorId);
            }
            
            setPendingBooking(null);
          }
          
          // Save to localStorage
          console.log('Saving to localStorage:', allBookings);
          localStorage.setItem('aviationBookings', JSON.stringify(allBookings));
          
          // Dispatch custom event to update scheduler
          console.log('Dispatching bookingCreated event');
          window.dispatchEvent(new CustomEvent('bookingCreated', { detail: bookingData }));
        }
      } else if (data.clearPending) {
        setPendingBooking(null);
      }
      
      const assistantMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        text: data.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        type: 'assistant',
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-stelfly-navy text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Ask me anything!
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-stelfly-navy text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stelfly-gold rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-stelfly-navy" />
              </div>
              <div>
                <h3 className="font-bold">Flight Assistant</h3>
                <p className="text-xs text-gray-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-2 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-stelfly-gold rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-stelfly-navy" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-stelfly-navy text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                    {format(message.timestamp, 'HH:mm')}
                  </p>
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 bg-stelfly-gold rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-stelfly-navy" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about availability, bookings..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-stelfly-navy text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-10 h-10 bg-stelfly-navy text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
