from fastapi import APIRouter, HTTPException, Form, UploadFile, File
from fastapi.responses import StreamingResponse
import json
from services.builder.resume_enhancer import enhance_content_with_gemini, get_gemini_api_key
from services.builder.generator_standard import generate_structured_resume
import io
import json
from datetime import datetime
router = APIRouter(prefix="/resume", tags=["resume"])
# Add this to resume_routes.py after your existing routes


@router.post("/generate-cv")
async def generate_cv_from_form(
    personal_info: str = Form(..., description="Personal info JSON"),
    experiences: str = Form(..., description="Experiences JSON"),
    educations: str = Form(..., description="Educations JSON"),
    skills: str = Form(..., description="Skills JSON array"),
    languages: str = Form(..., description="Languages JSON array"),
    summary: str = Form("", description="Professional summary"),
    projects: str = Form("[]", description="Projects JSON array"),
    certifications: str = Form("[]", description="Certifications JSON array"),
    achievements: str = Form("[]", description="Achievements JSON array"),
    hobbies: str = Form("[]", description="Hobbies JSON array")
):
    """Generate CV from form data (compatible with React frontend)"""
    try:
        print("📄 Generating CV from form data")
        
        # Parse all JSON data
        personal = json.loads(personal_info)
        exp_list = json.loads(experiences)
        edu_list = json.loads(educations)
        skills_list = json.loads(skills)
        languages_list = json.loads(languages)
        projects_list = json.loads(projects)
        certs_list = json.loads(certifications)
        achievements_list = json.loads(achievements)
        hobbies_list = json.loads(hobbies)
        
        # Transform data to match generator_standard.py format
        structured_data = {
            "personal": {
                "name": personal.get("fullName", ""),
                "email": personal.get("email", ""),
                "phone": personal.get("phone", ""),
                "location": personal.get("location", ""),
                "linkedin": personal.get("linkedin", ""),
                "github": "",
                "website": "",
                "title": ""
            },
            "summary": summary,
            "education": [
                {
                    "degree": edu.get("degree", ""),
                    "university": edu.get("institution", ""),
                    "location": "",
                    "start_date": "",
                    "end_date": edu.get("year", ""),
                    "gpa": "",
                    "coursework": edu.get("field", "")
                }
                for edu in edu_list if edu.get("institution") or edu.get("degree")
            ],
            "experience": [
                {
                    "job_title": exp.get("position", ""),
                    "company": exp.get("company", ""),
                    "location": "",
                    "start_date": exp.get("startDate", ""),
                    "end_date": exp.get("endDate", ""),
                    "responsibilities": [exp.get("description", "")]
                }
                for exp in exp_list if exp.get("company") or exp.get("position")
            ],
            "projects": [
                {
                    "title": proj.get("title", ""),
                    "tech_stack": proj.get("tech", ""),
                    "description": proj.get("description", ""),
                    "deployment": proj.get("link", ""),
                    "link": proj.get("link", "")
                }
                for proj in projects_list
            ],
            "skills": {
                "technical": skills_list,
                "soft": []
            },
            "certifications": [
                {
                    "title": cert.get("title", ""),
                    "issuer": cert.get("issuer", ""),
                    "link": cert.get("link", "")
                }
                for cert in certs_list
            ],
            "achievements_hobbies": {
                "achievements": achievements_list,
                "hobbies": hobbies_list
            }
        }
        
        # Add languages to hobbies section if present
        if languages_list and any(lang.get("language") for lang in languages_list):
            language_text = ", ".join([
                f"{lang['language']} ({lang['level']})" 
                for lang in languages_list 
                if lang.get("language")
            ])
            structured_data["achievements_hobbies"]["hobbies"].append(f"Languages: {language_text}")
        
        print(f"✅ Data structured for {structured_data['personal']['name']}")
        print(f"   Experiences: {len(structured_data['experience'])}")
        print(f"   Education: {len(structured_data['education'])}")
        print(f"   Skills: {len(structured_data['skills']['technical'])}")
        
        # Generate the resume document
        doc_bytes = generate_structured_resume(structured_data)
        
        # Create filename
        name = structured_data["personal"]["name"].replace(" ", "_") or "CV"
        date = datetime.now().strftime("%Y%m%d")
        filename = f"CV_{name}_{date}.docx"
        
        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(doc_bytes.getvalue()),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
    except Exception as e:
        print(f"❌ Error generating CV: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"CV generation error: {str(e)}")
@router.post("/enhance")
async def enhance_resume_section(
    section_name: str = Form(..., description="Section to enhance (e.g., 'professional_summary', 'job_responsibility')"),
    content: str = Form(..., description="Content to enhance"),
    tone: str = Form("Professional", description="Tone for enhancement"),
    api_key: str = Form(None, description="Optional Gemini API key")
):
    """Enhance a specific resume section using AI"""
    try:
        print(f"🔧 Enhancing resume section: {section_name}")
        
        if not content or len(content.strip()) < 10:
            raise HTTPException(status_code=400, detail="Content too short")
        
        # If no API key provided, use the function to get it
        if not api_key:
            # Note: You might need to adjust this for FastAPI context
            # Since Streamlit secrets won't work, require API key as parameter
            raise HTTPException(
                status_code=400, 
                detail="Gemini API key is required. Please provide it as a parameter."
            )
        
        # Call the enhancement function
        enhanced_content = enhance_content_with_gemini(
            section_name=section_name,
            text_content=content,
            tone=tone,
            api_key=api_key
        )
        
        return {
            "status": "success",
            "original_content": content,
            "enhanced_content": enhanced_content,
            "section": section_name
        }
        
    except Exception as e:
        print(f"❌ Error enhancing resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Enhancement error: {str(e)}")

@router.post("/generate")
async def generate_resume_document(
    resume_data: str = Form(..., description="JSON string of resume data")
):
    """Generate a structured resume document in DOCX format"""
    try:
        print("📄 Generating resume document")
        
        # Parse the JSON data
        try:
            data = json.loads(resume_data)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON data: {str(e)}")
        
        # Validate required fields
        if "personal" not in data:
            raise HTTPException(status_code=400, detail="Missing personal information")
        
        # Generate the resume document
        doc_bytes = generate_structured_resume(data)
        
        # Return as downloadable file
        return StreamingResponse(
            io.BytesIO(doc_bytes.getvalue()),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": "attachment; filename=resume.docx"
            }
        )
        
    except Exception as e:
        print(f"❌ Error generating resume: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation error: {str(e)}")

@router.post("/enhance-batch")
async def enhance_resume_batch(
    sections: str = Form(..., description="JSON object with sections to enhance"),
    tone: str = Form("Professional", description="Tone for enhancement"),
    api_key: str = Form(..., description="Gemini API key")
):
    """Enhance multiple resume sections at once"""
    try:
        print("🔧 Enhancing multiple resume sections")
        
        # Parse sections JSON
        try:
            sections_data = json.loads(sections)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid sections data: {str(e)}")
        
        if not isinstance(sections_data, dict):
            raise HTTPException(status_code=400, detail="Sections must be a dictionary")
        
        enhanced_sections = {}
        
        for section_name, content in sections_data.items():
            if content and len(str(content).strip()) > 10:
                enhanced_content = enhance_content_with_gemini(
                    section_name=section_name,
                    text_content=str(content),
                    tone=tone,
                    api_key=api_key
                )
                enhanced_sections[section_name] = enhanced_content
            else:
                enhanced_sections[section_name] = content
        
        return {
            "status": "success",
            "enhanced_sections": enhanced_sections
        }
        
    except Exception as e:
        print(f"❌ Error in batch enhancement: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch enhancement error: {str(e)}")

@router.get("/supported-sections")
async def get_supported_sections():
    """Get list of supported resume sections for enhancement"""
    return {
        "supported_sections": [
            "professional_summary",
            "job_responsibility",
            "project_description",
            "skills_section",
            "achievements"
        ],
        "supported_tones": [
            "Professional",
            "Confident",
            "Achievement-oriented",
            "Concise"
        ]
    }

@router.get("/test")
async def test_resume_module():
    """Test the resume module"""
    return {
        "status": "success",
        "message": "Resume module is operational",
        "endpoints": {
            "enhance": "POST /resume/enhance",
            "generate": "POST /resume/generate",
            "enhance_batch": "POST /resume/enhance-batch"
        }
    }