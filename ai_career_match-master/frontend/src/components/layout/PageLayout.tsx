import { ReactNode } from "react";
import { motion } from "framer-motion";
import Navbar from "./Navbar";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`pt-20 pb-8 px-4 sm:px-6 lg:px-8 ${className}`}
      >
        {children}
      </motion.main>
    </div>
  );
}

export default PageLayout;