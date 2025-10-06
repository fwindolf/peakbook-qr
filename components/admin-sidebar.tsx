"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Mountain, LayoutDashboard, Languages, QrCode, CheckSquare, BarChart3, LogOut, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LocaleSwitcher } from "@/components/locale-switcher"

const navigationItems = [
  { key: "dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { key: "peaks", href: "/admin/peaks", icon: Mountain },
  { key: "translations", href: "/admin/translations", icon: Languages },
  { key: "qrCodes", href: "/admin/qr-codes", icon: QrCode },
  { key: "moderation", href: "/admin/moderation", icon: CheckSquare },
  { key: "analytics", href: "/admin/analytics", icon: BarChart3 },
]

export function AdminSidebar() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Image
          src="/icons/logo.light.svg"
          alt="peakbook"
          width={100}
          height={28}
          className="dark:hidden"
        />
        <Image
          src="/icons/logo.dark.svg"
          alt="peakbook"
          width={100}
          height={28}
          className="hidden dark:block"
        />
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(item.key)}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4 space-y-2">
        <LocaleSwitcher />
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          {t("logout")}
        </Button>
      </div>
    </div>
  )
}
