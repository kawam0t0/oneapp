"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, TrendingUp, Users, Car, Pen as Yen } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ja } from "date-fns/locale"
import { subscribeToTransactions, type Transaction } from "@/lib/supabase"

interface Store {
  id: number
  name: string
}

interface DailyReportProps {
  stores: Store[]
  transactions: Transaction[]
}

export default function DailyReport({ stores, transactions }: DailyReportProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedStore, setSelectedStore] = useState<string>("all")
  const [dailyTransactions, setDailyTransactions] = useState<Transaction[]>(transactions)
  const [dailyNotes, setDailyNotes] = useState<string>("トラブル・エラー等引き継ぎ事項があれば記載下さい")

  useEffect(() => {
    setDailyTransactions(transactions)

    const subscription = subscribeToTransactions((payload) => {
      console.log("[v0] Daily report real-time update:", payload.eventType)
      if (payload.eventType === "INSERT") {
        setDailyTransactions((prev) => [payload.new, ...prev])
      } else if (payload.eventType === "UPDATE") {
        setDailyTransactions((prev) => prev.map((t) => (t.payment_id === payload.new.payment_id ? payload.new : t)))
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [transactions])

  const getTodayTransactions = () => {
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd")

    return dailyTransactions.filter((t) => {
      if (!t.transaction_date) return false

      const transactionDate = format(parseISO(t.transaction_date), "yyyy-MM-dd")
      const storeMatches =
        selectedStore === "all" || t.store_name === stores.find((s) => s.id.toString() === selectedStore)?.name
      const hasValidAmount = (t.net_total || 0) > 0
      const isValidPayment = ["CASH", "CARD", "WALLET", "POSレジ", "請求書"].includes(t.payment_source || "")

      console.log("[v0] Daily filtering:", {
        transactionDate,
        selectedDateStr,
        storeMatches,
        hasValidAmount,
        isValidPayment,
        payment_source: t.payment_source,
        net_total: t.net_total,
      })

      return transactionDate === selectedDateStr && storeMatches && hasValidAmount && isValidPayment
    })
  }

  const calculateDailyStats = () => {
    const todayTransactions = getTodayTransactions()

    console.log("[v0] Today transactions count:", todayTransactions.length)
    console.log("[v0] Sample today transaction:", todayTransactions[0])

    const totalSales = todayTransactions.reduce((sum, t) => sum + (t.net_total || 0), 0)
    const onetimeSales = todayTransactions
      .filter((t) => ["CASH", "CARD", "WALLET", "POSレジ"].includes(t.payment_source || ""))
      .reduce((sum, t) => sum + (t.net_total || 0), 0)
    const subscriptionSales = todayTransactions
      .filter((t) => t.payment_source === "請求書")
      .reduce((sum, t) => sum + (t.net_total || 0), 0)
    const totalTransactions = todayTransactions.length
    const subscriptionCount = todayTransactions.filter((t) => t.payment_source === "請求書").length
    const repeatCount = 0 // TODO: 計算ロジック後で実装
    const newCount = 0 // TODO: 計算ロジック後で実装

    const uniqueCustomers = new Set(
      todayTransactions.filter((t) => t.customer_id && t.customer_id.trim() !== "").map((t) => t.customer_id),
    ).size
    const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const hourlyData: { [key: string]: { customers: number; sales: number } } = {}
    todayTransactions.forEach((t) => {
      if (t.transaction_time) {
        const hour = t.transaction_time.substring(0, 2) + ":00"
        if (!hourlyData[hour]) {
          hourlyData[hour] = { customers: 0, sales: 0 }
        }
        hourlyData[hour].customers += 1
        hourlyData[hour].sales += t.net_total || 0
      }
    })

    console.log("[v0] Daily stats calculated:", {
      totalSales,
      onetimeSales,
      subscriptionSales,
      totalTransactions,
      subscriptionCount,
    })

    return {
      totalSales,
      onetimeSales,
      subscriptionSales,
      totalTransactions,
      subscriptionCount,
      repeatCount,
      newCount,
      uniqueCustomers,
      averageTicket: Math.round(averageTicket),
      hourlyData: Object.entries(hourlyData)
        .map(([hour, data]) => ({
          hour,
          customers: data.customers,
          sales: data.sales,
        }))
        .sort((a, b) => a.hour.localeCompare(b.hour)),
    }
  }

  const dailyStats = calculateDailyStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">日報</h2>
          <p className="text-muted-foreground">
            {format(selectedDate, "yyyy年MM月dd日", { locale: ja })}の実績レポート
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="店舗を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全店舗</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総売上</CardTitle>
            <Yen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{dailyStats.totalSales.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>ワンタイム: ¥{dailyStats.onetimeSales.toLocaleString()}</div>
              <div>サブスク: ¥{dailyStats.subscriptionSales.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総台数</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.totalTransactions}台</div>
            <p className="text-xs text-muted-foreground">決済完了分のみ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">サブスク</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.subscriptionCount}台</div>
            <p className="text-xs text-muted-foreground">請求書決済</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">リピート</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.repeatCount}台</div>
            <p className="text-xs text-muted-foreground">リピート顧客</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新規</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.newCount}台</div>
            <p className="text-xs text-muted-foreground">新規顧客</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>時間別売上</CardTitle>
            <CardDescription>営業時間中の台数と売上推移</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyStats.hourlyData.length > 0 ? (
                dailyStats.hourlyData.map((data) => {
                  const maxSales = Math.max(...dailyStats.hourlyData.map((d) => d.sales))
                  return (
                    <div key={data.hour} className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium w-16">{data.hour}</span>
                        <div className="flex-1 bg-muted rounded-full h-2 max-w-[200px]">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: maxSales > 0 ? `${(data.sales / maxSales) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">¥{data.sales.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{data.customers}台</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-center text-muted-foreground">データがありません</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>所感</CardTitle>
            <CardDescription>今日起こった出来事や引き継ぎ事項</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              placeholder="トラブル・エラー等引き継ぎ事項があれば記載下さい"
              className="min-h-[200px] resize-none"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
