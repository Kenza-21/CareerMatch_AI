import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Assistant from "./pages/Assistant";
import SmartAssistant from "./pages/SmartAssistant";
import CVAnalyzer from "./pages/CVAnalyzer";
import ATSOptimizer from "./pages/ATSOptimizer";
import ATSEvaluator from "./pages/ATSEvaluator";
import CVBuilder from "./pages/CVBuilder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/smart-assistant" element={<SmartAssistant />} />
          <Route path="/cv-analyzer" element={<CVAnalyzer />} />
          <Route path="/ats-optimizer" element={<ATSOptimizer />} />
          <Route path="/ats-evaluator" element={<ATSEvaluator />} />
          <Route path="/cv-builder" element={<CVBuilder />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;