import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  sender: "user" | "coach" | "assistant";
  timestamp?: string;
}

export function ChatBubble({ message, sender, timestamp }: ChatBubbleProps) {
  const isUser = sender === "user";
  
  const bubbleStyles = {
    user: "gradient-user text-secondary-foreground ml-auto",
    coach: "gradient-coach text-primary-foreground",
    assistant: "bg-muted text-foreground",
  };

  const iconStyles = {
    user: "gradient-user",
    coach: "gradient-coach",
    assistant: "bg-muted",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconStyles[sender]}`}>
        {isUser ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      {/* Message Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${bubbleStyles[sender]}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <span className={`text-xs mt-1 block opacity-70`}>
            {timestamp}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default ChatBubble;