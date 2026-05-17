"use client"

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  ShieldCheck, User, Clock, FileEdit,
  Download, Search, Filter, Calendar as CalendarIcon,
  PlusCircle, CheckCircle, Unlock, Trash2, X
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  entity: string
  user: { name: string } | null
  reason: string | null
  timestamp: string
}

export default function AuditTrailClient({ initialLogs }: { initialLogs: AuditLog[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAction, setSelectedAction] = useState<string>('ALL')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const filteredLogs = useMemo(() => {
    return initialLogs.filter(log => {
      // 1. Search term filter
      const matchesSearch =
        (log.user?.name || 'System').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entity.toLowerCase().includes(searchTerm.toLowerCase())

      // 2. Action filter
      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction

      // 3. Date filter
      const logDate = new Date(log.timestamp)
      const matchesDate = !selectedDate || (
        logDate.getFullYear() === selectedDate.getFullYear() &&
        logDate.getMonth() === selectedDate.getMonth() &&
        logDate.getDate() === selectedDate.getDate()
      )

      return matchesSearch && matchesAction && matchesDate
    })
  }, [initialLogs, searchTerm, selectedAction, selectedDate])

  const exportCSV = () => {
    const headers = ['User', 'Action', 'Resource', 'Detail', 'Timestamp']
    const rows = filteredLogs.map(log => [
      log.user?.name || 'System',
      log.action,
      log.entity,
      log.reason || '',
      new Date(log.timestamp).toLocaleString()
    ])
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `audit_log_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const actions = ['ALL', 'CREATE', 'APPROVE', 'UNLOCK', 'ASSIGN', 'UPDATE', 'DELETE']

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Audit & Traceability</h2>
          <p className="text-muted-foreground">Comprehensive system logs and regulatory compliance tracking</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportCSV}>
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Badge variant="outline" className="gap-2 px-3 py-1 bg-green-50 text-green-700 border-green-200">
            <ShieldCheck className="w-4 h-4" /> System Integrity: Secure
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle>System Activity Trail</CardTitle>
              <CardDescription>Filtering through {filteredLogs.length} logged events</CardDescription>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search user or action..."
                  className="pl-9 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Action Filter Popover */}
              <Popover>
                <PopoverTrigger render={
                  <Button variant={selectedAction !== 'ALL' ? 'default' : 'outline'} size="icon" title="Filter by Action">
                    <Filter className="w-4 h-4" />
                  </Button>
                } />
                <PopoverContent className="w-48 p-2 bg-popover rounded-md border shadow-md">
                  <div className="space-y-1">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1">Filter by Action</div>
                    {actions.map(act => (
                      <button
                        key={act}
                        onClick={() => setSelectedAction(act)}
                        className={`w-full text-left px-2 py-1 text-xs rounded-sm hover:bg-slate-100 transition-colors ${selectedAction === act ? 'bg-slate-100 font-semibold text-blue-600' : ''}`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Date Filter Popover */}
              <Popover>
                <PopoverTrigger render={
                  <Button variant={selectedDate ? 'default' : 'outline'} size="icon" title="Filter by Date">
                    <CalendarIcon className="w-4 h-4" />
                  </Button>
                } />
                <PopoverContent className="w-auto p-0 bg-popover rounded-md border shadow-md" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                  />
                  {selectedDate && (
                    <div className="p-2 border-t flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)} className="text-xs text-red-500 gap-1 hover:bg-red-50">
                        <X className="w-3 h-3" /> Clear Date
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[180px]">User & Identity</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead className="max-w-[300px]">Action Detail</TableHead>
                <TableHead className="text-right">Execution Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No matching logs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="font-semibold text-xs text-slate-900">{log.user?.name || 'System'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold uppercase tracking-tighter px-1.5 py-0 border-2 flex items-center w-fit ${log.action === 'CREATE' ? 'text-blue-600 border-blue-100 bg-blue-50' :
                          log.action === 'APPROVE' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' :
                            log.action === 'UNLOCK' ? 'text-amber-600 border-amber-100 bg-amber-50' :
                              log.action === 'UPDATE' || log.action === 'EDIT' ? 'text-purple-600 border-purple-100 bg-purple-50' :
                                log.action === 'DELETE' ? 'text-red-600 border-red-100 bg-red-50' :
                                  log.action === 'ASSIGN' ? 'text-indigo-600 border-indigo-100 bg-indigo-50' :
                                    'text-slate-600 border-slate-100 bg-slate-50'
                          }`}
                      >
                        {log.action === 'CREATE' && <PlusCircle className="w-2.5 h-2.5 mr-1" />}
                        {log.action === 'APPROVE' && <CheckCircle className="w-2.5 h-2.5 mr-1" />}
                        {log.action === 'UNLOCK' && <Unlock className="w-2.5 h-2.5 mr-1" />}
                        {(log.action === 'UPDATE' || log.action === 'EDIT') && <FileEdit className="w-2.5 h-2.5 mr-1" />}
                        {log.action === 'DELETE' && <Trash2 className="w-2.5 h-2.5 mr-1" />}
                        {log.action === 'ASSIGN' && <User className="w-2.5 h-2.5 mr-1" />}
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <FileEdit className="w-3 h-3" /> {log.entity}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 leading-relaxed italic">
                      {log.reason || 'No description provided.'}
                    </TableCell>
                    <TableCell className="text-[10px] text-slate-500 text-right font-medium">
                      <div className="flex flex-col">
                        <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
