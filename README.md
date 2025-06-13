# Mental Health Analytics

Aplicação para análise de dados de saúde mental global, com visualizações e modelos de machine learning.

## Estrutura do Projeto

\`\`\`
/mental-health-analytics/
├─ frontend/                  # Frontend Next.js
├─ backend/                   # Backend Python com FastAPI
├─ data/                      # Dados CSV
│  ├─ raw/                    # Dados originais
│  └─ processed/              # Dados processados
└─ README.md                  # Documentação do projeto
\`\`\`

## Requisitos

### Frontend
- Node.js 18+
- npm ou yarn

### Backend
- Python 3.9+
- pip

## Instalação

### 1. Download dos Dados

Primeiro, baixe os dados necessários:

\`\`\`bash
python data/download_data.py
\`\`\`

### 2. Backend (Python/FastAPI)

\`\`\`bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
\`\`\`

O servidor backend estará disponível em http://localhost:8000.

### 3. Frontend (Next.js)

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

O frontend estará disponível em http://localhost:3000.

## Funcionalidades

- **Análise de Séries Temporais**: Previsão de tendências futuras de transtornos mentais
- **Clustering**: Agrupamento de países com perfis semelhantes de saúde mental
- **Detecção de Anomalias**: Identificação de padrões incomuns nos dados
- **Análise de Correlação**: Estudo das relações entre diferentes transtornos mentais
- **Análise de Regressão**: Identificação de fatores que influenciam a prevalência de transtornos

## Tecnologias Utilizadas

### Frontend
- Next.js (React)
- TypeScript
- Tailwind CSS
- Recharts (visualizações)
- shadcn/ui (componentes)

### Backend
- Python
- FastAPI
- Pandas
- NumPy
- scikit-learn

## Estrutura de Dados

O projeto utiliza dados de saúde mental de várias fontes, incluindo:

- Prevalência de transtornos mentais por país e ano
- Carga de doença (DALYs) para cada transtorno mental
- Cobertura de dados primários sobre prevalência
- Lacunas de tratamento para transtornos de ansiedade
- Sintomas depressivos em populações específicas
