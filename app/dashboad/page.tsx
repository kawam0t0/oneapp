"use client"

import { useState, useEffect } from "react"
import {
  CalendarMinus as CalendarMenu,
  UserCheck,
  SubscriptIcon as SubscriptionIcon,
  FileText,
  Clock,
  MessageCircle,
  PiIcon as BIIcon,
  Package,
  AlertTriangle,
  Home,
  Calendar,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import type { Transaction, Store } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { userEmail, logout } = useAuth()
  const router = useRouter()
  const [selectedStore, setSelectedStore] = useState("all")
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")

  const [stores, setStores] = useState<Store[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated")
    if (isAuthenticated !== "true") {
      router.push("/login")
      return
    }
  }, [router])

  const menuItems = [
    { id: "dashboard", label: "ダッシュボード", icon: Home },
    { id: "customers", label: "顧客管理", icon: UserCheck },
    { id: "subscriptions", label: "サブスク管理", icon: SubscriptionIcon },
    { id: "daily-report", label: "日報", icon: FileText },
    { id: "attendance", label: "勤怠管理", icon: Clock },
    { id: "shift-creation", label: "シフト作成", icon: Calendar },
    { id: "chat", label: "CHAT画面", icon: MessageCircle },
    { id: "bi-analytics", label: "BI関連", icon: BIIcon },
    { id: "supplies", label: "備品発注関連", icon: Package },
    { id: "maintenance", label: "メンテナンス/エラー", icon: AlertTriangle },
    { id: "calendar", label: "行事カレンダー", icon: CalendarMenu },
  ]
}
