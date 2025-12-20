# services/resume_enhancer_api.py (new file)
import google.generativeai as genai
import re

def get_suitable_gemini_model(api_key):
    """Simplified model selection for API use"""
    try:
        genai.configure(api_key=api_key)
        models = [m for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        # Prefer newer models
        preferred_models = [
            "gemini-2.5-flash",
            "gemini-1.5-flash-8b",
            "gemini-2.0-flash",
            "gemini-1.5-flash-latest"
        ]
        
        for preferred in preferred_models:
            for model in models:
                if preferred in model.name:
                    return model.name
        
        # Fallback to first available
        return models[0].name if models else None
        
    except Exception:
        return None

def generate_prompt(section_name, text_content, tone="Professional"):
    """Same as before, but for API use"""
    base_prompt = f"As an expert resume writer, rewrite the following {section_name} to be highly impactful, concise, and ATS-friendly, using a {tone} tone. Focus on achievements, quantifiable results, and strong action verbs. Avoid generic statements and focus on unique contributions."

    if section_name == "professional_summary":
        return f"{base_prompt} Ensure it is between 30 to 70 words.\n\nHere is the summary:\n{text_content}\n\nEnhanced Professional Summary (30-70 words):"
    elif section_name == "job_responsibility":
        return f"Rewrite the following job responsibilities into a maximum of 3 concise, impactful bullet points. Each bullet point should start with a strong action verb and focus on quantifiable achievements. If specific numbers are not provided, estimate reasonable numeric statistics. Do NOT include any headers, introductory text, or concluding remarks. Provide ONLY the bullet points, one per line.\n\nHere are the job responsibilities:\n{text_content}\n\nEnhanced Responsibilities (max 3 bullet points with quantifiable results). Just give plain text with no sort of formatting:"
    elif section_name == "project_description":
        return f"Rewrite the following project descriptions into a maximum of 3 concise, impactful bullet points. Each bullet point should start with a strong action verb and highlight contributions and results. If specific numbers are not provided, estimate reasonable numeric statistics. Do NOT include any headers, introductory text, or concluding remarks. Provide ONLY the bullet points, one per line.\n\nHere are the project descriptions:\n{text_content}\n\nEnhanced Project Descriptions (max 3 bullet points with quantifiable results). Just give plain text with no sort of formatting:"
    elif section_name == "skills_section":
        return f"From the following text, extract and categorize all relevant technical skills and soft skills. List 'Technical Skills' as a comma-separated string on one line, and 'Soft Skills' as a comma-separated string on the next line. Do NOT include any other text, headers, or formatting. Ensure no duplicate skills. Moreover, from the extracted skills, add more closely connected skills toh the list you return. If a category has no skills, just leave it blank after the colon.\n\nExample Output:\nTechnical Skills: Python, Java, AWS, SQL\nSoft Skills: Leadership, Communication, Problem-solving\n\nText to extract skills from:\n{text_content}\n\nEnhanced Skills Section:"
    elif section_name == "achievements":
        return f"Rewrite the following achievements into concise, keyword-rich, and impactful sentences. Focus on quantifiable results where possible. If an achievement is vague, make a reasonable professional interpretation. Separate each achievement sentence with a comma. Do NOT include any introductory or concluding sentences, just the comma-separated sentences.\n\nAchievements:\n{text_content}\n\nEnhanced Achievements:"
    else:
        return f"{base_prompt}\n\nHere is the content:\n{text_content}\n\nEnhanced Content:"

def enhance_content_with_gemini(section_name, text_content, tone, api_key):
    """Enhanced version for API use without Streamlit dependencies"""
    if not api_key:
        raise ValueError("Gemini API key is required")
    
    model_name = get_suitable_gemini_model(api_key)
    if not model_name:
        raise ValueError("No suitable Gemini model found")
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(model_name)
        
        prompt = generate_prompt(section_name, text_content, tone)
        
        response = model.generate_content(
            prompt,
            safety_settings={
                'HARASSMENT': 'BLOCK_NONE',
                'HATE': 'BLOCK_NONE',
                'SEXUAL': 'BLOCK_NONE',
                'DANGEROUS': 'BLOCK_NONE'
            }
        )
        
        if response and response.parts:
            enhanced_text = ""
            for part in response.parts:
                if hasattr(part, 'text'):
                    enhanced_text += part.text
            return enhanced_text.strip()
        else:
            return text_content  # Return original on failure
            
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")