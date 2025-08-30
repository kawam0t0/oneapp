import { type NextRequest, NextResponse } from "next/server"
import { syncAllSquareTransactions } from "@/lib/square-api"

async function handleSync() {
  try {
    console.log("[v0] Starting Square transaction sync...")

    // 過去30日間のデータを同期
    const endTime = new Date().toISOString()
    const beginTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const result = await syncAllSquareTransactions(undefined, beginTime, endTime)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Transaction sync error:", error)
    return NextResponse.json(
      {
        success: false,
        count: 0,
        message: `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  return handleSync()
}

export async function POST(request: NextRequest) {
  return handleSync()
}
