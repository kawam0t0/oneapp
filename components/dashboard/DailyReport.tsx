"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, TrendingUp, Users, Car, Pen as Yen } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

export default function DailyReport() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // モックデータ
  const dailyStats = {
    totalSales: 45000,
    totalCustomers: 23,
    totalCars: 28,
    averageTicket: 1957,
    topService: "プレミアム洗車",
    busyHour: "14:00-15:00",
  }

  const hourlyData = [
    { hour: "09:00", customers: 2, sales: 3000 },
    { hour: "10:00", customers: 4, sales: 6000 },
    { hour: "11:00", customers: 3, sales: 4500 },
    { hour: "12:00", customers: 1, sales: 1500 },
    { hour: "13:00", customers: 5, sales: 7500 },
    { hour: "14:00", customers: 6, sales: 9000 },
    { hour: "15:00", customers: 2, sales: 3000 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">日報</h2>
          <p className="text-muted-foreground">日次売上レポートと分析</p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button>レポート出力</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総売上</CardTitle>
            <Yen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{dailyStats.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              前日比 +12.5%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">来店客数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.totalCustomers}人</div>
            <p className="text-xs text-muted-foreground">前日比 +3人</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">洗車台数</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.totalCars}台</div>
            <p className="text-xs text-muted-foreground">前日比 +5台</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均単価</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{dailyStats.averageTicket.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">前日比 +8.2%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>時間別売上</CardTitle>
            <CardDescription>営業時間中の売上推移</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hourlyData.map((data) => (
                <div key={data.hour} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium w-16">{data.hour}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 max-w-[200px]">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${(data.sales / 9000) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">¥{data.sales.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{data.customers}人</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>本日のハイライト</CardTitle>
            <CardDescription>重要な指標とトレンド</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">人気サービス</span>
              <Badge variant="secondary">{dailyStats.topService}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">最繁忙時間</span>
              <Badge variant="outline">{dailyStats.busyHour}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">売上目標達成率</span>
              <Badge className="bg-green-100 text-green-800">112%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">顧客満足度</span>
              <Badge className="bg-blue-100 text-blue-800">4.8/5.0</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
