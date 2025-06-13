"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, PieChart, Network, LineChart, AlertTriangle } from "lucide-react"

export type ModelType = "timeSeries" | "clustering" | "correlation" | "regression" | "anomaly"

interface ModelSelectorProps {
  onModelSelect: (modelType: ModelType, modelName: string) => void
}

export function ModelSelector({ onModelSelect }: ModelSelectorProps) {
  const [selectedType, setSelectedType] = useState<ModelType>("timeSeries")

  const handleModelSelect = (modelName: string) => {
    onModelSelect(selectedType, modelName)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Selecione um Modelo de Análise</CardTitle>
        <CardDescription>
          Escolha o tipo de análise e o modelo específico para aplicar aos dados de saúde mental
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="timeSeries" onValueChange={(value) => setSelectedType(value as ModelType)}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="timeSeries" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Tendências</span>
            </TabsTrigger>
            <TabsTrigger value="clustering" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Clustering</span>
            </TabsTrigger>
            <TabsTrigger value="correlation" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span className="hidden sm:inline">Correlação</span>
            </TabsTrigger>
            <TabsTrigger value="regression" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Regressão</span>
            </TabsTrigger>
            <TabsTrigger value="anomaly" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Anomalias</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeSeries" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModelCard
                title="Prophet"
                description="Previsão de tendências futuras com decomposição de séries temporais"
                features={["Tendências não-lineares", "Sazonalidade", "Efeitos de feriados"]}
                onSelect={() => handleModelSelect("prophet")}
              />
              <ModelCard
                title="LSTM"
                description="Redes neurais para séries temporais complexas"
                features={["Relações não-lineares", "Memória de longo prazo", "Múltiplas variáveis"]}
                onSelect={() => handleModelSelect("lstm")}
              />
            </div>
          </TabsContent>

          <TabsContent value="clustering" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ModelCard
                title="K-Means + PCA"
                description="Agrupamento de países/regiões com perfis semelhantes"
                features={["Redução de dimensionalidade", "Clusters bem definidos", "Visualização 2D/3D"]}
                onSelect={() => handleModelSelect("kmeans")}
              />
              <ModelCard
                title="DBSCAN"
                description="Clustering baseado em densidade para padrões complexos"
                features={["Detecção de outliers", "Clusters de formato irregular", "Sem número fixo de clusters"]}
                onSelect={() => handleModelSelect("dbscan")}
              />
            </div>
          </TabsContent>

          {/* Conteúdo similar para outras abas */}
          <TabsContent value="correlation">{/* Modelos de correlação */}</TabsContent>

          <TabsContent value="regression">{/* Modelos de regressão */}</TabsContent>

          <TabsContent value="anomaly">{/* Modelos de detecção de anomalias */}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface ModelCardProps {
  title: string
  description: string
  features: string[]
  onSelect: () => void
}

function ModelCard({ title, description, features, onSelect }: ModelCardProps) {
  return (
    <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onSelect}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1">
          {features.map((feature, index) => (
            <li key={index} className="text-sm">
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
