import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

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

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function getBookingsForDate(dateStr: string, allBookings: any): Record<string, any[]> {
  return allBookings[dateStr] || {};
}

function checkInstructorAvailability(instructor: string, date: string, time: string, allBookings: any): boolean {
  const instructorId = 'inst-' + instructor.split(' ')[0].toLowerCase();
  const bookings = getBookingsForDate(date, allBookings);
  const instructorBookings = bookings[instructorId] || [];
  return !instructorBookings.some((b: any) => b.startTime === time);
}

function checkAircraftAvailability(aircraft: string, date: string, time: string, allBookings: any): boolean {
  const aircraftId = aircraft.split(' ')[0].toLowerCase().replace('-', '');
  const bookings = getBookingsForDate(date, allBookings);
  const aircraftBookings = bookings[aircraftId] || [];
  return !aircraftBookings.some((b: any) => b.startTime === time);
}

function buildContextData(allBookings: any): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  let context = '\n\n=== CURRENT BOOKING DATA ===\n';
  context += 'IMPORTANT: Check this data carefully before confirming availability!\n';
  context += 'A booking blocks the start time AND all hours within its duration.\n';
  context += 'Example: A 2-hour booking at 08:00 means 08:00 and 09:00 are BOTH UNAVAILABLE.\n\n';
  
  // Today's bookings with details
  const todayBookings = allBookings[today] || {};
  context += `TODAY (${today}) - BOOKED SLOTS:\n`;
  let hasTodayBookings = false;
  Object.keys(todayBookings).forEach(resourceId => {
    const bookings = todayBookings[resourceId];
    if (bookings.length > 0) {
      hasTodayBookings = true;
      const resourceName = getResourceName(resourceId);
      context += `\n${resourceName}:\n`;
      bookings.forEach((b: any) => {
        const endHour = parseInt(b.startTime.split(':')[0]) + (b.duration || 1);
        const endTime = `${endHour.toString().padStart(2, '0')}:00`;
        context += `  ❌ BOOKED: ${b.startTime} - ${endTime} (${b.duration}h) - ${b.title || 'Booking'}\n`;
        context += `     ID: ${b.id} | Instructor: ${b.instructor || 'TBD'} | Type: ${b.bookingType || b.type || 'N/A'}\n`;
        context += `     (This blocks: ${b.startTime}`;
        for (let i = 1; i < b.duration; i++) {
          const blockedHour = parseInt(b.startTime.split(':')[0]) + i;
          context += `, ${blockedHour.toString().padStart(2, '0')}:00`;
        }
        context += `)\n`;
      });
    }
  });
  if (!hasTodayBookings) {
    context += 'No bookings today - all slots available!\n';
  }
  
  // Tomorrow's bookings with details
  const tomorrowBookings = allBookings[tomorrowStr] || {};
  context += `\nTOMORROW (${tomorrowStr}) - BOOKED SLOTS:\n`;
  let hasTomorrowBookings = false;
  Object.keys(tomorrowBookings).forEach(resourceId => {
    const bookings = tomorrowBookings[resourceId];
    if (bookings.length > 0) {
      hasTomorrowBookings = true;
      const resourceName = getResourceName(resourceId);
      context += `\n${resourceName}:\n`;
      bookings.forEach((b: any) => {
        const endHour = parseInt(b.startTime.split(':')[0]) + (b.duration || 1);
        const endTime = `${endHour.toString().padStart(2, '0')}:00`;
        context += `  ❌ BOOKED: ${b.startTime} - ${endTime} (${b.duration}h) - ${b.title || 'Booking'}\n`;
        context += `     ID: ${b.id} | Instructor: ${b.instructor || 'TBD'} | Type: ${b.bookingType || b.type || 'N/A'}\n`;
        context += `     (This blocks: ${b.startTime}`;
        for (let i = 1; i < b.duration; i++) {
          const blockedHour = parseInt(b.startTime.split(':')[0]) + i;
          context += `, ${blockedHour.toString().padStart(2, '0')}:00`;
        }
        context += `)\n`;
      });
    }
  });
  if (!hasTomorrowBookings) {
    context += 'No bookings tomorrow - all slots available!\n';
  }
  
  return context;
}

function getResourceName(resourceId: string): string {
  // Convert resource IDs to readable names
  if (resourceId.startsWith('inst-')) {
    const name = resourceId.replace('inst-', '');
    return `Instructor: ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  }
  // Aircraft IDs (e.g., zsohh -> ZS-OHH)
  const aircraftMap: Record<string, string> = {
    'zsohh': 'ZS-OHH (C172 N)',
    'zsohi': 'ZS-OHI (C172 N)',
    'zsslm': 'ZS-SLM (C172 P)',
    'zssms': 'ZS-SMS (C172 R)',
    'zskui': 'ZS-KUI (C172RG Cutlass)'
  };
  return `Aircraft: ${aircraftMap[resourceId] || resourceId}`;
}

async function generateAIResponse(messages: ChatMessage[], allBookings: any, pendingBooking?: any): Promise<string> {
  const contextData = buildContextData(allBookings);
  
  let pendingBookingContext = '';
  if (pendingBooking) {
    pendingBookingContext = `\n\n⚠️ PENDING BOOKING (needs more details):
- Booking ID: ${pendingBooking.bookingId}
- Date: ${pendingBooking.date}
- Time: ${pendingBooking.time}
- Aircraft: ${pendingBooking.aircraft || 'Not specified'}
- Instructor: ${pendingBooking.instructor || 'Not specified'}
- Type: ${pendingBooking.type || 'Not specified'}
- Duration: ${pendingBooking.duration || 'Not specified'}

If the user provides additional details (instructor, type, duration), UPDATE this booking by including the bookingId in your response.
`;
  }
  
  const systemPrompt = `You are an intelligent flight scheduling assistant for Stellenbosch Flying Club ONLY. 

CRITICAL RULES:
1. ONLY answer questions related to:
   - Flight scheduling and bookings
   - Aircraft availability
   - Instructor availability  
   - Flight training at Stellenbosch Flying Club
   - Aviation topics related to our operations
   
2. If asked about ANYTHING else (politics, general knowledge, other companies, personal advice, etc.), respond with:
   "I'm specifically designed to help with Stellenbosch Flying Club scheduling and flight operations. Please ask me about instructor availability, aircraft bookings, or flight scheduling."

3. NEVER make up information - only use the data provided below.

4. ⚠️ CRITICAL AVAILABILITY RULE ⚠️
   BEFORE saying someone or something is available, you MUST check the booking data below!
   - If a resource shows "❌ BOOKED" at a time, it is NOT available
   - A booking blocks ALL hours in its duration (e.g., 08:00-10:00 means 08:00 AND 09:00 are blocked)
   - ONLY times NOT listed in the booking data are available
   - If you're not 100% certain, say "Let me check the schedule" and verify the booking data

5. ⚠️ BOOKING UPDATE RULE ⚠️
   If there's a PENDING BOOKING and the user provides more details:
   - DO NOT create a new booking
   - UPDATE the existing booking with the bookingId
   - Include "isUpdate": true in the JSON
   - Keep the same bookingId

6. ⚠️ BOOKING MODIFICATION RULE ⚠️
   If user wants to CHANGE/MODIFY an existing booking (e.g., "change instructor to X", "switch to Peter"):
   - Look up the existing booking in the booking data
   - Find the booking ID from the context
   - Return an UPDATE with the modified field(s)
   - Include "isUpdate": true and the found bookingId
   - Keep all other fields the same
   
   Example: If ZS-OHI is booked at 15:00 and user says "change instructor to Peter"
   - Find the ZS-OHI 15:00 booking in the data
   - Get its bookingId
   - Return UPDATE with new instructor but same date/time/aircraft/type/duration

COMPANY INFORMATION:
- Name: Stellenbosch Flying Club
- Location: Stellenbosch, South Africa (FASH)
- Operating hours: 07:00 - 19:00 daily
- Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

AVAILABLE INSTRUCTORS:
${INSTRUCTORS.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

AVAILABLE AIRCRAFT:
${AIRCRAFT.map((a, idx) => `${idx + 1}. ${a}`).join('\n')}

${contextData}${pendingBookingContext}

RESPONSE STYLE:
- ALWAYS check the booking data above before confirming availability
- Give DIRECT answers first (Yes/No for availability questions)
- Be conversational and helpful
- Suggest next steps or alternatives if a slot is booked
- Use emojis sparingly for clarity (✓ ✈️ 🎯)

BOOKING REQUESTS:
When creating a NEW booking with ALL details, respond with:
BOOKING_REQUEST:{
  "date": "2026-01-10",
  "time": "09:00",
  "aircraft": "ZS-OHH",
  "instructor": "Peter Erasmus",
  "type": "Training",
  "duration": 2,
  "bookingId": "booking-xyz"
}

When UPDATING a pending booking, include the existing bookingId and isUpdate flag:
BOOKING_REQUEST:{
  "date": "2026-01-10",
  "time": "09:00",
  "aircraft": "ZS-OHH",
  "instructor": "Tristan Storkey",
  "type": "Training",
  "duration": 2,
  "bookingId": "booking-xyz",
  "isUpdate": true
}

When MODIFYING an existing booking (user wants to change instructor/type/duration):
- Find the booking in the booking data by date/time/aircraft
- Extract the booking details including its ID
- Return UPDATE with changed field(s)
Example: "change instructor to Peter" when ZS-OHI is booked at 15:00:
BOOKING_REQUEST:{
  "date": "2026-01-12",
  "time": "15:00",
  "aircraft": "ZS-OHI",
  "instructor": "Peter Erasmus",
  "type": "Training",
  "duration": 2,
  "bookingId": "found-from-booking-data",
  "isUpdate": true
}

When you need to create a placeholder booking (missing instructor/type), create it and add NEEDS_MORE_INFO:
BOOKING_REQUEST:{"date":"2026-01-10","time":"09:00","aircraft":"ZS-OHH","instructor":"TBD","type":"Training","duration":2,"bookingId":"booking-xyz"}
NEEDS_MORE_INFO

If user cancels or you need to clear pending booking, add: CLEAR_PENDING

Example conversation flow:
User: "Book me a flight today at 15:00 with ZS-OHI"
You: "BOOKING_REQUEST:{"date":"2026-01-12","time":"15:00","aircraft":"ZS-OHI","bookingId":"booking-123"}
NEEDS_MORE_INFO

I've created your flight for today at 15:00 with ZS-OHI. Please let me know which instructor you'd like to assign to this booking, and what type of flight this is (e.g. training, rental)."

User: "with Tristan Storkey for training"
You: "BOOKING_REQUEST:{"date":"2026-01-12","time":"15:00","aircraft":"ZS-OHI","instructor":"Tristan Storkey","type":"Training","duration":2,"bookingId":"booking-123","isUpdate":true}

Perfect! I've updated your booking with Tristan Storkey for training. All set for 15:00 today! ✈️"

MODIFICATION conversation flow:
User: "I want to change the instructor to Peter"
You: (Look at booking data, find the relevant booking based on context, extract its ID and details)
"BOOKING_REQUEST:{"date":"2026-01-12","time":"15:00","aircraft":"ZS-OHI","instructor":"Peter Erasmus","type":"Training","duration":2,"bookingId":"booking-123","isUpdate":true}

Done! I've updated your booking - Peter Erasmus will be your instructor instead. ✓"`;

  const userMessage = messages[messages.length - 1].content;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || 'I apologize, I encountered an error. Please try again.';
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, bookings, pendingBooking } = await request.json();
    
    const response = await generateAIResponse(messages, bookings || {}, pendingBooking);
    
    // Check if response contains a booking request
    let bookingData = null;
    let needsMoreInfo = false;
    let isUpdate = false;
    let clearPending = false;
    
    if (response.includes('BOOKING_REQUEST:')) {
      const jsonMatch = response.match(/BOOKING_REQUEST:(\{[^}]+\})/);
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[1]);
          bookingData = parsedData;
          
          // Check if this is an update to pending booking
          if (pendingBooking && parsedData.bookingId === pendingBooking.bookingId) {
            isUpdate = true;
            bookingData.isUpdate = true;
          }
        } catch (e) {
          console.error('Failed to parse booking data:', e);
        }
      }
    }
    
    if (response.includes('NEEDS_MORE_INFO')) {
      needsMoreInfo = true;
    }
    
    if (response.includes('CLEAR_PENDING')) {
      clearPending = true;
    }
    
    return NextResponse.json({ 
      message: response.replace(/BOOKING_REQUEST:\{[^}]+\}/, '').replace(/NEEDS_MORE_INFO/, '').replace(/CLEAR_PENDING/, '').trim(),
      booking: bookingData,
      needsMoreInfo,
      clearPending
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
