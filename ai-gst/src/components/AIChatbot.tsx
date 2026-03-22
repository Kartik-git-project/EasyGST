import { useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import OpenAI from "openai";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
type Message = { role: "user" | "assistant"; text: string };

const suggestions = [
  "Show my GST summary",
  "Explain Input Tax Credit",
  "Detect missing invoices",
];


export function AIChatbot() {
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true
});
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm the Easy GST AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const getInvoiceSummary = async () => {

  const snapshot = await getDocs(collection(db,"invoices"));

  let totalGST = 0;
  let totalAmount = 0;
  let count = 0;

  snapshot.forEach((doc)=>{
    const data = doc.data();
    totalGST += data.totalGST || 0;
    totalAmount += data.totalAmount || 0;
    count += 1;
  });

  return {
    invoices: count,
    totalGST,
    totalAmount
  };

};

const send = async (text: string) => {

  if (!text.trim()) return;

  const userMsg: Message = { role: "user", text };

  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setLoading(true);
  try {

  const summary = await getInvoiceSummary();

  const completion = await openai.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: [
    {
    role: "system",
    content:
    "You are EasyGST AI assistant helping Indian businesses analyze GST and invoices."
    },
    {
    role: "system",
    content:
    `User invoice data:
    Total invoices: ${summary.invoices}
    Total GST: ₹${summary.totalGST}
    Total invoice amount: ₹${summary.totalAmount}`
    },
    {
    role: "user",
    content: text
    }
    ]
  });

  const reply = completion.choices[0].message.content;

  const botMsg: Message = {
    role: "assistant",
    text: reply || "No response generated."
  };

  setMessages((prev) => [...prev, botMsg]);

} catch (error) {

  console.error("OpenAI error:", error);

  setMessages((prev) => [
    ...prev,
    { role: "assistant", text: "AI request failed." }
  ]);

} finally {
  setLoading(false);
}


};
  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full gradient-primary shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 animate-pulse-glow"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-h-[500px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="gradient-primary p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary-foreground" />
              <span className="font-semibold text-primary-foreground text-sm">Easy GST AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px]">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" && "justify-end")}>
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className={cn(
                  "rounded-xl px-3 py-2 text-sm max-w-[80%]",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          {loading && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground px-4 pb-2">
              <Bot className="h-3 w-3" />
              AI is typing...
            </div>
          )}
          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-xs rounded-full border border-border bg-muted/50 px-3 py-1 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask anything..."
              className="h-9 text-sm"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" variant="default" onClick={() => send(input)}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
