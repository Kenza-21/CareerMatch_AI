import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  CheckCircle,
  Loader2,
  ArrowRight,
  FileCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Download
} from "lucide-react";
import { apiClient } from "@/services/api";
import jsPDF from "jspdf";

interface CategoryEvaluation {
  Positives: string[];
  Negatives: string[];
}

interface ATSResponse {
  success: boolean;
  ats_score: number;
  evaluation: {
    ATS_Score: number;
    "Contact Information": CategoryEvaluation;
    "Spelling & Grammar": CategoryEvaluation;
    "Personal Pronoun Usage": CategoryEvaluation;
    "Skills & Keyword Targeting": CategoryEvaluation;
    "Complex or Long Sentences": CategoryEvaluation;
    "Generic or Weak Phrases": CategoryEvaluation;
    "Passive Voice Usage": CategoryEvaluation;
    "Quantified Achievements": CategoryEvaluation;
    "Required Resume Sections": CategoryEvaluation;
    "AI-generated Language": CategoryEvaluation;
    "Repeated Action Verbs": CategoryEvaluation;
    "Visual Formatting or Readability": CategoryEvaluation;
    "Personal Information / Bias Triggers": CategoryEvaluation;
    "Other Strengths and Weaknesses": CategoryEvaluation;
  };
  metadata?: {
    source: string;
    model: string;
    timestamp: string;
    resume_length: number;
  };
  error?: string;
}

interface EvaluationCategory {
  name: string;
  score: number;
  positives: string[];
  negatives: string[];
}

interface EvaluationResult {
  overallScore: number;
  categories: EvaluationCategory[];
  summary: string;
  metadata?: {
    source: string;
    model: string;
    timestamp: string;
    resume_length: number;
  };
}

// Custom Progress Bar component
const CustomProgressBar = ({ value, className = "" }: { value: number; className?: string }) => {
  const getColor = (score: number) => {
    if (score >= 80) return "bg-success";
    if (score >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className={`relative h-2 bg-muted rounded-full overflow-hidden ${className}`}>
      <div 
        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${getColor(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

// Map of category names to display names
const categoryDisplayNames: Record<string, string> = {
  "Contact Information": "Information de Contact",
  "Spelling & Grammar": "Orthographe et Grammaire",
  "Personal Pronoun Usage": "Utilisation des Pronoms Personnels",
  "Skills & Keyword Targeting": "Compétences et Mots-clés",
  "Complex or Long Sentences": "Phrases Complexes ou Longues",
  "Generic or Weak Phrases": "Phrases Génériques ou Faibles",
  "Passive Voice Usage": "Utilisation de la Voix Passive",
  "Quantified Achievements": "Réalisations Quantifiées",
  "Required Resume Sections": "Sections Requises",
  "AI-generated Language": "Langage Généré par IA",
  "Repeated Action Verbs": "Verbes d'Action Répétés",
  "Visual Formatting or Readability": "Mise en Page et Lisibilité",
  "Personal Information / Bias Triggers": "Informations Personnelles / Biais",
  "Other Strengths and Weaknesses": "Autres Forces et Faiblesses"
};

export default function ATSEvaluator() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const calculateCategoryScore = (positives: string[], negatives: string[]): number => {
    if (positives.length === 0 && negatives.length === 0) return 50;
    
    const totalPoints = positives.length + negatives.length;
    if (totalPoints === 0) return 50;
    
    // Calculate score based on ratio of positives to negatives
    const score = Math.max(0, Math.min(100, (positives.length / totalPoints) * 100));
    return Math.round(score);
  };

  const generateSummary = (categories: EvaluationCategory[]): string => {
    const avgScore = categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length;
    
    if (avgScore >= 80) {
      return "Excellent! Votre CV est bien optimisé pour les ATS. Il présente une structure solide, un bon choix de mots-clés et une présentation professionnelle.";
    } else if (avgScore >= 60) {
      return "Votre CV montre un bon potentiel mais pourrait être amélioré. Concentrez-vous sur l'ajout de plus de réalisations quantifiées et l'optimisation des mots-clés.";
    } else {
      return "Votre CV nécessite des améliorations significatives pour être bien lu par les ATS. Travaillez sur la structure, les mots-clés et l'élimination des erreurs courantes.";
    }
  };

  const handleEvaluate = async () => {
    if (!cvFile) {
      setError("Veuillez sélectionner un fichier CV");
      return;
    }
    
    // Check file size
    if (cvFile.size > 5 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (max 5MB)");
      return;
    }
    
    // Check file type
    const validTypes = ['application/pdf', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                       'application/msword', 
                       'text/plain'];
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExtension = cvFile.name.substring(cvFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(cvFile.type) && !validExtensions.includes(fileExtension)) {
      setError("Format de fichier non supporté. Utilisez PDF, DOCX, DOC ou TXT.");
      return;
    }
    
    setIsEvaluating(true);
    setError(null);
    
    try {
      console.log("Sending CV file to backend for ATS evaluation:", cvFile.name, cvFile.size);
      
      // Call the actual API endpoint using FormData
      const formData = new FormData();
      formData.append('cv_file', cvFile);
      
      const response = await fetch(`${apiClient.getBaseUrl()}/api/ats_evaluate`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur: ${response.status} - ${errorText}`);
      }
      
      const atsData: ATSResponse = await response.json();
      
      if (atsData.success) {
        const evaluation = atsData.evaluation;
        const categories: EvaluationCategory[] = [];
        
        // Process each category
        Object.entries(evaluation).forEach(([key, value]) => {
          // Skip ATS_Score field as it's handled separately
          if (key === "ATS_Score") return;
          
          const categoryValue = value as CategoryEvaluation;
          const score = calculateCategoryScore(categoryValue.Positives, categoryValue.Negatives);
          
          categories.push({
            name: categoryDisplayNames[key] || key,
            score,
            positives: categoryValue.Positives,
            negatives: categoryValue.Negatives
          });
        });
        
        const resultData: EvaluationResult = {
          overallScore: atsData.ats_score,
          categories,
          summary: generateSummary(categories),
          metadata: atsData.metadata
        };
        
        setResult(resultData);
        console.log("ATS Evaluation completed successfully:", resultData);
      } else {
        setError(atsData.error || "Erreur lors de l'évaluation ATS");
      }
    } catch (err: any) {
      console.error("ATS evaluation error:", err);
      setError(err.message || "Erreur de connexion au serveur. Vérifiez que le backend est en cours d'exécution.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreColorHex = (score: number) => {
    if (score >= 80) return "#10b981"; // success green
    if (score >= 60) return "#f59e0b"; // warning orange
    return "#ef4444"; // destructive red
  };
 const generatePDFReport = () => {
  if (!result) return;

  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('fr-FR');
  const fileName = cvFile?.name || "CV_analyse";
  
  // Set font
  doc.setFont("helvetica");
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(33, 37, 41);
  doc.text("RAPPORT D'ÉVALUATION ATS", 105, 20, { align: "center" });
  
  // Add subtitle
  doc.setFontSize(12);
  doc.setTextColor(108, 117, 125);
  doc.text("Career Assistant - Évaluation Professionnelle", 105, 30, { align: "center" });
  
  // Add line
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 35, 190, 35);
  
  // General information
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text("Informations Générales", 20, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(73, 80, 87);
  doc.text(`Date: ${date}`, 20, 55);
  doc.text(`Fichier analysé: ${fileName}`, 20, 62);
  doc.text(`Score Global ATS: ${result.overallScore}/100`, 20, 69);
  
  if (result.metadata) {
    doc.text(`Modèle IA: ${result.metadata.model}`, 20, 76);
    doc.text(`Longueur du CV: ${result.metadata.resume_length} caractères`, 20, 83);
  }
  
  // Overall score visualization
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(120, 45, 70, 40, 3, 3, 'F');
  
  // Score circle visualization
  const scoreX = 155;
  const scoreY = 65;
  const radius = 15;
  
  // Background circle
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(2);
  doc.circle(scoreX, scoreY, radius);
  
  // Score arc based on percentage
  const scorePercentage = result.overallScore;
  const startAngle = -90;
  const endAngle = -90 + (scorePercentage * 360 / 100);
  
  doc.setDrawColor(getScoreColorHex(result.overallScore));
  doc.setLineWidth(3);
  doc.ellipse(scoreX, scoreY, radius, radius);

  // Score text
  doc.setFontSize(16);
  doc.setTextColor(33, 37, 41);
  doc.text(`${result.overallScore}`, scoreX, scoreY + 2, { align: "center" });
  
  doc.setFontSize(8);
  doc.text("points", scoreX, scoreY + 10, { align: "center" });
  
  // Summary section
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text("Résumé de l'Évaluation", 20, 95);
  
  doc.setFontSize(10);
  doc.setTextColor(73, 80, 87);
  
  // Fix: Clean up the summary text before splitting
  const cleanSummary = result.summary.replace(/\s+/g, ' ');
  const summaryLines = doc.splitTextToSize(cleanSummary, 170);
  doc.text(summaryLines, 20, 105);
  
  // Detailed categories - start new page if needed
  let yPosition = 105 + (summaryLines.length * 6) + 15;
  
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text("Détails par Catégorie", 20, yPosition);
  yPosition += 10;
  
  // Helper function to clean and format text for PDF
  const cleanTextForPDF = (text: string): string => {
    // Remove extra spaces and clean up the text
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/' /g, "'")  // Fix spacing after single quotes
      .replace(/ \./g, '.') // Fix spacing before periods
      .replace(/ ,/g, ',')  // Fix spacing before commas
      .trim();
  };
  
  // Add categories
  result.categories.forEach((category, index) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Category header with score
    doc.setFontSize(11);
    doc.setTextColor(33, 37, 41);
    doc.text(`${category.name}: ${category.score}%`, 20, yPosition);
    
    yPosition += 7;
    
    // Progress bar visualization
    const barWidth = 50;
    const barHeight = 4;
    const filledWidth = (category.score / 100) * barWidth;
    
    // Background bar
    doc.setFillColor(233, 236, 239);
    doc.rect(20, yPosition, barWidth, barHeight, 'F');
    
    // Filled bar
    doc.setFillColor(getScoreColorHex(category.score));
    doc.rect(20, yPosition, filledWidth, barHeight, 'F');
    
    yPosition += 10;
    
    // Positives
    if (category.positives.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(34, 197, 94); // Green
      doc.text("Points forts:", 25, yPosition);
      yPosition += 5;
      
      category.positives.forEach(positive => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Clean the text before adding to PDF
        const cleanedPositive = cleanTextForPDF(positive);
        const positiveLines = doc.splitTextToSize(`• ${cleanedPositive}`, 160);
        doc.text(positiveLines, 30, yPosition);
        yPosition += (positiveLines.length * 5);
      });
      
      yPosition += 2; // Add small space after positives
    }
    
    // Negatives
    if (category.negatives.length > 0) {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(9);
      doc.setTextColor(239, 68, 68); // Red
      doc.text("Points à améliorer:", 25, yPosition);
      yPosition += 5;
      
      category.negatives.forEach(negative => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Clean the text before adding to PDF
        const cleanedNegative = cleanTextForPDF(negative);
        const negativeLines = doc.splitTextToSize(`• ${cleanedNegative}`, 160);
        doc.text(negativeLines, 30, yPosition);
        yPosition += (negativeLines.length * 5);
      });
    }
    
    yPosition += 8; // Add space between categories
  });
  
  // Add final page with recommendations if needed
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }
  
  doc.setFontSize(14);
  doc.setTextColor(33, 37, 41);
  doc.text("Recommandations pour l'Optimisation ATS", 20, yPosition);
  yPosition += 10;
  
  const recommendations = [
    "1. MOTS-CLÉS: Incluez les termes spécifiques au poste cible",
    "2. CHIFFRES: Quantifiez vos réussites (ex: 'augmenté les ventes de 25%')",
    "3. STRUCTURE: Utilisez des titres clairs (Expérience, Formation, Compétences)",
    "4. VERBES D'ACTION: Commencez vos phrases avec des verbes forts",
    "5. LONGEUR: Gardez votre CV concis (1-2 pages maximum)",
    "6. FORMAT: Évitez les tableaux, images et polices fantaisistes",
    "7. CONTACT: Incluez email et téléphone professionnels",
    "8. PROOFREADING: Relisez pour éviter les fautes d'orthographe"
  ];
  
  doc.setFontSize(10);
  doc.setTextColor(73, 80, 87);
  
  recommendations.forEach(rec => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }
    
    const recLines = doc.splitTextToSize(rec, 170);
    doc.text(recLines, 20, yPosition);
    yPosition += (recLines.length * 6);
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(108, 117, 125);
  doc.text(`© Career Assistant - Rapport généré le ${date}`, 105, 285, { align: "center" });
  
  // Save the PDF
  const pdfName = `Rapport_ATS_${result.overallScore}_${date.replace(/\//g, '-')}.pdf`;
  doc.save(pdfName);
};


  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 gradient-coach rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Évaluateur ATS avec IA
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Évaluation complète de votre CV avec Google Gemini AI (14 critères professionnels)
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
          >
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {/* Upload Section */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Téléchargez votre CV pour l'évaluation ATS
              </h2>
              <FileUpload
                onFileSelect={(file) => {
                  console.log("File selected:", file?.name);
                  setCvFile(file);
                  setError(null);
                }}
                accept=".pdf,.docx,.doc,.txt"
                maxSize={5 * 1024 * 1024}
              />
              <p className="text-sm text-muted-foreground mt-3">
                Formats supportés: PDF, DOCX, DOC, TXT (max 5MB)
              </p>
              {cvFile && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{cvFile.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(cvFile.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Preview */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">14 Critères d'Évaluation</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.values(categoryDisplayNames).map((name, index) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.03 }}
                    className="p-3 rounded-xl bg-muted/50 text-center hover:bg-muted transition-colors"
                  >
                    <FileCheck className="w-5 h-5 text-primary mx-auto mb-2" />
                    <span className="text-xs text-muted-foreground">{name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Evaluate Button */}
            <div className="flex justify-center">
              <Button
                variant="hero"
                size="xl"
                onClick={handleEvaluate}
                disabled={isEvaluating || !cvFile}
                className="min-w-[200px]"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Évaluation en cours...
                  </>
                ) : (
                  <>
                    Évaluer mon CV avec IA
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Debug Info */}
            {import.meta.env.DEV && (
              <div className="glass rounded-2xl p-6 border border-dashed border-primary/30">
                <h4 className="text-sm font-medium text-primary mb-2">Debug Info</h4>
                <p className="text-xs text-muted-foreground">
                  Backend URL: {apiClient.getBaseUrl()}<br />
                  Endpoint: {apiClient.getBaseUrl()}/api/ats_evaluate
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Overall Score */}
            <div className="glass rounded-2xl p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Score ATS Global
              </h2>
              <ScoreRing score={result.overallScore} size={180} strokeWidth={14} />
              <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
                {result.metadata && (
                  <>
                    <span>Modèle: {result.metadata.model}</span>
                    <span>•</span>
                    <span>Longueur: {result.metadata.resume_length} caractères</span>
                  </>
                )}
              </div>
              <p className="mt-6 text-muted-foreground max-w-lg mx-auto">
                {result.summary}
              </p>
            </div>

            {/* Detailed Categories */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-6">Détail par Catégorie</h3>
              <div className="space-y-3">
                {result.categories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedCategory(
                        expandedCategory === category.name ? null : category.name
                      )}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <span className="font-medium text-foreground text-left">{category.name}</span>
                        <div className="flex-1 max-w-[200px] hidden sm:block">
                          <CustomProgressBar value={category.score} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${getScoreColor(category.score)}`}>
                          {category.score}%
                        </span>
                        {expandedCategory === category.name ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    
                    {expandedCategory === category.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 space-y-3"
                      >
                        {/* Positives */}
                        {category.positives.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-success mb-2">Points forts:</h4>
                            <ul className="space-y-1">
                              {category.positives.map((positive, idx) => (
                                <li key={idx} className="text-sm text-success/80 flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                                  <span className="flex-1">{positive}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Negatives */}
                        {category.negatives.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-destructive mb-2">Points à améliorer:</h4>
                            <ul className="space-y-1">
                              {category.negatives.map((negative, idx) => (
                                <li key={idx} className="text-sm text-destructive/80 flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                                  <span className="flex-1">{negative}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {category.positives.length === 0 && category.negatives.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            Aucune évaluation spécifique disponible pour cette catégorie.
                          </p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Reset */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setResult(null);
                  setCvFile(null);
                  setError(null);
                }}
              >
                Nouvelle évaluation
              </Button>
              <Button
                variant="hero"
                size="lg"
                onClick={generatePDFReport}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Télécharger le rapport (.pdf)
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}