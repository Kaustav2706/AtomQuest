'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, BarChart2, FileText, PieChart, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from '@/components/ui/progress'

export function ManagerActions() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Generating team performance CSV...',
        success: () => {
          setIsExporting(false)
          // Simple CSV download simulation
          const csvContent = "Employee,Email,Status,Progress\nEmployee User,employee@atomquest.com,APPROVED,45%\n"
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.setAttribute('hidden', '')
          a.setAttribute('href', url)
          a.setAttribute('download', 'team_report.csv')
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          return 'Team report downloaded successfully!'
        },
        error: 'Failed to generate report.',
      }
    )
  }

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={handleExport}
        disabled={isExporting}
      >
        <Download className="w-4 h-4" /> 
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </Button>

      <Dialog>
        <DialogTrigger
          render={
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <BarChart2 className="w-4 h-4" /> View Team Report
            </Button>
          }
        />
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6 text-blue-600" />
              Team Performance Report
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of team goals and quarterly progress for FY 2026-2027.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <div className="text-2xl font-bold">1</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Members</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <PieChart className="w-8 h-8 text-emerald-500 mb-2" />
              <div className="text-2xl font-bold">45%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Average Progress</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
              <CheckCircle2 className="w-8 h-8 text-purple-500 mb-2" />
              <div className="text-2xl font-bold">12%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Goal Completion</div>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <h3 className="font-bold text-lg border-b pb-2">Strategic Goal Breakdown</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Engineering Excellence</span>
                  <span>65%</span>
                </div>
                <Progress value={65} className="h-2 bg-slate-100" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Product Innovation</span>
                  <span>30%</span>
                </div>
                <Progress value={30} className="h-2 bg-slate-100" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Customer Satisfaction</span>
                  <span>80%</span>
                </div>
                <Progress value={80} className="h-2 bg-slate-100" />
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Manager Summary
            </h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              The team is performing well in Customer Satisfaction but needs more focus on Product Innovation for Q2. 
              Pending goal sheets should be reviewed by end of week to maintain momentum.
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Download PDF Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
