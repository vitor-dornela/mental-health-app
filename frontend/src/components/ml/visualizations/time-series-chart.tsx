"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

interface TimeSeriesPoint {
  date: string
  actual?: number
  predicted?: number
  lower?: number
  upper?: number
}

interface TimeSeriesChartProps {
  title: string
  description: string
  disorder: string
  region: string
  metric: string
  showConfidenceInterval?: boolean
  forecastPeriod?: number
  intervalWidth?: number
  data?: TimeSeriesPoint[]
}

export function TimeSeriesChart({
  title,
  description,
  disorder,
  region,
  metric,
  showConfidenceInterval = true,
  forecastPeriod = 5,
  intervalWidth = 0.8,
  data = [],
}: TimeSeriesChartProps) {
  const [isLoading, setIsLoading] = useState(data.length === 0)
  const [error, setError] = useState<string | null>(null)

  // Função para formatar valores no tooltip
  const formatTooltipValue = (value: number) => {
    return `${value.toFixed(2)}%`
  }

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
          <Tabs defaultValue="line">
            <TabsList className="grid grid-cols-2 w-40 mb-4">
              <TabsTrigger value="line">Linha</TabsTrigger>
              <TabsTrigger value="area">Área</TabsTrigger>
            </TabsList>

            <TabsContent value="line">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" label={{ value: "Ano", position: "insideBottom", offset: -5 }} />
                    <YAxis
                      label={{
                        value: metric,
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle" },
                      }}
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip formatter={(value) => [formatTooltipValue(value as number), "Prevalência"]} />
                    <Legend />
                    {showConfidenceInterval && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="lower"
                          stroke="#8884d8"
                          strokeDasharray="5 5"
                          strokeWidth={1}
                          dot={false}
                          name="Limite Inferior"
                        />
                        <Line
                          type="monotone"
                          dataKey="upper"
                          stroke="#8884d8"
                          strokeDasharray="5 5"
                          strokeWidth={1}
                          dot={false}
                          name="Limite Superior"
                        />
                      </>
                    )}
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" strokeWidth={2} name="Valor Real" />
                    <Line type="monotone" dataKey="predicted" stroke="#8884d8" strokeWidth={2} name="Previsão" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="area">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => `${value.toFixed(1)}%`} />
                    <Tooltip formatter={(value) => [formatTooltipValue(value as number), "Prevalência"]} />
                    <Legend />
                    {showConfidenceInterval && (
                      <Area
                        type="monotone"
                        dataKey="lower"
                        stackId="1"
                        stroke="none"
                        fill="#8884d833"
                        name="Intervalo de Confiança"
                      />
                    )}
                    {showConfidenceInterval && (
                      <Area
                        type="monotone"
                        dataKey="upper"
                        stackId="1"
                        stroke="none"
                        fill="#8884d833"
                        name="Intervalo de Confiança"
                      />
                    )}
                    <Area type="monotone" dataKey="actual" stroke="#82ca9d" fill="#82ca9d" name="Valor Real" />
                    <Area type="monotone" dataKey="predicted" stroke="#8884d8" fill="#8884d8" name="Previsão" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
