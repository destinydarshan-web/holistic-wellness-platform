"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;

  console.log("Loaded sessionId:", sessionId);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Unauthorized</div>;

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch existing messages
  useEffect(() => {
    if (!sessionId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .filter("session_id", "eq", sessionId)
        .order("created_at", { ascending: true });

      console.log("Fetched messages:", data, error);

      if (data) {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [sessionId]);

  // Realtime subscription
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages"
        },
        (payload) => {
          const newMsg = payload.new;

          // Only check equality loosely
          if (String(newMsg.session_id) === String(sessionId)) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const sendMessage = async () => {
  if (!newMessage.trim()) return;

  if (!user?.id) {
    console.error("Cannot send message — user not loaded");
    return;
  }

  const { error } = await supabase
    .from("messages")
    .insert({
      session_id: sessionId,
      sender_id: user.id,
      content: newMessage
    });

  if (error) {
    console.error("Insert error:", error);
    return;
  }

  setNewMessage("");
};

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Live Chat</h1>

      <div className="flex-1 bg-white rounded-xl shadow p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 ${
              msg.sender_id === user?.id
                ? "text-right"
                : "text-left"
            }`}
          >
            <span className="inline-block px-4 py-2 rounded-lg bg-blue-100">
              {msg.content}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-4 py-2"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
