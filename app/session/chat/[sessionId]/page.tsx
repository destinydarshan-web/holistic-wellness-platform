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
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

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
  const [showEndConfirmation, setShowEndConfirmation] = useState(false)
  const [isEndingSession, setIsEndingSession] = useState(false);
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
        const { data: expertData, error: expertError } = await supabase
          .from("expert_astrologers")
          .select("display_name, price_per_minute")
          .eq("id", sessionData.expert_id)
          .maybeSingle();
        
        if (expertError) {
          console.error('Error fetching expert profile:', expertError);
          setOtherParticipant({ display_name: 'Expert', price_per_minute: 299 }); // Fallback
        } else {
          setOtherParticipant(expertData);
          // Update sessionInfo with price_per_minute
          setSessionInfo(prev => prev ? { ...prev, price_per_minute: expertData?.price_per_minute } : null);
        }
      } else {
        // Fetch user info for expert
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", sessionData.user_id)
          .maybeSingle();
        
        if (userError) {
          console.error('Error fetching user profile:', userError);
          setOtherParticipant({ full_name: 'User' }); // Fallback
        } else {
          setOtherParticipant(userData);
        }
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

  // Realtime subscription for messages, typing indicators, and session status
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

    // Session status channel - Listen for session completion
    const sessionStatusChannel = supabase
      .channel(`session-status-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_sessions",
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session status update received:', payload);
          
          // If session was completed by either participant, redirect both users
          if (payload.new?.status === 'completed') {
            console.log('Session completed detected, redirecting both participants');
            alert('Session has been ended by the other participant.');
            
            // Redirect both user and expert to appropriate dashboards
            setTimeout(() => {
              router.push(isExpert ? "/expert-dashboard" : "/dashboard");
            }, 2000);
          }
        }
      )
      .subscribe((status) => {
        console.log('Session status subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscriptions');
      if (messageChannel) supabase.removeChannel(messageChannel);
      if (typingChannel) supabase.removeChannel(typingChannel);
      if (sessionStatusChannel) supabase.removeChannel(sessionStatusChannel);
    };
  }, [sessionId, timerStarted, sessionInfo, user?.id]);

  // Auto-focus message input for both users and experts
  useEffect(() => {
    console.log('=== DEBUG: Auto-focus effect triggered ===');
    console.log('=== DEBUG: isExpert:', isExpert);
    console.log('=== DEBUG: messageInputRef.current:', messageInputRef.current);
    
    // Focus for both users and experts
    if (messageInputRef.current) {
      console.log('=== DEBUG: Attempting auto-focus ===');
      
      // Strategy 1: Immediate focus
      messageInputRef.current.focus();
      messageInputRef.current.setSelectionRange(messageInputRef.current.value.length, messageInputRef.current.value.length);
      
      // Strategy 2: Delayed focus with multiple attempts
      const focusAttempts = [100, 300, 600, 1000]; // Multiple delays
      focusAttempts.forEach((delay, index) => {
        setTimeout(() => {
          if (messageInputRef.current && document.activeElement !== messageInputRef.current) {
            console.log(`=== DEBUG: Focus attempt ${index + 1} at ${delay}ms ===`);
            messageInputRef.current.focus();
            messageInputRef.current.setSelectionRange(messageInputRef.current.value.length, messageInputRef.current.value.length);
          }
        }, delay);
      });
      
      // Strategy 3: Click simulation
      setTimeout(() => {
        if (messageInputRef.current && document.activeElement !== messageInputRef.current) {
          console.log('=== DEBUG: Simulating click event ===');
          messageInputRef.current.click();
        }
      }, 1500);
    }
  }, [isExpert, messages]); // Also trigger when messages change

  // Enhanced click focus with immediate focus and debugging
  const handleInputFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    console.log('=== DEBUG: handleInputFocus called ===');
    console.log('=== DEBUG: Active element before focus:', document.activeElement);
    
    if (messageInputRef.current) {
      messageInputRef.current.focus();
      // Move cursor to end of any existing text
      const currentValue = messageInputRef.current.value;
      messageInputRef.current.setSelectionRange(currentValue.length, currentValue.length);
      
      console.log('=== DEBUG: Active element after focus:', document.activeElement);
      console.log('=== DEBUG: Input value:', currentValue);
    }
  };

  // Additional click handler for backup focus
  const handleInputClick = () => {
    console.log('=== DEBUG: handleInputClick called ===');
    if (messageInputRef.current) {
      messageInputRef.current.focus();
      const currentValue = messageInputRef.current.value;
      messageInputRef.current.setSelectionRange(currentValue.length, currentValue.length);
    }
  };

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
      console.log('=== DEBUG: Message data ===', messageData);
      
      // Add timeout to prevent hanging using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout

      const { data, error } = await supabase
        .from("messages")
        .insert(messageData)
        .abortSignal(controller.signal);

      // Clear timeout if successful
      clearTimeout(timeoutId);

      console.log('=== DEBUG: Insert result ===', { data, error });

      if (error) {
        if (error.name === 'AbortError') {
          console.error('Insert timeout - possible RLS policy issue');
          alert('Message sending timed out. Please check your connection and try again.');
        } else {
          console.error("Insert error:", error);
          alert('Failed to send message: ' + error.message);
        }
        setNewMessage(messageContent); // Restore message on error
        setMessageSending(false);
        return;
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
      setIsEndingSession(true)
      setShowEndConfirmation(false)
      
      console.log('=== DEBUG: Ending Session ===');
      console.log('=== DEBUG: Session info ===', sessionInfo);
      console.log('=== DEBUG: User role ===', isExpert ? 'Expert' : 'User');

      // Calculate final cost
      const finalMinutes = timerStarted ? Math.ceil(elapsedTime / 60) : 0;
      const pricePerMinute = sessionInfo?.price_per_minute || 29; // fallback to default price
      const finalCost = pricePerMinute ? finalMinutes * pricePerMinute : 0;
      console.log('Final minutes:', finalMinutes);
      console.log('Price per minute:', pricePerMinute);
      console.log('Final cost:', finalCost);
      console.log('Session info structure:', {
        sessionInfo,
        price_per_minute: sessionInfo?.price_per_minute,
        session_keys: Object.keys(sessionInfo || {})
      });

      // Step 1: Update session status to completed with end time
      console.log('=== DEBUG: Step 1 - Updating session status ===');
      console.log('=== DEBUG: Session ID ===', sessionId);
      console.log('=== DEBUG: Update data ===', { 
        status: 'completed',
        ended_at: new Date().toISOString()
      });
      
      try {
        // Add timeout to prevent hanging
        const sessionUpdatePromise = supabase
          .from("live_sessions")
          .update({ 
            status: 'completed',
            ended_at: new Date().toISOString()
          })
          .eq("id", sessionId)
          .select();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session update timeout')), 10000);
        });

        const { data: sessionUpdateData, error: sessionError } = await Promise.race([
          sessionUpdatePromise,
          timeoutPromise
        ]) as any;

        console.log('=== DEBUG: Session update result ===', { sessionUpdateData, sessionError });

        if (sessionError) {
          console.error('=== DEBUG: Error updating session ===', sessionError);
          console.error('=== DEBUG: Session error details ===', {
            message: sessionError.message,
            details: sessionError.details,
            hint: sessionError.hint,
            code: sessionError.code
          });
          alert('Failed to end session: ' + sessionError.message);
          return;
        }

        if (!sessionUpdateData || sessionUpdateData.length === 0) {
          console.error('=== DEBUG: No session data returned from update ===');
          alert('Failed to end session: Session not found or already completed');
          return;
        }

        console.log('=== DEBUG: Session updated successfully ===', sessionUpdateData);
      } catch (updateError) {
        console.error('=== DEBUG: Exception during session update ===', updateError);
        
        if (updateError instanceof Error && updateError.message.includes('timeout')) {
          console.log('=== DEBUG: Session update timed out, but continuing anyway ===');
          alert('Session update timed out, but continuing with payment processing...');
        } else {
          alert('Failed to end session: ' + (updateError as Error).message);
          return;
        }
      }

      // Step 2: Check if we need to process wallet transactions
      console.log('=== DEBUG: Step 2 - Checking wallet processing ===');
      console.log('Final cost:', finalCost);
      console.log('Price per minute:', sessionInfo?.price_per_minute);
      console.log('Should process wallet:', finalCost > 0);
      
      if (finalCost > 0) {
        console.log('=== DEBUG: Processing wallet transactions ===');
        console.log('Final cost to process:', finalCost);
        
        // Check for existing transactions BEFORE wallet processing
        console.log('=== DEBUG: Checking for existing transactions ===');
        
        if (!sessionInfo) {
          console.error('=== DEBUG: Session info is null, cannot check transactions ===');
          return;
        }
        
        // Check for existing transactions for this specific session
        console.log('=== DEBUG: Checking for existing transactions ===');
        
        if (!sessionInfo) {
          console.error('=== DEBUG: Session info is null, cannot check transactions ===');
          return;
        }
        
        // Check for transactions with this specific session ID in description
        const { data: existingUserTransaction, error: checkUserError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", sessionInfo.user_id)
          .eq("description", `Session payment - ${finalMinutes} minutes (Session ID: ${sessionId})`)
          .maybeSingle();

        const { data: existingExpertTransaction, error: checkExpertError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", sessionInfo.expert_id)
          .eq("description", `Session payment - ${finalMinutes} minutes (Session ID: ${sessionId})`)
          .maybeSingle();

        console.log('=== DEBUG: Existing transactions check ===', {
          sessionId,
          userTransaction: existingUserTransaction,
          expertTransaction: existingExpertTransaction,
          checkUserError,
          checkExpertError
        });

        // Only skip wallet processing if BOTH transactions exist for this specific session
        if (existingUserTransaction && existingExpertTransaction) {
          console.log('=== DEBUG: Both transactions already exist for this session, skipping wallet processing ===');
          alert('Session ended successfully! Payment already processed.');
        } else {
          console.log('=== DEBUG: Processing wallet updates for session ===', sessionId);
          // Continue with wallet processing...
          try {
            // Simplified wallet processing without timeout
            console.log('=== DEBUG: Starting wallet fetch operations ===');
            
            if (!sessionInfo) {
              throw new Error('Session info is null');
            }
            
            // Fetch user wallet
            console.log('=== DEBUG: Fetching user wallet for user_id ===', sessionInfo.user_id);
            let userWallet = await supabase
              .from("user_wallet")
              .select("balance")
              .eq("user_id", sessionInfo.user_id)
              .maybeSingle();

            const { data: userWalletData, error: userWalletError } = userWallet;
            console.log('=== DEBUG: User wallet result ===', { userWalletData, userWalletError });

            if (userWalletError) {
              console.error('=== DEBUG: User wallet fetch error ===', userWalletError);
              throw new Error('Failed to fetch user wallet: ' + userWalletError.message);
            }

            if (!userWalletData) {
              console.log('=== DEBUG: User wallet not found, creating new wallet ===');
              // Create user wallet if it doesn't exist
              const { data: newUserWallet, error: createWalletError } = await supabase
                .from("user_wallet")
                .insert({ user_id: sessionInfo.user_id, balance: 1000 }) // Give starting balance
                .select()
                .single();

              if (createWalletError) {
                console.error('=== DEBUG: Failed to create user wallet ===', createWalletError);
                throw new Error('Failed to create user wallet: ' + createWalletError.message);
              }

              console.log('=== DEBUG: User wallet created ===', newUserWallet);
              userWallet = newUserWallet;
            }

            const newUserBalance = (userWalletData?.balance || 0) - finalCost;
            
            if (newUserBalance < 0) {
              console.error('=== DEBUG: Insufficient balance ===', { current: userWalletData?.balance, cost: finalCost });
              throw new Error('Insufficient wallet balance');
            }

            console.log('=== DEBUG: Processing user wallet update ===');
            console.log('Current balance:', userWalletData?.balance || 0);
            console.log('Final cost:', finalCost);
            console.log('New balance:', newUserBalance);
            console.log('User ID:', sessionInfo.user_id);
            
            // Update user wallet
            console.log('=== DEBUG: Executing user wallet update ===');
            const { error: userUpdateError, data: userUpdateData } = await supabase.from("user_wallet").update({ balance: newUserBalance }).eq("user_id", sessionInfo.user_id).select();
            if (userUpdateError) {
              console.error('=== DEBUG: User wallet update error ===', userUpdateError);
              throw new Error('Failed to update user wallet: ' + userUpdateError.message);
            }
            console.log('=== DEBUG: User wallet updated successfully ===', userUpdateData);
            
            // Verify the update actually worked
            const { data: verifyWallet } = await supabase.from("user_wallet").select("balance").eq("user_id", sessionInfo.user_id).single();
            console.log('=== DEBUG: Wallet verification after update ===', verifyWallet);

            // Create user transaction with delay
            console.log('=== DEBUG: Creating user transaction ===');
            console.log('=== DEBUG: Transaction data ===', {
              user_id: sessionInfo.user_id,
              type: 'debit',
              amount: finalCost,
              description: `Session with ${otherParticipant?.display_name || 'Expert'} - ${finalMinutes} minutes`,
              booking_id: sessionId
            });

            if (existingUserTransaction) {
              console.log('=== DEBUG: User transaction already exists ===', existingUserTransaction);
              console.log('=== DEBUG: Skipping duplicate user transaction ===');
            } else {
              // Add small delay to prevent race conditions
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const { error: userTransactionError } = await supabase.from("transactions").insert({
                user_id: sessionInfo.user_id,
                type: 'debit',
                amount: finalCost,
                description: `Session payment - ${finalMinutes} minutes (Session ID: ${sessionId})`
              });

              if (userTransactionError) {
                console.error('=== DEBUG: User transaction creation error ===', userTransactionError);
                console.error('=== DEBUG: Transaction error details ===', {
                  message: userTransactionError.message,
                  details: userTransactionError.details,
                  hint: userTransactionError.hint,
                  code: userTransactionError.code
                });
                
                // Continue with session end even if transaction fails
                console.log('=== DEBUG: Continuing session end despite transaction error ===');
              } else {
                console.log('=== DEBUG: User transaction created successfully ===');
              }
            }

            // Fetch and update expert wallet
            console.log('=== DEBUG: Processing expert wallet for expert_id ===', sessionInfo.expert_id);
            const { data: expertWallet, error: expertWalletError } = await supabase
              .from("user_wallet")
              .select("balance")
              .eq("user_id", sessionInfo.expert_id)
              .maybeSingle();

            console.log('=== DEBUG: Expert wallet result ===', { expertWallet, expertWalletError });

            if (expertWalletError) {
              console.error('=== DEBUG: Expert wallet fetch error ===', expertWalletError);
              throw new Error('Failed to fetch expert wallet: ' + expertWalletError.message);
            }

            let newExpertBalance = finalCost;
            
            if (expertWallet?.balance !== undefined) {
              newExpertBalance = expertWallet.balance + finalCost;
            }
            
            console.log('=== DEBUG: Updating expert wallet ===');
            console.log('Current expert balance:', expertWallet?.balance || 0);
            console.log('Final cost:', finalCost);
            console.log('New expert balance:', newExpertBalance);
            
            // Update or create expert wallet
            if (expertWallet?.balance !== undefined) {
              console.log('=== DEBUG: Executing expert wallet update ===');
              const { error: expertUpdateError, data: expertUpdateData } = await supabase.from("user_wallet").update({ balance: newExpertBalance }).eq("user_id", sessionInfo.expert_id).select();
              if (expertUpdateError) {
                console.error('=== DEBUG: Expert wallet update error ===', expertUpdateError);
                throw new Error('Failed to update expert wallet: ' + expertUpdateError.message);
              }
              console.log('=== DEBUG: Expert wallet updated successfully ===', expertUpdateData);
            } else {
              console.log('=== DEBUG: Creating expert wallet ===');
              const { error: expertCreateError, data: expertCreateData } = await supabase.from("user_wallet").insert({
                user_id: sessionInfo.expert_id,
                balance: newExpertBalance
              }).select();
              if (expertCreateError) {
                console.error('=== DEBUG: Expert wallet creation error ===', expertCreateError);
                throw new Error('Failed to create expert wallet: ' + expertCreateError.message);
              }
              console.log('=== DEBUG: Expert wallet created successfully ===', expertCreateData);
            }
            console.log('=== DEBUG: Expert wallet updated successfully ===');
            
            // Create expert transaction with delay
            console.log('=== DEBUG: Creating expert transaction ===');
            console.log('=== DEBUG: Expert transaction data ===', {
              user_id: sessionInfo.expert_id,
              type: 'credit',
              amount: finalCost,
              description: `Session payment - ${finalMinutes} minutes`,
              booking_id: sessionId
            });

            if (existingExpertTransaction) {
              console.log('=== DEBUG: Expert transaction already exists ===', existingExpertTransaction);
              console.log('=== DEBUG: Skipping duplicate expert transaction ===');
            } else {
              // Add small delay to prevent race conditions
              await new Promise(resolve => setTimeout(resolve, 500));
              
              const { error: expertTransactionError } = await supabase.from("transactions").insert({
                user_id: sessionInfo.expert_id,
                type: 'credit',
                amount: finalCost,
                description: `Session payment - ${finalMinutes} minutes (Session ID: ${sessionId})`
              });

              if (expertTransactionError) {
                console.error('=== DEBUG: Expert transaction creation error ===', expertTransactionError);
                console.error('=== DEBUG: Expert transaction error details ===', {
                  message: expertTransactionError.message,
                  details: expertTransactionError.details,
                  hint: expertTransactionError.hint,
                  code: expertTransactionError.code
                });
                
                // Continue with session end even if transaction fails
                console.log('=== DEBUG: Continuing session end despite expert transaction error ===');
              } else {
                console.log('=== DEBUG: Expert transaction created successfully ===');
              }
            }
            console.log('=== DEBUG: Wallet transactions completed ===');
            
          } catch (error) {
            console.error('=== DEBUG: Error in wallet processing ===', error);
            
            // Show user-friendly error but continue with session end
            if (error instanceof Error && error.message.includes('Insufficient')) {
              console.log('=== DEBUG: Insufficient balance error ===');
              alert('Insufficient wallet balance. Session ended but payment failed.');
              return;
            } else {
              console.log('=== DEBUG: Other wallet error ===', error);
              alert('Session ended successfully. There may be an issue with payment processing.');
            }
          }
        }
      } else {
        console.log('=== DEBUG: No wallet processing needed - cost is 0 ===');
      }

      console.log('=== DEBUG: Step 3 - Session end completed ===');
      
      // Show success message
      alert(`Session ended successfully. Total cost: ₹${finalCost} for ${finalMinutes} minutes.`);
      
      console.log('=== DEBUG: Step 4 - Redirecting to appropriate pages ===');
      
      // Redirect users to specific pages based on their role
      setTimeout(() => {
        console.log('=== DEBUG: Performing redirect ===');
        if (isExpert) {
          console.log('=== DEBUG: Redirecting expert to earnings page ===');
          router.push("/expert/earnings");
        } else {
          console.log('=== DEBUG: Redirecting user to homepage ===');
          router.push("/");
        }
      }, 1000);
      
    } catch (error) {
      console.error('=== DEBUG: Error ending session ===', error);
      alert('Failed to end session: ' + (error as Error).message);
    } finally {
      setIsEndingSession(false)
      setShowEndConfirmation(false)
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
      
      {/* Chat Header - Fixed at Top */}
      <div className="fixed top-16 left-0 right-0 bg-[#1e293b] border-b border-white/10 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 z-30 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-lg font-semibold text-white truncate">
                  {isExpert ? 'Consultation Session' : otherParticipant?.display_name || 'Expert'}
                </h2>
                <p className="text-xs sm:text-sm text-white/60 truncate">
                  {isExpert ? 'User' : 'Expert Astrologer'} • {sessionInfo?.session_type || 'Chat'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Timer and Cost - Mobile Optimized */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {timerStarted && (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-1 sm:gap-2 bg-white/10 px-2 py-1 sm:px-3 sm:py-2 rounded-lg">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                  <span className="text-xs sm:text-sm text-white font-mono">{formatTime(elapsedTime)}</span>
                </div>
                {sessionInfo?.price_per_minute && (
                  <div className="hidden sm:flex items-center gap-2 bg-green-500/20 px-3 py-2 rounded-lg border border-green-500/30">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">₹{sessionCost}</span>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={endSession}
              className="px-2 py-1 sm:px-4 sm:py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-xs sm:text-sm font-medium"
            >
              <span className="hidden sm:inline">End Session</span>
              <span className="sm:hidden">End</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 pt-20 sm:pt-24 pb-32 sm:pb-32">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
              </div>
              <p className="text-white/60 text-sm sm:text-base">
                {isExpert ? 'Waiting for user to start the conversation...' : 'Start the conversation by sending a message'}
              </p>
              {!isExpert && (
                <p className="text-white/40 text-xs sm:text-sm mt-2">
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
                <div className={`max-w-[85%] sm:max-w-lg lg:max-w-xl ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${
                    isOwnMessage 
                      ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/20' 
                      : 'bg-white/10 text-white border border-white/20 backdrop-blur-sm'
                  }`}>
                    <p className="text-xs sm:text-sm font-medium mb-1 opacity-90 truncate">
                      {displayName}
                    </p>
                    <p className="text-sm sm:text-base break-words leading-relaxed">{msg.content}</p>
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
              <div className="max-w-[85%] sm:max-w-lg lg:max-w-xl order-1">
                <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-2xl bg-white/10 text-white border border-white/20 backdrop-blur-sm">
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
      <div className="fixed bottom-0 left-0 right-0 bg-[#1e293b] border-t border-white/10 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 z-40">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onClick={handleInputClick}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isExpert ? "Type your response..." : "Type your message..."}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 resize-none transition-all duration-200 pr-10 sm:pr-12 text-sm sm:text-base"
                rows={1}
                disabled={messageSending}
              />
              {messageSending && (
                <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || messageSending}
              className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black rounded-xl font-semibold hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 sm:gap-2 transform hover:scale-[1.05] active:scale-[0.95] text-sm sm:text-base"
            >
              {messageSending ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* End Session Confirmation Dialog */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] border border-white/20 rounded-xl p-4 sm:p-6 max-w-md w-full mx-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">End Session</h3>
            
            <div className="space-y-3 mb-6">
              <p className="text-white/80 text-sm sm:text-base">
                Are you sure you want to end this consultation session?
              </p>
              
              {timerStarted && sessionInfo?.price_per_minute && (
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/80 text-sm mb-2">Session Summary:</p>
                  <div className="flex justify-between text-white text-sm">
                    <span>Duration:</span>
                    <span>{Math.ceil(elapsedTime / 60)} minutes</span>
                  </div>
                  <div className="flex justify-between text-white text-sm">
                    <span>Rate:</span>
                    <span>₹{sessionInfo.price_per_minute}/min</span>
                  </div>
                  <div className="flex justify-between text-yellow-400 font-semibold pt-2 border-t border-white/20 text-sm">
                    <span>Total Cost:</span>
                    <span>₹{Math.ceil(elapsedTime / 60) * sessionInfo.price_per_minute}</span>
                  </div>
                </div>
              )}
              
              <p className="text-white/60 text-xs sm:text-sm">
                This action will end the session for both participants and process any payments.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  console.log('=== DEBUG: Cancel button clicked ===');
                  cancelEndSession();
                }}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('=== DEBUG: Confirm End Session button clicked ===');
                  confirmEndSession();
                }}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Ending Loading Overlay */}
      {isEndingSession && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] border border-white/20 rounded-xl p-6 max-w-sm w-full mx-4 text-center">
            <div className="w-12 h-12 border-3 border-[#fbcc1e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-white mb-2">Ending Session</h3>
            <p className="text-white/60 text-sm">Please wait while we process your session...</p>
            <div className="mt-4 space-y-2 text-left text-xs text-white/40">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#fbcc1e] rounded-full animate-pulse"></div>
                <span>Updating session status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                <span>Processing payment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                <span>Updating earnings</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
