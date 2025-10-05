"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [magicLinkEmail, setMagicLinkEmail] = useState("")
  const [tokenEmail, setTokenEmail] = useState("")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [tokenLoading, setTokenLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setMagicLinkLoading(true)
    setError(null)
    setMagicLinkSent(false)

    // First check if user exists
    const { data: { users }, error: lookupError } = await supabase.auth.admin.listUsers()

    if (lookupError) {
      // If we can't check, proceed anyway (for non-admin scenarios)
      console.warn('Cannot verify user existence, proceeding with OTP request')
    } else {
      const userExists = users?.some(u => u.email === magicLinkEmail)
      if (!userExists) {
        setError('No account found with this email address. Please contact an administrator.')
        setMagicLinkLoading(false)
        return
      }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: magicLinkEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        shouldCreateUser: false,
      },
    })

    if (error) {
      if (error.message.includes('User not found') || error.message.includes('Signups not allowed')) {
        setError('No account found with this email address. Please contact an administrator.')
      } else {
        setError(error.message)
      }
      setMagicLinkLoading(false)
    } else {
      setMagicLinkSent(true)
      setMagicLinkLoading(false)
    }
  }

  const handleTokenLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setTokenLoading(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email: tokenEmail,
      token: token,
      type: 'email',
    })

    if (error) {
      setError(error.message)
      setTokenLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <Image
              src="/icons/logo.light.svg"
              alt="peakbook"
              width={150}
              height={40}
              className="dark:hidden"
            />
            <Image
              src="/icons/logo.dark.svg"
              alt="peakbook"
              width={150}
              height={40}
              className="hidden dark:block"
            />
          </div>
          <div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Sign in to access the admin dashboard</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
              <TabsTrigger value="token">Token</TabsTrigger>
            </TabsList>

            <TabsContent value="password" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@peakbook.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic-link" className="space-y-4 mt-4">
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="magic-email">Email</Label>
                  <Input
                    id="magic-email"
                    type="email"
                    placeholder="admin@peakbook.com"
                    value={magicLinkEmail}
                    onChange={(e) => setMagicLinkEmail(e.target.value)}
                    required
                    disabled={magicLinkLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send you a link to sign in. Only works for existing accounts.
                  </p>
                </div>
                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                {magicLinkSent && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-md flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Check your email for the magic link! Click it to sign in.
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={magicLinkLoading}>
                  {magicLinkLoading ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="token" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground mb-4">
                If you received a 6-digit code via email, enter it here to sign in.
              </p>
              <form onSubmit={handleTokenLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token-email">Email</Label>
                  <Input
                    id="token-email"
                    type="email"
                    placeholder="admin@peakbook.com"
                    value={tokenEmail}
                    onChange={(e) => setTokenEmail(e.target.value)}
                    required
                    disabled={tokenLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="token">6-Digit Code</Label>
                  <Input
                    id="token"
                    type="text"
                    placeholder="123456"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    disabled={tokenLoading}
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code from your email
                  </p>
                </div>
                {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
                <Button type="submit" className="w-full" disabled={tokenLoading}>
                  {tokenLoading ? "Verifying..." : "Sign In with Code"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
