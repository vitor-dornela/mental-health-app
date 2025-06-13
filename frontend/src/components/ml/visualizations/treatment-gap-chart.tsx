"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"

interface AnomalyPoint {
  id: string
  name: string
  x: number
  y: number
  isAnomaly: boolean
}

interface Statistics {
  mean: number
  std_dev: number
  threshold: number
}

interface TreatmentGapChartProps {
  title: string
  description: string
  year?: number | string
  data?: AnomalyPoint[]
  statistics?: Statistics
}

export function TreatmentGapChart({
  title,
  description,
  year = 2019,
  data = [],
  statistics = { mean: 0, std_dev: 0, threshold: 0 },
}: TreatmentGapChartProps) {
  const [isLoading, setIsLoading] = useState(data.length === 0)
  const [error, setError] = useState<string | null>(null)

  // Cores para diferentes categorias
  const colors = ["#4CAF50", "#FFC107", "#F44336"]

  // Separa pontos normais e anômalos
  const normalPoints = data.filter((point) => !point.isAnomaly)
  const anomalyPoints = data.filter((point) => point.isAnomaly)

  // Dados para o gráfico de pizza
  const pieData = [
    { name: "Normal", value: normalPoints.length },
    { name: "Anomalia", value: anomalyPoints.length },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <p>Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="h-80 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <Tabs defaultValue="scatter">
            <TabsList className="grid grid-cols-2 w-52 mb-4">
              <TabsTrigger value="scatter">Dispersão</TabsTrigger>
              <TabsTrigger value="pie">Distribuição</TabsTrigger>
            </TabsList>

            <TabsContent value="scatter">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Prevalência"
                      label={{ value: "Prevalência (%)", position: "insideBottom", offset: -5 }}
                      domain={["auto", "auto"]}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Índice"
                      label={{ value: "Índice", angle: -90, position: "insideLeft" }}
                      domain={[-1, 1]}
                      tickFormatter={() => ""}
                    />
                    <ZAxis range={[60, 400]} />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value, name) => {
                        if (name === "Prevalência") return [`${Number(value).toFixed(2)}%`, name]
                        return [value, name]
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as AnomalyPoint
                          return (
                            <div className="bg-white p-2 border rounded shadow-sm">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm">{`Prevalência: ${data.x.toFixed(2)}%`}</p>
                              <p className="text-sm font-medium">{`Status: ${data.isAnomaly ? "Anomalia" : "Normal"}`}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    <Scatter name="Normal" data={normalPoints} fill="#8884d8" />
                    <Scatter name="Anomalia" data={anomalyPoints} fill="#FF5722" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="pie">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#8884d8" />
                      <Cell fill="#FF5722" />
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} países`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
