# git-dashboard

Өз GitHub репозиторийлеріңіздің файлдарын веб-беттен басқаратын жеке dashboard.
Кіру тек GitHub OAuth арқылы, тек сіздің аккаунтыңызға рұқсат етілген.

## 1. Тәуелділіктерді орнату

```bash
npm install
```

## 2. Орта айнымалылары (Environment Variables)

`.env.example` файлын `.env.local` етіп көшіріп, мәндерін толтырыңыз:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase жобаңыздың URL-і (толтырылған)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase → Settings → API → anon public key
- `GITHUB_TOKEN` — GitHub → Settings → Developer settings → Personal access tokens
  (Fine-grained, **Contents: Read and write** рұқсатымен)
- `ALLOWED_GITHUB_LOGIN` — тек осы логинге кіруге рұқсат етіледі (мысалы `saqiyevtalgat2003`)

## 3. GitHub OAuth App (Supabase Auth үшін)

GitHub → Settings → Developer settings → OAuth Apps → New OAuth App:

- Homepage URL: `https://<сіздің-vercel-домен>`
- Authorization callback URL: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`

Client ID / Client Secret-ті Supabase Dashboard → Authentication → Providers → GitHub
бөліміне қойып, Save басыңыз.

## 4. Жергілікті іске қосу

```bash
npm run dev
```

## 5. Vercel-ге деплой

1. Осы жобаны GitHub-қа push жасаңыз
2. Vercel → New Project → сол репозиторийді импорттаңыз
3. Vercel → Settings → Environment Variables бөлімінде жоғарыдағы 4 айнымалыны қойыңыз
4. Deploy басыңыз, содан кейін домен қосыңыз
5. GitHub OAuth App-тың Homepage/Callback URL-ін нақты доменге жаңартыңыз

## Қалай жұмыс істейді

- `/login` — "Sign in with GitHub" батырмасы, Supabase OAuth-қа бағыттайды
- `/auth/callback` — сессияны құрады, `ALLOWED_GITHUB_LOGIN`-мен салыстырады,
  сәйкес келмесе дереу шығарады
- `/dashboard` — барлық репозиторийлер тізімі (GITHUB_TOKEN арқылы)
- `/dashboard/repo/[owner]/[repo]` — файл тізімі + папка ауыстыру формасы
- Папка жүктегенде: әр файл GitHub Git Data API арқылы blob болып жасалады,
  жаңа tree құрылады (ескі файлдар өшіріледі, жаңалары қосылады), содан кейін
  бір commit жасалып, branch сол commit-ке жаңартылады — яғни толық ауыстыру
  бір ғана commit-те болады.

## Шектеу

Vercel serverless функциясының дене өлшемі шектеулі (~4.5MB), сондықтан өте
үлкен (мысалы, көптеген үлкен суреттер бар) папкаларды бір жолда жүктеу
сәтсіз болуы мүмкін — андай жағдайда файлдарды бөліп жүктеу керек болады.
