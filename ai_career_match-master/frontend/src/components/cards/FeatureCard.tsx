import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient?: "coach" | "user";
  delay?: number;
}

export function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  href,
  gradient = "coach",
  delay = 0
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <Link to={href}>
        <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden h-full">
          {/* Gradient overlay on hover */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${gradient === "coach" ? "gradient-coach" : "gradient-user"}`} />
          
          {/* Icon */}
          <div className={`w-14 h-14 rounded-xl ${gradient === "coach" ? "gradient-coach" : "gradient-user"} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-7 h-7 ${gradient === "coach" ? "text-primary-foreground" : "text-secondary-foreground"}`} />
          </div>
          
          {/* Content */}
          <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-gradient-coach transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>

          {/* Arrow indicator */}
          <div className="mt-4 flex items-center text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            Commencer
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default FeatureCard;