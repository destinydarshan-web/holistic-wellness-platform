"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Navigation } from "@/components/navigation";
import { MessageCircle, Clock, User, Send, DollarSign, Star, Phone, Video, Users, CheckCircle } from "lucide-react";

interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender_name?: string;
  sender_role?: 'user' | 'expert';
}

interface SessionInfo {
  id: string;
  user_id: string;
  expert_id: string;
  status: string;
  session_type: string;
  created_at: string;
  user_name?: string;
  expert_name?: string;
  price_per_minute?: number;
}

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [isExpert, setIsExpert] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [messageSending, setMessageSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerStarted) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerStarted]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate session cost
  useEffect(() => {
    if (timerStarted && sessionInfo?.price_per_minute) {
      const minutes = Math.ceil(elapsedTime / 60);
      setSessionCost(minutes * sessionInfo.price_per_minute);
    }
  }, [elapsedTime, timerStarted, sessionInfo]);

  // Fetch session info
  useEffect(() => {
    if (!sessionId) return;

    const fetchSessionInfo = async () => {
      // First fetch session info
      const { data: sessionData, error: sessionError } = await supabase
        .from("live_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError || !sessionData) {
        console.error('Session fetch error:', sessionError);
        return;
      }

      setSessionInfo(sessionData);
      setIsExpert(user?.id === sessionData.expert_id);

      // Fetch participant info separately
      if (user?.id === sessionData.user_id) {
        // Fetch expert info for user
        const { data: expertData } = await supabase
          .from("expert_astrologers")
          .select("display_name, price_per_minute")
          .eq("id", sessionData.expert_id)
          .single();
        
        setOtherParticipant(expertData);
        // Update sessionInfo with price_per_minute
        setSessionInfo(prev => prev ? { ...prev, price_per_minute: expertData?.price_per_minute } : null);
      } else {
        // Fetch user info for expert
        const { data: userData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", sessionData.user_id)
          .single();
        
        setOtherParticipant(userData);
      }
    };

    fetchSessionInfo();
  }, [sessionId, user]);

  // Fetch existing messages
  useEffect(() => {
    if (!sessionId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (data && !error) {
        setMessages(data);
        
        // Check if timer should be started (first message sent)
        const firstUserMessage = data.find(msg => msg.sender_id === sessionInfo?.user_id);
        if (firstUserMessage && !timerStarted) {
          setTimerStarted(true);
          const messageTime = new Date(firstUserMessage.created_at).getTime();
          const currentTime = Date.now();
          setElapsedTime(Math.floor((currentTime - messageTime) / 1000));
        }
      }
    };

    fetchMessages();
  }, [sessionId, sessionInfo]);

  // Realtime subscription for messages and typing indicators
  useEffect(() => {
    if (!sessionId) return;

    console.log('Setting up realtime subscription for session:', sessionId);

    // Messages channel
    const messageChannel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Realtime message received:', payload);
          const newMsg = payload.new as Message;
          
          setMessages((prev) => {
            console.log('Adding message to state:', newMsg);
            return [...prev, newMsg];
          });
          
          // Start timer on first user message
          if (!timerStarted && newMsg.sender_id === sessionInfo?.user_id) {
            console.log('Starting timer on first user message');
            setTimerStarted(true);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Typing indicators channel
    const typingChannel = supabase
      .channel(`typing-${sessionId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, isTyping: typing } = payload.payload as { user_id: string, isTyping: boolean };
        
        // Only show typing indicator for the other user, not yourself
        if (user_id !== user?.id) {
          setOtherUserTyping(typing);
        }
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [sessionId, timerStarted, sessionInfo, user?.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    console.log('=== DEBUG: sendMessage called ===');
    console.log('newMessage:', newMessage);
    console.log('user:', user);
    console.log('sessionId:', sessionId);
    console.log('messageSending:', messageSending);
    
    if (!newMessage.trim() || !user?.id || messageSending) {
      console.log('=== DEBUG: Early return - missing message, user, or already sending ===');
      return;
    }

    setMessageSending(true);
    const messageContent = newMessage.trim();
    setNewMessage("");

    const messageData = {
      session_id: sessionId,
      sender_id: user.id,
      content: messageContent
    };

    console.log('=== DEBUG: messageData to insert ===', messageData);

    try {
      console.log('=== DEBUG: Attempting database insert ===');
      const { data, error } = await supabase
        .from("messages")
        .insert(messageData);

      console.log('=== DEBUG: Insert result ===', { data, error });

      if (error) {
        console.error("Insert error:", error);
        alert('Failed to send message: ' + error.message);
        setNewMessage(messageContent); // Restore message on error
      } else {
        console.log('=== DEBUG: Message sent successfully ===');
      }
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message. Please try again.');
      setNewMessage(messageContent); // Restore message on error
    } finally {
      console.log('=== DEBUG: Setting messageSending to false ===');
      setMessageSending(false);
    }
  };

  // Handle typing indicators
  const handleTypingStart = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Broadcast typing status
      supabase.channel(`typing-${sessionId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user?.id, isTyping: true }
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      supabase.channel(`typing-${sessionId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user?.id, isTyping: false }
      });
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      handleTypingStart();
    }
  };

  const endSession = async () => {
    setShowEndConfirmation(true);
  };

  const confirmEndSession = async () => {
    try {
      // Calculate final cost
      const finalMinutes = timerStarted ? Math.ceil(elapsedTime / 60) : 0;
      const finalCost = sessionInfo?.price_per_minute ? finalMinutes * sessionInfo.price_per_minute : 0;
      
      console.log('=== DEBUG: Ending Session ===');
      console.log('Final minutes:', finalMinutes);
      console.log('Final cost:', finalCost);
      console.log('Session info:', sessionInfo);

      // Update session status to completed
      const { data: sessionUpdateData, error: sessionError } = await supabase
        .from("live_sessions")
        .update({ 
          status: 'completed'
        })
        .eq("id", sessionId)
        .select();

      console.log('=== DEBUG: Session update result ===', { sessionUpdateData, sessionError });

      if (sessionError) {
        console.error('Error updating session:', sessionError);
        alert('Failed to end session: ' + sessionError.message);
        return;
      }

      // If there's a cost to process, handle wallet transactions (simplified for now)
      if (finalCost > 0 && sessionInfo?.price_per_minute) {
        console.log('=== DEBUG: Processing wallet transactions ===');
        console.log('Final cost to process:', finalCost);
        
        // TODO: Implement wallet transactions when tables/functions are ready
        // For now, just log the cost that should be processed
        console.log('=== DEBUG: Wallet transactions skipped (tables/functions not ready) ===');
        console.log('Amount to deduct from user:', finalCost);
        console.log('Amount to credit to astrologer:', finalCost);
      }

      console.log('=== DEBUG: Session ended successfully ===');
      
      // Redirect both users
      router.push(isExpert ? "/expert-dashboard" : "/astrology");
      
    } catch (error) {
      console.error('=== DEBUG: Error ending session ===', error);
      alert('Failed to end session: ' + (error as Error).message);
    }
  };

  const cancelEndSession = () => {
    setShowEndConfirmation(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-white">Unauthorized</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <Navigation />
      
      {/* Chat Header */}
      <div className="bg-[#1e293b] border-b border-white/10 px-4 lg:px-6 py-4 mt-16 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-black" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {isExpert ? 'Consultation Session' : otherParticipant?.display_name || 'Expert'}
                </h2>
                <p className="text-sm text-white/60">
                  {isExpert ? 'User' : 'Expert Astrologer'} • {sessionInfo?.session_type || 'Chat'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Timer and Cost */}
          <div className="flex items-center gap-6">
            {timerStarted && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <span className="text-white font-mono">{formatTime(elapsedTime)}</span>
                </div>
                {sessionInfo?.price_per_minute && (
                  <div className="flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-lg border border-green-500/30">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">₹{sessionCost}</span>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={endSession}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/60">
                {isExpert ? 'Waiting for user to start the conversation...' : 'Start the conversation by sending a message'}
              </p>
              {!isExpert && (
                <p className="text-white/40 text-sm mt-2">
                  The timer will start when you send your first message
                </p>
              )}
            </div>
          )}
          
          {messages.map((msg, index) => {
            const isOwnMessage = msg.sender_id === user?.id;
            const displayName = isOwnMessage 
              ? 'You' 
              : (isExpert ? 'User' : otherParticipant?.display_name || otherParticipant?.full_name || 'Expert');
            
            return (
              <div
                key={msg.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`max-w-lg lg:max-w-xl ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    isOwnMessage 
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/20' 
                      : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm'
                  }`}>
                    <p className="text-sm font-medium mb-1 opacity-90">
                      {displayName}
                    </p>
                    <p className="break-words leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-1 ${isOwnMessage ? 'text-black/70' : 'text-white/60'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {otherUserTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="max-w-lg lg:max-w-xl order-1">
                <div className="px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-white/10 px-4 lg:px-6 py-4 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isExpert ? "Type your response..." : "Type your message..."}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 resize-none transition-all duration-200 pr-12"
                rows={1}
                disabled={messageSending}
              />
              {messageSending && (
                <div className="absolute right-3 bottom-3">
                  <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || messageSending}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-[1.05] active:scale-[0.95]"
            >
              {messageSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
          
          {!timerStarted && !isExpert && (
            <p className="text-white/40 text-sm mt-2 text-center animate-pulse">
              💡 Send your first message to start the consultation timer
            </p>
          )}
          
          {otherUserTyping && (
            <p className="text-yellow-400 text-sm mt-2 text-center animate-fadeIn">
              {isExpert ? 'User is typing...' : 'Astrologer is typing...'}
            </p>
          )}
        </div>
      </div>

      {/* End Session Confirmation Dialog */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">End Session</h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-white/80">
                Are you sure you want to end this consultation session?
              </p>
              
              {timerStarted && sessionInfo?.price_per_minute && (
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/80 text-sm mb-2">Session Summary:</p>
                  <div className="flex justify-between text-white">
                    <span>Duration:</span>
                    <span>{Math.ceil(elapsedTime / 60)} minutes</span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Rate:</span>
                    <span>₹{sessionInfo.price_per_minute}/min</span>
                  </div>
                  <div className="flex justify-between text-yellow-400 font-semibold pt-2 border-t border-white/20">
                    <span>Total Cost:</span>
                    <span>₹{Math.ceil(elapsedTime / 60) * sessionInfo.price_per_minute}</span>
                  </div>
                </div>
              )}
              
              <p className="text-white/60 text-sm">
                This action will end the session for both participants and process any payments.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelEndSession}
                className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmEndSession}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
