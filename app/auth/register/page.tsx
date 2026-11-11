'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { ArrowRight, Lock, Mail, User, Phone, Check } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return toast.error('Full name is required')
    if (!email.trim()) return toast.error('Email address is required')
    if (!password) return toast.error('Password is required')
    if (password.length < 6)
      return toast.error('Password must be at least 6 characters')
    if (password !== confirmPassword)
      return toast.error('Passwords do not match')
    if (!agreeTerms)
      return toast.error('Please accept the terms and privacy policy')

    try {
      setLoading(true)

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          phone: phone.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Account created successfully! Signing you in...')
        // Auto sign in
        const signInRes = await signIn('credentials', {
          redirect: false,
          email: email.trim().toLowerCase(),
          password,
        })

        if (!signInRes?.error) {
          router.push('/account')
          router.refresh()
        } else {
          router.push('/auth/login')
        }
      } else {
        toast.error(data.error || 'Failed to create account')
      }
    } catch {
      toast.error('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex text-stone-100">
      <Toaster position="top-right" />

      {/* Visual Column */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1400')`,
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
              The Atelier Circle
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-light text-white leading-tight">
              Craftsmanship woven into every thread.
            </h2>
            <div className="space-y-2 pt-2 text-xs text-stone-300">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Complimentary priority shipping on all creations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Private invitations to seasonal trunk shows</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Personal styling concierge and wardrobe curation</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-stone-400 tracking-widest uppercase">
            © {new Date().getFullYear()} Luxe Threads Maison. All rights reserved.
          </div>
        </div>
      </div>

      {/* Registration Form */}
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
              Create Patron Membership
            </h1>
            <p className="text-xs text-stone-400 tracking-wider mt-1.5">
              Join the maison to manage orders, wishlists, and curated collections
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-stone-300 tracking-wider uppercase text-[10px] font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Eleanor Vance"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="patron@domain.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 tracking-wider uppercase text-[10px] font-medium">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-stone-300 tracking-wider uppercase text-[10px] font-medium">
                  Password
                </label>
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

              <div className="space-y-1.5">
                <label className="text-stone-300 tracking-wider uppercase text-[10px] font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-2.5 cursor-pointer text-[11px] text-stone-400">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-amber-400 bg-stone-900 border-stone-700 focus:ring-0"
                />
                <span>
                  I agree to the Maison Terms of Service and acknowledge the Privacy & Discreet Packaging Policy.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium tracking-[0.15em] uppercase text-xs rounded transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-amber-400/10 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Creating Membership...' : 'Register as Patron'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-800/80 text-center text-xs text-stone-400">
            <span>Already hold a patron account? </span>
            <Link
              href="/auth/login"
              className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-4 tracking-wider"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
