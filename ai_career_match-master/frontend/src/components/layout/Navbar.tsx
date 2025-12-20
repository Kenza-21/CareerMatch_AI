import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  FileSearch, 
  Target, 
  CheckCircle, 
  FileText, 
  Menu, 
  X,
  MessageSquare,
  Bot,
  Briefcase
} from "lucide-react";

const navItems = [
  { path: "/assistant", label: "Assistant", icon: MessageSquare },
  { path: "/smart-assistant", label: "Coach IA", icon: Bot },
  { path: "/cv-analyzer", label: "Analyseur CV", icon: FileSearch },
  { path: "/ats-optimizer", label: "Optimiseur ATS", icon: Target },
  { path: "/ats-evaluator", label: "Évaluateur ATS", icon: CheckCircle },
  { path: "/cv-builder", label: "Créateur CV", icon: FileText },
];

interface NavbarProps {
  variant?: "default" | "transparent";
}

export function Navbar({ variant = "default" }: NavbarProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTransparent = variant === "transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isTransparent ? "bg-transparent" : "glass"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-coach rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className={`text-xl font-bold hidden sm:block ${isTransparent ? "text-primary-foreground" : "text-gradient-coach"}`}>
              Career Match AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "coach" : "ghost"}
                    size="sm"
                    className={`gap-2 ${
                      isActive 
                        ? "" 
                        : isTransparent 
                          ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10" 
                          : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`lg:hidden ${isTransparent ? "text-primary-foreground hover:bg-white/10" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "coach" : "ghost"}
                      className="w-full justify-start gap-3"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;