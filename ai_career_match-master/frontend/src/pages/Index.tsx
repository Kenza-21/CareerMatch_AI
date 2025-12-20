import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FeatureCard from "@/components/cards/FeatureCard";
import Navbar from "@/components/layout/Navbar";
import { 
  Bot, 
  FileSearch, 
  Target, 
  CheckCircle, 
  FileText, 
  MessageSquare,
  ArrowRight,
  Briefcase,
  TrendingUp,
  Users
} from "lucide-react";

const features = [
  {
    title: "Assistant",
    description: "Recherche d'emploi simplifiée avec des requêtes en langage naturel.",
    icon: MessageSquare,
    href: "/assistant",
    gradient: "coach" as const,
  },
  {
    title: "Coach IA Smart",
    description: "Votre coach carrière personnel avec Coach Karim pour des conseils personnalisés.",
    icon: Bot,
    href: "/smart-assistant",
    gradient: "user" as const,
  },
  {
    title: "Analyseur CV",
    description: "Comparez votre CV aux offres d'emploi et identifiez les compétences clés.",
    icon: FileSearch,
    href: "/cv-analyzer",
    gradient: "coach" as const,
  },
  {
    title: "Optimiseur ATS",
    description: "Optimisez votre CV pour passer les systèmes de suivi des candidatures.",
    icon: Target,
    href: "/ats-optimizer",
    gradient: "user" as const,
  },
  {
    title: "Évaluateur ATS",
    description: "Évaluation complète de votre CV avec 14 critères professionnels.",
    icon: CheckCircle,
    href: "/ats-evaluator",
    gradient: "coach" as const,
  },
  {
    title: "Créateur CV",
    description: "Créez un CV professionnel optimisé pour le marché marocain.",
    icon: FileText,
    href: "/cv-builder",
    gradient: "user" as const,
  },
];

const stats = [
  { value: "10K+", label: "Offres analysées", icon: Briefcase },
  { value: "95%", label: "Taux de réussite", icon: TrendingUp },
  { value: "5K+", label: "Utilisateurs actifs", icon: Users },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Navbar - transparent variant for hero */}
      <Navbar variant="transparent" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary/20 blur-3xl"
            animate={{
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary-foreground/90">
                Plateforme #1 pour le marché marocain
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              Votre Carrière,{" "}
              <span className="text-gradient-coach">Propulsée par l'IA</span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Optimisez votre CV, préparez vos entretiens et trouvez le job idéal sur le marché marocain avec notre coach carrière intelligent.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/smart-assistant">
                <Button variant="hero" size="xl" className="group">
                  Commencer avec Coach IA
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/cv-analyzer">
                <Button variant="glass" size="xl">
                  Analyser mon CV
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-primary" />
                    <span className="text-2xl sm:text-3xl font-bold text-primary-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <span className="text-sm text-primary-foreground/60">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Outils Puissants pour Votre{" "}
              <span className="text-gradient-coach">Réussite</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une suite complète d'outils IA conçus pour le marché de l'emploi marocain.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.href}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto gradient-coach rounded-3xl p-8 sm:p-12 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
            Prêt à Transformer Votre Carrière?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Rejoignez des milliers de professionnels marocains qui ont déjà boosté leur carrière avec Career Match AI.
          </p>
          <Link to="/smart-assistant">
            <Button variant="glass" size="xl" className="group">
              Discuter avec Coach Karim
              <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-coach rounded-lg flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Career Match AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Career Match AI. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;