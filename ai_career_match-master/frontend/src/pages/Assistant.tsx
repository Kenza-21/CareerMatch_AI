// pages/Assistant.tsx - PRODUCTION READY
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/cards/JobCard";
import { Search, Briefcase, MapPin, Loader2, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/services/api"; // Import the corrected API client

export default function Assistant() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState<string>("");

  // Test backend connection and create session
  useEffect(() => {
    const initialize = async () => {
      const connected = await apiClient.testConnection();
      setBackendConnected(connected);
      
      // Generate a session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      if (!connected) {
        setError("Le backend n'est pas connecté. Utilisation des données de démonstration.");
      }
    };
    
    initialize();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError("");
    setHasSearched(true);
    
    try {
      // Call the assistant endpoint with query parameter
      const data = await apiClient.assistantSearch(query);
      
      if (data.jobs && data.jobs.length > 0) {
        // Transform backend data to match JobCard format
        const transformedJobs = data.jobs.map((job: any, index: number) => ({
          id: job.job_id || index + 1,
          title: job.job_title || "Sans titre",
          company: job.category || "Non spécifié",
          location: job.location || "Maroc",
          date: "Récent",
          matchScore: Math.round((job.match_score || 0) * 100),
          source: job.source || "Career Match AI",
          // Use stagiaires_url first, then linkedin_url, then fallback
          url: job.stagiaires_url || job.all_search_urls?.stagiaires_url || 
               job.linkedin_url || job.all_search_urls?.linkedin || "#",
          description: job.description || "",
          required_skills: job.required_skills || "",
          // Store all backend data for external links
          backendData: job
        }));
        
        setResults(transformedJobs);
        
        // Clear any previous errors
        setError("");
      } else {
        setResults([]);
        setError("Aucun emploi trouvé. Essayez avec des termes différents.");
      }
    } catch (err: any) {
      console.error('Search error:', err);
      
      // Parse error message
      let errorMsg = err.message || "Erreur inconnue";
      
      if (errorMsg.includes("404")) {
        errorMsg = "Endpoint non trouvé. Vérifiez que votre backend a bien l'endpoint /api/assistant";
      } else if (errorMsg.includes("422")) {
        errorMsg = "Format de requête incorrect. L'assistant attend un paramètre 'message' dans la requête.";
      } else if (errorMsg.includes("Network") || errorMsg.includes("Failed to fetch")) {
        errorMsg = "Impossible de se connecter au backend sur le port 8000. Assurez-vous qu'il est en cours d'exécution.";
      } else if (errorMsg.includes("500")) {
        errorMsg = "Erreur interne du serveur. Vérifiez les logs du backend.";
      }
      
      setError(`Erreur: ${errorMsg}`);
      
      // Fallback to sample data
      useSampleData();
    } finally {
      setIsSearching(false);
    }
  };

  // Sample data fallback function
  const useSampleData = () => {
    const filtered = sampleJobs.filter(job => 
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.location.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered.length > 0 ? filtered : sampleJobs);
  };

  const sampleJobs = [
    {
      id: 1,
      title: "Développeur Full Stack",
      company: "Tech Morocco",
      location: "Casablanca",
      date: "Il y a 2 jours",
      matchScore: 92,
      source: "LinkedIn",
      url: "https://www.linkedin.com/jobs/view/123456",
      description: "Développement d'applications web full stack avec React et Node.js",
      required_skills: "React, Node.js, TypeScript, MongoDB",
      backendData: {
        linkedin_url: "https://www.linkedin.com/jobs/view/123456",
        stagiaires_url: "https://www.stagiaires.ma/offre/123456",
        all_search_urls: {
          google: "https://www.google.com/search?q=Développeur+Full+Stack+Casablanca",
          indeed: "https://ma.indeed.com/job/123456",
          rekrute_url: "https://rekru.te/job/123456"
        }
      }
    },
    {
      id: 2,
      title: "Data Analyst",
      company: "Finance Plus",
      location: "Rabat",
      date: "Il y a 3 jours",
      matchScore: 85,
      source: "ReKrute",
      url: "https://rekru.te/job/789012",
      description: "Analyse de données financières et création de rapports",
      required_skills: "Python, SQL, Tableau, Statistiques",
      backendData: {
        linkedin_url: "https://www.linkedin.com/jobs/view/789012",
        stagiaires_url: "https://www.stagiaires.ma/offre/789012",
        all_search_urls: {
          google: "https://www.google.com/search?q=Data+Analyst+Rabat",
          indeed: "https://ma.indeed.com/job/789012",
          rekrute_url: "https://rekru.te/job/789012"
        }
      }
    },
    {
      id: 3,
      title: "Chef de Projet Digital",
      company: "Digital Agency MA",
      location: "Marrakech",
      date: "Il y a 1 jour",
      matchScore: 78,
      source: "Indeed",
      url: "https://ma.indeed.com/job/345678",
      description: "Gestion de projets digitaux et équipes de développement",
      required_skills: "Gestion de projet, Agile, Communication, Tech",
      backendData: {
        linkedin_url: "https://www.linkedin.com/jobs/view/345678",
        stagiaires_url: "https://www.stagiaires.ma/offre/345678",
        all_search_urls: {
          google: "https://www.google.com/search?q=Chef+de+Projet+Digital+Marrakech",
          indeed: "https://ma.indeed.com/job/345678",
          rekrute_url: "https://rekru.te/job/345678"
        }
      }
    },
    {
      id: 4,
      title: "Ingénieur DevOps",
      company: "Cloud Solutions",
      location: "Casablanca",
      date: "Aujourd'hui",
      matchScore: 88,
      source: "Stagiaires.ma",
      url: "https://www.stagiaires.ma/offre/901234",
      description: "Mise en place et maintenance d'infrastructures cloud",
      required_skills: "AWS, Docker, Kubernetes, CI/CD",
      backendData: {
        linkedin_url: "https://www.linkedin.com/jobs/view/901234",
        stagiaires_url: "https://www.stagiaires.ma/offre/901234",
        all_search_urls: {
          google: "https://www.google.com/search?q=Ingénieur+DevOps+Casablanca",
          indeed: "https://ma.indeed.com/job/901234",
          rekrute_url: "https://rekru.te/job/901234"
        }
      }
    },
  ];

  const suggestions = [
    "Je cherche un stage en développement web à Casablanca",
    "Emploi marketing digital Rabat",
    "Poste data scientist junior Maroc",
    "Chef de projet IT remote",
  ];

  // Function to handle external link clicks
  const handleExternalLink = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (url && url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Function to get available sources for a job
  const getAvailableSources = (job: any) => {
    const sources = [];
    const backendData = job.backendData;
    
    // Helper function to check multiple possible URL locations
    const findFirstValidUrl = (urlList: any[]) => {
      return urlList.find(url => url && url !== "#" && url !== "N/A" && !url.includes("undefined"));
    };
    
    // LinkedIn - check multiple possible locations
    const linkedinUrl = findFirstValidUrl([
      backendData?.linkedin_url,
      backendData?.all_search_urls?.linkedin,
      backendData?.all_search_urls?.linkedin_url
    ]);
    if (linkedinUrl) {
      sources.push({
        name: "LinkedIn",
        url: linkedinUrl,
        key: "linkedin"
      });
    }
    
    // Stagiaire - check multiple possible locations
    const stagiaireUrl = findFirstValidUrl([
      backendData?.stagiaires_url,
      backendData?.all_search_urls?.stagiaires_url,
      backendData?.all_search_urls?.stagiaires
    ]);
    if (stagiaireUrl) {
      sources.push({
        name: "Stagiaire",
        url: stagiaireUrl,
        key: "stagiaire"
      });
    }
    
    // Google - check multiple possible locations
    const googleUrl = findFirstValidUrl([
      backendData?.google_url,
      backendData?.all_search_urls?.google,
      backendData?.all_search_urls?.google_url,
      backendData?.all_search_urls?.google_jobs
    ]);
    if (googleUrl) {
      sources.push({
        name: "Google",
        url: googleUrl,
        key: "google"
      });
    }
    
    // Indeed - check multiple possible locations
    const indeedUrl = findFirstValidUrl([
      backendData?.indeed_url,
      backendData?.all_search_urls?.indeed,
      backendData?.all_search_urls?.indeed_url
    ]);
    if (indeedUrl) {
      sources.push({
        name: "Indeed",
        url: indeedUrl,
        key: "indeed"
      });
    }
    
    // ReKrute - check multiple possible locations
    const rekruteUrl = findFirstValidUrl([
      backendData?.rekrute_url,
      backendData?.all_search_urls?.rekrute_url,
      backendData?.all_search_urls?.rekrute
    ]);
    if (rekruteUrl) {
      sources.push({
        name: "ReKrute",
        url: rekruteUrl,
        key: "rekrute"
      });
    }
    
    return sources;
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
            <Briefcase className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Assistant Recherche d'Emploi
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Décrivez le poste que vous recherchez en langage naturel et trouvez les meilleures offres.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ex: Je cherche un poste de développeur Python à Casablanca..."
                className="pl-12 h-14 rounded-xl border-border bg-background/50 text-base"
              />
            </div>
            <Button
              variant="coach"
              size="lg"
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="h-14 px-8"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Rechercher
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg text-sm flex flex-col gap-1">
              <div className={`flex items-center gap-2 ${
                error.includes("Erreur") ? "text-destructive" : "text-warning"
              }`}>
                <span className="font-medium">⚠️ {error}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={useSampleData}
                  className="ml-2 text-xs"
                >
                  Utiliser données de démo
                </Button>
              </div>
              {error.includes("422") && (
                <p className="text-xs text-muted-foreground mt-1">
                  Vérifiez que votre backend FastAPI attend bien un paramètre 'message' dans la requête.
                </p>
              )}
            </div>
          )}

          {/* Suggestions */}
          {!hasSearched && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Exemples de questions :</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQuery(suggestion);
                      setTimeout(() => handleSearch(), 100);
                    }}
                    className="text-xs h-auto py-2 px-3"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isSearching ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Recherche en cours...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    {results.length} offre{results.length > 1 ? "s" : ""} trouvée{results.length > 1 ? "s" : ""}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Maroc
                  </div>
                </div>

                <div className="space-y-6">
                  {results.map((job, index) => {
                    const availableSources = getAvailableSources(job);
                    
                    return (
                      <div key={job.id} className="relative glass rounded-2xl p-5">
                        <JobCard
                          {...job}
                          delay={index * 0.1}
                        />
                        
                        {/* REMOVED: Duplicate Skills Tags Section */}
                        
                        {/* Source Links - Horizontal Display */}
                        {availableSources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                Voir sur :
                              </span>
                              <div className="flex flex-wrap gap-3">
                                {availableSources.map((source) => (
                                  <button
                                    key={source.key}
                                    onClick={(e) => handleExternalLink(source.url, e)}
                                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors hover:underline px-2 py-1 rounded-md hover:bg-primary/5"
                                    title={`Ouvrir sur ${source.name}`}
                                  >
                                    {source.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            {availableSources.length < 5 && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {availableSources.length} source{availableSources.length > 1 ? 's' : ''} disponible{availableSources.length > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {results.length === 0 && !error && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Aucun résultat trouvé. Essayez avec d'autres termes.</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}