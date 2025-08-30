"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, LogIn, LogOut, Coffee, Users } from "lucide-react"

export default function AttendanceManagement() {
  const [currentTime, setCurrentTime] = useState(new Date())

  // モックデータ
  const staff = [
    {
      id: 1,
      name: "田中太郎",
      status: "working",
      checkIn: "09:00",
      checkOut: null,
      breakTime: 30,
      workHours: "5.5h",
    },
    {
      id: 2,
      name: "佐藤花子",
      status: "break",
      checkIn: "08:30",
      checkOut: null,
      breakTime: 15,
      workHours: "6.0h",
    },
    {
      id: 3,
      name: "鈴木一郎",
      status: "off",
      checkIn: "09:00",
      checkOut: "17:00",
      breakTime: 60,
      workHours: "8.0h",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "working":
        return <Badge className="bg-green-100 text-green-800">勤務中</Badge>
      case "break":
        return <Badge className="bg-yellow-100 text-yellow-800">休憩中</Badge>
      case "off":
        return <Badge variant="secondary">退勤済み</Badge>
      default:
        return <Badge variant="secondary">不明</Badge>
    }
  }

  const workingStaff = staff.filter((s) => s.status === "working").length
  const onBreakStaff = staff.filter((s) => s.status === "break").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">勤怠管理</h2>
          <p className="text-muted-foreground">スタッフの出勤・退勤管理</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</p>
          <p className="text-sm text-muted-foreground">{currentTime.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">勤務中</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workingStaff}人</div>
            <p className="text-xs text-muted-foreground">現在勤務中のスタッフ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">休憩中</CardTitle>
            <Coffee className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onBreakStaff}人</div>
            <p className="text-xs text-muted-foreground">休憩中のスタッフ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総勤務時間</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19.5h</div>
            <p className="text-xs text-muted-foreground">本日の累計</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>出退勤</CardTitle>
            <CardDescription>出勤・退勤の打刻</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-20 flex flex-col gap-2">
                <LogIn className="h-6 w-6" />
                <span>出勤</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <LogOut className="h-6 w-6" />
                <span>退勤</span>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" className="h-20 flex flex-col gap-2">
                <Coffee className="h-6 w-6" />
                <span>休憩開始</span>
              </Button>
              <Button variant="secondary" className="h-20 flex flex-col gap-2">
                <Clock className="h-6 w-6" />
                <span>休憩終了</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>スタッフ状況</CardTitle>
            <CardDescription>現在のスタッフ勤務状況</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        出勤: {member.checkIn} {member.checkOut && `| 退勤: ${member.checkOut}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right text-sm">
                      <p>{member.workHours}</p>
                      <p className="text-muted-foreground">休憩: {member.breakTime}分</p>
                    </div>
                    {getStatusBadge(member.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
