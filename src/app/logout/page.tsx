"use client"

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LogOut, ShieldAlert, ArrowLeft } from 'lucide-react'

export default function LogoutPage() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
      {/* Dynamic Glow Meshes for AtomQuest theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Decorative Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 text-slate-100 shadow-2xl relative z-10 overflow-hidden">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 shadow-inner shadow-red-500/5">
            <LogOut className="w-6 h-6 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Secure Sign Out</CardTitle>
          <CardDescription className="text-slate-400 mt-2 text-sm leading-relaxed">
            Are you sure you want to terminate your active session and sign out of your secure workspace?
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="bg-amber-500/5 border border-amber-500/20 text-amber-300 rounded-lg p-3.5 text-xs leading-relaxed flex items-start gap-2.5 text-left shadow-sm">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>All active goal operations, check-in drafts, and session audit logs will be finalized.</span>
          </div>
        </CardContent>

        {/* Custom clean dark footer row for flawless visibility */}
        <div className="flex flex-col gap-3 p-6 bg-slate-950/60 border-t border-slate-800/80 rounded-b-xl">
          <Button 
            onClick={handleSignOut} 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-11 transition-all shadow-lg shadow-red-600/10"
          >
            Yes, Sign Out
          </Button>
          <Link 
            href="/admin"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              "w-full text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-semibold h-11 gap-2 transition-colors flex items-center justify-center border-none"
            )}
          >
            <ArrowLeft className="w-4 h-4" /> Keep Session Active
          </Link>
        </div>
      </Card>
    </div>
  )
}
