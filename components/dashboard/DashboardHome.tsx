"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, CreditCard, Users, BarChart3, PieChart } from "lucide-react"
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
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999)

    console.log("[v0] Filtering for current month:", {
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString(),
      totalTransactions: transactions.length,
    })

    const currentMonthTransactions = transactions.filter((t) => {
      if (!t.transaction_date) return false
      const transactionDate = new Date(t.transaction_date)
      return transactionDate >= startOfMonth && transactionDate <= endOfMonth
    })

    console.log("[v0] Current month transactions:", currentMonthTransactions.length)

    console.log("[v0] Available store names in transactions:", [
      ...new Set(currentMonthTransactions.map((t) => t.store_name).filter(Boolean)),
    ])
    console.log(
      "[v0] Available stores:",
      stores.map((s) => ({ id: s.id, name: s.name })),
    )
    console.log("[v0] Selected store:", selectedStore)

    const selectedStoreName = stores.find((s) => s.id.toString() === selectedStore)?.name
    console.log("[v0] Selected store name:", selectedStoreName)

    const filteredTransactions =
      selectedStore === "all"
        ? currentMonthTransactions.filter((t) => {
            const hasValidAmount = (t.net_total || 0) > 0 || (t.gross_sales || 0) > 0
            const hasValidPaymentSource =
              t.payment_source && ["CASH", "CARD", "WALLET", "POSレジ", "請求書"].includes(t.payment_source)

            console.log("[v0] Transaction filter check:", {
              net_total: t.net_total,
              gross_sales: t.gross_sales,
              payment_source: t.payment_source,
              payment_or_refund: t.payment_or_refund,
              hasValidAmount,
              hasValidPaymentSource,
            })

            return hasValidAmount && hasValidPaymentSource
          })
        : currentMonthTransactions.filter((t) => {
            const storeMatches = t.store_name === selectedStoreName
            const hasValidAmount = (t.net_total || 0) > 0 || (t.gross_sales || 0) > 0
            const hasValidPaymentSource =
              t.payment_source && ["CASH", "CARD", "WALLET", "POSレジ", "請求書"].includes(t.payment_source)

            if (storeMatches && hasValidAmount && hasValidPaymentSource) {
              console.log("[v0] Matched transaction:", {
                store_name: t.store_name,
                net_total: t.net_total,
                gross_sales: t.gross_sales,
                payment_source: t.payment_source,
                transaction_date: t.transaction_date,
              })
            }

            return storeMatches && hasValidAmount && hasValidPaymentSource
          })

    console.log("[v0] Filtered transactions count:", filteredTransactions.length)

    console.log(
      "[v0] Net total values in filtered transactions:",
      filteredTransactions.map((t) => ({
        id: t.id,
        net_total: t.net_total,
        gross_sales: t.gross_sales,
        payment_source: t.payment_source,
        transaction_date: t.transaction_date,
        store_name: t.store_name,
      })),
    )

    const totalSales = filteredTransactions.reduce((sum, t) => {
      const netTotal = t.net_total || 0
      console.log("[v0] Adding to total sales:", {
        transaction_id: t.id,
        net_total: netTotal,
        running_total: sum + netTotal,
      })
      return sum + netTotal
    }, 0)

    console.log("[v0] Final total sales calculation:", {
      totalSales,
      transactionCount: filteredTransactions.length,
      negativeTransactions: filteredTransactions.filter((t) => (t.net_total || 0) < 0).length,
      zeroTransactions: filteredTransactions.filter((t) => (t.net_total || 0) === 0).length,
      positiveTransactions: filteredTransactions.filter((t) => (t.net_total || 0) > 0).length,
    })

    const totalTransactions = filteredTransactions.length
    const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0

    const uniqueCustomers = new Set(
      filteredTransactions.filter((t) => t.customer_id && t.customer_id.trim() !== "").map((t) => t.customer_id),
    ).size

    const itemCounts: { [key: string]: number } = {}
    filteredTransactions.forEach((t) => {
      if (t.transaction_details && t.transaction_details !== "基本取引") {
        const item = t.transaction_details
        itemCounts[item] = (itemCounts[item] || 0) + 1
      }
    })

    const sourceRevenue: { [key: string]: number } = {}
    filteredTransactions.forEach((t) => {
      const source = t.payment_source || "不明"
      sourceRevenue[source] = (sourceRevenue[source] || 0) + (t.net_total || 0)
    })

    return {
      totalSales,
      totalTransactions,
      avgTransactionValue,
      uniqueCustomers,
      itemCounts,
      sourceRevenue,
      filteredTransactions,
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">店舗別総売上</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold text-primary">
              ¥{storeAnalytics.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {selectedStore === "all" ? "全店舗合計" : "選択店舗"}（{currentMonthDisplay}）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">取引件数</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold">{storeAnalytics.totalTransactions}件</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              決済完了分のみ（{currentMonthDisplay}）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均単価</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold">
              ¥{Math.round(storeAnalytics.avgTransactionValue).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              1取引あたり平均（{currentMonthDisplay}）
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ユニーク顧客数</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif font-bold">{storeAnalytics.uniqueCustomers}人</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              リピート顧客含む（{currentMonthDisplay}）
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* アイテム別件数 */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              アイテム別件数
            </CardTitle>
            <CardDescription>商品・サービス別の取引件数（{currentMonthDisplay}）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(storeAnalytics.itemCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([item, count]) => (
                  <div key={item} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="text-sm font-medium truncate flex-1 mr-2">{item}</span>
                    <span className="text-lg font-serif font-bold text-primary">{count}件</span>
                  </div>
                ))}
              {Object.keys(storeAnalytics.itemCounts).length === 0 && (
                <p className="text-muted-foreground text-center py-4">データがありません</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* payment_source別売上 */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif flex items-center gap-2">
              <PieChart className="h-5 w-5 text-accent" />
              決済方法別売上
            </CardTitle>
            <CardDescription>POSレジ・請求書別の売上分析（{currentMonthDisplay}）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(storeAnalytics.sourceRevenue)
                .sort(([, a], [, b]) => b - a)
                .map(([source, revenue]) => (
                  <div key={source} className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                    <span className="text-sm font-medium">{source}</span>
                    <span className="text-lg font-serif font-bold text-primary">¥{revenue.toLocaleString()}</span>
                  </div>
                ))}
              {Object.keys(storeAnalytics.sourceRevenue).length === 0 && (
                <p className="text-muted-foreground text-center py-4">データがありません</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            店舗パフォーマンス概要
          </CardTitle>
          <CardDescription>
            {selectedStore === "all"
              ? "全店舗の"
              : `${stores.find((s) => s.id.toString() === selectedStore)?.name || "選択店舗"}の`}
            取引データサマリー（{currentMonthDisplay}）
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-serif font-bold text-primary">
                ¥{storeAnalytics.totalSales.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">総売上</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-serif font-bold">{storeAnalytics.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">取引件数</div>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-2xl font-serif font-bold text-accent">
                ¥{Math.round(storeAnalytics.avgTransactionValue).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">平均単価</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
