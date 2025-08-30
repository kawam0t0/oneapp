"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, CheckCircle, Clock, Wrench, Plus } from "lucide-react"

export default function MaintenanceErrors() {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  // モックデータ
  const maintenanceItems = [
    {
      id: 1,
      title: "洗車機ブラシ交換",
      description: "メインブラシの摩耗により交換が必要",
      status: "urgent",
      priority: "高",
      store: "前橋50号店",
      reportedAt: "2025-08-23 09:30",
      assignee: "田中太郎",
    },
    {
      id: 2,
      title: "水圧ポンプ点検",
      description: "定期点検の時期です",
      status: "scheduled",
      priority: "中",
      store: "伊勢崎韮塚店",
      reportedAt: "2025-08-22 14:15",
      assignee: "佐藤花子",
    },
    {
      id: 3,
      title: "電気系統チェック",
      description: "照明の一部が点灯しない",
      status: "completed",
      priority: "低",
      store: "高崎棟高店",
      reportedAt: "2025-08-21 16:45",
      assignee: "鈴木一郎",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800">緊急</Badge>
      case "scheduled":
        return <Badge className="bg-yellow-100 text-yellow-800">予定</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">完了</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "高":
        return <Badge variant="destructive">高</Badge>
      case "中":
        return <Badge className="bg-yellow-100 text-yellow-800">中</Badge>
      case "低":
        return <Badge variant="secondary">低</Badge>
      default:
        return <Badge variant="secondary">-</Badge>
    }
  }

  const urgentCount = maintenanceItems.filter((item) => item.status === "urgent").length
  const scheduledCount = maintenanceItems.filter((item) => item.status === "scheduled").length
  const completedCount = maintenanceItems.filter((item) => item.status === "completed").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">メンテナンス・エラー管理</h2>
          <p className="text-muted-foreground">設備メンテナンスとエラー報告管理</p>
        </div>
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規報告
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>メンテナンス・エラー報告</DialogTitle>
              <DialogDescription>新しいメンテナンス項目またはエラーを報告してください</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">タイトル</label>
                <Input placeholder="問題のタイトルを入力" />
              </div>
              <div>
                <label className="text-sm font-medium">詳細説明</label>
                <Textarea placeholder="詳細な説明を入力してください" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">優先度</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>高</option>
                    <option>中</option>
                    <option>低</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">店舗</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>前橋50号店</option>
                    <option>伊勢崎韮塚店</option>
                    <option>高崎棟高店</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setIsReportDialogOpen(false)}>報告する</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">緊急対応</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentCount}</div>
            <p className="text-xs text-muted-foreground">即座に対応が必要</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">予定済み</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledCount}</div>
            <p className="text-xs text-muted-foreground">スケジュール済み</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完了済み</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">今月完了分</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>メンテナンス・エラー一覧</CardTitle>
          <CardDescription>現在の設備状況と対応状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{item.title}</h4>
                      {getStatusBadge(item.status)}
                      {getPriorityBadge(item.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>店舗: {item.store}</span>
                      <span>報告日時: {item.reportedAt}</span>
                      <span>担当者: {item.assignee}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Wrench className="h-4 w-4 mr-1" />
                      対応
                    </Button>
                    <Button variant="ghost" size="sm">
                      詳細
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
