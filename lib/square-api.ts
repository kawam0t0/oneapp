import { supabase } from "./supabase-client" // Assuming supabase client is imported here

export interface SquareCustomer {
  id?: string
  given_name?: string
  family_name?: string
  email_address?: string
  phone_number?: string
  created_at?: string
  updated_at?: string
  preferences?: {
    email_unsubscribed?: boolean
  }
  groups?: Array<{
    id: string
    name: string
  }>
  company_name?: string
  device_name?: string
  reference_id?: string
  store_name?: string
}

export interface SquareTransaction {
  id?: string
  order_id?: string
  location_id?: string
  created_at?: string
  updated_at?: string
  source_type?: string
  tenders?: Array<{
    id?: string
    type?: string
    amount_money?: {
      amount?: number
      currency?: string
    }
    card_details?: {
      status?: string
      card?: {
        card_brand?: string
        last_4?: string
        card_type?: string
      }
      entry_method?: string
    }
    cash_details?: {
      buyer_tendered_money?: {
        amount?: number
        currency?: string
      }
    }
  }>
  refunds?: Array<{
    id?: string
    status?: string
    amount_money?: {
      amount?: number
      currency?: string
    }
    reason?: string
  }>
  reference_id?: string
  note?: string
  customer_id?: string
  total_money?: {
    amount?: number
    currency?: string
  }
  total_tax_money?: {
    amount?: number
    currency?: string
  }
  total_discount_money?: {
    amount?: number
    currency?: string
  }
  total_tip_money?: {
    amount?: number
    currency?: string
  }
  total_service_charge_money?: {
    amount?: number
    currency?: string
  }
  processing_fee?: Array<{
    effective_at?: string
    type?: string
    amount_money?: {
      amount?: number
      currency?: string
    }
  }>
  receipt_number?: string
  receipt_url?: string
}

export interface SupabaseTransaction {
  store_id: number
  transaction_date: string
  transaction_time: string
  time_slot: string
  gross_sales: number
  discount: number
  service_charge: number
  net_sales: number
  gift_card_sales: number
  tax: number
  tip: number
  partial_refund: number
  total_received: number
  payment_source: string
  card: number
  card_entry_method: string
  cash: number
  square_gift_card: number
  other: number
  other_payment_method: string | null
  payment_note: string | null
  fee: number
  net_total: number
  order_id: string | null
  payment_id: string
  card_type: string
  card_last4: string
  device_name: string
  staff_name: string
  staff_id: string | null
  receipt_details: string | null
  transaction_details: string
  payment_or_refund: string
  store_name: string
  dining_option: string | null
  customer_id: string | null
  customer_name: string | null
  customer_reference_id: string | null
  terminal_name: string | null
  third_party_fee: number
  transfer_id: string | null
  deposit_date: string | null
  deposit_details: string | null
  fee_percentage: number
  fee_fixed: number
  refund_reason: string
  e_money: number
  discount_type: string | null
  unauthorized_or_canceled_transaction: boolean
  order_reference_id: string | null
  paypay: number
  shipping_note: string | null
  no_transaction_fee_applied: boolean
  channel: string
  alipay: number
  au_pay: number
  d_payment: number
  merpay: number
  rakuten_pay: number
  wechat_pay: number
  tip_without_attribute: number
  table_info: string | null
  location_id: string | null
}

async function createSquareClient() {
  try {
    console.log("[v0] Creating Square client with Personal Access Token...")
    const squareModule = await import("square")

    const { SquareClient } = squareModule as any
    if (!SquareClient) {
      throw new Error("SquareClient not found in module")
    }

    const client = new SquareClient({
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      environment: process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox",
    })

    console.log("[v0] Square client created successfully with Personal Access Token")
    return client
  } catch (error) {
    console.error("[v0] Error creating Square client:", error)
    throw error
  }
}

export async function getAllSquareCustomers(): Promise<SquareCustomer[]> {
  try {
    console.log("[v0] Fetching customers from Square using REST API...")
    console.log("[v0] Environment:", process.env.SQUARE_ENVIRONMENT)
    console.log("[v0] Access token configured:", !!process.env.SQUARE_ACCESS_TOKEN)

    const response = await fetch("https://connect.squareup.com/v2/customers", {
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": "2024-08-21",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Customer API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    console.log("[v0] Square API response received")
    console.log("[v0] Customers found:", data.customers?.length || 0)

    return data.customers || []
  } catch (error: any) {
    console.error("[v0] Error fetching Square customers:", error)
    return []
  }
}

export async function getAllSquareCustomersWithPagination(): Promise<SquareCustomer[]> {
  try {
    console.log("[v0] Fetching ALL customers from Square with pagination...")
    let allCustomers: SquareCustomer[] = []
    let cursor: string | undefined = undefined
    let pageCount = 0

    do {
      console.log(`[v0] Fetching page ${pageCount + 1}...`)

      const response = await fetch(`https://connect.squareup.com/v2/customers?cursor=${cursor}`, {
        headers: {
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Square-Version": "2024-08-21",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        console.error(`[v0] Customer API error: ${response.status}`)
        break
      }

      const data = await response.json()
      const customers = data.customers || []
      allCustomers = allCustomers.concat(customers)
      cursor = data.cursor
      pageCount++

      console.log(`[v0] Page ${pageCount} completed. Total customers so far: ${allCustomers.length}`)

      // API制限対策：少し待機
      if (cursor) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    } while (cursor)

    console.log(`[v0] All customers fetched: ${allCustomers.length} total`)
    return allCustomers
  } catch (error: any) {
    console.error("[v0] Error fetching all Square customers:", error)
    return []
  }
}

export async function syncAllSquareCustomers(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    console.log("[v0] Starting full customer sync from Square to Supabase...")

    const squareCustomers = await getAllSquareCustomers()

    if (squareCustomers.length === 0) {
      return { success: true, count: 0, message: "No customers found in Square" }
    }

    let syncedCount = 0

    for (const squareCustomer of squareCustomers) {
      const supabaseCustomer = convertSquareToSupabaseCustomer(squareCustomer)

      // upsert（存在すれば更新、なければ挿入）
      const { error } = await supabase.from("customers").upsert(supabaseCustomer, {
        onConflict: "square_customer_id",
        ignoreDuplicates: false,
      })

      if (error) {
        console.error("[v0] Error syncing customer:", error)
        continue
      }

      syncedCount++
    }

    console.log("[v0] Customer sync completed:", syncedCount, "customers synced")
    return {
      success: true,
      count: syncedCount,
      message: `Successfully synced ${syncedCount} customers from Square to Supabase`,
    }
  } catch (error) {
    console.error("[v0] Error in full customer sync:", error)
    return {
      success: false,
      count: 0,
      message: `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function syncAllSquareCustomersBatch(): Promise<{
  success: boolean
  totalCount: number
  syncedCount: number
  errorCount: number
  message: string
}> {
  try {
    console.log("[v0] Starting BATCH customer sync from Square to Supabase...")

    const squareCustomers = await getAllSquareCustomersWithPagination()

    if (squareCustomers.length === 0) {
      return {
        success: true,
        totalCount: 0,
        syncedCount: 0,
        errorCount: 0,
        message: "No customers found in Square",
      }
    }

    console.log(`[v0] Processing ${squareCustomers.length} customers in batches...`)

    let syncedCount = 0
    let errorCount = 0
    const batchSize = 50 // Supabaseへの同時挿入数を制限

    // バッチ処理
    for (let i = 0; i < squareCustomers.length; i += batchSize) {
      const batch = squareCustomers.slice(i, i + batchSize)
      console.log(
        `[v0] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(squareCustomers.length / batchSize)}...`,
      )

      const supabaseCustomers = batch.map(convertSquareToSupabaseCustomer)

      // バッチでupsert
      const { data, error } = await supabase.from("customers").upsert(supabaseCustomers, {
        onConflict: "square_customer_id",
        ignoreDuplicates: false,
      })

      if (error) {
        console.error(`[v0] Batch error:`, error)
        errorCount += batch.length
      } else {
        syncedCount += batch.length
        console.log(`[v0] Batch completed: ${syncedCount}/${squareCustomers.length} synced`)
      }

      // バッチ間で少し待機（DB負荷軽減）
      if (i + batchSize < squareCustomers.length) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    const message = `Batch sync completed: ${syncedCount} synced, ${errorCount} errors out of ${squareCustomers.length} total`
    console.log(`[v0] ${message}`)

    return {
      success: errorCount < squareCustomers.length / 2, // 半分以上成功なら成功とみなす
      totalCount: squareCustomers.length,
      syncedCount,
      errorCount,
      message,
    }
  } catch (error) {
    console.error("[v0] Error in batch customer sync:", error)
    return {
      success: false,
      totalCount: 0,
      syncedCount: 0,
      errorCount: 0,
      message: `Batch sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function getAllSquareTransactions(
  locationId?: string,
  beginTime?: string,
  endTime?: string,
): Promise<any[]> {
  try {
    console.log("[v0] Fetching payments from Square using REST API...")

    const defaultEndTime = new Date().toISOString()
    const defaultBeginTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const params = new URLSearchParams({
      begin_time: beginTime || defaultBeginTime,
      end_time: endTime || defaultEndTime,
      sort_order: "DESC",
      limit: "100",
    })

    if (locationId) {
      params.append("location_id", locationId)
    }

    const response = await fetch(`https://connect.squareup.com/v2/payments?${params}`, {
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": "2024-08-21",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Payments API error: ${response.status}`)
      return []
    }

    const data = await response.json()
    console.log("[v0] Square payments response received")
    console.log("[v0] Payments found:", data.payments?.length || 0)

    return data.payments || []
  } catch (error: any) {
    console.error("[v0] Error fetching Square payments:", error)
    return []
  }
}

async function getCustomerInfo(customerId: string): Promise<{ name: string; reference_id: string } | null> {
  try {
    const response = await fetch(`https://connect.squareup.com/v2/customers/${customerId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": "2024-08-21",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Customer API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    const customer = data.customer

    if (customer) {
      const name = `${customer.given_name || ""} ${customer.family_name || ""}`.trim()
      return {
        name: name || customer.email_address || "Unknown Customer",
        reference_id: customer.reference_id || "",
      }
    }

    return null
  } catch (error) {
    console.error("[v0] Error fetching customer info:", error)
    return null
  }
}

async function getOrderProductNames(orderId: string): Promise<string> {
  try {
    const response = await fetch(`https://connect.squareup.com/v2/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": "2024-08-21",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Order API error: ${response.status}`)
      return `注文ID: ${orderId}`
    }

    const data = await response.json()
    const order = data.order

    if (order?.line_items) {
      const productNames = order.line_items
        .map((item: any) => {
          // Use the actual product name if available
          if (item.name) {
            return item.name
          }
          // Fallback to variation name if available
          if (item.variation_name) {
            return item.variation_name
          }
          // Last resort: use catalog object name
          if (item.catalog_object_id && item.catalog_version) {
            return `商品ID: ${item.catalog_object_id}`
          }
          return "商品名不明"
        })
        .filter((name) => name && name !== "商品名不明") // Remove empty or unknown names
        .join(", ")

      return productNames || `注文ID: ${orderId}`
    }

    return `注文ID: ${orderId}`
  } catch (error) {
    console.error("[v0] Error fetching order details:", error)
    return `注文ID: ${orderId}`
  }
}

async function getLocationName(locationId: string): Promise<string> {
  try {
    console.log(`[v0] Fetching location name for ID: ${locationId}`)
    const response = await fetch(`https://connect.squareup.com/v2/locations/${locationId}`, {
      headers: {
        Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        "Square-Version": "2024-08-21",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      return getStoreNameFromLocationId(locationId).store_name
    }

    const data = await response.json()
    const location = data.location

    if (location?.name) {
      console.log(`[v0] Location name retrieved: ${location.name}`)
      return location.name
    }

    return getStoreNameFromLocationId(locationId).store_name
  } catch (error) {
    return getStoreNameFromLocationId(locationId).store_name
  }
}

function getStoreNameFromLocationId(locationId?: string): { store_name: string; store_code: string } {
  const locationMapping: { [key: string]: { store_name: string; store_code: string } } = {
    LDHMQX9WPW34B: { store_name: "SPLASH'N'GO!高崎棟高店", store_code: "1003" },
    LEFYQ66VK7C0H: { store_name: "SPLASH'N'GO!伊勢崎韮塚店", store_code: "1002" },
    L49BHVHTKTQPE: { store_name: "SPLASH'N'GO!前橋50号店", store_code: "1001" },
    LV19VY3VYHPBA: { store_name: "SPLASH'N'GO!足利緑町店", store_code: "1004" },
    // 新しいlocation_idを追加
    LPK3Z9BHEEXX3: { store_name: "SPLASH'N'GO!新前橋店", store_code: "1005" },
    LWCC3Y3HSJPTN: { store_name: "SPLASH'N'GO!太田新田店", store_code: "1006" },
  }

  console.log(`[v0] Mapping location_id: ${locationId}`)

  if (!locationId) {
    console.log("[v0] No location_id provided, using default")
    return { store_name: "SPLASH'N'GO!前橋50号店", store_code: "1001" }
  }

  const mapped = locationMapping[locationId]
  if (mapped) {
    console.log(`[v0] Location mapped to: ${mapped.store_name}`)
    return mapped
  }

  console.warn(`[v0] Unknown location_id: ${locationId}, using default store`)
  return { store_name: `SPLASH'N'GO!店舗(${locationId})`, store_code: "1001" }
}

export async function convertSquareToSupabaseTransaction(
  squarePayment: any,
  storeId = 1,
): Promise<SupabaseTransaction | null> {
  if (!squarePayment?.id) {
    console.error("[v0] Invalid payment data - missing ID")
    return null
  }

  console.log("[v0] Square payment object:", JSON.stringify(squarePayment, null, 2))

  const createdAt = new Date(squarePayment.created_at || new Date())
  const japanTime = new Date(createdAt.getTime() + 9 * 60 * 60 * 1000)

  const transactionDate = japanTime.toISOString().split("T")[0]
  const transactionTime = japanTime.toISOString().split("T")[1].split(".")[0]

  const totalAmount = squarePayment.total_money?.amount || squarePayment.amount_money?.amount || 0
  const discountAmount = squarePayment.total_discount_money?.amount || squarePayment.discount_money?.amount || 0
  const taxAmount = squarePayment.total_tax_money?.amount || squarePayment.tax_money?.amount || 0
  const tipAmount = squarePayment.total_tip_money?.amount || squarePayment.tip_money?.amount || 0

  console.log("[v0] Amount values:", {
    totalAmount,
    discountAmount,
    taxAmount,
    tipAmount,
    total_money: squarePayment.total_money,
    amount_money: squarePayment.amount_money,
  })

  const processingFee = squarePayment.processing_fee?.[0]
  const feeAmount = processingFee ? processingFee.amount_money?.amount || 0 : 0

  const cardDetails = squarePayment.card_details

  let actualStoreName = "SPLASH'N'GO!前橋50号店"
  let storeCode = "1001"

  if (squarePayment.location_id) {
    actualStoreName = await getLocationName(squarePayment.location_id)

    const storeInfo = getStoreNameFromLocationId(squarePayment.location_id)
    storeCode = storeInfo.store_code

    if (actualStoreName.includes("SPLASH'N'GO!")) {
    } else {
      actualStoreName = storeInfo.store_name
    }
  }

  let transactionDetails = "基本取引"
  if (squarePayment.order_id) {
    transactionDetails = await getOrderProductNames(squarePayment.order_id)
  } else if (squarePayment.note) {
    transactionDetails = squarePayment.note
  }

  let customerName = null
  let customerReferenceId = null
  if (squarePayment.customer_id) {
    const customerInfo = await getCustomerInfo(squarePayment.customer_id)
    if (customerInfo) {
      customerName = customerInfo.name
      customerReferenceId = customerInfo.reference_id
    }
  }

  const discountType = discountAmount > 0 ? "割引" : null

  let paymentSource = "POSレジ"

  if (squarePayment.application_details?.application_id === "sq0idp-wGVapF8sNt9PLrdj5znuKA") {
    paymentSource = "請求書"
  } else if (squarePayment.source_type === "EXTERNAL") {
    paymentSource = "請求書"
  } else if (squarePayment.order_id && squarePayment.order_id.includes("invoice")) {
    paymentSource = "請求書"
  } else if (squarePayment.note && squarePayment.note.includes("請求書")) {
    paymentSource = "請求書"
  }

  const result: SupabaseTransaction = {
    store_id: storeId,
    transaction_date: transactionDate,
    transaction_time: transactionTime,
    time_slot: "Japan",
    gross_sales: totalAmount + discountAmount,
    discount: discountAmount,
    service_charge: 0,
    net_sales: totalAmount,
    gift_card_sales: 0,
    tax: taxAmount,
    tip: tipAmount,
    partial_refund: 0,
    total_received: totalAmount,
    payment_source: paymentSource,
    card: cardDetails ? totalAmount : 0,
    card_entry_method: cardDetails?.entry_method || "該当なし",
    cash: !cardDetails ? totalAmount : 0,
    square_gift_card: 0,
    other: 0,
    other_payment_method: null,
    payment_note: squarePayment.note || null,
    fee: feeAmount,
    net_total: totalAmount - feeAmount,
    order_id: squarePayment.order_id || null,
    payment_id: squarePayment.id,
    card_type: cardDetails?.card?.card_brand || "",
    card_last4: cardDetails?.card?.last_4 || "",
    device_name: cardDetails?.device_details?.device_name || "Square ターミナル",
    staff_name: actualStoreName,
    staff_id: null,
    receipt_details: squarePayment.receipt_url || null,
    transaction_details: transactionDetails,
    payment_or_refund: "取引",
    store_name: actualStoreName,
    dining_option: null,
    customer_id: squarePayment.customer_id || null,
    customer_name: customerName,
    customer_reference_id: customerReferenceId,
    terminal_name: null,
    third_party_fee: 0,
    transfer_id: null,
    deposit_date: null,
    deposit_details: null,
    fee_percentage: 3.75,
    fee_fixed: 0,
    refund_reason: "",
    e_money: 0,
    discount_type: discountType,
    unauthorized_or_canceled_transaction: squarePayment.status !== "COMPLETED",
    order_reference_id: squarePayment.reference_id || null,
    paypay: 0,
    shipping_note: null,
    no_transaction_fee_applied: feeAmount === 0,
    channel: actualStoreName,
    alipay: 0,
    au_pay: 0,
    d_payment: 0,
    merpay: 0,
    rakuten_pay: 0,
    wechat_pay: 0,
    tip_without_attribute: 0,
    table_info: null,
    location_id: squarePayment.location_id || null,
  }

  console.log("[v0] Converted transaction amounts:", {
    gross_sales: result.gross_sales,
    net_total: result.net_total,
    total_received: result.total_received,
  })

  return result
}

export async function syncAllSquareTransactions(
  locationId?: string,
  beginTime?: string,
  endTime?: string,
): Promise<{
  success: boolean
  count: number
  message: string
}> {
  try {
    console.log("[v0] Starting transaction sync from Square to Supabase...")

    const squareTransactions = await getAllSquareTransactions(locationId, beginTime, endTime)

    if (squareTransactions.length === 0) {
      return { success: true, count: 0, message: "No transactions found in Square" }
    }

    let syncedCount = 0

    for (const squareTransaction of squareTransactions) {
      const supabaseTransaction = await convertSquareToSupabaseTransaction(squareTransaction)

      if (!supabaseTransaction) {
        continue
      }

      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("payment_id", supabaseTransaction.payment_id)
        .single()

      if (existing) {
        console.log(`[v0] Transaction ${supabaseTransaction.payment_id} already exists, skipping...`)
        continue
      }

      const { error } = await supabase.from("transactions").insert([supabaseTransaction])

      if (error) {
        console.error("[v0] Error syncing transaction:", error)
        continue
      }

      syncedCount++
      console.log(`[v0] Transaction synced: ${supabaseTransaction.payment_id}`)
    }

    console.log("[v0] Transaction sync completed:", syncedCount, "transactions synced")
    return {
      success: true,
      count: syncedCount,
      message: `Successfully synced ${syncedCount} transactions from Square to Supabase`,
    }
  } catch (error) {
    console.error("[v0] Error in transaction sync:", error)
    return {
      success: false,
      count: 0,
      message: `Transaction sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export function convertSquareToSupabaseCustomer(squareCustomer: SquareCustomer) {
  const companyName = squareCustomer.company_name || ""
  const [car_model = "", color = ""] = companyName.includes("/")
    ? companyName.split("/").map((s) => s.trim())
    : ["", ""]

  const storeInfo = getStoreInfoFromReferenceId(squareCustomer.reference_id || "")

  return {
    square_customer_id: squareCustomer.id,
    reference_id: squareCustomer.reference_id || squareCustomer.id,
    family_name: squareCustomer.family_name || "",
    given_name: squareCustomer.given_name || "",
    email: squareCustomer.email_address || "",
    phone: squareCustomer.phone_number || "",
    registration_date: squareCustomer.created_at
      ? new Date(squareCustomer.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    status: "active",
    course: squareCustomer.device_name || "standard",
    car_model,
    color,
    plate_info_1: null,
    plate_info_2: null,
    plate_info_3: null,
    plate_info_4: null,
    store_name: storeInfo.store_name,
    store_code: storeInfo.store_code,
  }
}

function getStoreInfoFromReferenceId(referenceId: string): { store_name: string; store_code: string } {
  if (!referenceId) {
    return { store_name: "SPLASH'N'GO!前橋50号店", store_code: "1001" }
  }

  const storePrefix = referenceId.substring(0, 4)

  const storeMapping: { [key: string]: { store_name: string; store_code: string } } = {
    "1001": { store_name: "SPLASH'N'GO!前橋50号店", store_code: "1001" },
    "1002": { store_name: "SPLASH'N'GO!伊勢崎韮塚店", store_code: "1002" },
    "1003": { store_name: "SPLASH'N'GO!高崎棟高店", store_code: "1003" },
    "1004": { store_name: "SPLASH'N'GO!足利緑町店", store_code: "1004" },
    "1005": { store_name: "SPLASH'N'GO!新前橋店", store_code: "1005" },
    "1006": { store_name: "SPLASH'N'GO!太田新田店", store_code: "1006" },
  }

  return storeMapping[storePrefix] || { store_name: "SPLASH'N'GO!前橋50号店", store_code: "1001" }
}
