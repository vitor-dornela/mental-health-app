"use client"

import { useEffect, useState } from "react"
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
import { loadCSVData, getTimeSeriesData, type MentalIllnessPrevalence } from "@/lib/data-loader"

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
}: TimeSeriesChartProps) {
  const [data, setData] = useState<TimeSeriesPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTimeSeriesData() {
      try {
        setIsLoading(true)
        setError(null)

        // Carrega os dados de prevalência
        const prevalenceData = await loadCSVData<MentalIllnessPrevalence>("mental-illnesses-prevalence.csv")

        if (prevalenceData.length === 0) {
          throw new Error("Não foi possível carregar os dados de prevalência")
        }

        // Filtra dados inválidos
        const validData = prevalenceData.filter(
          (item) => item && typeof item.Entity === "string" && typeof item.Year === "number" && !isNaN(item.Year),
        )

        if (validData.length === 0) {
          throw new Error("Nenhum dado válido encontrado após filtragem")
        }

        console.log(`Dados válidos para visualização: ${validData.length} registros`)

        // Obtém os dados de séries temporais
        const timeSeriesData = getTimeSeriesData(validData, disorder, region)

        if (timeSeriesData.length === 0) {
          console.warn(`Nenhum dado de série temporal encontrado para ${disorder} na região ${region}`)
        }

        // Adiciona previsões para os próximos anos
        const extendedData = [...timeSeriesData]

        if (timeSeriesData.length > 0) {
          // Obtém os últimos anos para calcular a tendência
          const lastYears = timeSeriesData.slice(-Math.min(5, timeSeriesData.length))
          const values = lastYears
            .map((d) => d.actual)
            .filter((val): val is number => typeof val === "number" && !isNaN(val))

          // Calcula a tendência linear simples
          let trend = 0
          if (values.length > 1) {
            let sum = 0
            for (let i = 1; i < values.length; i++) {
              sum += values[i] - values[i - 1]
            }
            trend = sum / (values.length - 1)
          }

          // Último ano disponível
          const lastYear = Number.parseInt(timeSeriesData[timeSeriesData.length - 1].date)
          const lastValue = timeSeriesData[timeSeriesData.length - 1].actual || 0

          // Gera previsões
          for (let i = 1; i <= forecastPeriod; i++) {
            const year = lastYear + i
            const predicted = lastValue + trend * i
            const halfInterval = (predicted * (1 - intervalWidth)) / 2

            extendedData.push({
              date: year.toString(),
              predicted,
              lower: predicted - halfInterval,
              upper: predicted + halfInterval,
            })
          }
        }

        setData(extendedData)
      } catch (err) {
        console.error("Erro ao carregar dados de séries temporais:", err)
        setError("Erro ao carregar dados. Por favor, tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTimeSeriesData()
  }, [disorder, region, forecastPeriod, intervalWidth])

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
