export type ResumePersonal = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  city: string;
  summary: string;
  photoUrl: string;
};

export type ResumeExperience = {
  id: string;
  company: string;
  position: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM, бос болса "current" true
  current: boolean;
  description: string;
};

export type ResumeEducation = {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
};

export type ResumeSkill = {
  id: string;
  name: string;
  level: number; // 1-5
};

export type ResumeData = {
  personal: ResumePersonal;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkill[];
};

export function createEmptyResumeData(): ResumeData {
  return {
    personal: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      city: '',
      summary: '',
      photoUrl: '',
    },
    experience: [],
    education: [],
    skills: [],
  };
}

export function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Ескі резюмелерде skills жәй string[] түрінде сақталған, соны жаңа {id,name,level} пішініне көшіреді. */
function normalizeSkills(raw: unknown): ResumeSkill[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item === 'string') {
      return { id: makeId(), name: item, level: 3 };
    }
    if (item && typeof item === 'object') {
      const s = item as Partial<ResumeSkill>;
      return {
        id: typeof s.id === 'string' ? s.id : makeId(),
        name: typeof s.name === 'string' ? s.name : '',
        level: typeof s.level === 'number' && s.level >= 1 && s.level <= 5 ? s.level : 3,
      };
    }
    return { id: makeId(), name: '', level: 3 };
  });
}

/** Supabase-тен келген jsonb data толық емес болса (эски резюме, жаңа өріс қосылса) қауіпсіз толықтырады. */
export function normalizeResumeData(raw: unknown): ResumeData {
  const empty = createEmptyResumeData();
  if (!raw || typeof raw !== 'object') return empty;
  const r = raw as Partial<ResumeData>;
  return {
    personal: { ...empty.personal, ...(r.personal ?? {}) },
    experience: Array.isArray(r.experience) ? r.experience : [],
    education: Array.isArray(r.education) ? r.education : [],
    skills: normalizeSkills(r.skills),
  };
}
