"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react"

interface ProcessingStage {
  name: string
  status: "pending" | "active" | "completed" | "error"
  progress: number
}

interface ProcessingFeedbackProps {
  isProcessing: boolean
  currentStage: string
  progress: number
  timeElapsed: number
  timeRemaining: number | null
  logs: string[]
  onCancel: () => void
}

export function ProcessingFeedback({
  isProcessing,
  currentStage,
  progress,
  timeElapsed,
  timeRemaining,
  logs,
  onCancel,
}: ProcessingFeedbackProps) {
  const [stages, setStages] = useState<ProcessingStage[]>([
    { name: "Pré-processamento", status: "pending", progress: 0 },
    { name: "Treinamento", status: "pending", progress: 0 },
    { name: "Validação", status: "pending", progress: 0 },
    { name: "Geração de Insights", status: "pending", progress: 0 },
  ])

  // Atualiza o status dos estágios com base no estágio atual
  useEffect(() => {
    if (!isProcessing) return

    const updatedStages = [...stages]

    // Encontra o índice do estágio atual
    const currentIndex = stages.findIndex((stage) => stage.name.toLowerCase() === currentStage.toLowerCase())

    if (currentIndex >= 0) {
      // Marca estágios anteriores como concluídos
      for (let i = 0; i < currentIndex; i++) {
        updatedStages[i] = { ...updatedStages[i], status: "completed", progress: 100 }
      }

      // Atualiza o estágio atual
      updatedStages[currentIndex] = {
        ...updatedStages[currentIndex],
        status: "active",
        progress,
      }
    }

    setStages(updatedStages)
  }, [currentStage, progress, isProcessing])

  // Formata o tempo em hh:mm:ss
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Processamento em Andamento
          <Badge variant={isProcessing ? "default" : "outline"}>{isProcessing ? "Processando" : "Concluído"}</Badge>
        </CardTitle>
        <CardDescription>
          {currentStage}: {progress}% concluído
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={progress} className="h-2" />

        <div className="flex justify-between text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Tempo decorrido: {formatTime(timeElapsed)}</span>
          </div>
          {timeRemaining !== null && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Tempo restante: {formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Progresso por Estágio</h4>
          <div className="space-y-2">
            {stages.map((stage, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stage.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : stage.status === "active" ? (
                      <div className="h-4 w-4 rounded-full bg-blue-500 animate-pulse" />
                    ) : stage.status === "error" ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                    )}
                    <span className="text-sm">{stage.name}</span>
                  </div>
                  <span className="text-xs">{stage.progress}%</span>
                </div>
                <Progress value={stage.progress} className="h-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Log de Execução</h4>
          <ScrollArea className="h-32 rounded-md border p-2">
            {logs.map((log, index) => (
              <div key={index} className="text-xs">
                {log}
              </div>
            ))}
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={onCancel} disabled={!isProcessing} className="w-full">
          Cancelar Processamento
        </Button>
      </CardFooter>
    </Card>
  )
}
