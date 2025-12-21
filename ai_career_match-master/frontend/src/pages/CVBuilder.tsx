
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  Award,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  year: string;
}

const steps = [
  { id: 1, title: "Informations", icon: User },
  { id: 2, title: "Expérience", icon: Briefcase },
  { id: 3, title: "Formation", icon: GraduationCap },
  { id: 4, title: "Compétences", icon: Code },
  { id: 5, title: "Langues", icon: Languages },
  { id: 6, title: "Aperçu", icon: Award },
];

export default function CVBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    summary: "",
  });
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: "1", company: "", position: "", startDate: "", endDate: "", description: "" }
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { id: "1", institution: "", degree: "", field: "", year: "" }
  ]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [languages, setLanguages] = useState<{ language: string; level: string }[]>([
    { language: "", level: "" }
  ]);

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: ""
    }]);
  };

  const removeExperience = (id: string) => {
    if (experiences.length > 1) {
      setExperiences(experiences.filter(exp => exp.id !== id));
    }
  };

  const addEducation = () => {
    setEducations([...educations, {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      year: ""
    }]);
  };

  const removeEducation = (id: string) => {
    if (educations.length > 1) {
      setEducations(educations.filter(edu => edu.id !== id));
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addLanguage = () => {
    setLanguages([...languages, { language: "", level: "" }]);
  };

  const removeLanguage = (index: number) => {
    if (languages.length > 1) {
      setLanguages(languages.filter((_, i) => i !== index));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      setError(null);
      setSuccess(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
      setSuccess(null);
    }
  };

  const generateCV = async () => {
    // Basic validation
    if (!personalInfo.fullName.trim()) {
      setError("Le nom complet est requis");
      setCurrentStep(1);
      return;
    }
    
    if (!personalInfo.email.trim()) {
      setError("L'email est requis");
      setCurrentStep(1);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare data for backend
      const cvData = {
        personal_info: {
          fullName: personalInfo.fullName.trim(),
          email: personalInfo.email.trim(),
          phone: personalInfo.phone.trim(),
          location: personalInfo.location.trim(),
          linkedin: personalInfo.linkedin.trim(),
          summary: personalInfo.summary.trim(),
        },
        experiences: experiences
          .filter(exp => exp.company.trim() || exp.position.trim())
          .map(exp => ({
            ...exp,
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            description: exp.description.trim()
          })),
        educations: educations
          .filter(edu => edu.institution.trim() || edu.degree.trim())
          .map(edu => ({
            ...edu,
            year: edu.year || ""
          })),
        skills: skills,
        languages: languages
          .filter(lang => lang.language.trim())
          .map(lang => ({
            language: lang.language.trim(),
            level: lang.level.trim() || "Intermédiaire"
          })),
        summary: personalInfo.summary.trim(),
        projects: [],
        certifications: [],
        achievements: [],
        hobbies: []
      };
      
      // Create FormData
      const formData = new FormData();
      formData.append('personal_info', JSON.stringify(cvData.personal_info));
      formData.append('experiences', JSON.stringify(cvData.experiences));
      formData.append('educations', JSON.stringify(cvData.educations));
      formData.append('skills', JSON.stringify(cvData.skills));
      formData.append('languages', JSON.stringify(cvData.languages));
      formData.append('summary', cvData.summary);
      formData.append('projects', JSON.stringify(cvData.projects));
      formData.append('certifications', JSON.stringify(cvData.certifications));
      formData.append('achievements', JSON.stringify(cvData.achievements));
      formData.append('hobbies', JSON.stringify(cvData.hobbies));
      
      // Call the backend
      const response = await fetch('http://localhost:8000/resume/generate-cv', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        let errorText = `Erreur ${response.status}`;
        try {
          const errorData = await response.text();
          errorText += ` - ${errorData}`;
        } catch {
          errorText += " - Impossible de lire le message d'erreur";
        }
        throw new Error(errorText);
      }
      
      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Create filename
      const name = personalInfo.fullName.replace(/\s+/g, '_') || 'CV';
      const date = new Date().toISOString().split('T')[0];
      const filename = `CV_${name}_${date}.docx`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(`CV généré avec succès! Le fichier "${filename}" a été téléchargé.`);
      
    } catch (err: any) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError("Impossible de se connecter au serveur. Vérifiez que le backend FastAPI est en cours d'exécution sur http://localhost:8000");
      } else {
        setError(err.message || "Erreur lors de la génération du CV.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Nom complet *</Label>
                <Input
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  placeholder="Ahmed Benjelloun"
                  className="bg-background"
                  required
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder="ahmed@email.com"
                  className="bg-background"
                  required
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Téléphone (optionnel)</Label>
                <Input
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  placeholder="+212 6XX XXX XXX"
                  className="bg-background"
                />
              </div>
              <div>
                <Label>Ville (optionnel)</Label>
                <Input
                  value={personalInfo.location}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                  placeholder="Casablanca, Maroc"
                  className="bg-background"
                />
              </div>
            </div>
            <div>
              <Label>LinkedIn (optionnel)</Label>
              <Input
                value={personalInfo.linkedin}
                onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                placeholder="linkedin.com/in/votreprofil"
                className="bg-background"
              />
            </div>
            <div>
              <Label>Résumé professionnel (optionnel)</Label>
              <Textarea
                value={personalInfo.summary}
                onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                placeholder="Décrivez votre profil en quelques phrases..."
                className="min-h-[120px] bg-background"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-border rounded-xl space-y-4 bg-background"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Expérience {index + 1}</span>
                  {experiences.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(exp.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Entreprise (optionnel)</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) => {
                        const updated = experiences.map(ex =>
                          ex.id === exp.id ? { ...ex, company: e.target.value } : ex
                        );
                        setExperiences(updated);
                      }}
                      placeholder="Nom de l'entreprise"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label>Poste (optionnel)</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) => {
                        const updated = experiences.map(ex =>
                          ex.id === exp.id ? { ...ex, position: e.target.value } : ex
                        );
                        setExperiences(updated);
                      }}
                      placeholder="Intitulé du poste"
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Date de début (optionnel)</Label>
                    <Input
                      type="month"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = experiences.map(ex =>
                          ex.id === exp.id ? { ...ex, startDate: e.target.value } : ex
                        );
                        setExperiences(updated);
                      }}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label>Date de fin (optionnel)</Label>
                    <Input
                      type="month"
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = experiences.map(ex =>
                          ex.id === exp.id ? { ...ex, endDate: e.target.value } : ex
                        );
                        setExperiences(updated);
                      }}
                      placeholder="Présent"
                      className="bg-background"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description (optionnel)</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => {
                      const updated = experiences.map(ex =>
                        ex.id === exp.id ? { ...ex, description: e.target.value } : ex
                      );
                      setExperiences(updated);
                    }}
                    placeholder="Décrivez vos responsabilités et réalisations..."
                    className="min-h-[100px] bg-background"
                  />
                </div>
              </motion.div>
            ))}
            <Button variant="outline" onClick={addExperience} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une expérience
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {educations.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-border rounded-xl space-y-4 bg-background"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Formation {index + 1}</span>
                  {educations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(edu.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Établissement (optionnel)</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = educations.map(ed =>
                          ed.id === edu.id ? { ...ed, institution: e.target.value } : ed
                        );
                        setEducations(updated);
                      }}
                      placeholder="Nom de l'établissement"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label>Diplôme (optionnel)</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = educations.map(ed =>
                          ed.id === edu.id ? { ...ed, degree: e.target.value } : ed
                        );
                        setEducations(updated);
                      }}
                      placeholder="Ex: Master, Licence..."
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Domaine d'étude (optionnel)</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) => {
                        const updated = educations.map(ed =>
                          ed.id === edu.id ? { ...ed, field: e.target.value } : ed
                        );
                        setEducations(updated);
                      }}
                      placeholder="Ex: Informatique"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label>Année d'obtention (optionnel)</Label>
                    <Input
                      value={edu.year}
                      onChange={(e) => {
                        const updated = educations.map(ed =>
                          ed.id === edu.id ? { ...ed, year: e.target.value } : ed
                        );
                        setEducations(updated);
                      }}
                      placeholder="2024"
                      className="bg-background"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            <Button variant="outline" onClick={addEducation} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une formation
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label>Ajouter des compétences (optionnel)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Ex: Python, React, SQL..."
                  className="bg-background"
                />
                <Button variant="coach" onClick={addSkill} className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Appuyez sur Entrée ou cliquez sur le bouton + pour ajouter
              </p>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[100px] p-4 border border-dashed border-border rounded-xl bg-background">
              <AnimatePresence>
                {skills.length === 0 ? (
                  <p className="text-sm text-muted-foreground self-center mx-auto">
                    Ajoutez vos compétences techniques et soft skills...
                  </p>
                ) : (
                  skills.map((skill) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge variant="secondary" className="gap-2 px-3 py-1.5">
                        {skill}
                        <button 
                          onClick={() => removeSkill(skill)}
                          className="hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {languages.map((lang, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-border rounded-xl space-y-4 bg-background"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Langue {index + 1}</span>
                  {languages.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLanguage(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Langue (optionnel)</Label>
                    <Input
                      value={lang.language}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[index].language = e.target.value;
                        setLanguages(updated);
                      }}
                      placeholder="Ex: Français, Anglais, Arabe..."
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <Label>Niveau (optionnel)</Label>
                    <select
                      value={lang.level}
                      onChange={(e) => {
                        const updated = [...languages];
                        updated[index].level = e.target.value;
                        setLanguages(updated);
                      }}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Sélectionner un niveau</option>
                      <option value="Natif">Natif</option>
                      <option value="Courant">Courant</option>
                      <option value="Avancé">Avancé</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Débutant">Débutant</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}
            <Button variant="outline" onClick={addLanguage} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une langue
            </Button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {/* Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive mb-1">Erreur</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 bg-green-50 border border-green-200 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800 mb-1">Succès!</p>
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Generate Button */}
            <div className="glass rounded-2xl p-6 text-center">
              <div className="w-20 h-20 gradient-coach rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                Votre CV est prêt!
              </h3>
              <p className="text-muted-foreground mb-6">
                Téléchargez votre CV au format Word, optimisé pour les systèmes ATS.
              </p>
              
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full max-w-xs mx-auto"
                onClick={generateCV}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Télécharger CV (DOCX)
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4">
                Format: DOCX (compatible avec Microsoft Word, LibreOffice, Google Docs)
              </p>
            </div>

            {/* Preview Summary */}
            <div className="border border-border rounded-xl p-6 space-y-4 bg-background">
              <h4 className="font-semibold text-lg mb-4">Aperçu de votre CV</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Nom:</span>{" "}
                    <span className="font-medium">{personalInfo.fullName || "Non renseigné"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-medium">{personalInfo.email || "Non renseigné"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Téléphone:</span>{" "}
                    <span className="font-medium">{personalInfo.phone || "Non renseigné"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-muted-foreground">Localisation:</span>{" "}
                    <span className="font-medium">{personalInfo.location || "Non renseigné"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expériences:</span>{" "}
                    <span className="font-medium">{experiences.filter(e => e.company.trim() || e.position.trim()).length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Formations:</span>{" "}
                    <span className="font-medium">{educations.filter(e => e.institution.trim() || e.degree.trim()).length}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Compétences:</span>{" "}
                  <span className="font-medium">{skills.length}</span>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skills.slice(0, 5).map((skill, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{skills.length - 5} autres
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground">Langues:</span>{" "}
                  <span className="font-medium">{languages.filter(l => l.language.trim()).length}</span>
                  {languages.filter(l => l.language.trim()).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {languages.filter(l => l.language.trim()).map((lang, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {lang.language} ({lang.level || "Intermédiaire"})
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {personalInfo.summary && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">Résumé professionnel:</h5>
                  <p className="text-sm text-foreground/80">{personalInfo.summary}</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 gradient-user rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-secondary-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
            Créateur de CV Professionnel
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Créez un CV professionnel optimisé pour le marché marocain. Toutes les informations optionnelles.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="glass rounded-2xl p-3 sm:p-4 mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary/10"
                        : isCompleted
                        ? "text-green-600"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isActive
                          ? "gradient-coach"
                          : isCompleted
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <Icon
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            isActive ? "text-white" : "text-muted-foreground"
                          }`}
                        />
                      )}
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-4 sm:w-8 h-0.5 mx-1 sm:mx-2 ${
                        currentStep > step.id ? "bg-green-500" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {(() => {
                const Icon = steps[currentStep - 1].icon;
                return <Icon className="w-4 h-4 text-primary" />;
              })()}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {steps[currentStep - 1].title}
            </h2>
          </div>
          {renderStepContent()}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          
          {currentStep < steps.length ? (
            <Button 
              variant="coach" 
              onClick={nextStep}
              className="w-full sm:w-auto"
            >
              Suivant
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <div className="w-full sm:w-48"></div>
          )}
        </div>
        
       
      </div>
    </PageLayout>
  );
}
