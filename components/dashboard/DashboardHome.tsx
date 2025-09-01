"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, CreditCard, Users, BarChart3, Trophy, LineChart } from "lucide-react"
import type { Transaction } from "@/lib/supabase"

interface Store {
  id: number
  name: string
}

interface DashboardHomeProps {
  stores: Store[]
  transactions: Transaction[]
  selectedStore: string
  setSelectedStore: (store: string) => void
}

export default function DashboardHome({ stores, transactions, selectedStore, setSelectedStore }: DashboardHomeProps) {
  const storeAnalytics = useMemo(() => {
    console.log("[v0] Calculating analytics with transactions:", transactions.length)

    // 今月のデータのみをフィルタリング
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const currentMonthTransactions = transactions.filter((t) => {
      if (!t.transaction_date) return false
      const transactionDate = new Date(t.transaction_date)
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth
    })

    // 店舗別フィルタリング
    let filteredTransactions = currentMonthTransactions
    if (selectedStore !== "all") {
      const selectedStoreName = stores.find((s) => s.id.toString() === selectedStore)?.name
      if (selectedStoreName) {
        filteredTransactions = currentMonthTransactions.filter((t) => t.store_name === selectedStoreName)
      }
    }

    console.log("[v0] Filtered transactions:", filteredTransactions.length)

    // 総売上計算
    const totalSales = filteredTransactions.reduce((sum, t) => sum + (t.net_total || 0), 0)

    // ワンタイム/サブスク売上の分類（payment_sourceで判定）
    const onetimeSales = filteredTransactions
      .filter((t) => t.payment_source === "POSレジ" || ["CASH", "CARD", "WALLET"].includes(t.payment_source || ""))
      .reduce((sum, t) => sum + (t.net_total || 0), 0)

    const subscriptionSales = filteredTransactions
      .filter((t) => t.payment_source === "請求書")
      .reduce((sum, t) => sum + (t.net_total || 0), 0)

    // 総台数（全取引件数）
    const totalUnits = filteredTransactions.length

    // 平均単価
    const avgPrice = totalUnits > 0 ? Math.round(totalSales / totalUnits) : 0

    // 会員数（ユニーク顧客数）
    const uniqueCustomers = new Set(
      filteredTransactions.map((t) => t.customer_id).filter((id) => id && id.trim() !== ""),
    )
    const memberCount = uniqueCustomers.size

    const storeUnitsMap = new Map<string, number>()
    currentMonthTransactions.forEach((t) => {
      if (t.store_name) {
        storeUnitsMap.set(t.store_name, (storeUnitsMap.get(t.store_name) || 0) + 1)
      }
    })

    // storesテーブルのnameカラムの順序で店舗一覧を作成
    const storeUnits = stores.map((store) => ({
      storeName: store.name,
      units: storeUnitsMap.get(store.name) || 0,
      totalUnits: storeUnitsMap.get(store.name) || 0, // 実際の台数データ
      subscription: "", // 計算ロジック未実装のため空表示
      repeat: "", // 計算ロジック未実装のため空表示
      newCustomer: "", // 計算ロジック未実装のため空表示
    }))

    // 台数ランキング（上位3店舗）
    const ranking = storeUnits.slice(0, 3).map((store, index) => ({
      rank: index + 1,
      storeName: store.storeName,
      units: store.units,
    }))

    console.log("[v0] Analytics calculated:", {
      totalSales,
      onetimeSales,
      subscriptionSales,
      totalUnits,
      avgPrice,
      memberCount,
      storeUnitsCount: storeUnits.length,
    })

    return {
      totalSales,
      onetimeSales,
      subscriptionSales,
      totalUnits,
      avgPrice,
      memberCount,
      storeUnits,
      ranking,
    }
  }, [transactions, selectedStore, stores])

  const currentMonthDisplay = useMemo(() => {
    const now = new Date()
    return `${now.getFullYear()}年${now.getMonth() + 1}月`
  }, [])

  return (
    <>
      {/* Store Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            店舗選択
          </CardTitle>
          <CardDescription>分析したい店舗を選択してください（{currentMonthDisplay}のデータ）</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full sm:w-64">
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* 総売上 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総売上</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-primary">
              ¥{storeAnalytics.totalSales.toLocaleString()}
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">ワンタイム</span>
                <span className="font-medium">¥{storeAnalytics.onetimeSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">サブスク</span>
                <span className="font-medium">¥{storeAnalytics.subscriptionSales.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 総台数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総台数</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold">{storeAnalytics.totalUnits}台</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              全取引件数（{currentMonthDisplay}）
            </p>
          </CardContent>
        </Card>

        {/* 平均単価 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均単価</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold">¥{storeAnalytics.avgPrice.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              1台あたり平均（{currentMonthDisplay}）
            </p>
          </CardContent>
        </Card>

        {/* 会員数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">会員数</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold">{storeAnalytics.memberCount}人</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              ユニーク顧客数（{currentMonthDisplay}）
            </p>
          </CardContent>
        </Card>

        {/* 空のカード（レイアウト調整用） */}
        <div className="hidden lg:block"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 今月の台数（店舗別一覧） */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              今月の台数
            </CardTitle>
            <CardDescription>店舗別の台数一覧（{currentMonthDisplay}）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
                <span>店舗名</span>
                <span className="text-center">総台数</span>
                <span className="text-center">サブスク</span>
                <span className="text-center">リピート</span>
                <span className="text-center">新規</span>
              </div>
              {storeAnalytics.storeUnits.map((store, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 text-sm py-2 border-b border-muted/30">
                  <span className="font-medium truncate">{store.storeName}</span>
                  <span className="text-center font-serif font-bold text-primary">{store.totalUnits}台</span>
                  <span className="text-center">{store.subscription}</span>
                  <span className="text-center">{store.repeat}</span>
                  <span className="text-center">{store.newCustomer}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 今月の台数ランキング */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              今月の台数ランキング
            </CardTitle>
            <CardDescription>上位3店舗（{currentMonthDisplay}）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storeAnalytics.ranking.map((item) => (
                <div key={item.rank} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        item.rank === 1
                          ? "bg-yellow-500 text-white"
                          : item.rank === 2
                            ? "bg-gray-400 text-white"
                            : "bg-orange-600 text-white"
                      }`}
                    >
                      {item.rank}
                    </div>
                    <span className="font-medium text-sm">{item.storeName}</span>
                  </div>
                  <span className="text-lg font-serif font-bold text-primary">{item.units}台</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            全店舗別折れ線グラフ
          </CardTitle>
          <CardDescription>時系列での推移分析</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select defaultValue="totalSales">
              <SelectTrigger className="w-48">
                <SelectValue placeholder="表示項目を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalSales">総売上</SelectItem>
                <SelectItem value="totalUnits">総台数</SelectItem>
                <SelectItem value="avgPrice">平均単価</SelectItem>
                <SelectItem value="memberCount">会員数</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-64 flex items-center justify-center bg-muted/10 rounded-lg">
            <p className="text-muted-foreground">グラフコンポーネント（後で実装）</p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
