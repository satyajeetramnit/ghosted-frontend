export interface WorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  location?: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  leetcode?: string;
  hackerrank?: string;
  summary: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
}

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  leetcode: string;
  hackerrank: string;
  currentTitle: string;
  yearsExp: string;
  existingSummary: string;
}

export interface SavedResume {
  id: string;
  companyName: string;
  jobTitle: string;
  applicationId?: string;
  resumeData: ResumeData;
  latexCode: string;
  createdAt: string;
  updatedAt: string;
}

/** Global user profile — persisted to localStorage, used across resume builder */
export interface GlobalProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  leetcode: string;
  hackerrank: string;
  currentTitle: string;
  yearsExp: string;
  existingSummary: string;
}

/** User-defined experience entry (structure only — AI fills bullets) */
export interface ExperienceTemplate {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
}

/** User-defined education entry */
export interface EducationTemplate {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  location?: string;
  gpa?: string;
  coursework?: string;
}

/** User-defined project entry (structure only — AI fills description) */
export interface ProjectTemplate {
  id: string;
  name: string;
  link?: string;
}

/** The full resume template a user configures once and reuses across jobs */
export interface ResumeTemplate {
  experiences: ExperienceTemplate[];
  education: EducationTemplate[];
  projects: ProjectTemplate[];
}
