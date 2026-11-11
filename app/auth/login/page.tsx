'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your email and password')
      return
    }

    try {
      setLoading(true)
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      })

      if (res?.error) {
        toast.error('Invalid email or password')
      } else {
        toast.success('Welcome back to Luxe Threads')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      toast.error('An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex text-stone-100">
      <Toaster position="top-right" />

      {/* Left Column: Visual Editorial Cover */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1400')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        <div className="relative z-10 p-16 flex flex-col justify-between h-full">
          <div>
            <Link
              href="/"
              className="font-serif text-2xl tracking-[0.25em] uppercase text-white font-light"
            >
              LUXE THREADS
            </Link>
            <p className="text-[11px] text-amber-300 tracking-[0.2em] uppercase mt-1">
              Haute Couture Atelier
            </p>
          </div>

          <div className="max-w-md space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-mono">
              Patron Exclusive
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white leading-tight">
              A private realm of sartorial distinction.
            </h2>
            <p className="text-xs text-stone-300 leading-relaxed font-light">
              Access your personal wardrobe archives, preview debut collections before public release, and enjoy bespoke concierge assistance.
            </p>
          </div>

          <div className="text-[10px] text-stone-400 tracking-widest uppercase">
            © {new Date().getFullYear()} Luxe Threads Maison. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 max-w-xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="lg:hidden mb-10 text-center">
          <Link
            href="/"
            className="font-serif text-2xl tracking-[0.25em] uppercase text-white font-light"
          >
            LUXE THREADS
          </Link>
          <p className="text-[10px] text-amber-400 tracking-[0.2em] uppercase mt-1">
            Haute Couture Atelier
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-white tracking-wide">
              Patron Sign In
            </h1>
            <p className="text-xs text-stone-400 tracking-wider mt-1.5">
              Enter your credentials to access your private account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-stone-300 tracking-wider uppercase text-[10px] font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patron@luxethreads.com"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-stone-300 tracking-wider uppercase text-[10px] font-medium">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-[10px] text-amber-400/80 hover:text-amber-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium tracking-[0.15em] uppercase text-xs rounded transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-amber-400/10 disabled:opacity-50 mt-6"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Atelier'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="p-4 bg-stone-900/60 rounded border border-stone-800/80 text-[11px] text-stone-400 space-y-1">
            <p className="text-stone-300 font-medium uppercase text-[10px] tracking-wider">
              Preview Accounts:
            </p>
            <p>Admin: <span className="font-mono text-amber-300">admin@luxethreads.com</span> / <span className="font-mono text-amber-300">admin123</span></p>
            <p>Customer: <span className="font-mono text-stone-200">customer@example.com</span> / <span className="font-mono text-stone-200">password123</span></p>
          </div>

          <div className="pt-4 border-t border-stone-800/80 text-center text-xs text-stone-400">
            <span>New to Luxe Threads? </span>
            <Link
              href="/auth/register"
              className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 tracking-wider"
            >
              Create a Patron Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
