import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { ScoreRing } from "@/components/ui/score-ring";
import { Badge } from "@/components/ui/badge";
import { 
  FileSearch, 
  Loader2, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  AlertCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { apiClient } from "@/services/api"; // Import the API client

interface AnalysisResult {
  match_score: number;
  score_analysis: {
    final_score: number;
    method: string;
    cv_skills_count: number;
    job_skills_count: number;
    common_skills_count: number;
    coverage_percentage: number;
    common_skills: string[];
  };
  cv_skills: string[];
  job_skills: string[];
  skill_gaps: Array<{
    skill_name: string;
    required_level: string;
    current_level: string;
    gap_severity: string;
    strict_missing: boolean;
    explicit_in_jd: boolean;
    explicit_in_cv: boolean;
  }>;
  missing_skills: string[];
  strict_analysis: boolean;
  overall_assessment: string;
  confidence_level: string;
  summary: {
    cv_skills_count: number;
    job_skills_count: number;
    common_skills: string[];
    coverage: string;
    coverage_percentage: number;
    methodology: string;
  };
  error?: string;
}

export default function CVAnalyzer() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>("");
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await apiClient.testConnection();
        setBackendConnected(connected);
        
        if (!connected) {
          setError("Le backend n'est pas connecté. Utilisation des données de démonstration.");
        }
      } catch (err) {
        console.error("Connection test failed:", err);
        setBackendConnected(false);
        setError("Impossible de se connecter au backend sur le port 8000.");
      }
    };
    
    testConnection();
  }, []);

  const handleAnalyze = async () => {
    if (!cvFile && !jobDescription) {
      setError("Veuillez télécharger un CV ou coller une description de poste.");
      return;
    }
    
    setIsAnalyzing(true);
    setError("");
    
    try {
      let analysisData: AnalysisResult;
      
      // Always use text-based endpoint for consistency
      if (backendConnected) {
        console.log("Analyzing CV text...");
        
        let cvTextToAnalyze = cvText;
        
        // If a file is uploaded, extract text from it
        if (cvFile) {
          cvTextToAnalyze = await readFileAsText(cvFile);
        }
        
        // Ensure we have either CV text or job description
        if (!cvTextToAnalyze.trim() && !jobDescription.trim()) {
          throw new Error("Veuillez télécharger un CV ou coller une description de poste.");
        }
        
        // Use the text analysis endpoint consistently
        analysisData = await apiClient.analyzeCVText(cvTextToAnalyze, jobDescription);
        
      } else {
        // Fallback to mock data if backend is not connected
        analysisData = await getMockAnalysis();
        setError("Mode démo activé - données de démonstration");
      }
      
      setResult(analysisData);
      
    } catch (err: any) {
      console.error('Analysis error:', err);
      
      let errorMsg = err.message || "Erreur inconnue";
      
      if (errorMsg.includes("404")) {
        errorMsg = "Endpoint non trouvé. Vérifiez que votre backend a bien l'endpoint /cv/analyze";
      } else if (errorMsg.includes("422")) {
        errorMsg = "Format de requête incorrect.";
      } else if (errorMsg.includes("Network") || errorMsg.includes("Failed to fetch")) {
        errorMsg = "Impossible de se connecter au backend sur le port 8000.";
        // Fallback to mock data
        const mockData = await getMockAnalysis();
        setResult(mockData);
        setError("Mode démo activé - données de démonstration");
        setIsAnalyzing(false);
        return;
      } else if (errorMsg.includes("500")) {
        errorMsg = "Erreur interne du serveur.";
      }
      
      setError(`Erreur: ${errorMsg}`);
      
      // Fallback to mock data
      const mockData = await getMockAnalysis();
      setResult(mockData);
      setError("Mode démo - données de démonstration");
      
    } finally {
      setIsAnalyzing(false);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const getMockAnalysis = async (): Promise<AnalysisResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      match_score: 78,
      score_analysis: {
        final_score: 0.78,
        method: "strict_skills_analysis",
        cv_skills_count: 8,
        job_skills_count: 10,
        common_skills_count: 7,
        coverage_percentage: 70,
        common_skills: ["Python", "SQL", "Data Analysis", "Machine Learning", "Git", "JavaScript", "React"]
      },
      cv_skills: ["Python", "SQL", "Data Analysis", "Machine Learning", "Git", "JavaScript", "React", "HTML"],
      job_skills: ["Python", "SQL", "Data Analysis", "Machine Learning", "Git", "JavaScript", "React", "AWS", "Kubernetes", "Scala"],
      skill_gaps: [
        {
          skill_name: "AWS",
          required_level: "Demandée dans l'offre",
          current_level: "Non présente dans le CV",
          gap_severity: "high",
          strict_missing: true,
          explicit_in_jd: true,
          explicit_in_cv: false
        },
        {
          skill_name: "Kubernetes",
          required_level: "Demandée dans l'offre",
          current_level: "Non présente dans le CV",
          gap_severity: "high",
          strict_missing: true,
          explicit_in_jd: true,
          explicit_in_cv: false
        },
        {
          skill_name: "Scala",
          required_level: "Demandée dans l'offre",
          current_level: "Non présente dans le CV",
          gap_severity: "medium",
          strict_missing: true,
          explicit_in_jd: true,
          explicit_in_cv: false
        }
      ],
      missing_skills: ["Kubernetes", "AWS", "Scala"],
      strict_analysis: true,
      overall_assessment: "⚠️ Bon matching strict - La plupart des compétences présentes",
      confidence_level: "Moyenne (basée sur texte explicite)",
      summary: {
        cv_skills_count: 8,
        job_skills_count: 10,
        common_skills: ["Python", "SQL", "Data Analysis", "Machine Learning", "Git", "JavaScript", "React"],
        coverage: "70% des compétences demandées (strict)",
        coverage_percentage: 70,
        methodology: "Extraction et comparaison STRICTE basée uniquement sur le texte explicite"
      }
    };
  };

  const resetAnalysis = () => {
    setResult(null);
    setCvFile(null);
    setCvText("");
    setJobDescription("");
    setError("");
  };

  const handleFileSelect = (file: File | null) => {
    setCvFile(file);
    if (!file) {
      setCvText("");
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Connection Status */}
        {backendConnected !== null && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            backendConnected 
              ? "bg-success/10 text-success border border-success/20" 
              : "bg-warning/10 text-warning border border-warning/20"
          }`}>
            {backendConnected ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Backend connecté (port 8000)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Backend non connecté - Mode démo</span>
              </>
            )}
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 gradient-coach rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileSearch className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Analyseur de CV
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Comparez votre CV à une offre d'emploi et découvrez votre score de compatibilité.
          </p>
        </motion.div>

        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8"
          >
            {/* CV Upload */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                1. Téléchargez votre CV
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Formats supportés: PDF, DOCX, DOC, TXT
              </p>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.docx,.doc,.txt"
              />
              <p className="text-xs text-muted-foreground mt-3">
                Note: Le CV sera converti en texte et analysé pour extraire les compétences techniques.
              </p>
            </div>

            {/* Job Description */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                2. Collez la description du poste
              </h2>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Collez ici la description complète de l'offre d'emploi...
Ex: 
Compétences requises:
- JavaScript, React, Node.js
- Bases de données MongoDB
- APIs RESTful

Missions:
- Développement d'applications web
- Collaboration équipe frontend/backend"
                className="min-h-[200px] resize-none font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-3">
                Note: Les compétences seront extraites strictement du texte fourni.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Analyze Button */}
            <div className="flex justify-center">
              <Button
                variant="hero"
                size="xl"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!cvFile && !jobDescription.trim())}
                className="min-w-[200px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    Analyser
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Score */}
            <div className="glass rounded-2xl p-8 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Score de Compatibilité
              </h2>
              <ScoreRing 
                score={result.match_score * 100} 
                size={160} 
                strokeWidth={12} 
              />
              <div className="mt-4 space-y-2">
                <p className="text-muted-foreground">
                  {result.overall_assessment}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Méthode:</strong> {result.score_analysis.method}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Confiance:</strong> {result.confidence_level}
                </p>
              </div>
            </div>

            {/* Skills Analysis */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Common Skills */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <div>
                    <h3 className="font-semibold text-foreground">Compétences en commun</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.summary.common_skills.length} sur {result.summary.job_skills_count} compétences demandées
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.summary.common_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-success/10 text-success border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="w-5 h-5 text-destructive" />
                  <div>
                    <h3 className="font-semibold text-foreground">Compétences manquantes</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.missing_skills.length} compétences demandées non présentes dans votre CV
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-destructive/10 text-destructive border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Statistiques détaillées</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.summary.cv_skills_count}</div>
                  <div className="text-sm text-muted-foreground">Compétences CV</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.summary.job_skills_count}</div>
                  <div className="text-sm text-muted-foreground">Compétences Offre</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.summary.common_skills.length}</div>
                  <div className="text-sm text-muted-foreground">Compétences communes</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{result.summary.coverage_percentage}%</div>
                  <div className="text-sm text-muted-foreground">Couverture</div>
                </div>
              </div>
            </div>

            {/* Analysis Methodology */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Méthodologie d'analyse</h3>
              <p className="text-muted-foreground mb-3">
                {result.summary.methodology}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Approche stricte:</strong> Seules les compétences explicitement mentionnées dans les textes sont considérées.</p>
                <p><strong>Normalisation:</strong> Les synonymes et variantes de compétences sont normalisés (ex: "React.js" → "React").</p>
                <p><strong>Score:</strong> Basé sur le pourcentage de compétences de l'offre présentes dans votre CV.</p>
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button variant="outline" size="lg" onClick={resetAnalysis}>
                Nouvelle analyse
              </Button>
            </div>

            {/* Demo Mode Notice */}
            {error && error.includes("Mode démo") && (
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2 text-warning">
                  <AlertCircle className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Mode démo activé</p>
                    <p className="text-sm">Ces résultats sont basés sur des données de démonstration.</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}