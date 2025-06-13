"use client"

import { useState, useEffect } from "react"
import { ModelSelector, type ModelType } from "@/components/ml/model-selector"
import { ParameterConfig } from "@/components/ml/parameter-config"
import { ProcessingFeedback } from "@/components/ml/processing-feedback"
import { RealTimeMetrics } from "@/components/ml/real-time-metrics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimeSeriesChart } from "@/components/ml/visualizations/time-series-chart"
import { ClusterChart } from "@/components/ml/visualizations/cluster-chart"
import { TreatmentGapChart } from "@/components/ml/visualizations/treatment-gap-chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import {
  analyzeTimeSeries,
  analyzeClustering,
  analyzeAnomalies,
  analyzeCorrelation,
  analyzeRegression,
} from "@/lib/api-client"

export default function MLAnalysisPage() {
  // Estados para controle do fluxo de ML
  const [selectedModelType, setSelectedModelType] = useState<ModelType | null>(null)
  const [selectedModelName, setSelectedModelName] = useState<string | null>(null)
  const [modelParameters, setModelParameters] = useState<Record<string, any>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStage, setProcessingStage] = useState("")
  const [processingProgress, setProcessingProgress] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [processingLogs, setProcessingLogs] = useState<string[]>([])
  const [metricsData, setMetricsData] = useState<any>({})
  const [results, setResults] = useState<any>(null)
  const [isCancelled, setIsCancelled] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(true)

  // Verifica se a API está disponível
  useEffect(() => {
    async function checkApiStatus() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/health`)
        setApiAvailable(response.ok)
      } catch (error) {
        console.error("API não disponível:", error)
        setApiAvailable(false)
      }
    }

    checkApiStatus()
  }, [])

  // Timer para tempo decorrido
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isProcessing) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isProcessing])

  // Simulação de progresso para feedback visual
  useEffect(() => {
    if (!isProcessing) return

    let progressInterval: NodeJS.Timeout

    // Função para atualizar o progresso uma única vez
    const updateProgress = () => {
      setProcessingProgress((prev) => {
        const newProgress = prev + 1

        // Atualiza estágio com base no novo progresso
        let newStage = processingStage
        if (newProgress < 20) {
          newStage = "Pré-processamento"
        } else if (newProgress < 70) {
          newStage = "Treinamento"
        } else if (newProgress < 90) {
          newStage = "Validação"
        } else {
          newStage = "Geração de Insights"
        }

        // Só atualiza o estágio se for diferente
        if (newStage !== processingStage) {
          setProcessingStage(newStage)
        }

        // Adiciona log a cada 10%
        if (newProgress % 10 === 0) {
          addLog(`Progresso: ${newProgress}% concluído`)
        }

        // Atualiza tempo restante
        if (newProgress > 0) {
          const remaining = Math.round((100 - newProgress) * (timeElapsed / newProgress))
          setTimeRemaining(remaining > 0 ? remaining : null)
        }

        // Finaliza o processamento
        if (newProgress >= 100) {
          setTimeout(() => {
            setIsProcessing(false)
            // Garantir que o último estágio seja marcado como concluído
            setProcessingProgress(100)
            addLog("Processamento concluído com sucesso!")
          }, 1000)
          return 100
        }

        return newProgress
      })

      // Atualiza métricas independentemente do estado
      updateMetrics()
    }

    // Inicia o intervalo
    progressInterval = setInterval(updateProgress, 300)

    // Limpa o intervalo quando o componente é desmontado ou o processamento para
    return () => {
      clearInterval(progressInterval)
    }
  }, [isProcessing, processingStage, timeElapsed])

  // Funções auxiliares
  const handleModelSelect = (modelType: ModelType, modelName: string) => {
    setSelectedModelType(modelType)
    setSelectedModelName(modelName)
    setModelParameters({})
    setResults(null)
    setError(null)
  }

  const handleParametersChange = (params: Record<string, any>) => {
    setModelParameters(params)
  }

  const handleStartTraining = async () => {
    setIsProcessing(true)
    setIsCancelled(false)
    setProcessingProgress(0)
    setTimeElapsed(0)
    setTimeRemaining(null)
    setProcessingLogs([])
    setMetricsData({})
    setResults(null)
    setError(null)

    // Adiciona logs iniciais
    addLog(`Iniciando análise de ${getModelTypeName(selectedModelType)}`)
    addLog(`Parâmetros: ${JSON.stringify(modelParameters)}`)

    try {
      // Chama a API correspondente ao tipo de modelo
      let result

      switch (selectedModelType) {
        case "timeSeries":
          result = await analyzeTimeSeries({
            disorder: modelParameters.target || "depression",
            region: modelParameters.region || "global",
            forecast_period: modelParameters.forecastPeriod || 5,
            interval_width: modelParameters.intervalWidth || 0.8,
          })
          break

        case "clustering":
          result = await analyzeClustering({
            features: modelParameters.features || ["depression", "anxiety"],
            year: modelParameters.year || 2019,
            n_clusters: modelParameters.nClusters || 3,
          })
          break

        case "anomaly":
          result = await analyzeAnomalies({
            disorder: modelParameters.disorder || "depression",
            year: modelParameters.year || 2019,
            sensitivity: modelParameters.sensitivity || "medium",
          })
          break

        case "correlation":
          result = await analyzeCorrelation({
            disorders: modelParameters.disorders || ["depression", "anxiety", "bipolar"],
            region: modelParameters.region || "global",
            period: modelParameters.period || "all",
          })
          break

        case "regression":
          result = await analyzeRegression({
            target_disorder: modelParameters.targetDisorder || "depression",
            factors: modelParameters.factors || ["socioeconomic", "healthcare"],
            region: modelParameters.region || "global",
          })
          break

        default:
          throw new Error("Tipo de modelo não suportado")
      }

      // Simula o tempo de processamento
      setTimeout(() => {
        setResults(result)
      }, 5000)
    } catch (error) {
      console.error("Erro ao processar análise:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido ao processar análise")
      setIsProcessing(false)
      addLog(`Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    }
  }

  // Função para obter nome amigável do tipo de modelo
  const getModelTypeName = (type: ModelType | null): string => {
    switch (type) {
      case "timeSeries":
        return "Previsão de Tendências"
      case "clustering":
        return "Agrupamento de Perfis"
      case "correlation":
        return "Correlação entre Transtornos"
      case "regression":
        return "Fatores de Influência"
      case "anomaly":
        return "Detecção de Anomalias"
      default:
        return "análise"
    }
  }

  const handleCancelProcessing = () => {
    setIsProcessing(false)
    setIsCancelled(true)
    addLog("Processamento cancelado pelo usuário")
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setProcessingLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const updateMetrics = () => {
    // Simulação de métricas em tempo real
    if (selectedModelType === "timeSeries") {
      setMetricsData((prev) => {
        const loss = [
          ...(prev.loss || []),
          {
            iteration: (prev.loss?.length || 0) + 1,
            value: 0.5 * Math.exp(-0.05 * (prev.loss?.length || 0)) + 0.05 * Math.random(),
          },
        ]

        const rmse = [
          ...(prev.rmse || []),
          {
            iteration: (prev.rmse?.length || 0) + 1,
            value: 0.3 * Math.exp(-0.03 * (prev.rmse?.length || 0)) + 0.02 * Math.random(),
          },
        ]

        return { ...prev, loss, rmse }
      })
    } else if (selectedModelType === "clustering") {
      setMetricsData((prev) => {
        const silhouette = [
          ...(prev.silhouette || []),
          {
            iteration: (prev.silhouette?.length || 0) + 1,
            value: 0.5 + 0.3 * (1 - Math.exp(-0.1 * (prev.silhouette?.length || 0))) + 0.05 * Math.random(),
          },
        ]

        const inertia = [
          ...(prev.inertia || []),
          {
            iteration: (prev.inertia?.length || 0) + 1,
            value: 1000 * Math.exp(-0.05 * (prev.inertia?.length || 0)) + 50 * Math.random(),
          },
        ]

        return { ...prev, silhouette, inertia }
      })
    }
  }

  const handleExport = (format: string) => {
    addLog(`Exportando resultados em formato ${format}`)
    // Lógica de exportação seria implementada aqui
  }

  const handleShare = () => {
    addLog("Compartilhando resultados")
    // Lógica de compartilhamento seria implementada aqui
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Análise de Saúde Mental</h1>
      <p className="text-muted-foreground">
        Selecione um tipo de análise, configure os parâmetros e gere insights a partir dos dados de saúde mental
      </p>

      {!apiAvailable && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API não disponível</AlertTitle>
          <AlertDescription>
            O backend Python não está acessível. Certifique-se de que o servidor está em execução em
            http://localhost:8000.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro na análise</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Seleção e configuração de modelo */}
        <div className="space-y-6">
          <ModelSelector onModelSelect={handleModelSelect} />

          {selectedModelType && selectedModelName && (
            <ParameterConfig
              modelType={selectedModelType}
              modelName={selectedModelName}
              onParametersChange={handleParametersChange}
              onStartTraining={handleStartTraining}
            />
          )}
        </div>

        {/* Feedback de processamento */}
        <div className="space-y-6">
          {(isProcessing || processingLogs.length > 0) && (
            <ProcessingFeedback
              isProcessing={isProcessing}
              currentStage={processingStage}
              progress={processingProgress}
              timeElapsed={timeElapsed}
              timeRemaining={timeRemaining}
              logs={processingLogs}
              onCancel={handleCancelProcessing}
              isCancelled={isCancelled}
            />
          )}

          {isProcessing && Object.keys(metricsData).length > 0 && (
            <RealTimeMetrics modelType={selectedModelType || ""} metrics={metricsData} />
          )}
        </div>
      </div>

      {/* Resultados */}
      {results && selectedModelType && selectedModelName && (
        <div className="mt-8">
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Resultados da Análise</CardTitle>
                  <CardDescription>{getModelTypeName(selectedModelType)}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="visualization">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="visualization">Visualização</TabsTrigger>
                  <TabsTrigger value="metrics">Métricas</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="visualization">
                  {selectedModelType === "timeSeries" && (
                    <TimeSeriesChart
                      title="Previsão de Tendências"
                      description="Evolução e previsão da prevalência do transtorno ao longo do tempo"
                      disorder={modelParameters.target || "depression"}
                      region={modelParameters.region || "global"}
                      metric="Prevalência (%)"
                      showConfidenceInterval={true}
                      forecastPeriod={modelParameters.forecastPeriod || 5}
                      intervalWidth={modelParameters.intervalWidth || 0.8}
                      data={results?.data || []}
                    />
                  )}

                  {selectedModelType === "clustering" && (
                    <ClusterChart
                      title="Análise de Clusters"
                      description="Agrupamento de países com perfis semelhantes de saúde mental"
                      features={modelParameters.features || ["depression", "anxiety"]}
                      year={modelParameters.year || 2019}
                      xLabel="Depressão (%)"
                      yLabel="Ansiedade (%)"
                      clusterCount={modelParameters.nClusters || 3}
                      data={results?.points || []}
                      clusterStats={results?.clusters || []}
                    />
                  )}

                  {selectedModelType === "anomaly" && (
                    <TreatmentGapChart
                      title="Detecção de Anomalias"
                      description="Identificação de países com padrões atípicos de saúde mental"
                      year={modelParameters.year || 2019}
                      data={results?.points || []}
                      statistics={results?.statistics || {}}
                    />
                  )}
                </TabsContent>

                <TabsContent value="metrics">
                  {/* Renderização de métricas específicas para cada tipo de modelo */}
                  {/* Implementação omitida para brevidade */}
                </TabsContent>

                <TabsContent value="insights">
                  {/* Renderização de insights específicos para cada tipo de modelo */}
                  {/* Implementação omitida para brevidade */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
