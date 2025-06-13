"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts"

interface ClusterPoint {
  id: string
  name: string
  x: number
  y: number
  cluster: number
}

interface ClusterStat {
  cluster: number
  count: number
  percentage: number
  [key: string]: number | string
}

interface ClusterChartProps {
  title: string
  description: string
  features: string[]
  year: number | string
  xLabel: string
  yLabel: string
  clusterCount: number
  data?: ClusterPoint[]
  clusterStats?: ClusterStat[]
}

export function ClusterChart({
  title,
  description,
  features,
  year,
  xLabel,
  yLabel,
  clusterCount,
  data = [],
  clusterStats = [],
}: ClusterChartProps) {
  const [isLoading, setIsLoading] = useState(data.length === 0)
  const [error, setError] = useState<string | null>(null)

  // Cores para diferentes clusters
  const clusterColors = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#d62728",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ]

  // Dados para o gráfico de distribuição
  const distributionData = clusterStats.map((stat) => ({
    name: `Grupo ${stat.cluster + 1}`,
    value: stat.count,
  }))

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
              <TabsTrigger value="distribution">Distribuição</TabsTrigger>
            </TabsList>

            <TabsContent value="scatter">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name={xLabel}
                      label={{ value: xLabel, position: "insideBottom", offset: -5 }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name={yLabel}
                      label={{ value: yLabel, angle: -90, position: "insideLeft" }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, ""]}
                      labelFormatter={(label) => `Ponto: ${label}`}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as ClusterPoint
                          return (
                            <div className="bg-white p-2 border rounded shadow-sm">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm">{`${xLabel}: ${data.x.toFixed(2)}%`}</p>
                              <p className="text-sm">{`${yLabel}: ${data.y.toFixed(2)}%`}</p>
                              <p className="text-sm font-medium">{`Grupo: ${data.cluster + 1}`}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend />
                    {Array.from({ length: clusterCount }, (_, i) => (
                      <Scatter
                        key={i}
                        name={`Grupo ${i + 1}`}
                        data={data.filter((d) => d.cluster === i)}
                        fill={clusterColors[i % clusterColors.length]}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={clusterColors[index % clusterColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
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
