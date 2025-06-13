"use client"

import { useState, useEffect } from "react"
import { ModelSelector, type ModelType } from "@/components/ml/model-selector"
import { ParameterConfig } from "@/components/ml/parameter-config"
import { ProcessingFeedback } from "@/components/ml/processing-feedback"
import { RealTimeMetrics } from "@/components/ml/real-time-metrics"
import { ResultsDashboard } from "@/components/ml/results-dashboard"

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

  // Simulação de WebSocket para atualizações em tempo real
  useEffect(() => {
    if (!isProcessing) return

    // Simulação de progresso
    const progressInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 1
      })

      // Atualiza logs periodicamente
      if (processingProgress % 10 === 0) {
        addLog(`Progresso: ${processingProgress}% concluído`)
      }

      // Atualiza métricas
      updateMetrics()

      // Atualiza tempo restante
      const remaining = Math.round((100 - processingProgress) * (timeElapsed / processingProgress))
      setTimeRemaining(remaining > 0 ? remaining : null)

      // Atualiza estágio
      if (processingProgress < 20) {
        setProcessingStage("Pré-processamento")
      } else if (processingProgress < 70) {
        setProcessingStage("Treinamento")
      } else if (processingProgress < 90) {
        setProcessingStage("Validação")
      } else {
        setProcessingStage("Geração de Insights")
      }

      // Finaliza o processamento
      if (processingProgress >= 100) {
        setTimeout(() => {
          setIsProcessing(false)
          setResults({
            // Resultados simulados
            metrics: {
              rmse: 0.0324,
              mae: 0.0256,
              mape: 3.45,
              r2: 0.876,
            },
            predictions: [],
            insights: [],
          })
          addLog("Processamento concluído com sucesso!")
        }, 1000)
      }
    }, 300) // Atualiza a cada 300ms para simulação

    return () => {
      clearInterval(progressInterval)
    }
  }, [isProcessing, processingProgress, timeElapsed])

  // Funções auxiliares
  const handleModelSelect = (modelType: ModelType, modelName: string) => {
    setSelectedModelType(modelType)
    setSelectedModelName(modelName)
    setModelParameters({})
    setResults(null)
  }

  const handleParametersChange = (params: Record<string, any>) => {
    setModelParameters(params)
  }

  const handleStartTraining = () => {
    setIsProcessing(true)
    setProcessingProgress(0)
    setTimeElapsed(0)
    setTimeRemaining(null)
    setProcessingLogs([])
    setMetricsData({})
    setResults(null)

    // Adiciona logs iniciais
    addLog(`Iniciando treinamento do modelo ${selectedModelName}`)
    addLog(`Parâmetros: ${JSON.stringify(modelParameters)}`)
  }

  const handleCancelProcessing = () => {
    setIsProcessing(false)
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
      <h1 className="text-3xl font-bold">Análise de Machine Learning</h1>
      <p className="text-muted-foreground">
        Selecione um modelo, configure parâmetros e gere insights a partir dos dados de saúde mental
      </p>

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
          <ResultsDashboard
            modelType={selectedModelType}
            modelName={selectedModelName}
            results={results}
            onExport={handleExport}
            onShare={handleShare}
          />
        </div>
      )}
    </div>
  )
}
