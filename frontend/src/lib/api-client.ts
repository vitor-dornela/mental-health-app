/**
 * Cliente para comunicação com a API do backend Python
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

/**
 * Função genérica para fazer requisições à API
 */
async function fetchAPI<T>(endpoint: string, method: "GET" | "POST" = "GET", body?: any): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store", // Desabilita o cache para sempre obter dados atualizados
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Ocorreu um erro na requisição")
    }

    return response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

/**
 * Obtém a lista de datasets disponíveis
 */
export async function getDatasets() {
  return fetchAPI<{ datasets: Array<{ id: string; name: string }> }>("/datasets")
}

/**
 * Obtém os dados de um dataset específico
 */
export async function getDataset(datasetId: string) {
  return fetchAPI<{ data: any[] }>(`/data/${datasetId}`)
}

/**
 * Realiza análise de séries temporais
 */
export async function analyzeTimeSeries(params: {
  disorder: string
  region?: string
  forecast_period?: number
  interval_width?: number
}) {
  return fetchAPI<{
    data: Array<{
      date: string
      actual?: number
      predicted?: number
      lower?: number
      upper?: number
    }>
    metrics: {
      rmse: number
      mae: number
      mape: number
      r2: number
    }
    trend: {
      slope: number
      intercept: number
    }
  }>("/analysis/time-series", "POST", params)
}

/**
 * Realiza análise de clustering
 */
export async function analyzeClustering(params: {
  features: string[]
  year?: number
  n_clusters?: number
}) {
  return fetchAPI<{
    points: Array<{
      id: string
      name: string
      x: number
      y: number
      cluster: number
    }>
    metrics: {
      inertia: number
      silhouette?: number
      davies_bouldin?: number
    }
    clusters: Array<{
      cluster: number
      count: number
      percentage: number
      [key: string]: number | string
    }>
  }>("/analysis/clustering", "POST", params)
}

/**
 * Realiza detecção de anomalias
 */
export async function analyzeAnomalies(params: {
  disorder: string
  year?: number
  sensitivity?: string
}) {
  return fetchAPI<{
    points: Array<{
      id: string
      name: string
      x: number
      y: number
      isAnomaly: boolean
    }>
    statistics: {
      mean: number
      std_dev: number
      threshold: number
    }
    anomalies: {
      count: number
      percentage: number
      countries: string[]
    }
  }>("/analysis/anomalies", "POST", params)
}

/**
 * Realiza análise de correlação
 */
export async function analyzeCorrelation(params: {
  disorders: string[]
  region?: string
  period?: string
}) {
  return fetchAPI<{
    correlations: Array<{
      source: string
      target: string
      value: number
    }>
    metrics: {
      max_correlation: number
      min_correlation: number
      avg_correlation: number
    }
  }>("/analysis/correlation", "POST", params)
}

/**
 * Realiza análise de regressão
 */
export async function analyzeRegression(params: {
  target_disorder: string
  factors: string[]
  region?: string
}) {
  return fetchAPI<{
    factors: Array<{
      factor: string
      impact: number
    }>
    metrics: {
      r2: number
      rmse: number
    }
  }>("/analysis/regression", "POST", params)
}
