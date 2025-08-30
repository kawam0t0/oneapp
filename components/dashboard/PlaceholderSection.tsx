"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PlaceholderSectionProps {
  title: string
  description?: string
  isExternalLink?: boolean
}

export default function PlaceholderSection({ title, description, isExternalLink = false }: PlaceholderSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">{title}</CardTitle>
        <CardDescription>{description || "この機能は開発中です。"}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">
            {isExternalLink ? "備品発注システムは外部リンクで開きます" : "機能開発中..."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
