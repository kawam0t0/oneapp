"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Download,
  Brain,
  LogOut,
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
import { getTransactions, subscribeToTransactions, type Transaction, type Store } from "@/lib/supabase"
import DashboardHome from "@/components/dashboard/DashboardHome"
import CustomerManagement from "@/components/dashboard/CustomerManagement"
import SubscriptionManagement from "@/components/dashboard/SubscriptionManagement"
import DailyReport from "@/components/dashboard/DailyReport"
import AttendanceManagement from "@/components/dashboard/AttendanceManagement"
import ChatScreen from "@/components/dashboard/ChatScreen"
import BiAnalytics from "@/components/dashboard/BiAnalytics"
import MaintenanceErrors from "@/components/dashboard/MaintenanceErrors"
import EventCalendar from "@/components/dashboard/EventCalendar"
import PlaceholderSection from "@/components/dashboard/PlaceholderSection"

export default function SplashNGoDashboard() {
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
    if (!isAuthenticated) {
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

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      console.log("[v0] Fetching transactions...")

      const transactionsData = await getTransactions()
      console.log("[v0] Transactions data:", transactionsData)
      console.log("[v0] Number of transactions:", transactionsData.length)
      setTransactions(transactionsData)

      const uniqueStoreNames = [...new Set(transactionsData.map((t) => t.store_name).filter(Boolean))]
      console.log("[v0] Unique store names from transactions:", uniqueStoreNames)

      const storesFromTransactions = uniqueStoreNames.map((name, index) => ({
        id: index + 1,
        name: name as string,
      }))

      setStores(storesFromTransactions)
      console.log("[v0] Stores from transactions:", storesFromTransactions)

      setLoading(false)
    }

    fetchData()

    console.log("[v0] Setting up real-time subscription...")
    const subscription = subscribeToTransactions((payload) => {
      console.log("[v0] Real-time transaction update received!")
      console.log("[v0] Event type:", payload.eventType)
      console.log("[v0] Payload:", payload)

      if (payload.eventType === "INSERT") {
        console.log("[v0] Adding new transaction:", payload.new)
        setTransactions((prev) => {
          console.log("[v0] Previous transactions count:", prev.length)
          const updated = [payload.new, ...prev]
          console.log("[v0] Updated transactions count:", updated.length)
          return updated
        })
        const newStoreName = payload.new.store_name
        if (newStoreName) {
          console.log("[v0] Checking for new store:", newStoreName)
          setStores((prevStores) => {
            const storeExists = prevStores.some((s) => s.name === newStoreName)
            if (!storeExists) {
              console.log("[v0] Adding new store:", newStoreName)
              return [...prevStores, { id: prevStores.length + 1, name: newStoreName }]
            }
            console.log("[v0] Store already exists:", newStoreName)
            return prevStores
          })
        }
      } else if (payload.eventType === "UPDATE") {
        console.log("[v0] Updating transaction:", payload.new.id)
        setTransactions((prev) => prev.map((t) => (t.id === payload.new.id ? payload.new : t)))
      } else if (payload.eventType === "DELETE") {
        console.log("[v0] DELETE event detected but IGNORED to preserve historical data")
        console.log("[v0] Would have deleted transaction:", payload.old.id)
        console.log("[v0] Transaction details:", payload.old)
        // setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id))
      }
    })

    console.log("[v0] Subscription created:", !!subscription)

    return () => {
      console.log("[v0] Cleaning up subscription...")
      subscription.unsubscribe()
    }
  }, [])

  const handleSuppliesClick = () => {
    window.open("https://kawam0t0-orderwebapp20250502.vercel.app/login", "_blank")
  }

  const handleShiftCreationClick = () => {
    window.open(
      "https://connect.airregi.jp/login?client_id=SFT&redirect_uri=https%3A%2F%2Fconnect.airregi.jp%2Foauth%2Fauthorize%3Fclient_id%3DSFT%26redirect_uri%3Dhttps%253A%252F%252Fairshift.jp%252Fsft%252Fcallback%26response_type%3Dcode%26state%3DredirectTo%253A%25252Fsft",
      "_blank",
    )
  }

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
      case "subscriptions":
        return <SubscriptionManagement />
      case "daily-report":
        return <DailyReport stores={stores} transactions={transactions} />
      case "attendance":
        return <AttendanceManagement />
      case "shift-creation":
        return <PlaceholderSection title="シフト作成" />
      case "chat":
        return <ChatScreen />
      case "bi-analytics":
        return <BiAnalytics />
      case "maintenance":
        return <MaintenanceErrors />
      case "calendar":
        return <EventCalendar />
      default:
        return <PlaceholderSection title="機能開発中" />
    }
  }

  const isAuthenticated = localStorage.getItem("isAuthenticated")
  if (!isAuthenticated) {
    return null
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
    <div className="min-h-screen bg-background">
      <div
        className="fixed inset-y-0 left-0 z-50 w-16 hover:w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out group"
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="flex items-center justify-center group-hover:justify-between h-16 px-4 group-hover:px-6 border-b border-sidebar-border">
          <div className="flex items-center">
            <Brain className="h-6 w-6 text-sidebar-primary flex-shrink-0" />
            <h2 className="text-lg font-serif font-bold text-sidebar-primary ml-3 hidden group-hover:block whitespace-nowrap">
              SPLASH'N'GO!
            </h2>
          </div>
        </div>

        <nav className="p-2 group-hover:p-4 space-y-1 group-hover:space-y-2 transition-all duration-300">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className="w-full justify-center group-hover:justify-start mb-1 transition-all duration-300"
                onClick={() => {
                  if (item.id === "supplies") {
                    handleSuppliesClick()
                  } else if (item.id === "shift-creation") {
                    handleShiftCreationClick()
                  } else {
                    setActiveSection(item.id)
                  }
                }}
                title={item.label}
              >
                <IconComponent className="h-4 w-4 flex-shrink-0" />
                <span className="ml-2 hidden group-hover:inline whitespace-nowrap">{item.label}</span>
              </Button>
            )
          })}

          <div className="absolute bottom-4 left-2 right-2 group-hover:left-4 group-hover:right-4 transition-all duration-300">
            <div className="p-2 group-hover:p-3 bg-sidebar-accent/10 rounded-lg transition-all duration-300">
              <div className="flex items-center justify-center group-hover:block">
                <div className="w-8 h-8 bg-sidebar-primary/20 rounded-full flex items-center justify-center group-hover:hidden">
                  <span className="text-xs font-bold text-sidebar-primary">{userEmail?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="hidden group-hover:block">
                  <p className="text-xs text-sidebar-foreground mb-2">ログイン中:</p>
                  <p className="text-sm font-medium text-sidebar-foreground mb-3">{userEmail}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full gap-2 bg-transparent hidden group-hover:flex"
                title="ログアウト"
              >
                <LogOut className="h-4 w-4" />
                <span>ログアウト</span>
              </Button>
            </div>
          </div>
        </nav>
      </div>

      <div className="ml-16">
        <header className="border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center justify-between h-20 px-6">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {menuItems.find((item) => item.id === activeSection)?.label || "ダッシュボード"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedStore === "all" ? "全店舗" : stores.find((s) => s.id.toString() === selectedStore)?.name}{" "}
                のデータ
              </p>
            </div>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              データエクスポート
            </Button>
          </div>
        </header>

        <main className="p-6">{renderActiveSection()}</main>
      </div>
    </div>
  )
}
