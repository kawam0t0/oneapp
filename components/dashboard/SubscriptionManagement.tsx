"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, CreditCard, AlertCircle, CheckCircle } from "lucide-react"

export default function SubscriptionManagement() {
  const [searchTerm, setSearchTerm] = useState("")

  // モックデータ
  const subscriptions = [
    {
      id: 1,
      customerName: "田中太郎",
      email: "tanaka@example.com",
      plan: "プレミアム洗車",
      status: "active",
      nextPayment: "2025-09-15",
      amount: 3000,
    },
    {
      id: 2,
      customerName: "佐藤花子",
      email: "sato@example.com",
      plan: "ベーシック洗車",
      status: "pending",
      nextPayment: "2025-08-30",
      amount: 1500,
    },
    {
      id: 3,
      customerName: "鈴木一郎",
      email: "suzuki@example.com",
      plan: "プレミアム洗車",
      status: "failed",
      nextPayment: "2025-08-25",
      amount: 3000,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">支払い完了</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">支払い待ち</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">支払い失敗</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">サブスクリプション管理</h2>
          <p className="text-muted-foreground">顧客のサブスクリプション状況を管理</p>
        </div>
        <Button>新規サブスク追加</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブ</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">支払い完了</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">支払い待ち</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">支払い待ち</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">支払い失敗</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">要対応</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>サブスクリプション一覧</CardTitle>
          <CardDescription>顧客のサブスクリプション状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="顧客名またはメールアドレスで検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="space-y-4">
            {filteredSubscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{subscription.customerName}</p>
                      <p className="text-sm text-muted-foreground">{subscription.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{subscription.plan}</p>
                      <p className="text-sm text-muted-foreground">¥{subscription.amount.toLocaleString()}/月</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm">次回支払い</p>
                    <p className="text-sm text-muted-foreground">{subscription.nextPayment}</p>
                  </div>
                  {getStatusBadge(subscription.status)}
                  <Button variant="outline" size="sm">
                    詳細
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
