import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ResumeTemplate,
  ExperienceTemplate,
  EducationTemplate,
  ProjectTemplate,
} from '@/types/resume';

function makeId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

interface TemplateStoreState {
  template: ResumeTemplate;

  addExperience: (exp: Omit<ExperienceTemplate, 'id'>) => void;
  updateExperience: (id: string, updates: Partial<Omit<ExperienceTemplate, 'id'>>) => void;
  removeExperience: (id: string) => void;
  moveExperience: (id: string, dir: 'up' | 'down') => void;

  addEducation: (edu: Omit<EducationTemplate, 'id'>) => void;
  updateEducation: (id: string, updates: Partial<Omit<EducationTemplate, 'id'>>) => void;
  removeEducation: (id: string) => void;

  addProject: (proj: Omit<ProjectTemplate, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Omit<ProjectTemplate, 'id'>>) => void;
  removeProject: (id: string) => void;
  moveProject: (id: string, dir: 'up' | 'down') => void;
}

export const useTemplateStore = create<TemplateStoreState>()(
  persist(
    (set) => ({
      template: { experiences: [], education: [], projects: [] },

      addExperience: (exp) =>
        set((s) => ({
          template: {
            ...s.template,
            experiences: [...s.template.experiences, { ...exp, id: makeId() }],
          },
        })),
      updateExperience: (id, updates) =>
        set((s) => ({
          template: {
            ...s.template,
            experiences: s.template.experiences.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          },
        })),
      removeExperience: (id) =>
        set((s) => ({
          template: {
            ...s.template,
            experiences: s.template.experiences.filter((e) => e.id !== id),
          },
        })),
      moveExperience: (id, dir) =>
        set((s) => {
          const arr = [...s.template.experiences];
          const idx = arr.findIndex((e) => e.id === id);
          if (idx < 0) return s;
          const ni = dir === 'up' ? idx - 1 : idx + 1;
          if (ni < 0 || ni >= arr.length) return s;
          [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
          return { template: { ...s.template, experiences: arr } };
        }),

      addEducation: (edu) =>
        set((s) => ({
          template: {
            ...s.template,
            education: [...s.template.education, { ...edu, id: makeId() }],
          },
        })),
      updateEducation: (id, updates) =>
        set((s) => ({
          template: {
            ...s.template,
            education: s.template.education.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          },
        })),
      removeEducation: (id) =>
        set((s) => ({
          template: {
            ...s.template,
            education: s.template.education.filter((e) => e.id !== id),
          },
        })),

      addProject: (proj) =>
        set((s) => ({
          template: {
            ...s.template,
            projects: [...s.template.projects, { ...proj, id: makeId() }],
          },
        })),
      updateProject: (id, updates) =>
        set((s) => ({
          template: {
            ...s.template,
            projects: s.template.projects.map((p) =>
              p.id === id ? { ...p, ...updates } : p
            ),
          },
        })),
      removeProject: (id) =>
        set((s) => ({
          template: {
            ...s.template,
            projects: s.template.projects.filter((p) => p.id !== id),
          },
        })),
      moveProject: (id, dir) =>
        set((s) => {
          const arr = [...s.template.projects];
          const idx = arr.findIndex((p) => p.id === id);
          if (idx < 0) return s;
          const ni = dir === 'up' ? idx - 1 : idx + 1;
          if (ni < 0 || ni >= arr.length) return s;
          [arr[idx], arr[ni]] = [arr[ni], arr[idx]];
          return { template: { ...s.template, projects: arr } };
        }),
    }),
    { name: 'ghosted-template' }
  )
);
