// src/services/api.ts - CORRECTED VERSION
const API_BASE = 'http://localhost:8000';

// Types for requests/responses
export interface SearchRequest {
  query: string;
  session_id?: string;
}

export interface Job {
  job_id: number;
  job_title: string;
  category: string;
  description: string;
  required_skills: string;
  recommended_courses?: string;
  avg_salary_mad?: number;
  demand_level?: string;
  match_score: number;
  linkedin_url?: string;
  all_search_urls?: {
    linkedin?: string;
    google?: string;
    indeed?: string;
    stagiaires_url?: string;
    rekrute_url?: string;
  };
  source_query?: string;
  location?: string;
  stagiaires_url?: string;
}

export interface AssistantResponse {
  jobs: Job[];
  analysis?: any;
  summary?: any;
  search_query_used?: string;
  suggestions?: string[];
  debug_info?: any;
}

export interface SmartAssistantResponse {
  assistant_response: string;
  coaching_advice?: string;
  intent: string;
  search_query_used?: string;
  total_matches?: number;
  jobs: Job[];
  search_urls?: any[];
  needs_clarification?: boolean;
  clarification_questions?: string[];
  is_coaching?: boolean;
}

// CV Analysis Types
export interface CVAnalysisResult {
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
  cv_sections?: {
    experience: string;
    education: string;
    skills: string;
    summary: string;
    contact: string;
    projects: string;
    languages: string;
    certifications: string;
  };
  filename?: string;
  api_skills?: string[];
  api_experience?: any[];
}

class APIClient {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_BASE;
    this.timeout = 600000; // 10 minutes for large file uploads
  }
  
  public getBaseUrl(): string {
    return this.baseUrl;
  }
  
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    files?: File[]
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {},
    };

    console.log(`API Request: ${method} ${url}`, { data, files });

    // Handle file uploads
    if (files && files.length > 0) {
      const formData = new FormData();
      
      // Add files
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      // Add other data
      if (data) {
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        });
      }
      
      options.body = formData;
    } else if (data) {
      if (method.toUpperCase() === 'GET') {
        // For GET requests, add params to URL
        const params = new URLSearchParams();
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined) {
            params.append(key, data[key]);
          }
        });
        const fullUrl = `${url}?${params.toString()}`;
        return this.makeRequest<T>(method, fullUrl.replace(this.baseUrl, ''));
      } else {
        // For POST/PUT, send as JSON
        options.headers = {
          'Content-Type': 'application/json',
          ...options.headers,
        };
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      return responseData as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  private async makeRequestWithParams<T>(
    method: string,
    endpoint: string,
    params?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Build URL with query parameters
    let fullUrl = url;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined) {
          queryParams.append(key, params[key]);
        }
      });
      fullUrl = `${url}?${queryParams.toString()}`;
    }

    console.log(`API Request: ${method} ${fullUrl}`);

    try {
      const response = await fetch(fullUrl, {
        method: method.toUpperCase(),
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      return responseData as T;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // ===== ASSISTANT API =====
  
  async assistantSearch(message: string): Promise<AssistantResponse> {
    return this.makeRequestWithParams<AssistantResponse>('POST', '/api/assistant', { 
      message 
    });
  }

  async assistantAsk(query: string): Promise<AssistantResponse> {
    return this.makeRequest<AssistantResponse>('POST', '/api/assistant/ask', {
      query
    });
  }

  // ===== SMART ASSISTANT =====
  
  async smartAssistantSearch(
    message: string,
    clarification?: string
  ): Promise<SmartAssistantResponse> {
    const params: any = { message };
    if (clarification) {
      params.clarification = clarification;
    }
    
    return this.makeRequestWithParams<SmartAssistantResponse>('POST', '/api/smart-assistant', params);
  }

  // ===== SEARCH API =====
  
  async searchJobs(query: string, session_id?: string): Promise<{ results: Job[] }> {
    return this.makeRequest<{ results: Job[] }>('POST', '/api/search', {
      query,
      session_id: session_id || this.generateSessionId()
    });
  }

  async clarifySearch(answer: string, session_id: string): Promise<{ results: Job[] }> {
    return this.makeRequest<{ results: Job[] }>('POST', '/api/clarify', {
      session_id,
      answer
    });
  }

  async getLastResults(session_id: string): Promise<{ results: Job[] }> {
    return this.makeRequest<{ results: Job[] }>('GET', `/api/results`, {
      session_id
    });
  }

  // ===== JOBS API =====
  
  async getAllJobs(): Promise<Job[]> {
    return this.makeRequest<Job[]>('GET', '/jobs/all');
  }

  async searchJobsByQuery(query: string, top_k: number = 5): Promise<{ results: Job[] }> {
    return this.makeRequest<{ results: Job[] }>('GET', '/jobs/search', {
      query,
      top_k
    });
  }

  async getJobCategories(): Promise<string[]> {
    return this.makeRequest<string[]>('GET', '/jobs/categories');
  }

  async getJobsByCategory(category: string): Promise<Job[]> {
    return this.makeRequest<Job[]>('GET', `/jobs/category/${encodeURIComponent(category)}`);
  }

  // ===== CV ANALYZER =====
  
  async analyzeCVUpload(cvFile: File, jobDescription: string): Promise<CVAnalysisResult> {
    try {
      console.log('Analyzing CV upload...', cvFile.name);
      
      const formData = new FormData();
      formData.append('cv_file', cvFile);
      formData.append('job_description', jobDescription);
      
      const response = await fetch(`${this.baseUrl}/cv/analyze-upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CV upload analysis failed:', error);
      throw error;
    }
  }

  async analyzeCVText(cvText: string, jobDescription: string): Promise<CVAnalysisResult> {
    try {
      console.log('Analyzing CV text...');
      
      const response = await fetch(`${this.baseUrl}/cv/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: new URLSearchParams({
          cv_text: cvText,
          job_description: jobDescription,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CV text analysis failed:', error);
      throw error;
    }
  }

  async analyzeCV(
    cvFile?: File,
    cvText?: string,
    jobDescription?: string,
    session_id?: string
  ): Promise<any> {
    const files = cvFile ? [cvFile] : undefined;
    return this.makeRequest<any>('POST', '/api/cv_analyser', {
      cv_text: cvText,
      job_description: jobDescription,
      session_id: session_id || this.generateSessionId()
    }, files);
  }

  // Test CV module connection
  async testCVModule(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/cv/test`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: CV module not available`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('CV module test failed:', error);
      throw error;
    }
  }

  // Get available skills from CV analyzer
  async getAvailableSkills(): Promise<{ technical_skills: string[], total_skills: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/cv/skills`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get skills failed:', error);
      throw error;
    }
  }

  // ===== ATS OPTIMIZER =====
  
  async optimizeATSCV(
    cvFile: File,
    targetRole?: string,
    session_id?: string
  ): Promise<any> {
    return this.makeRequest<any>('POST', '/api/ats_cv', {
      target_role: targetRole,
      session_id: session_id || this.generateSessionId()
    }, [cvFile]);
  }

  // Update the evaluateATSResume method in APIClient class:
async evaluateATSResume(
  cvFile?: File,
  cvText?: string,
  session_id?: string
): Promise<any> {
  // Create form data for file upload
  const formData = new FormData();
  
  if (cvFile) {
    formData.append('cv_file', cvFile);
  }
  
  if (cvText) {
    formData.append('cv_text', cvText);
  }
  
  if (session_id) {
    formData.append('session_id', session_id);
  }
  
  try {
    const response = await fetch(`${this.baseUrl}/api/ats_evaluate`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ATS Evaluation Error ${response.status}:`, errorText);
      throw new Error(`ATS Evaluation Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('ATS Evaluation Response:', responseData);
    return responseData;
  } catch (error) {
    console.error('ATS Evaluation Request failed:', error);
    throw error;
  }
}
  // ===== UTILITY METHODS =====
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }
// ===== CV GENERATOR =====

async generateCV(cvData: {
  personal_info: any;
  experiences: any[];
  educations: any[];
  skills: string[];
  languages: any[];
  summary: string;
  projects?: any[];
  certifications?: any[];
  achievements?: string[];
  hobbies?: string[];
}): Promise<Blob> {
  try {
    // Create FormData for sending multipart data
    const formData = new FormData();
    
    // Convert all data to JSON strings and append to formData
    formData.append('personal_info', JSON.stringify(cvData.personal_info));
    formData.append('experiences', JSON.stringify(cvData.experiences));
    formData.append('educations', JSON.stringify(cvData.educations));
    formData.append('skills', JSON.stringify(cvData.skills));
    formData.append('languages', JSON.stringify(cvData.languages));
    formData.append('summary', cvData.summary);
    
    // Optional fields
    if (cvData.projects && cvData.projects.length > 0) {
      formData.append('projects', JSON.stringify(cvData.projects));
    }
    if (cvData.certifications && cvData.certifications.length > 0) {
      formData.append('certifications', JSON.stringify(cvData.certifications));
    }
    if (cvData.achievements && cvData.achievements.length > 0) {
      formData.append('achievements', JSON.stringify(cvData.achievements));
    }
    if (cvData.hobbies && cvData.hobbies.length > 0) {
      formData.append('hobbies', JSON.stringify(cvData.hobbies));
    }
    
    console.log('Sending CV generation request...', cvData);
    
    const response = await fetch(`${this.baseUrl}/api/generate-cv`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CV Generation Error ${response.status}:`, errorText);
      throw new Error(`CV Generation Error: ${response.status} - ${errorText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('CV generation failed:', error);
    throw error;
  }
}
  // Test specific CV module connection
  async testCVConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/cv/test`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      return response.ok;
    } catch (error) {
      console.error('CV module connection test failed:', error);
      return false;
    }
  }

  // Debug function to test all endpoints
  async debugEndpoints(): Promise<any> {
    const results: any = {};
    
    // Test endpoints
    const tests = [
      { name: 'Root', method: 'GET', endpoint: '/' },
      { name: 'Assistant POST', method: 'POST', endpoint: '/api/assistant', params: { message: 'test query' } },
      { name: 'Smart Assistant POST', method: 'POST', endpoint: '/api/smart-assistant', params: { message: 'test query' } },
      { name: 'Jobs All', method: 'GET', endpoint: '/jobs/all' },
      { name: 'CV Module Test', method: 'GET', endpoint: '/cv/test' },
      { name: 'CV Skills', method: 'GET', endpoint: '/cv/skills' },
      { name: 'CV Demo', method: 'GET', endpoint: '/cv/demo' },
    ];
    
    for (const test of tests) {
      try {
        if (test.method === 'POST') {
          results[test.name] = await this.makeRequestWithParams<any>(
            test.method, 
            test.endpoint, 
            test.params
          );
        } else {
          const response = await fetch(`${this.baseUrl}${test.endpoint}`, {
            method: test.method,
            headers: { 'Accept': 'application/json' },
          });
          
          if (response.ok) {
            results[test.name] = await response.json();
          } else {
            results[test.name] = { error: `HTTP ${response.status}` };
          }
        }
      } catch (error: any) {
        results[test.name] = { error: error.message };
      }
    }
    
    return results;
  }
}

// Singleton instance
export const apiClient = new APIClient();