'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { KeyRound, Mail, ShieldCheck } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    if (result?.error) {
      toast.error('Invalid credentials')
    } else {
      toast.success('Logged in successfully')
      router.push('/dashboard')
    }
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
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/5">
            <KeyRound className="w-5 h-5 text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">
            Secure Portal Login
          </CardTitle>
          <CardDescription className="text-slate-400 mt-2 text-sm leading-relaxed">
            Enter your credentials below to access your performance command center.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 pb-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@atomquest.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-slate-950/60 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-slate-300 font-semibold text-xs uppercase tracking-wider">Security Password</Label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-slate-950/60 border-slate-800 text-white focus:border-blue-500 focus:ring-blue-500/10"
                  required
                />
              </div>
            </div>
          </CardContent>

          {/* Premium Footer with dynamic blue login action */}
          <div className="flex flex-col gap-3 p-6 bg-slate-950/60 border-t border-slate-800/80 rounded-b-xl">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 transition-all shadow-lg shadow-blue-600/15" 
              type="submit"
            >
              Log in to Workspace
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              Secure multi-role enterprise environment
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}