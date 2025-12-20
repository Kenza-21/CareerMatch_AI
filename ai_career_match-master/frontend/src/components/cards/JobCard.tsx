import { motion } from "framer-motion";
import { MapPin, Building2, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobCardProps {
  title: string;
  company: string;
  location: string;
  date?: string;
  matchScore?: number;
  url?: string;
  source?: string;
  delay?: number;
  description?: string;
  required_skills?: string;
  backendData?: any; // Add this to pass backend data
}

export function JobCard({
  title,
  company,
  location,
  date,
  matchScore,
  url,
  source,
  delay = 0,
  description,
  required_skills,
  backendData
}: JobCardProps) {
  
  // Handle external link click
  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (url && url !== "#") {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title & Company */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-foreground truncate mb-1">{title}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{company}</span>
              </div>
            </div>
            
            {/* External Link Button */}
            {url && url !== "#" && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 flex-shrink-0"
                onClick={handleLinkClick}
                title="Voir l'offre"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
            {date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{date}</span>
              </div>
            )}
            {source && (
              <Badge variant="secondary" className="text-xs">
                {source}
              </Badge>
            )}
          </div>
          
          {/* Skills Preview */}
          {required_skills && (
            <div className="mt-3 flex flex-wrap gap-1">
              {required_skills.split(',').slice(0, 3).map((skill: string, idx: number) => (
                <span key={idx} className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded">
                  {skill.trim()}
                </span>
              ))}
              {required_skills.split(',').length > 3 && (
                <span className="text-xs px-2 py-1 text-muted-foreground">
                  +{required_skills.split(',').length - 3} plus
                </span>
              )}
            </div>
          )}
        </div>

        {/* Match Score & Action */}
        <div className="flex flex-col items-end gap-2">
          {matchScore !== undefined && (
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              matchScore >= 80 ? "bg-success/10 text-success" :
              matchScore >= 60 ? "bg-primary/10 text-primary" :
              matchScore >= 40 ? "bg-warning/10 text-warning" :
              "bg-muted text-muted-foreground"
            }`}>
              {matchScore}%
            </div>
          )}
          
          {/* Additional Links from Backend */}
          {backendData?.all_search_urls && (
            <div className="flex gap-1">
              {backendData.all_search_urls.linkedin && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={backendData.all_search_urls.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs"
                  >
                    LI
                  </a>
                </Button>
              )}
              {backendData.all_search_urls.google && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={backendData.all_search_urls.google} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs"
                  >
                    G
                  </a>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default JobCard;