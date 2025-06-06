"use client"

import ProtectedRoute from "@/components/auth/protected-route"

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
} 