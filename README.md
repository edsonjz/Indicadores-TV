# 📺 Indicadores TV — Call Center Performance Dashboard

Painel de indicadores de performance para exibição em TV (modo quiosque/fullscreen), com painel administrativo para gestão de operadores e integração em tempo real com Supabase.

---

## ✨ Funcionalidades

| Indicador | Descrição |
|-----------|-----------|
| **TMA** | Tempo Médio de Atendimento |
| **NPS** | Net Promoter Score (destaque principal) |
| **Monitoria** | Nota de qualidade/monitoria (%) |
| **ABS** | Absenteísmo (%) |
| **Resumo** | Texto curto sobre o operador exibido na apresentação |

- 📸 Upload de fotos para o Supabase Storage
- 🔴 Atualizações em tempo real via Supabase Realtime
- 🎉 Efeitos de confetti animados na apresentação
- ⚙️ Configuração de fonte e tempo por slide
- ⌨️ Tecla `Esc` para sair da apresentação

---

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/Indicadores-TV.git
cd Indicadores-TV
npm install
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (nunca commite esse arquivo!):

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

> **Onde encontrar?** Supabase Dashboard → Seu Projeto → Project Settings → API

### 3. Configure o Supabase

#### 3.1 — Tabelas no banco de dados

Execute no **SQL Editor** do Supabase:

```sql
-- Tabela principal de operadores
CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo TEXT DEFAULT '',
  tma TEXT DEFAULT '00:00',
  nps TEXT DEFAULT '0',
  monitoria TEXT DEFAULT '0',
  abs TEXT DEFAULT '0%',
  resumo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de configurações
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  font TEXT DEFAULT 'Playfair Display',
  slide_duration INTEGER DEFAULT 8
);
```

#### 3.2 — Se a tabela operators já existir (adicionar novas colunas)

```sql
ALTER TABLE operators
  ADD COLUMN IF NOT EXISTS abs TEXT DEFAULT '0%',
  ADD COLUMN IF NOT EXISTS resumo TEXT DEFAULT '';
```

> O arquivo completo de migração está em `supabase/migrations/001_add_abs_resumo.sql`

#### 3.3 — Storage para fotos

1. Acesse **Storage** no Supabase Dashboard
2. Crie um bucket chamado `operator-photos`
3. Configure como **público** (Public Bucket)
4. Políticas de acesso recomendadas:

```sql
-- Permitir leitura pública
CREATE POLICY "Allow public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'operator-photos');

-- Permitir upload autenticado (ou anônimo para uso interno)
CREATE POLICY "Allow upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'operator-photos');

-- Permitir deleção
CREATE POLICY "Allow delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'operator-photos');
```

#### 3.4 — Realtime

Ative o Realtime nas tabelas `operators` e `settings`:

Supabase Dashboard → Database → Replication → Selecione as tabelas `operators` e `settings`

---

### 4. Rode localmente

```bash
npm run dev
```

Acesse `http://localhost:5173`

---

## 📂 Estrutura do Projeto

```
Indicadores-TV/
├── .env.example              # Template de variáveis (seguro para commit)
├── .env.local                # Suas credenciais (NUNCA commite!)
├── .gitignore
├── supabase/
│   └── migrations/
│       └── 001_add_abs_resumo.sql
├── components/
│   ├── AdminPanel.tsx        # Painel de gestão
│   └── PresentationMode.tsx  # Modo TV fullscreen
├── App.tsx                   # Lógica principal + CRUD Supabase
├── types.ts                  # Interfaces TypeScript
├── supabaseClient.ts         # Configuração do cliente Supabase
└── package.json
```

---

## 🌐 Deploy

### Vercel (recomendado)

1. Importe o repositório no [Vercel](https://vercel.com)
2. Em **Settings → Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático a cada push na branch `main`

### Netlify

1. Conecte o repositório
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Adicione as variáveis de ambiente em **Site Settings → Environment**

---

## 🛡️ Segurança

- Credenciais Supabase ficam **somente** no `.env.local` (ignorado pelo Git)
- O arquivo `.env.example` serve como template e pode ser commitado
- A `ANON_KEY` do Supabase é segura para o frontend — controle de acesso é feito via Row Level Security (RLS)

---

## 📋 Licença

MIT
