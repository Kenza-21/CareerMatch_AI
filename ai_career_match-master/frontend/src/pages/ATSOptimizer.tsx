import { useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Loader2, 
  Download,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  X
} from "lucide-react";

interface ATSOptimizationResult {
  success: boolean;
  ats_cv_text?: string;
  ats_latex?: string;
  pdf_base64?: string;
  pdf_available?: boolean;
  download_url?: string;
  metadata?: {
    source: string;
    format: string;
    template: string;
    generator: string;
    timestamp: string;
    content_preserved: boolean;
    experience_count: number;
    education_count: number;
    skills_count: number;
  };
  error?: string;
  error_details?: string;
}

export default function ATSOptimizer() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<ATSOptimizationResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleFileSelect = (file: File | null) => {
    setCvFile(file);
    // Clear results when file changes
    setOptimizationResult(null);
    setError("");
  };

  const handleOptimize = async () => {
    if (!cvFile) {
      setError("Veuillez télécharger un CV.");
      return;
    }
    
    setIsOptimizing(true);
    setError("");
    setOptimizationResult(null);
    
    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('cv_file', cvFile);
      // Optional: add empty target_role if needed
      formData.append('target_role', '');
      
      console.log('Uploading file:', cvFile.name, cvFile.type, cvFile.size);
      
      // Send request directly to the backend
      const response = await fetch('http://localhost:8000/api/ats_cv', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${result.detail || 'Erreur serveur'}`);
      }
      
      if (result.success) {
        setOptimizationResult(result);
      } else {
        setError(result.error || "Erreur lors de l'optimisation.");
      }
    } catch (err: any) {
      console.error('Optimization error:', err);
      setError(err.message || "Erreur lors de l'optimisation. Vérifiez que le backend est démarré.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!optimizationResult?.pdf_base64) return;
    
    try {
      const byteCharacters = atob(optimizationResult.pdf_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_Optimise_ATS_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF download error:', err);
      setError("Erreur lors du téléchargement du PDF.");
    }
  };

  const handleDownloadLatex = () => {
    if (!optimizationResult?.ats_latex) return;
    
    try {
      const blob = new Blob([optimizationResult.ats_latex], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_Optimise_ATS_${Date.now()}.tex`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('LaTeX download error:', err);
      setError("Erreur lors du téléchargement du fichier LaTeX.");
    }
  };

  const resetAll = () => {
    setCvFile(null);
    setOptimizationResult(null);
    setError("");
  };

  const optimizationFeatures = [
    "Mots-clés optimisés pour les systèmes ATS",
    "Format LaTeX professionnel",
    "Structure adaptée au marché marocain",
    "Mise en page compatible avec tous les ATS",
    "Sections optimisées pour le parsing automatique",
  ];

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 gradient-user rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-secondary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Optimiseur ATS
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Transformez votre CV pour qu'il passe tous les systèmes de suivi des candidatures.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/20"
          >
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* CV Upload */}
            <div className="glass rounded-2xl p-6">
              <Label className="text-base font-semibold text-foreground mb-4 block">
                Votre CV actuel
              </Label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.docx,.doc,.txt"
              />
              {cvFile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-background/50 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{cvFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(cvFile.size / 1024).toFixed(1)} KB • {cvFile.type || "Type inconnu"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFileSelect(null)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              <p className="text-xs text-muted-foreground mt-3">
                Formats supportés: PDF, DOCX, DOC, TXT
              </p>
            </div>

            {/* Optimize Button */}
            <Button
              variant="user"
              size="xl"
              onClick={handleOptimize}
              disabled={isOptimizing || !cvFile}
              className="w-full"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Optimisation en cours...
                </>
              ) : (
                <>
                  Optimiser mon CV
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {/* Reset Button */}
            {optimizationResult && (
              <Button
                variant="outline"
                size="lg"
                onClick={resetAll}
                className="w-full"
              >
                Nouvelle optimisation
              </Button>
            )}
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {!optimizationResult ? (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Ce que vous obtiendrez
                </h3>
                <ul className="space-y-3">
                  {optimizationFeatures.map((feature, index) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full gradient-coach flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Success Card */}
                <div className="glass rounded-2xl p-6 text-center">
                  <div className="w-20 h-20 gradient-coach rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    CV Optimisé!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Votre CV a été optimisé pour les systèmes ATS.
                  </p>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <div className="text-lg font-bold text-primary">{optimizationResult.metadata?.experience_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Expériences</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <div className="text-lg font-bold text-primary">{optimizationResult.metadata?.education_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Formations</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-lg">
                      <div className="text-lg font-bold text-primary">{optimizationResult.metadata?.skills_count || 0}</div>
                      <div className="text-xs text-muted-foreground">Compétences</div>
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="space-y-3">
                    {optimizationResult.pdf_available && (
                      <Button variant="hero" size="lg" className="w-full" onClick={handleDownloadPDF}>
                        <Download className="w-5 h-5 mr-2" />
                        Télécharger le PDF
                      </Button>
                    )}
                    {optimizationResult.ats_latex && (
                      <Button variant="outline" size="lg" className="w-full" onClick={handleDownloadLatex}>
                        <Download className="w-5 h-5 mr-2" />
                        Télécharger le LaTeX
                      </Button>
                    )}
                  </div>
                </div>

                {/* Metadata Info */}
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-semibold text-foreground mb-3">Détails de l'optimisation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Source:</span>
                      <span className="font-medium">{optimizationResult.metadata?.source || "Inconnue"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Format:</span>
                      <span className="font-medium">{optimizationResult.metadata?.format || "Inconnu"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contenu préservé:</span>
                      <span className="font-medium">{optimizationResult.metadata?.content_preserved ? "Oui ✓" : "Non ✗"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Généré le:</span>
                      <span className="font-medium">
                        {new Date(optimizationResult.metadata?.timestamp || Date.now()).toLocaleString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Info Box */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Astuce:</strong> Plus de 75% des CV sont rejetés par les ATS avant d'être lus par un recruteur. Notre optimiseur augmente vos chances de passage.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}