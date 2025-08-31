"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardHome from "@/components/dashboard/DashboardHome"
import DailyReport from "@/components/dashboard/DailyReport"
import CustomerManagement from "@/components/dashboard/CustomerManagement"
import PlaceholderSection from "@/components/dashboard/PlaceholderSection"
import { getStores, getTransactions, subscribeToTransactions, type Store, type Transaction } from "@/lib/supabase"
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

export default function HomePage() {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesData, transactionsData] = await Promise.all([getStores(), getTransactions()])

        // 取引データから店舗を抽出
        const storesFromTransactions = Array.from(
          new Set(transactionsData.map((t) => t.store_name).filter(Boolean)),
        ).map((name, index) => ({
          id: index + 1,
          name: name as string,
          location: "",
          phone: "",
          zip_code: "",
          address: "",
          mail: "",
          password: "",
          created_at: new Date().toISOString(),
        }))

        setStores(storesFromTransactions)
        setTransactions(transactionsData)
        setLoading(false)
      } catch (error) {
        console.error("データ取得エラー:", error)
        setLoading(false)
      }
    }

    fetchData()

    const subscription = subscribeToTransactions((payload) => {
      if (payload.eventType === "INSERT") {
        setTransactions((prev) => [payload.new, ...prev])
      } else if (payload.eventType === "UPDATE") {
        setTransactions((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    router.push("/login")
  }

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

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardHome
            stores={stores}
            transactions={transactions}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
          />
        )
      case "customers":
        return <CustomerManagement />
      case "daily-report":
        return <DailyReport stores={stores} transactions={transactions} />
      default:
        return <PlaceholderSection title={menuItems.find((item) => item.id === activeSection)?.label || "機能"} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* サイドバー */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ${sidebarHovered ? "w-64" : "w-16"}`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="p-4">
          <h1
            className={`font-bold text-xl text-blue-600 transition-opacity duration-300 ${
              sidebarHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            SPLASH'N'GO
          </h1>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                  activeSection === item.id ? "bg-blue-100 border-r-4 border-blue-500" : ""
                }`}
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <span
                  className={`ml-3 transition-opacity duration-300 ${sidebarHovered ? "opacity-100" : "opacity-0"}`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
          >
            {sidebarHovered ? "ログアウト" : "×"}
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find((item) => item.id === activeSection)?.label || "ダッシュボード"}
          </h2>
          <p className="text-gray-600">SPLASH'N'GO 管理システム</p>
        </div>

        {/* コンテンツエリア */}
        <div className="space-y-6">{renderActiveSection()}</div>
      </div>
    </div>
  )
}
