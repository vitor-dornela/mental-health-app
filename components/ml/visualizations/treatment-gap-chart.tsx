"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { loadCSVData, getTreatmentGapData, type TreatmentGap } from "@/lib/data-loader"

interface TreatmentGapChartProps {
  title: string
  description: string
  year?: number | string
}

export function TreatmentGapChart({ title, description, year = 2017 }: TreatmentGapChartProps) {
  const [data, setData] = useState<{ name: string; value: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTreatmentGapData() {
      try {
        setIsLoading(true)
        setError(null)

        // Carrega os dados de lacuna de tratamento
        const treatmentGapData = await loadCSVData<TreatmentGap>("anxiety-treatment-gap.csv")

        // Obtém os dados processados
        const processedData = getTreatmentGapData(treatmentGapData, year)

        setData(processedData)
      } catch (err) {
        console.error("Erro ao carregar dados de lacuna de tratamento:", err)
        setError("Erro ao carregar dados. Por favor, tente novamente.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTreatmentGapData()
  }, [year])

  // Cores para diferentes categorias
  const colors = ["#4CAF50", "#FFC107", "#F44336"]

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
          <Tabs defaultValue="pie">
            <TabsList className="grid grid-cols-2 w-40 mb-4">
              <TabsTrigger value="pie">Pizza</TabsTrigger>
              <TabsTrigger value="bar">Barras</TabsTrigger>
            </TabsList>

            <TabsContent value="pie">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="bar">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, ""]} />
                    <Legend />
                    <Bar dataKey="value" name="Percentual">
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
