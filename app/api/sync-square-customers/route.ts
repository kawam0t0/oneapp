import { NextResponse } from "next/server"
import { syncAllSquareCustomersBatch } from "@/lib/square-api"

export async function GET() {
  return await syncCustomers()
}

export async function POST() {
  return await syncCustomers()
}

async function syncCustomers() {
  try {
    console.log("[v0] Starting Square customers BATCH sync...")

    const result = await syncAllSquareCustomersBatch()

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          totalCount: result.totalCount,
          syncedCount: result.syncedCount,
          errorCount: result.errorCount,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      totalCount: result.totalCount,
      syncedCount: result.syncedCount,
      errorCount: result.errorCount,
      message: result.message,
    })
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
