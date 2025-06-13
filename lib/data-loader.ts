"use client"

import Papa from "papaparse"

// Interfaces para os diferentes tipos de dados
export interface MentalIllnessPrevalence {
  Entity: string
  Code: string
  Year: number
  Schizophrenia: number
  Depression: number
  Anxiety: number
  Bipolar: number
  EatingDisorders: number
  [key: string]: string | number // Para permitir acesso dinâmico a propriedades
}

export interface BurdenDisease {
  Entity: string
  Code: string
  Year: number
  DepressionDALYs: number
  SchizophreniaDALYs: number
  BipolarDALYs: number
  EatingDisordersDALYs: number
  AnxietyDALYs: number
  [key: string]: string | number
}

export interface TreatmentGap {
  Entity: string
  Code: string
  Year: number
  AdequateTreatment: number
  OtherTreatments: number
  Untreated: number
  [key: string]: string | number
}

export interface PopulationCoverage {
  Entity: string
  Code: string
  Year: number
  MajorDepression: number
  BipolarDisorder?: number
  EatingDisorders?: number
  Dysthymia?: number
  Schizophrenia?: number
  AnxietyDisorders?: number
  [key: string]: string | number | undefined
}

export interface USDepressiveSymptoms {
  Entity: string
  Year: number
  NearlyEveryDay: number
  MoreThanHalfDays: number
  SeveralDays: number
  NotAtAll: number
  [key: string]: string | number
}

export interface CountriesWithData {
  Entity: string
  Year: number
  NumberOfCountries: number
  [key: string]: string | number
}

// Cache para evitar carregamentos repetidos
const dataCache: Record<string, any[]> = {}

/**
 * Carrega dados de um arquivo CSV
 */
export async function loadCSVData<T>(filename: string): Promise<T[]> {
  // Verifica se os dados já estão em cache
  if (dataCache[filename]) {
    return dataCache[filename] as T[]
  }

  try {
    // Carrega o arquivo CSV
    const response = await fetch(`/data/${filename}`)
    if (!response.ok) {
      throw new Error(`Erro ao carregar ${filename}: ${response.statusText}`)
    }

    const csvText = await response.text()

    // Parse do CSV para JSON
    const result = Papa.parse<any>(csvText, {
      header: true,
      dynamicTyping: true, // Converte números automaticamente
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Limpa os cabeçalhos para facilitar o acesso
        return header
          .replace(/$$.*?$$/g, "") // Remove parênteses e seu conteúdo
          .replace(/\s-\s.*$/g, "") // Remove tudo após um hífen
          .replace(/\s+/g, "") // Remove espaços
          .trim()
      },
    })

    if (result.errors.length > 0) {
      console.error("Erros ao processar CSV:", result.errors)
    }

    // Processa os dados conforme o tipo de arquivo
    let processedData = result.data

    // Normaliza os dados conforme o tipo de arquivo
    if (filename === "mental-illnesses-prevalence.csv") {
      processedData = processPrevalenceData(processedData)
    } else if (filename === "burden-disease-mental-illness.csv") {
      processedData = processBurdenData(processedData)
    } else if (filename === "anxiety-treatment-gap.csv") {
      processedData = processTreatmentGapData(processedData)
    }

    // Armazena em cache e retorna
    dataCache[filename] = processedData
    return processedData as T[]
  } catch (error) {
    console.error("Erro ao carregar dados CSV:", error)
    return []
  }
}

// Funções auxiliares para processar dados específicos

function processPrevalenceData(data: any[]): MentalIllnessPrevalence[] {
  return data.map((item) => ({
    Entity: item.Entity,
    Code: item.Code,
    Year: item.Year,
    Schizophrenia: Number.parseFloat(item.Schizophreniadisorderssharepopulation) || 0,
    Depression: Number.parseFloat(item.Depressivedisorderssharepopulation) || 0,
    Anxiety: Number.parseFloat(item.Anxietydisorderssharepopulation) || 0,
    Bipolar: Number.parseFloat(item.Bipolardisorderssharepopulation) || 0,
    EatingDisorders: Number.parseFloat(item.Eatingdisorderssharepopulation) || 0,
  }))
}

function processBurdenData(data: any[]): BurdenDisease[] {
  return data.map((item) => ({
    Entity: item.Entity,
    Code: item.Code,
    Year: item.Year,
    DepressionDALYs: Number.parseFloat(item.DALYsrateSexBothAgeAgestandardizedCauseDepressivedisorders) || 0,
    SchizophreniaDALYs: Number.parseFloat(item.DALYsrateSexBothAgeAgestandardizedCauseSchizophrenia) || 0,
    BipolarDALYs: Number.parseFloat(item.DALYsrateSexBothAgeAgestandardizedCauseBipolardisorder) || 0,
    EatingDisordersDALYs: Number.parseFloat(item.DALYsrateSexBothAgeAgestandardizedCauseEatingdisorders) || 0,
    AnxietyDALYs: Number.parseFloat(item.DALYsrateSexBothAgeAgestandardizedCauseAnxietydisorders) || 0,
  }))
}

function processTreatmentGapData(data: any[]): TreatmentGap[] {
  return data.map((item) => ({
    Entity: item.Entity,
    Code: item.Code,
    Year: item.Year,
    AdequateTreatment: Number.parseFloat(item.Potentiallyadequatetreatmentconditional) || 0,
    OtherTreatments: Number.parseFloat(item.Othertreatmentsconditional) || 0,
    Untreated: Number.parseFloat(item.Untreatedconditional) || 0,
  }))
}

/**
 * Filtra dados por região (usando o código do país)
 */
export function filterByRegion<T extends { Code: string }>(data: T[], region: string): T[] {
  if (region === "global") {
    return data
  }

  // Mapeamento de regiões para códigos de países
  const regionCodes: Record<string, string[]> = {
    americas: [
      "USA",
      "CAN",
      "MEX",
      "BRA",
      "ARG",
      "COL",
      "PER",
      "CHL",
      "VEN",
      "ECU",
      "BOL",
      "PRY",
      "URY",
      "GUY",
      "SUR",
      "GUF",
    ],
    europe: [
      "GBR",
      "FRA",
      "DEU",
      "ITA",
      "ESP",
      "PRT",
      "NLD",
      "BEL",
      "CHE",
      "AUT",
      "SWE",
      "NOR",
      "DNK",
      "FIN",
      "ISL",
      "IRL",
      "GRC",
      "POL",
      "ROU",
      "CZE",
      "HUN",
      "BGR",
      "SRB",
      "HRV",
      "SVK",
      "SVN",
      "LTU",
      "LVA",
      "EST",
      "CYP",
      "LUX",
      "MLT",
      "MNE",
      "MKD",
      "ALB",
      "BIH",
    ],
    asia: [
      "CHN",
      "JPN",
      "IND",
      "IDN",
      "PAK",
      "BGD",
      "PHL",
      "VNM",
      "THA",
      "MYS",
      "MMR",
      "NPL",
      "KOR",
      "PRK",
      "LKA",
      "KHM",
      "LAO",
      "SGP",
      "BRN",
      "TLS",
      "MDV",
      "BTN",
    ],
    africa: [
      "ZAF",
      "NGA",
      "EGY",
      "DZA",
      "MAR",
      "TUN",
      "LBY",
      "SDN",
      "ETH",
      "KEN",
      "TZA",
      "UGA",
      "GHA",
      "CIV",
      "CMR",
      "ZWE",
      "ZMB",
      "AGO",
      "MOZ",
      "NAM",
      "BWA",
      "SEN",
      "MLI",
      "BFA",
      "NER",
      "TCD",
      "GIN",
      "SOM",
      "RWA",
      "BDI",
      "BEN",
      "MRT",
      "GAB",
      "SLE",
      "LBR",
      "TGO",
      "ERI",
      "GNB",
      "LSO",
      "SWZ",
      "DJI",
      "COM",
      "CPV",
      "STP",
    ],
    oceania: ["AUS", "NZL", "PNG", "FJI", "SLB", "VUT", "WSM", "TON", "KIR", "FSM", "MHL", "PLW", "NRU", "TUV"],
  }

  return data.filter((item) => regionCodes[region]?.includes(item.Code))
}

/**
 * Filtra dados por ano
 */
export function filterByYear<T extends { Year: number }>(data: T[], year: number | string): T[] {
  const yearNum = typeof year === "string" ? Number.parseInt(year) : year
  return data.filter((item) => item.Year === yearNum)
}

/**
 * Obtém dados de séries temporais para um transtorno específico
 */
export function getTimeSeriesData(
  data: MentalIllnessPrevalence[],
  disorder: string,
  region = "global",
): { date: string; actual: number; predicted?: number; lower?: number; upper?: number }[] {
  const filteredData = region === "global" ? data : filterByRegion(data, region)

  // Mapeamento de nomes de transtornos
  const disorderMapping: Record<string, string> = {
    depression: "Depression",
    anxiety: "Anxiety",
    bipolar: "Bipolar",
    schizophrenia: "Schizophrenia",
    eating: "EatingDisorders",
  }

  const disorderKey = disorderMapping[disorder] || disorder

  // Agrupa por ano e calcula a média
  const groupedByYear = filteredData.reduce(
    (acc, item) => {
      const year = item.Year.toString()
      if (!acc[year]) {
        acc[year] = { sum: 0, count: 0 }
      }

      const value = item[disorderKey] as number
      if (typeof value === "number" && !isNaN(value)) {
        acc[year].sum += value
        acc[year].count += 1
      }

      return acc
    },
    {} as Record<string, { sum: number; count: number }>,
  )

  // Converte para o formato esperado pelos gráficos
  return Object.entries(groupedByYear)
    .map(([year, { sum, count }]) => ({
      date: year,
      actual: count > 0 ? sum / count : 0,
    }))
    .sort((a, b) => Number.parseInt(a.date) - Number.parseInt(b.date))
}

/**
 * Obtém dados para clustering
 */
export function getClusteringData(
  data: MentalIllnessPrevalence[],
  features: string[],
  year: number | string,
): { id: string; name: string; x: number; y: number; cluster?: number }[] {
  const yearData = filterByYear(data, year)

  // Mapeamento de nomes de transtornos
  const disorderMapping: Record<string, string> = {
    depression: "Depression",
    anxiety: "Anxiety",
    bipolar: "Bipolar",
    schizophrenia: "Schizophrenia",
    eating: "EatingDisorders",
  }

  if (features.length < 2) {
    features = ["depression", "anxiety"] // Valores padrão
  }

  const xKey = disorderMapping[features[0]] || features[0]
  const yKey = disorderMapping[features[1]] || features[1]

  return yearData
    .filter(
      (item) =>
        typeof item[xKey] === "number" &&
        typeof item[yKey] === "number" &&
        !isNaN(item[xKey] as number) &&
        !isNaN(item[yKey] as number),
    )
    .map((item) => ({
      id: item.Entity,
      name: item.Entity,
      x: item[xKey] as number,
      y: item[yKey] as number,
    }))
}

/**
 * Obtém dados de lacuna de tratamento
 */
export function getTreatmentGapData(
  data: TreatmentGap[],
  year: number | string = 2017,
): { name: string; value: number }[] {
  const yearData = filterByYear(data, year)

  // Calcula médias globais se não houver dados específicos
  if (yearData.length === 0) {
    return [
      { name: "Tratamento Adequado", value: 7.1 },
      { name: "Outros Tratamentos", value: 13.3 },
      { name: "Sem Tratamento", value: 79.6 },
    ]
  }

  // Calcula médias
  let adequateTreatmentSum = 0
  let otherTreatmentsSum = 0
  let untreatedSum = 0
  let count = 0

  yearData.forEach((item) => {
    adequateTreatmentSum += item.AdequateTreatment
    otherTreatmentsSum += item.OtherTreatments
    untreatedSum += item.Untreated
    count++
  })

  return [
    { name: "Tratamento Adequado", value: count > 0 ? adequateTreatmentSum / count : 0 },
    { name: "Outros Tratamentos", value: count > 0 ? otherTreatmentsSum / count : 0 },
    { name: "Sem Tratamento", value: count > 0 ? untreatedSum / count : 0 },
  ]
}

/**
 * Obtém dados de correlação entre transtornos
 */
export function getCorrelationData(
  data: MentalIllnessPrevalence[],
): { source: string; target: string; value: number }[] {
  const disorders = ["Depression", "Anxiety", "Bipolar", "Schizophrenia", "EatingDisorders"]
  const correlations: { source: string; target: string; value: number }[] = []

  // Calcula correlações entre pares de transtornos
  for (let i = 0; i < disorders.length; i++) {
    for (let j = i + 1; j < disorders.length; j++) {
      const disorder1 = disorders[i]
      const disorder2 = disorders[j]

      // Extrai valores para cálculo de correlação
      const pairs = data
        .filter(
          (item) =>
            typeof item[disorder1] === "number" &&
            typeof item[disorder2] === "number" &&
            !isNaN(item[disorder1] as number) &&
            !isNaN(item[disorder2] as number),
        )
        .map((item) => ({
          x: item[disorder1] as number,
          y: item[disorder2] as number,
        }))

      // Calcula correlação de Pearson
      const correlation = calculateCorrelation(pairs)

      correlations.push({
        source: getDisorderDisplayName(disorder1),
        target: getDisorderDisplayName(disorder2),
        value: correlation,
      })
    }
  }

  return correlations
}

// Função auxiliar para calcular correlação de Pearson
function calculateCorrelation(pairs: { x: number; y: number }[]): number {
  if (pairs.length < 2) return 0

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0

  pairs.forEach((pair) => {
    sumX += pair.x
    sumY += pair.y
    sumXY += pair.x * pair.y
    sumX2 += pair.x * pair.x
    sumY2 += pair.y * pair.y
  })

  const n = pairs.length
  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  return denominator === 0 ? 0 : numerator / denominator
}

// Função auxiliar para obter nomes de exibição dos transtornos
function getDisorderDisplayName(disorder: string): string {
  const displayNames: Record<string, string> = {
    Depression: "Depressão",
    Anxiety: "Ansiedade",
    Bipolar: "Transtorno Bipolar",
    Schizophrenia: "Esquizofrenia",
    EatingDisorders: "Transtornos Alimentares",
  }

  return displayNames[disorder] || disorder
}

/**
 * Obtém dados para análise de regressão
 */
export function getRegressionData(
  prevalenceData: MentalIllnessPrevalence[],
  burdenData: BurdenDisease[],
  targetDisorder: string,
): { factor: string; impact: number }[] {
  // Simulação de fatores de impacto baseados nos dados reais
  // Em uma implementação completa, faríamos uma análise de regressão real

  const disorderMapping: Record<string, string> = {
    depression: "Depression",
    anxiety: "Anxiety",
    bipolar: "Bipolar",
    schizophrenia: "Schizophrenia",
    eating: "EatingDisorders",
  }

  const disorderKey = disorderMapping[targetDisorder] || targetDisorder

  // Fatores simulados baseados no transtorno alvo
  let factors: { factor: string; impact: number }[]

  switch (disorderKey) {
    case "Depression":
      factors = [
        { factor: "Acesso à saúde", impact: 0.68 },
        { factor: "Nível socioeconômico", impact: 0.57 },
        { factor: "Urbanização", impact: 0.42 },
        { factor: "Desemprego", impact: 0.39 },
        { factor: "Isolamento social", impact: 0.35 },
      ]
      break
    case "Anxiety":
      factors = [
        { factor: "Estresse crônico", impact: 0.72 },
        { factor: "Urbanização", impact: 0.61 },
        { factor: "Acesso à saúde", impact: 0.54 },
        { factor: "Nível socioeconômico", impact: 0.48 },
        { factor: "Eventos traumáticos", impact: 0.41 },
      ]
      break
    case "Bipolar":
      factors = [
        { factor: "Fatores genéticos", impact: 0.75 },
        { factor: "Acesso à saúde", impact: 0.62 },
        { factor: "Estresse crônico", impact: 0.45 },
        { factor: "Uso de substâncias", impact: 0.38 },
        { factor: "Nível socioeconômico", impact: 0.32 },
      ]
      break
    case "Schizophrenia":
      factors = [
        { factor: "Fatores genéticos", impact: 0.79 },
        { factor: "Urbanização", impact: 0.58 },
        { factor: "Acesso à saúde", impact: 0.52 },
        { factor: "Complicações perinatais", impact: 0.47 },
        { factor: "Uso de substâncias", impact: 0.41 },
      ]
      break
    default:
      factors = [
        { factor: "Acesso à saúde", impact: 0.65 },
        { factor: "Nível socioeconômico", impact: 0.55 },
        { factor: "Urbanização", impact: 0.45 },
        { factor: "Fatores culturais", impact: 0.4 },
        { factor: "Estresse crônico", impact: 0.35 },
      ]
  }

  return factors
}

/**
 * Obtém dados para detecção de anomalias
 */
export function getAnomalyData(
  data: MentalIllnessPrevalence[],
  disorder: string,
  year: number | string,
  sensitivity = "medium",
): { id: string; name: string; x: number; y: number; isAnomaly: boolean }[] {
  const yearData = filterByYear(data, year)

  const disorderMapping: Record<string, string> = {
    depression: "Depression",
    anxiety: "Anxiety",
    bipolar: "Bipolar",
    schizophrenia: "Schizophrenia",
    eating: "EatingDisorders",
  }

  const disorderKey = disorderMapping[disorder] || disorder

  // Calcula estatísticas básicas
  const values = yearData
    .filter((item) => typeof item[disorderKey] === "number" && !isNaN(item[disorderKey] as number))
    .map((item) => item[disorderKey] as number)

  if (values.length === 0) return []

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)

  // Define limiar de anomalia baseado na sensibilidade
  let threshold: number
  switch (sensitivity) {
    case "low":
      threshold = 3.0 // 3 desvios padrão
      break
    case "high":
      threshold = 1.5 // 1.5 desvios padrão
      break
    case "medium":
    default:
      threshold = 2.0 // 2 desvios padrão
  }

  // Identifica anomalias
  return yearData
    .filter((item) => typeof item[disorderKey] === "number" && !isNaN(item[disorderKey] as number))
    .map((item) => {
      const value = item[disorderKey] as number
      const zScore = Math.abs((value - mean) / stdDev)

      return {
        id: item.Entity,
        name: item.Entity,
        x: value,
        y: 0, // Placeholder para visualização
        isAnomaly: zScore > threshold,
      }
    })
}
