"""
Text Normalization and Skill Matching Module
Simplified version without semantic matching
"""
import re
from typing import List, Dict
from unicodedata import normalize


class TextNormalizer:
    """Handles text normalization: lowercase, accent removal, punctuation, spaces"""
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalize text: lowercase, remove accents, punctuation, extra spaces
        """
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove accents
        try:
            text = normalize('NFD', text)
            text = text.encode('ascii', 'ignore').decode('utf-8')
        except:
            pass
        
        # Remove punctuation
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text)
        
        # Strip leading/trailing spaces
        text = text.strip()
        
        return text
    
    @staticmethod
    def normalize_skill(skill: str) -> str:
        """Normalize a single skill name"""
        return TextNormalizer.normalize_text(skill)


class SynonymMapper:
    """Maps synonyms and variants to standard skill names"""
    
    def __init__(self):
        self.synonym_map = {
            # SQL variants
            "sql server": "sql",
            "mssql": "sql",
            "mysql": "sql",
            "postgresql": "sql",
            "postgres": "sql",
            "oracle sql": "sql",
            "sqlite": "sql",
            "tsql": "sql",
            "plsql": "sql",
            
            # Data Science variants
            "data science": "data science",
            "data scientist": "data science",
            "data analytics": "data science",
            "data analysis": "data science",
            
            # JavaScript variants
            "js": "javascript",
            "ecmascript": "javascript",
            
            # Node.js variants
            "nodejs": "node.js",
            "node": "node.js",
            "node js": "node.js",
            
            # React variants
            "reactjs": "react",
            "react.js": "react",
            "react js": "react",
            
            # Python variants
            "py": "python",
            "python3": "python",
            "python 3": "python",
            
            # Java variants
            "java": "java",
            "java se": "java",
            
            # Docker variants
            "docker": "docker",
            
            # Kubernetes variants
            "k8s": "kubernetes",
            
            # AWS variants
            "amazon web services": "aws",
            "amazon aws": "aws",
            
            # Git variants
            "git": "git",
            "github": "git",
            "gitlab": "git",
            
            # REST API variants
            "rest": "rest api",
            "restful": "rest api",
            "rest api": "rest api",
            "restful api": "rest api",
            "api": "rest api",
            
            # HTML/CSS variants
            "html5": "html",
            "css3": "css",
            
            # MongoDB variants
            "mongo": "mongodb",
            "mongo db": "mongodb",
        }
    
    def normalize_skill(self, skill: str) -> str:
        """
        Normalize a skill name using synonym mapping
        """
        normalized = TextNormalizer.normalize_skill(skill)
        
        # Check if we have a synonym mapping
        if normalized in self.synonym_map:
            return self.synonym_map[normalized]
        
        # Check for partial matches
        for variant, standard in self.synonym_map.items():
            if variant in normalized or normalized in variant:
                if len(variant) > len(normalized) or normalized in variant:
                    return standard
        
        return normalized
    
    def get_standard_form(self, skill: str) -> str:
        """
        Get the standard form of a skill from the synonym map
        """
        return self.normalize_skill(skill)


class SkillMatcher:
    """Simple skill matcher"""
    
    def __init__(self, use_semantic: bool = False):
        self.normalizer = TextNormalizer()
        self.synonym_mapper = SynonymMapper()
        self.use_semantic = use_semantic
        print(f"✅ SkillMatcher initialized (semantic: {use_semantic})")


# Global instances
text_normalizer = TextNormalizer()
synonym_mapper = SynonymMapper()
skill_matcher = SkillMatcher(use_semantic=False)