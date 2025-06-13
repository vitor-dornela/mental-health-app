"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { ModelType } from "./model-selector"

interface ParameterConfigProps {
  modelType: ModelType
  modelName: string
  onParametersChange: (params: Record<string, any>) => void
  onStartTraining: () => void
}

export function ParameterConfig({ modelType, modelName, onParametersChange, onStartTraining }: ParameterConfigProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({})

  const updateParameter = (key: string, value: any) => {
    const updatedParams = { ...parameters, [key]: value }
    setParameters(updatedParams)
    onParametersChange(updatedParams)
  }

  // Renderiza diferentes configurações baseadas no tipo de modelo
  const renderModelConfig = () => {
    switch (modelType) {
      case "timeSeries":
        return renderTimeSeriesConfig()
      case "clustering":
        return renderClusteringConfig()
      // Outros casos para diferentes tipos de modelos
      default:
        return <p>Selecione um modelo para configurar</p>
    }
  }

  const renderTimeSeriesConfig = () => {
    if (modelName === "prophet") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="target">Variável Alvo</Label>
            <Select onValueChange={(value) => updateParameter("target", value)} defaultValue="depression">
              <SelectTrigger id="target">
                <SelectValue placeholder="Selecione o transtorno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="depression">Depressão</SelectItem>
                <SelectItem value="anxiety">Ansiedade</SelectItem>
                <SelectItem value="bipolar">Transtorno Bipolar</SelectItem>
                <SelectItem value="schizophrenia">Esquizofrenia</SelectItem>
                <SelectItem value="eating">Transtornos Alimentares</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecast-period">Período de Previsão (anos)</Label>
            <Slider
              id="forecast-period"
              min={1}
              max={10}
              step={1}
              defaultValue={[5]}
              onValueChange={(value) => updateParameter("forecastPeriod", value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 ano</span>
              <span>5 anos</span>
              <span>10 anos</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="yearly-seasonality"
              defaultChecked
              onCheckedChange={(checked) => updateParameter("yearlySeasonality", checked)}
            />
            <Label htmlFor="yearly-seasonality">Sazonalidade Anual</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval-width">Intervalo de Confiança (%)</Label>
            <Slider
              id="interval-width"
              min={50}
              max={95}
              step={5}
              defaultValue={[80]}
              onValueChange={(value) => updateParameter("intervalWidth", value[0] / 100)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>50%</span>
              <span>80%</span>
              <span>95%</span>
            </div>
          </div>
        </div>
      )
    }

    // Configurações para outros modelos de séries temporais
    return null
  }

  const renderClusteringConfig = () => {
    if (modelName === "kmeans") {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="n-clusters">Número de Clusters</Label>
            <Slider
              id="n-clusters"
              min={2}
              max={10}
              step={1}
              defaultValue={[4]}
              onValueChange={(value) => updateParameter("nClusters", value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2</span>
              <span>6</span>
              <span>10</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Características para Análise</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-depression"
                  defaultChecked
                  onCheckedChange={(checked) => {
                    const features = parameters.features || []
                    const updatedFeatures = checked
                      ? [...features, "depression"]
                      : features.filter((f) => f !== "depression")
                    updateParameter("features", updatedFeatures)
                  }}
                />
                <Label htmlFor="feature-depression">Depressão</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="feature-anxiety"
                  defaultChecked
                  onCheckedChange={(checked) => {
                    const features = parameters.features || []
                    const updatedFeatures = checked ? [...features, "anxiety"] : features.filter((f) => f !== "anxiety")
                    updateParameter("features", updatedFeatures)
                  }}
                />
                <Label htmlFor="feature-anxiety">Ansiedade</Label>
              </div>
              {/* Mais características */}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pca-components">Componentes PCA</Label>
            <Slider
              id="pca-components"
              min={2}
              max={5}
              step={1}
              defaultValue={[2]}
              onValueChange={(value) => updateParameter("pcaComponents", value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2D</span>
              <span>3D</span>
              <span>5D</span>
            </div>
          </div>
        </div>
      )
    }

    // Configurações para outros modelos de clustering
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuração do Modelo</CardTitle>
        <CardDescription>
          Ajuste os parâmetros para {modelName} ({modelType})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {renderModelConfig()}

          <Button className="w-full" onClick={onStartTraining}>
            Iniciar Treinamento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
