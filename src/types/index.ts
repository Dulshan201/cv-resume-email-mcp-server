export interface CVData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: string[];
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface EmailRequest {
  recipient: string;
  subject: string;
  body: string;
}
