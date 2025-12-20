import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import ChatBubble from "@/components/chat/ChatBubble";
import ChatInput from "@/components/chat/ChatInput";
import { Sparkles, Bot } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: "user" | "coach" | "assistant";
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: "1",
    content: "Bienvenue! Je suis Coach Karim, votre conseiller carrière intelligent. 🎯\n\nJe suis spécialisé dans le marché de l'emploi marocain et je peux vous aider avec:\n\n• Conseils personnalisés pour votre parcours\n• Recherche d'offres adaptées à votre profil\n• Préparation aux entretiens\n• Stratégies de négociation salariale\n\nComment puis-je vous aider aujourd'hui?",
    sender: "coach",
    timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  },
];

const coachResponses = [
  "Excellente question! Pour le marché marocain, je vous recommande de mettre en avant vos compétences techniques et votre capacité d'adaptation. Les entreprises casablancaises recherchent particulièrement des profils polyvalents.",
  "D'après mon analyse du marché actuel, les secteurs IT, fintech et e-commerce sont en forte croissance au Maroc. Votre profil serait très adapté pour ces opportunités.",
  "Je comprends votre situation. Pour maximiser vos chances, je vous suggère de:\n\n1. Personnaliser votre CV pour chaque candidature\n2. Utiliser notre outil d'optimisation ATS\n3. Développer votre réseau sur LinkedIn Maroc\n\nVoulez-vous que je vous aide avec l'un de ces points?",
  "Le salaire moyen pour ce type de poste à Casablanca se situe entre 12,000 et 18,000 MAD selon l'expérience. Je vous conseille de négocier en mettant en avant vos certifications et projets concrets.",
];

export default function SmartAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const coachMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: coachResponses[Math.floor(Math.random() * coachResponses.length)],
      sender: "coach",
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, coachMessage]);
    setIsTyping(false);
  };

  return (
    <PageLayout className="h-[calc(100vh-5rem)]">
      <div className="max-w-3xl mx-auto h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 pb-6 border-b border-border mb-6"
        >
          <div className="relative">
            <div className="w-14 h-14 gradient-coach rounded-2xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-2 border-background flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-success-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Coach Karim</h1>
            <p className="text-sm text-muted-foreground">Votre conseiller carrière IA • En ligne</p>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin">
          {messages.map((message, index) => (
            <ChatBubble
              key={message.id}
              message={message.content}
              sender={message.sender}
              timestamp={message.timestamp}
            />
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 gradient-coach rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="gradient-coach rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-primary-foreground/60 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-primary-foreground/60 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-primary-foreground/60 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="pt-4 border-t border-border">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isTyping}
            placeholder="Posez votre question à Coach Karim..."
          />
          <p className="text-xs text-muted-foreground text-center mt-2">
            Coach Karim utilise l'IA pour vous fournir des conseils personnalisés
          </p>
        </div>
      </div>
    </PageLayout>
  );
}