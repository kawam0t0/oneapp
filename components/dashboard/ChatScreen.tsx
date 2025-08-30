"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, Smile } from "lucide-react"

export default function ChatScreen() {
  const [message, setMessage] = useState("")
  const [selectedChat, setSelectedChat] = useState(1)

  // モックデータ
  const chatRooms = [
    { id: 1, name: "全体チャット", lastMessage: "お疲れ様でした！", time: "14:30", unread: 2 },
    { id: 2, name: "前橋50号店", lastMessage: "洗車機の調子はどうですか？", time: "13:45", unread: 0 },
    { id: 3, name: "管理者グループ", lastMessage: "月次レポートを確認してください", time: "12:20", unread: 1 },
  ]

  const messages = [
    {
      id: 1,
      sender: "田中太郎",
      message: "おはようございます！本日もよろしくお願いします。",
      time: "09:00",
      isMe: false,
    },
    {
      id: 2,
      sender: "私",
      message: "おはようございます！今日も頑張りましょう！",
      time: "09:05",
      isMe: true,
    },
    {
      id: 3,
      sender: "佐藤花子",
      message: "洗車機の調子が少し悪いようです。確認をお願いします。",
      time: "10:30",
      isMe: false,
    },
    {
      id: 4,
      sender: "私",
      message: "承知しました。すぐに確認します。",
      time: "10:32",
      isMe: true,
    },
    {
      id: 5,
      sender: "鈴木一郎",
      message: "お疲れ様でした！",
      time: "14:30",
      isMe: false,
    },
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      // メッセージ送信ロジック
      setMessage("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">チャット</h2>
          <p className="text-muted-foreground">チーム内コミュニケーション</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* チャットルーム一覧 */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>チャットルーム</CardTitle>
            <CardDescription>参加中のチャットルーム</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {chatRooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedChat === room.id ? "bg-muted" : ""}`}
                  onClick={() => setSelectedChat(room.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-sm">{room.name}</p>
                        {room.unread > 0 && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                            {room.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{room.lastMessage}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{room.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* チャット画面 */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{chatRooms.find((room) => room.id === selectedChat)?.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* メッセージ一覧 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start space-x-2 max-w-[70%] ${msg.isMe ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{msg.isMe ? "私" : msg.sender.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`rounded-lg p-3 ${msg.isMe ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {!msg.isMe && <p className="text-xs font-medium mb-1">{msg.sender}</p>}
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${msg.isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* メッセージ入力 */}
            <div className="border-t p-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="メッセージを入力..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
