import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Store {
  id: number
  name: string
  location: string
  phone?: string
  zip_code?: string
  address?: string
  mail?: string
  password?: string
  created_at: string
}

export interface Transaction {
  id: number
  store_id: number
  transaction_date: string | null
  transaction_time: string | null
  time_slot: string | null
  gross_sales: number | null
  discount: number | null
  service_charge: number | null
  net_sales: number | null
  net_total: number | null
  store_name: string | null
  transaction_details: string | null
  location_id: string | null
  payment_source: string | null
  card: string | null
  cash: number | null
  paypay: number | null
  au_pay: number | null
  d_payment: number | null
  merpay: number | null
  rakuten_pay: number | null
  wechat_pay: number | null
  alipay: number | null
  customer_name: string | null
  customer_id: string | null
  customer_reference_id: string | null
  order_id: string | null
  payment_id: string | null
  staff_name: string | null
  payment_or_refund: string | null
  created_at: string
  updated_at: string
  stores?: Store // Made stores property optional since it might not always be included
}

export interface Customer {
  id: number
  reference_id: string
  square_customer_id?: string
  family_name: string
  given_name: string
  email?: string
  phone?: string
  registration_date: string
  status: string
  created_at: string
  updated_at: string
  course?: string
  car_model?: string
  color?: string
  plate_info_1?: string
  plate_info_2?: string
  plate_info_3?: string
  plate_info_4?: string
  store_name?: string
  store_code?: string
}

// 顧客データを取得
export async function getCustomers(limit = 100, offset = 0, searchTerm = "") {
  console.log("[v0] getCustomers function started")
  console.log("[v0] Parameters - limit:", limit, "offset:", offset, "searchTerm:", searchTerm)

  try {
    console.log("[v0] Supabase client exists:", !!supabase)
    console.log("[v0] Supabase URL:", supabaseUrl ? "exists" : "missing")
    console.log("[v0] Supabase Key:", supabaseAnonKey ? "exists" : "missing")

    let query = supabase.from("customers").select("*", { count: "exact" }).order("created_at", { ascending: false })
    console.log("[v0] Base query created")

    // 検索条件を追加
    if (searchTerm) {
      console.log("[v0] Adding search term:", searchTerm)
      query = query.or(
        `family_name.ilike.%${searchTerm}%,given_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,reference_id.ilike.%${searchTerm}%`,
      )
    }

    // ページネーション
    console.log("[v0] Adding pagination - range:", offset, "to", offset + limit - 1)
    query = query.range(offset, offset + limit - 1)

    console.log("[v0] Executing query...")
    const { data, error, count } = await query

    console.log("[v0] Query executed - data:", !!data, "error:", !!error, "count:", count)
    console.log("[v0] Data length:", data?.length)
    console.log("[v0] Error details:", error)

    if (error) {
      console.error("[v0] Error fetching customers:", error)
      return { customers: [], totalCount: 0 }
    }

    const result = { customers: data || [], totalCount: count || 0 }
    console.log("[v0] Returning result:", result)
    return result
  } catch (exception) {
    console.error("[v0] Exception in getCustomers:", exception)
    console.error("[v0] Exception stack:", exception instanceof Error ? exception.stack : "No stack trace")
    return { customers: [], totalCount: 0 }
  }
}

// 顧客データを更新
export async function updateCustomer(id: number, customerData: Partial<Customer>) {
  console.log("[v0] updateCustomer called for ID:", id)

  const { data, error } = await supabase.from("customers").update(customerData).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating customer:", error)
    return null
  }

  console.log("[v0] Customer updated successfully:", data)
  return data
}

// 新規顧客を追加
export async function createCustomer(customerData: Omit<Customer, "id" | "created_at" | "updated_at">) {
  console.log("[v0] createCustomer called")

  const { data, error } = await supabase.from("customers").insert(customerData).select().single()

  if (error) {
    console.error("[v0] Error creating customer:", error)
    return null
  }

  console.log("[v0] Customer created successfully:", data)
  return data
}

// 顧客データの変更を購読
export function subscribeToCustomers(callback: (payload: any) => void) {
  console.log("[v0] subscribeToCustomers called - setting up real-time subscription")

  return supabase
    .channel("customers")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "customers",
      },
      callback,
    )
    .subscribe()
}

export async function getStores() {
  console.log("[v0] getStores called - fetching from Supabase")

  const { data, error } = await supabase.from("stores").select("*").order("name")

  if (error) {
    console.error("[v0] Error fetching stores:", error)
    return []
  }

  console.log("[v0] Stores fetched from Supabase:", data?.length || 0)
  return data || []
}

export async function getTransactions(storeId?: number) {
  console.log("[v0] getTransactions called with storeId:", storeId)

  const allTransactions: any[] = []
  let hasMore = true
  let offset = 0
  const batchSize = 1000

  while (hasMore) {
    console.log(`[v0] Fetching batch ${Math.floor(offset / batchSize) + 1}, offset: ${offset}`)

    let query = supabase
      .from("transactions")
      .select(`*, stores (id, name, location)`)
      .order("created_at", { ascending: false })
      .range(offset, offset + batchSize - 1)

    if (storeId) {
      query = query.eq("store_id", storeId)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error fetching transactions:", error)
      break
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    allTransactions.push(...data)
    console.log(`[v0] Batch ${Math.floor(offset / batchSize) + 1} fetched: ${data.length} transactions`)

    // If we got less than batchSize, we've reached the end
    if (data.length < batchSize) {
      hasMore = false
    } else {
      offset += batchSize
    }
  }

  console.log("[v0] All transactions fetched from Supabase:", allTransactions.length)
  console.log("[v0] Sample transaction data:", allTransactions[0])
  console.log(
    "[v0] Total net_total sum:",
    allTransactions.reduce((sum, t) => sum + (t.net_total || 0), 0),
  )

  return allTransactions
}

export function subscribeToTransactions(callback: (payload: any) => void) {
  console.log("[v0] subscribeToTransactions called - setting up real-time subscription")

  return supabase
    .channel("transactions")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transactions",
      },
      callback,
    )
    .subscribe()
}

export async function authenticateStore(email: string, password: string) {
  console.log("[v0] authenticateStore called with email:", email)
  console.log("[v0] authenticateStore called with password:", password)

  try {
    console.log("[v0] Executing stores query...")
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .eq("mail", email)
      .eq("password", password)
      .single()

    console.log("[v0] Query completed - data:", data)
    console.log("[v0] Query completed - error:", error)

    if (error) {
      console.error("[v0] Error authenticating store:", error)
      console.error("[v0] Error code:", error.code)
      console.error("[v0] Error message:", error.message)
      return null
    }

    if (!data) {
      console.log("[v0] No matching store found for credentials")
      return null
    }

    console.log("[v0] Store authentication successful:", data?.name)
    return data
  } catch (exception) {
    console.error("[v0] Exception in authenticateStore:", exception)
    return null
  }
}

export async function getCurrentMonthTotalSales(storeId?: number) {
  console.log("[v0] getCurrentMonthTotalSales called with storeId:", storeId)

  // 今月の開始日と終了日を計算
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const startDate = startOfMonth.toISOString().split("T")[0]
  const endDate = endOfMonth.toISOString().split("T")[0]

  console.log("[v0] Date range:", startDate, "to", endDate)

  let query = supabase
    .from("transactions")
    .select("net_total.sum()")
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)
    .not("net_total", "is", null)

  if (storeId) {
    query = query.eq("store_id", storeId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error fetching total sales:", error)
    return 0
  }

  const totalSales = data?.[0]?.sum || 0
  console.log("[v0] Current month total sales:", totalSales)
  return totalSales
}
