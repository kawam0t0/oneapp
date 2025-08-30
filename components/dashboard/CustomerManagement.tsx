"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, UserCheck, Loader2, ChevronLeft, ChevronRight, Edit, Save, X } from "lucide-react"
import { supabase, updateCustomer, type Customer } from "@/lib/supabase"

export default function CustomerManagement() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const itemsPerPage = 50

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const offset = (currentPage - 1) * itemsPerPage

      let query = supabase
        .from("customers")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .range(offset, offset + itemsPerPage - 1)

      if (searchTerm.trim()) {
        const searchPattern = `%${searchTerm.trim()}%`
        query = query.or(
          `family_name.ilike.${searchPattern},given_name.ilike.${searchPattern},email.ilike.${searchPattern},phone.ilike.${searchPattern},reference_id.ilike.${searchPattern},course.ilike.${searchPattern},car_model.ilike.${searchPattern},store_name.ilike.${searchPattern}`,
        )
      }

      const { data, error, count } = await query

      if (error) {
        console.error("Supabase error:", error)
        setCustomers([])
        setTotalCount(0)
      } else {
        setCustomers(data || [])
        setTotalCount(count || 0)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setCustomers([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [currentPage])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      fetchCustomers()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer({ ...customer })
    setIsEditDialogOpen(true)
  }

  const handleSaveCustomer = async () => {
    if (!editingCustomer) return

    setIsSaving(true)
    try {
      const updatedCustomer = await updateCustomer(editingCustomer.id, {
        family_name: editingCustomer.family_name,
        given_name: editingCustomer.given_name,
        email: editingCustomer.email,
        phone: editingCustomer.phone,
        course: editingCustomer.course,
        car_model: editingCustomer.car_model,
        color: editingCustomer.color,
        store_name: editingCustomer.store_name,
        status: editingCustomer.status,
      })

      if (updatedCustomer) {
        setCustomers(customers.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c)))
        if (selectedCustomer?.id === updatedCustomer.id) {
          setSelectedCustomer(updatedCustomer)
        }
        setIsEditDialogOpen(false)
        setEditingCustomer(null)
      }
    } catch (error) {
      console.error("Error saving customer:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false)
    setEditingCustomer(null)
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p className="text-muted-foreground">顧客データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 顧客一覧 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="font-serif">顧客一覧</CardTitle>
                  <CardDescription>登録されている顧客の管理 (全{totalCount.toLocaleString()}件)</CardDescription>
                </div>
                <Button className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  新規顧客追加
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="名前、メール、電話番号で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>名前</TableHead>
                      <TableHead>メール</TableHead>
                      <TableHead>電話番号</TableHead>
                      <TableHead>店舗</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className={`cursor-pointer hover:bg-muted/50 ${selectedCustomer?.id === customer.id ? "bg-primary/10" : ""}`}
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <TableCell className="font-medium">
                          {customer.family_name} {customer.given_name}
                        </TableCell>
                        <TableCell>{customer.email || "-"}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>{customer.store_name || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {customers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">検索条件に一致する顧客が見つかりません。</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    {totalCount.toLocaleString()}件中 {((currentPage - 1) * itemsPerPage + 1).toLocaleString()}-
                    {Math.min(currentPage * itemsPerPage, totalCount).toLocaleString()}件を表示
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                      前へ
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                      次へ
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 顧客詳細 */}
        <div className="lg:col-span-1">
          {selectedCustomer ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif">
                    {selectedCustomer.family_name} {selectedCustomer.given_name}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={() => handleEditCustomer(selectedCustomer)}>
                    <Edit className="h-4 w-4" />
                    編集
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">リファレンスID</label>
                    <div className="text-sm">{selectedCustomer.reference_id || "-"}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">メールアドレス</label>
                    <div className="text-sm text-primary">{selectedCustomer.email || "-"}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">電話番号</label>
                    <div className="text-sm">{selectedCustomer.phone || "-"}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">コース</label>
                    <div className="text-sm">{selectedCustomer.course || "-"}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">車両情報</label>
                    <div className="text-sm">
                      {selectedCustomer.car_model && selectedCustomer.color
                        ? `${selectedCustomer.car_model} (${selectedCustomer.color})`
                        : selectedCustomer.car_model || selectedCustomer.color || "-"}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">店舗</label>
                    <div className="text-sm">{selectedCustomer.store_name || "-"}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">登録日</label>
                    <div className="text-sm">{selectedCustomer.registration_date || "-"}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">ステータス</label>
                    <div className="text-sm">{selectedCustomer.status || "アクティブ"}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">顧客を選択してください</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>顧客情報を編集</DialogTitle>
            <DialogDescription>顧客の情報を編集できます。変更後は保存ボタンをクリックしてください。</DialogDescription>
          </DialogHeader>
          {editingCustomer && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="family_name" className="text-right">
                  姓
                </Label>
                <Input
                  id="family_name"
                  value={editingCustomer.family_name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, family_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="given_name" className="text-right">
                  名
                </Label>
                <Input
                  id="given_name"
                  value={editingCustomer.given_name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, given_name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  メール
                </Label>
                <Input
                  id="email"
                  value={editingCustomer.email || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  電話番号
                </Label>
                <Input
                  id="phone"
                  value={editingCustomer.phone || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">
                  コース
                </Label>
                <Input
                  id="course"
                  value={editingCustomer.course || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, course: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="car_model" className="text-right">
                  車種
                </Label>
                <Input
                  id="car_model"
                  value={editingCustomer.car_model || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, car_model: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  色
                </Label>
                <Input
                  id="color"
                  value={editingCustomer.color || ""}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, color: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              キャンセル
            </Button>
            <Button onClick={handleSaveCustomer} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
