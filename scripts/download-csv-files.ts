import fs from "fs"
import path from "path"
import fetch from "node-fetch"

// Estrutura para armazenar informações sobre os arquivos CSV
interface CsvFileInfo {
  filename: string
  url: string
  description: string
}

// Lista de arquivos CSV para download
const csvFiles: CsvFileInfo[] = [
  {
    filename: "mental-illnesses-prevalence.csv",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-%20mental-illnesses-prevalence-RwHttQgtefnKrf042BjPu7teOFUjWL.csv",
    description: "Prevalência de transtornos mentais por país e ano",
  },
  {
    filename: "burden-disease-mental-illness.csv",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-%20burden-disease-from-each-mental-illness%281%29-JQXWWjwzhZ1DdOoZkD7mKnN7jy6z5V.csv",
    description: "Carga de doença (DALYs) para cada transtorno mental",
  },
  {
    filename: "depression-prevalence-coverage.csv",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-%20adult-population-covered-in-primary-data-on-the-prevalence-of-major-depression-z9e0lkAtI6f1EbQvfoo3aCBZ8asj4j.csv",
    description: "População adulta coberta em dados primários sobre prevalência de depressão maior",
  },
  {
    filename: "mental-illnesses-coverage.csv",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-%20adult-population-covered-in-primary-data-on-the-prevalence-of-mental-illnesses-pAEjqrNW9oFRgc2mjGnvrAcSWyXRq1.csv",
    description: "População adulta coberta em dados primários sobre prevalência de transtornos mentais",
  },
  {
    filename: "anxiety-treatment-gap.csv",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-%20anxiety-disorders-treatment-gap-PVqfzr5mpljqUwBPR7UsJiOpK6qjU4.csv",
    description: "Lacuna de tratamento para transtornos de ansiedade",
  },
  {
    filename: "us-depressive-symptoms.csv",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-%20depressive-symptoms-across-us-population-P7XRbd0TN7CZJo5mTTOpUDlPrOWVQH.csv",
    description: "Sintomas depressivos na população dos EUA",
  },
  {
    filename: "countries-with-data.csv",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7-%20number-of-countries-with-primary-data-on-prevalence-of-mental-illnesses-in-the-global-burden-of-disease-study-dfCV828GhTcPNqI7Q6aobgBYB5uQUg.csv",
    description: "Número de países com dados primários sobre prevalência de transtornos mentais",
  },
]

// Função para baixar um arquivo
async function downloadFile(fileInfo: CsvFileInfo): Promise<void> {
  try {
    console.log(`Baixando ${fileInfo.filename}...`)
    const response = await fetch(fileInfo.url)

    if (!response.ok) {
      throw new Error(`Erro ao baixar ${fileInfo.filename}: ${response.statusText}`)
    }

    const data = await response.text()

    // Cria o diretório se não existir
    const dataDir = path.join(process.cwd(), "public", "data")
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Salva o arquivo
    const filePath = path.join(dataDir, fileInfo.filename)
    fs.writeFileSync(filePath, data)

    console.log(`✅ ${fileInfo.filename} baixado com sucesso!`)
  } catch (error) {
    console.error(`❌ Erro ao processar ${fileInfo.filename}:`, error)
  }
}

// Função principal para baixar todos os arquivos
async function downloadAllFiles(): Promise<void> {
  console.log("Iniciando download dos arquivos CSV...")

  // Cria um array de promessas para baixar todos os arquivos em paralelo
  const downloadPromises = csvFiles.map((fileInfo) => downloadFile(fileInfo))

  // Aguarda todas as promessas serem resolvidas
  await Promise.all(downloadPromises)

  console.log("Download de todos os arquivos concluído!")

  // Cria um arquivo de índice com informações sobre os arquivos
  const indexContent = csvFiles.map((file) => `${file.filename}: ${file.description}`).join("\n")

  fs.writeFileSync(path.join(process.cwd(), "public", "data", "index.txt"), indexContent)
}

// Executa a função principal
downloadAllFiles().catch((error) => {
  console.error("Erro ao baixar arquivos:", error)
  process.exit(1)
})
