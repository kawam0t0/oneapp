"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CalendarPlus, Clock, MapPin, Plus } from "lucide-react"

export default function EventCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)

  // モックデータ
  const events = [
    {
      id: 1,
      title: "洗車機メンテナンス",
      description: "定期メンテナンス作業",
      date: "2025-08-25",
      time: "09:00",
      store: "前橋50号店",
      type: "maintenance",
      status: "scheduled",
    },
    {
      id: 2,
      title: "備品発注期限",
      description: "洗剤とタオルの発注期限",
      date: "2025-08-27",
      time: "17:00",
      store: "全店舗",
      type: "deadline",
      status: "pending",
    },
    {
      id: 3,
      title: "スタッフ研修",
      description: "新サービス導入研修",
      date: "2025-08-30",
      time: "14:00",
      store: "伊勢崎韮塚店",
      type: "training",
      status: "scheduled",
    },
  ]

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case "maintenance":
        return <Badge className="bg-blue-100 text-blue-800">メンテナンス</Badge>
      case "deadline":
        return <Badge className="bg-red-100 text-red-800">期限</Badge>
      case "training":
        return <Badge className="bg-green-100 text-green-800">研修</Badge>
      case "meeting":
        return <Badge className="bg-purple-100 text-purple-800">会議</Badge>
      default:
        return <Badge variant="secondary">その他</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">予定</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">保留</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">完了</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const upcomingEvents = events.filter((event) => new Date(event.date) >= new Date()).slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">行事カレンダー</h2>
          <p className="text-muted-foreground">店舗イベントとスケジュール管理</p>
        </div>
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              イベント追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新しいイベント</DialogTitle>
              <DialogDescription>カレンダーに新しいイベントを追加してください</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">イベント名</label>
                <Input placeholder="イベント名を入力" />
              </div>
              <div>
                <label className="text-sm font-medium">説明</label>
                <Textarea placeholder="イベントの詳細を入力" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">日付</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">時間</label>
                  <Input type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">種類</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>メンテナンス</option>
                    <option>期限</option>
                    <option>研修</option>
                    <option>会議</option>
                    <option>その他</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">店舗</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>全店舗</option>
                    <option>前橋50号店</option>
                    <option>伊勢崎韮塚店</option>
                    <option>高崎棟高店</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setIsEventDialogOpen(false)}>追加</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* カレンダー */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              カレンダー
            </CardTitle>
            <CardDescription>月間スケジュール表示</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* 今後のイベント */}
        <Card>
          <CardHeader>
            <CardTitle>今後のイベント</CardTitle>
            <CardDescription>予定されているイベント一覧</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    {getEventTypeBadge(event.type)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {event.date} {event.time}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.store}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    {getStatusBadge(event.status)}
                    <Button variant="ghost" size="sm" className="text-xs">
                      編集
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 今日のイベント */}
      <Card>
        <CardHeader>
          <CardTitle>今日のイベント</CardTitle>
          <CardDescription>本日予定されているイベント</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>本日予定されているイベントはありません</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
