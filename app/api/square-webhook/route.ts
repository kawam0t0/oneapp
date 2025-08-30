import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { convertSquareToSupabaseCustomer, convertSquareToSupabaseTransaction } from "@/lib/square-api"

export async function POST(request: NextRequest) {
  console.log("[v0] =================================")
  console.log("[v0] Webhook POST request received!")
  console.log("[v0] Timestamp:", new Date().toISOString())
  console.log("[v0] =================================")

  try {
    console.log("[v0] Environment check:")
    console.log("[v0] NEXT_PUBLIC_SUPABASE_URL exists:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("[v0] NEXT_PUBLIC_SUPABASE_ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    let body
    try {
      const text = await request.text()
      console.log("[v0] Webhook body length:", text.length)

      if (!text || text.trim() === "") {
        console.log("[v0] Empty webhook body - returning success")
        return NextResponse.json({ success: true })
      }
      body = JSON.parse(text)
      console.log("[v0] Webhook event type:", body.type)
    } catch (parseError) {
      console.error("[v0] Webhook JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    console.log("[v0] Testing Supabase connection...")
    try {
      const { data, error } = await supabase.from("transactions").select("id").limit(1)
      if (error) {
        console.error("[v0] Supabase connection failed:", error)
        return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
      }
      console.log("[v0] Supabase connection: SUCCESS")
    } catch (dbError) {
      console.error("[v0] Supabase connection error:", dbError)
      return NextResponse.json({ error: "Database connection error" }, { status: 500 })
    }

    const getJapanTime = () => new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString()

    // 顧客関連のイベントを処理
    if (body.type === "customer.created") {
      const squareCustomer = body.data.object.customer
      const supabaseCustomer = convertSquareToSupabaseCustomer(squareCustomer)

      const { error } = await supabase.from("customers").insert([supabaseCustomer])

      if (error && error.code !== "23505") {
        console.error("[v0] Customer insert failed")
        return NextResponse.json({ error: "Failed to insert customer" }, { status: 500 })
      }
      console.log("[v0] Customer sync: SUCCESS")
    } else if (body.type === "customer.updated") {
      const squareCustomer = body.data.object.customer
      const supabaseCustomer = convertSquareToSupabaseCustomer(squareCustomer)

      const { error } = await supabase
        .from("customers")
        .update(supabaseCustomer)
        .eq("square_customer_id", squareCustomer.id)

      if (error) {
        console.error("[v0] Customer update failed")
        return NextResponse.json({ error: "Failed to update customer" }, { status: 500 })
      }
      console.log("[v0] Customer update: SUCCESS")
    } else if (body.type === "customer.deleted") {
      const customerId = body.data.object.customer.id

      const { error } = await supabase
        .from("customers")
        .update({ status: "deleted" })
        .eq("square_customer_id", customerId)

      if (error) {
        console.error("[v0] Customer delete failed")
        return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 })
      }
      console.log("[v0] Customer delete: SUCCESS")
    } else if (body.type === "customer.merged") {
      const mergedCustomer = body.data.object.customer
      const supabaseCustomer = convertSquareToSupabaseCustomer(mergedCustomer)

      const { error } = await supabase
        .from("customers")
        .update(supabaseCustomer)
        .eq("square_customer_id", mergedCustomer.id)

      if (error) {
        console.error("[v0] Customer merge failed")
        return NextResponse.json({ error: "Failed to update merged customer" }, { status: 500 })
      }
      console.log("[v0] Customer merge: SUCCESS")
    } else if (body.type === "payment.created" || body.type === "payment.updated") {
      const squareTransaction = body.data.object.payment
      const supabaseTransaction = await convertSquareToSupabaseTransaction(squareTransaction)

      if (!supabaseTransaction) {
        console.error("[v0] Transaction conversion failed")
        return NextResponse.json({ error: "Invalid transaction data" }, { status: 400 })
      }

      // 重複チェック
      const { data: existing } = await supabase
        .from("transactions")
        .select("id")
        .eq("payment_id", supabaseTransaction.payment_id)
        .single()

      if (existing && body.type === "payment.created") {
        console.log("[v0] Transaction sync: DUPLICATE_SKIPPED")
      } else if (body.type === "payment.created") {
        const transactionWithJapanTime = {
          ...supabaseTransaction,
          created_at: getJapanTime(),
          updated_at: getJapanTime(),
        }

        const { error } = await supabase.from("transactions").insert([transactionWithJapanTime])

        if (error) {
          console.error("[v0] Transaction insert failed")
          return NextResponse.json({ error: "Failed to insert transaction" }, { status: 500 })
        }
        console.log("[v0] Transaction sync: SUCCESS")
      } else if (body.type === "payment.updated" && existing) {
        const transactionWithJapanTime = {
          ...supabaseTransaction,
          updated_at: getJapanTime(),
        }

        const { error } = await supabase
          .from("transactions")
          .update(transactionWithJapanTime)
          .eq("payment_id", squareTransaction.id)

        if (error) {
          console.error("[v0] Transaction update failed")
          return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 })
        }
        console.log("[v0] Transaction update: SUCCESS")
      }
    } else if (body.type === "refund.created" || body.type === "refund.updated") {
      const refund = body.data.object.refund

      const { error } = await supabase
        .from("transactions")
        .update({
          partial_refund: refund.amount_money?.amount ? refund.amount_money.amount / 100 : 0,
          refund_reason: refund.reason || "返金",
          payment_or_refund: "返金",
          updated_at: getJapanTime(),
        })
        .eq("payment_id", refund.payment_id)

      if (error) {
        console.error("[v0] Refund update failed")
        return NextResponse.json({ error: "Failed to update refund" }, { status: 500 })
      }
      console.log("[v0] Refund update: SUCCESS")
    }

    console.log("[v0] Webhook processing completed successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] =================================")
    console.error("[v0] WEBHOOK PROCESSING FAILED!")
    console.error("[v0] Error:", error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : "Unknown error")
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")
    console.error("[v0] =================================")
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
