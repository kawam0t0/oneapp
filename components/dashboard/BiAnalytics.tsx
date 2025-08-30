"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Brain } from "lucide-react"

export default function BiAnalytics() {
  // モックデータ
  const kpis = [
    { label: "月間売上", value: "¥1,250,000", change: "+15.2%", trend: "up" },
    { label: "顧客数", value: "1,234", change: "+8.7%", trend: "up" },
    { label: "平均単価", value: "¥2,150", change: "-2.1%", trend: "down" },
    { label: "リピート率", value: "68%", change: "+5.3%", trend: "up" },
  ]

  const insights = [
    {
      title: "売上トレンド分析",
      description: "過去3ヶ月で売上が安定して成長しています",
      impact: "高",
      recommendation: "現在の戦略を継続し、さらなる成長を目指しましょう",
    },
    {
      title: "顧客行動パターン",
      description: "週末の来店が平日の2.3倍になっています",
      impact: "中",
      recommendation: "週末のスタッフ配置を最適化することを推奨します",
    },
    {
      title: "サービス人気度",
      description: "プレミアム洗車の需要が20%増加しています",
      impact: "中",
      recommendation: "プレミアムサービスの拡充を検討してください",
    },
  ]

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    )
  }

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "text-green-600" : "text-red-600"
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "高":
        return <Badge className="bg-red-100 text-red-800">高</Badge>
      case "中":
        return <Badge className="bg-yellow-100 text-yellow-800">中</Badge>
      case "低":
        return <Badge className="bg-green-100 text-green-800">低</Badge>
      default:
        return <Badge variant="secondary">-</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">BI分析</h2>
          <p className="text-muted-foreground">ビジネスインテリジェンス分析とAI予測</p>
        </div>
        <Button>
          <Brain className="h-4 w-4 mr-2" />
          AI分析実行
        </Button>
      </div>

      {/* KPI指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
              {getTrendIcon(kpi.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs ${getTrendColor(kpi.trend)}`}>{kpi.change} 前月比</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI インサイト */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AIインサイト
            </CardTitle>
            <CardDescription>AIによる自動分析結果</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{insight.title}</h4>
                  {getImpactBadge(insight.impact)}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>推奨アクション:</strong> {insight.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 分析ツール */}
        <Card>
          <CardHeader>
            <CardTitle>分析ツール</CardTitle>
            <CardDescription>詳細分析とレポート生成</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <BarChart3 className="h-4 w-4 mr-2" />
              売上トレンド分析
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <PieChart className="h-4 w-4 mr-2" />
              顧客セグメント分析
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <Target className="h-4 w-4 mr-2" />
              目標達成率分析
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              <TrendingUp className="h-4 w-4 mr-2" />
              予測分析
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 予測分析 */}
      <Card>
        <CardHeader>
          <CardTitle>AI売上予測</CardTitle>
          <CardDescription>機械学習による今後7日間の売上予測</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
              <span className="text-sm font-medium">明日の予測売上</span>
              <span className="text-lg font-serif font-bold text-primary">¥45,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
              <span className="text-sm font-medium">週間予測売上</span>
              <span className="text-lg font-serif font-bold">¥280,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
              <span className="text-sm font-medium">予測台数</span>
              <span className="text-lg font-serif font-bold">156台</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
