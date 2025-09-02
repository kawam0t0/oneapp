"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { PlusIcon, TrashIcon } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface Store {
  id: number
  name: string
}

interface MaintenanceItem {
  category: string
  side: string
  location: string
}

interface MaintenanceReport {
  id: number
  store_name: string
  staff_name: string
  report_date: string
  response_hours: number
  response_people: number
  maintenance_items: MaintenanceItem[]
  remarks: string
  created_at: string
}

interface MaintenanceScreenProps {
  stores: Store[]
}

const CATEGORIES = ["ブラシ関連部品", "電気関連部品", "ホース関連部品", "洗車機外部品", "その他部品"]

const SIDES = ["助手席側", "運転席側"]

export default function MaintenanceScreen({ stores }: MaintenanceScreenProps) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [maintenanceReports, setMaintenanceReports] = useState<MaintenanceReport[]>([])
  const [selectedReport, setSelectedReport] = useState<MaintenanceReport | null>(null)
  const [isNewReportOpen, setIsNewReportOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 新規報告フォームの状態
  const [formData, setFormData] = useState({
    store_id: "",
    staff_name: "",
    report_date: format(new Date(), "yyyy-MM-dd"),
    response_hours: "",
    response_people: "1",
    remarks: "",
  })

  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([
    { category: "", side: "", location: "" },
  ])

  const fetchMaintenanceReports = async () => {
    try {
      console.log("[v0] Fetching maintenance reports for month:", selectedMonth)
      // TODO: Supabaseからメンテナンス報告を取得
      setMaintenanceReports([])
    } catch (error) {
      console.error("[v0] Error fetching maintenance reports:", error)
    }
  }

  useEffect(() => {
    fetchMaintenanceReports()
  }, [selectedMonth])

  const addMaintenanceItem = () => {
    setMaintenanceItems([...maintenanceItems, { category: "", side: "", location: "" }])
  }

  const removeMaintenanceItem = (index: number) => {
    if (maintenanceItems.length > 1) {
      setMaintenanceItems(maintenanceItems.filter((_, i) => i !== index))
    }
  }

  const updateMaintenanceItem = (index: number, field: keyof MaintenanceItem, value: string) => {
    const updated = maintenanceItems.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    setMaintenanceItems(updated)
  }

  const handleSubmitReport = async () => {
    try {
      console.log("[v0] Submitting maintenance report:", { formData, maintenanceItems })

      // バリデーション
      if (!formData.store_id || !formData.staff_name || !formData.response_hours) {
        alert("必須項目を入力してください")
        return
      }

      const validItems = maintenanceItems.filter((item) => item.category && item.side && item.location)

      if (validItems.length === 0) {
        alert("少なくとも1つの対応箇所を入力してください")
        return
      }

      // TODO: Supabaseにデータを保存

      // フォームリセット
      setFormData({
        store_id: "",
        staff_name: "",
        report_date: format(new Date(), "yyyy-MM-dd"),
        response_hours: "",
        response_people: "1",
        remarks: "",
      })
      setMaintenanceItems([{ category: "", side: "", location: "" }])
      setIsNewReportOpen(false)

      // データ再取得
      fetchMaintenanceReports()

      alert("報告を送信しました")
    } catch (error) {
      console.error("[v0] Error submitting report:", error)
      alert("送信に失敗しました")
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">メンテナンス/エラー管理</h1>
        <Dialog open={isNewReportOpen} onOpenChange={setIsNewReportOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              新規報告
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新規メンテナンス報告</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store">店舗名</Label>
                  <Select
                    value={formData.store_id}
                    onValueChange={(value) => setFormData({ ...formData, store_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="店舗を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.id} value={store.id.toString()}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="staff">担当者名</Label>
                  <Input
                    id="staff"
                    value={formData.staff_name}
                    onChange={(e) => setFormData({ ...formData, staff_name: e.target.value })}
                    placeholder="担当者名を入力"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">日付</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.report_date}
                    onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hours">対応時間</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formData.response_hours}
                    onChange={(e) => setFormData({ ...formData, response_hours: e.target.value })}
                    placeholder="1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="people">対応人数</Label>
                  <Select
                    value={formData.response_people}
                    onValueChange={(value) => setFormData({ ...formData, response_people: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}人
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">対応箇所</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addMaintenanceItem}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    箇所を追加
                  </Button>
                </div>

                {maintenanceItems.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">対応箇所 {index + 1}</h4>
                      {maintenanceItems.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeMaintenanceItem(index)}>
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>対応カテゴリー</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateMaintenanceItem(index, "category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="カテゴリーを選択" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>対応側</Label>
                        <div className="flex gap-2 mt-2">
                          {SIDES.map((side) => (
                            <Button
                              key={side}
                              type="button"
                              variant={item.side === side ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateMaintenanceItem(index, "side", side)}
                            >
                              {side}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>対応箇所詳細</Label>
                      <Input
                        value={item.location}
                        onChange={(e) => updateMaintenanceItem(index, "location", e.target.value)}
                        placeholder="具体的な対応箇所を入力"
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <Label htmlFor="remarks">その他備考</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="その他の備考があれば入力してください"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNewReportOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSubmitReport}>送信</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>メンテナンス報告一覧</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="month">月選択:</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {maintenanceReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{selectedMonth}月の報告はありません</div>
          ) : (
            <div className="space-y-2">
              {maintenanceReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedReport(report)
                    setIsDetailOpen(true)
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium">{report.store_name}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(report.report_date), "yyyy年MM月dd日", { locale: ja })} - {report.staff_name}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {report.maintenance_items.map((item, index) => (
                        <Badge key={index} variant="secondary">
                          {item.category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {report.response_hours}時間 / {report.response_people}人
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>メンテナンス報告詳細</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">店舗名</Label>
                  <p>{selectedReport.store_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">担当者</Label>
                  <p>{selectedReport.staff_name}</p>
                </div>
                <div>
                  <Label className="font-semibold">日付</Label>
                  <p>{format(new Date(selectedReport.report_date), "yyyy年MM月dd日", { locale: ja })}</p>
                </div>
                <div>
                  <Label className="font-semibold">対応時間・人数</Label>
                  <p>
                    {selectedReport.response_hours}時間 / {selectedReport.response_people}人
                  </p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">対応箇所</Label>
                <div className="space-y-2 mt-2">
                  {selectedReport.maintenance_items.map((item, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center gap-4">
                        <Badge>{item.category}</Badge>
                        <Badge variant="outline">{item.side}</Badge>
                        <span>{item.location}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedReport.remarks && (
                <div>
                  <Label className="font-semibold">備考</Label>
                  <p className="mt-1 p-3 bg-gray-50 rounded">{selectedReport.remarks}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
