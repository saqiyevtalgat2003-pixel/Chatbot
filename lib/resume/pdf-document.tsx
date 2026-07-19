import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';
import type { ResumeData } from './types';
import type { TemplateSlug } from '@/lib/templates';

// Helvetica-де кириллица әріптері жоқ, сондықтан Cyrillic subset-і бар
// Roboto қарпін тіркейміз (Fontsource CDN, тұрақты статикалық URL).
// Ескерту: "cyrillic" subset-інде тек орыс әліпбиі бар. Қазақ тіліне тән
// қосымша әріптер (ә, ғ, қ, ң, ө, ұ, ү, һ, і) "cyrillic-ext" subset-інде
// жатады — сол қосылмаса, дәл осы әріптер PDF-те басқа таракторлармен
// алмастырылып, мәтін бүлінген болып көрінеді.
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/cyrillic-ext-400-normal.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/cyrillic-ext-700-normal.ttf',
      fontWeight: 700,
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/cyrillic-ext-400-italic.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
  ],
});

type Theme = {
  ink: string;
  inkSoft: string;
  muted: string;
  accent: string;
  accentSoft: string;
  border: string;
  bgOnDark: string;
  bgOnDarkFaint: string;
};

const THEMES: Record<TemplateSlug, Theme> = {
  classic: {
    ink: '#152238',
    inkSoft: '#3c4a63',
    muted: '#6b7488',
    accent: '#152238',
    accentSoft: '#e2e5eb',
    border: '#c9cdd6',
    bgOnDark: 'rgba(255,255,255,0.75)',
    bgOnDarkFaint: 'rgba(255,255,255,0.15)',
  },
  modern: {
    ink: '#152238',
    inkSoft: '#3c4a63',
    muted: '#6b7488',
    accent: '#e0a94f',
    accentSoft: '#1F5E80',
    border: '#e2e5eb',
    bgOnDark: 'rgba(255,255,255,0.75)',
    bgOnDarkFaint: 'rgba(255,255,255,0.15)',
  },
  executive: {
    ink: '#0f1b30',
    inkSoft: '#3c4a63',
    muted: '#6b7488',
    accent: '#c99a3f',
    accentSoft: '#0f1b30',
    border: '#e2e5eb',
    bgOnDark: 'rgba(255,255,255,0.75)',
    bgOnDarkFaint: 'rgba(255,255,255,0.15)',
  },
  creative: {
    ink: '#152238',
    inkSoft: '#3c4a63',
    muted: '#6b7488',
    accent: '#1F5E80',
    accentSoft: '#e0a94f',
    border: '#dbe6ec',
    bgOnDark: 'rgba(255,255,255,0.75)',
    bgOnDarkFaint: 'rgba(255,255,255,0.15)',
  },
};

const LABELS: Record<
  string,
  { experience: string; education: string; skills: string; summary: string; current: string }
> = {
  kk: {
    experience: 'Тәжірибе',
    education: 'Білімі',
    skills: 'Дағдылар',
    summary: 'Түйіндеме',
    current: 'Қазіргі уақытқа дейін',
  },
  ru: {
    experience: 'Опыт работы',
    education: 'Образование',
    skills: 'Навыки',
    summary: 'О себе',
    current: 'По настоящее время',
  },
  uz: {
    experience: 'Ish tajribasi',
    education: "Ta'lim",
    skills: "Ko'nikmalar",
    summary: 'Men haqimda',
    current: 'Hozirgi vaqtgacha',
  },
};

const MONTHS: Record<string, string[]> = {
  kk: ['қаң', 'ақп', 'нау', 'сәу', 'мам', 'мау', 'шіл', 'там', 'қыр', 'қаз', 'қар', 'жел'],
  ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
};

function formatMonth(value: string, language: string): string {
  if (!value) return '';
  const [year, month] = value.split('-').map(Number);
  if (!year || !month) return value;
  const names = MONTHS[language] ?? MONTHS.kk;
  return `${names[month - 1]} ${year}`;
}

function makeStyles(theme: Theme) {
  return StyleSheet.create({
    page: { fontFamily: 'Roboto', fontSize: 10, color: theme.ink, flexDirection: 'row' },
    pageColumn: { fontFamily: 'Roboto', fontSize: 10, color: theme.ink, flexDirection: 'column' },
    sidebar: { width: 160, minHeight: '100%', backgroundColor: theme.accentSoft, padding: 20 },
    main: { flex: 1, padding: 32 },
    mainNoPad: { flex: 1, padding: 32, paddingTop: 24 },
    photo: { width: 76, height: 76, borderRadius: 38, objectFit: 'cover', marginBottom: 16, alignSelf: 'center' },
    photoSquare: { width: 60, height: 60, borderRadius: 6, objectFit: 'cover' },
    sideSectionTitle: {
      fontSize: 9,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.accent,
      marginBottom: 8,
    },
    sideSection: { marginBottom: 18 },
    sideSummary: { fontSize: 9, color: theme.bgOnDark, lineHeight: 1.5 },
    skillItem: { marginBottom: 8 },
    skillName: { fontSize: 9, color: '#ffffff', marginBottom: 3 },
    skillBarTrack: { height: 3, backgroundColor: theme.bgOnDarkFaint, borderRadius: 2 },
    skillBarFill: { height: 3, backgroundColor: theme.accent, borderRadius: 2 },
    sideEduItem: { marginBottom: 10 },
    sideEduDegree: { fontSize: 9, fontWeight: 700, color: '#ffffff' },
    sideEduInstitution: { fontSize: 8.5, color: theme.bgOnDark },
    sideEduDate: { fontSize: 8, color: 'rgba(255,255,255,0.45)', marginTop: 1 },
    name: { fontSize: 22, fontWeight: 700, marginBottom: 2, textTransform: 'uppercase' },
    jobTitle: {
      fontSize: 11,
      color: theme.accentSoft,
      fontWeight: 700,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    contactRow: { flexDirection: 'row', gap: 10, fontSize: 9, color: theme.muted },
    headerBlock: { marginBottom: 18, paddingBottom: 14, borderBottomWidth: 2, borderBottomColor: theme.ink },
    headerBanner: {
      backgroundColor: theme.ink,
      padding: 24,
      marginBottom: 0,
      borderBottomWidth: 4,
      borderBottomColor: theme.accent,
    },
    sectionTitle: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    sectionTitleAccent: {
      fontSize: 9.5,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
      color: theme.accent,
    },
    section: { marginBottom: 16 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    itemTitle: { fontSize: 10, fontWeight: 700 },
    itemSub: { fontSize: 10, color: theme.inkSoft, fontWeight: 400 },
    itemDate: { fontSize: 9, color: theme.muted },
    itemDesc: { fontSize: 9.5, color: theme.inkSoft, lineHeight: 1.5, marginTop: 2 },
    experienceItem: { marginBottom: 10 },
    experienceItemAccent: { marginBottom: 10, borderLeftWidth: 2, borderLeftColor: theme.accent, paddingLeft: 10 },
    centeredHeader: { alignItems: 'center', textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
    chip: {
      fontSize: 8.5,
      color: theme.accent,
      backgroundColor: theme.border,
      borderRadius: 10,
      paddingVertical: 3,
      paddingHorizontal: 8,
      marginRight: 6,
      marginBottom: 6,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  });
}

function Sidebar({ data, language, theme, styles }: { data: ResumeData; language: string; theme: Theme; styles: ReturnType<typeof makeStyles> }) {
  const t = LABELS[language] ?? LABELS.kk;
  const { personal, skills, education } = data;
  return (
    <View style={styles.sidebar}>
      {personal.photoUrl ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={personal.photoUrl} style={styles.photo} />
      ) : null}

      {personal.summary ? (
        <View style={styles.sideSection}>
          <Text style={styles.sideSectionTitle}>{t.summary}</Text>
          <Text style={styles.sideSummary}>{personal.summary}</Text>
        </View>
      ) : null}

      {skills.length > 0 ? (
        <View style={styles.sideSection}>
          <Text style={styles.sideSectionTitle}>{t.skills}</Text>
          {skills.map((skill) => (
            <View key={skill.id} style={styles.skillItem}>
              <Text style={styles.skillName}>{skill.name}</Text>
              <View style={styles.skillBarTrack}>
                <View style={[styles.skillBarFill, { width: `${(skill.level / 5) * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {education.length > 0 ? (
        <View style={styles.sideSection}>
          <Text style={styles.sideSectionTitle}>{t.education}</Text>
          {education.map((item) => (
            <View key={item.id} style={styles.sideEduItem}>
              <Text style={styles.sideEduDegree}>{item.degree}</Text>
              <Text style={styles.sideEduInstitution}>{item.institution}</Text>
              <Text style={styles.sideEduDate}>
                {formatMonth(item.startDate, language)} — {formatMonth(item.endDate, language)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ExperienceSection({
  data,
  language,
  styles,
  accent,
}: {
  data: ResumeData;
  language: string;
  styles: ReturnType<typeof makeStyles>;
  accent?: boolean;
}) {
  const t = LABELS[language] ?? LABELS.kk;
  const { experience } = data;
  if (experience.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={accent ? styles.sectionTitleAccent : styles.sectionTitle}>{t.experience}</Text>
      {experience.map((item) => (
        <View key={item.id} style={accent ? styles.experienceItemAccent : styles.experienceItem}>
          <View style={styles.itemRow}>
            <Text style={styles.itemTitle}>
              {item.position}
              {item.company ? <Text style={styles.itemSub}> — {item.company}</Text> : null}
            </Text>
            <Text style={styles.itemDate}>
              {formatMonth(item.startDate, language)} — {item.current ? t.current : formatMonth(item.endDate, language)}
            </Text>
          </View>
          {item.description ? <Text style={styles.itemDesc}>{item.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}

/** Классикалық/Заманауи: сол жақта sidebar (фото/дағды/білім), оң жақта тәжірибе. */
function SidebarDocument({ data, language, theme, styles }: { data: ResumeData; language: string; theme: Theme; styles: ReturnType<typeof makeStyles> }) {
  const { personal } = data;
  return (
    <Page size="A4" style={styles.page}>
      <Sidebar data={data} language={language} theme={theme} styles={styles} />
      <View style={styles.main}>
        <View style={styles.headerBlock}>
          <Text style={styles.name}>{personal.fullName || ''}</Text>
          {personal.jobTitle ? <Text style={styles.jobTitle}>{personal.jobTitle}</Text> : null}
          <View style={styles.contactRow}>
            {personal.phone ? <Text>{personal.phone}</Text> : null}
            {personal.email ? <Text>{personal.email}</Text> : null}
            {personal.city ? <Text>{personal.city}</Text> : null}
          </View>
        </View>
        <ExperienceSection data={data} language={language} styles={styles} />
      </View>
    </Page>
  );
}

/** Executive: жоғарыда толық ені бойынша қою-көк header banner, астында оң жақта sidebar. */
function ExecutiveDocument({ data, language, theme, styles }: { data: ResumeData; language: string; theme: Theme; styles: ReturnType<typeof makeStyles> }) {
  const { personal } = data;
  return (
    <Page size="A4" style={styles.pageColumn}>
      <View style={styles.headerBanner}>
        <Text style={[styles.name, { color: theme.accent }]}>{personal.fullName || ''}</Text>
        {personal.jobTitle ? <Text style={[styles.jobTitle, { color: '#ffffff' }]}>{personal.jobTitle}</Text> : null}
        <View style={styles.contactRow}>
          {personal.phone ? <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{personal.phone}</Text> : null}
          {personal.email ? <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{personal.email}</Text> : null}
          {personal.city ? <Text style={{ color: 'rgba(255,255,255,0.7)' }}>{personal.city}</Text> : null}
        </View>
      </View>
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={styles.mainNoPad}>
          <ExperienceSection data={data} language={language} styles={styles} accent />
        </View>
        <Sidebar data={data} language={language} theme={theme} styles={styles} />
      </View>
    </Page>
  );
}

/** Креативті: бір бағанды, түсті section header және дағдылар чиптермен. */
function CreativeDocument({ data, language, theme, styles }: { data: ResumeData; language: string; theme: Theme; styles: ReturnType<typeof makeStyles> }) {
  const t = LABELS[language] ?? LABELS.kk;
  const { personal, skills, education } = data;
  return (
    <Page size="A4" style={[styles.pageColumn, { padding: 32 }]}>
      <View style={styles.centeredHeader}>
        {personal.photoUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={personal.photoUrl} style={[styles.photoSquare, { alignSelf: 'center', marginBottom: 10 }]} />
        ) : null}
        <Text style={[styles.name, { color: theme.accent }]}>{personal.fullName || ''}</Text>
        {personal.jobTitle ? <Text style={styles.jobTitle}>{personal.jobTitle}</Text> : null}
        <View style={[styles.contactRow, { justifyContent: 'center' }]}>
          {personal.phone ? <Text>{personal.phone}</Text> : null}
          {personal.email ? <Text>{personal.email}</Text> : null}
          {personal.city ? <Text>{personal.city}</Text> : null}
        </View>
      </View>

      {skills.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitleAccent}>{t.skills}</Text>
          <View style={styles.chipRow}>
            {skills.map((skill) => (
              <Text key={skill.id} style={styles.chip}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      <ExperienceSection data={data} language={language} styles={styles} accent />

      {education.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitleAccent}>{t.education}</Text>
          {education.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemTitle}>
                {item.degree}
                {item.institution ? <Text style={styles.itemSub}> — {item.institution}</Text> : null}
              </Text>
              <Text style={styles.itemDate}>
                {formatMonth(item.startDate, language)} — {formatMonth(item.endDate, language)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Page>
  );
}

export default function ResumePdfDocument({
  data,
  language,
  templateSlug = 'modern',
}: {
  data: ResumeData;
  language: string;
  templateSlug?: TemplateSlug;
}) {
  const theme = THEMES[templateSlug] ?? THEMES.modern;
  const styles = makeStyles(theme);

  return (
    <Document>
      {templateSlug === 'executive' ? (
        <ExecutiveDocument data={data} language={language} theme={theme} styles={styles} />
      ) : templateSlug === 'creative' ? (
        <CreativeDocument data={data} language={language} theme={theme} styles={styles} />
      ) : (
        <SidebarDocument data={data} language={language} theme={theme} styles={styles} />
      )}
    </Document>
  );
}
