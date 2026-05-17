"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Users, UserPlus, Search, Filter, 
  Shield, UserCheck, MoreHorizontal, 
  Building2, Mail, Edit3, Trash2, Key, Check, Copy
} from 'lucide-react'
import { provisionUser, updateUser, revokeAccess, resetPassword } from './actions'

interface Department {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  departmentId: string | null
  teamId: string | null
  managerId: string | null
  department: Department | null
  manager: { id: string; name: string } | null
}

export default function UserDirectoryClient({ 
  initialUsers, 
  departments, 
  managers 
}: { 
  initialUsers: User[]
  departments: Department[]
  managers: { id: string; name: string }[]
}) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('ALL')
  const [selectedDept, setSelectedDept] = useState('ALL')

  // Selected edit state
  const [isEditOpen, setIsEditOpen] = useState<string | null>(null)
  const [isProvisionOpen, setIsProvisionOpen] = useState(false)

  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Real-time filtering
  const filteredUsers = initialUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department?.name || 'Unassigned').toLowerCase().includes(search.toLowerCase())
    
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole
    const matchesDept = selectedDept === 'ALL' || u.departmentId === selectedDept

    return matchesSearch && matchesRole && matchesDept
  })

  const handleProvision = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await provisionUser(formData)
      setIsProvisionOpen(false)
      // Since it's server component backed, Next.js revalidatePath will update page automatically.
      // But we can reset form
      e.currentTarget.reset()
    } catch (err: any) {
      alert(err.message || 'Failed to provision user')
    }
  }

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    try {
      await updateUser(id, formData)
      setIsEditOpen(null)
    } catch (err: any) {
      alert(err.message || 'Failed to update user')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to revoke access and delete ${name}?`)) {
      await revokeAccess(id)
    }
  }

  const handleResetPassword = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to reset password for ${name} to "password123"?`)) {
      await resetPassword(id)
      alert(`Password for ${name} has been reset to "password123" successfully.`)
    }
  }

  const copyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const hasActiveFilters = search !== '' || selectedRole !== 'ALL' || selectedDept !== 'ALL'

  const resetFilters = () => {
    setSearch('')
    setSelectedRole('ALL')
    setSelectedDept('ALL')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage organizational structure, roles, and hierarchy</p>
        </div>
        
        <Dialog open={isProvisionOpen} onOpenChange={setIsProvisionOpen}>
          <DialogTrigger render={
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4" /> Provision User
            </Button>
          } />
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleProvision}>
              <DialogHeader>
                <DialogTitle>New User Provisioning</DialogTitle>
                <DialogDescription>Add a new employee or manager to the AtomQuest ecosystem.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4 text-left">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="provision-name">Full Name</Label>
                  <Input id="provision-name" name="name" placeholder="e.g., Alexander Pierce" required />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="provision-email">Corporate Email</Label>
                  <Input id="provision-email" name="email" type="email" placeholder="alex@atomquest.com" required />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="provision-role">Role</Label>
                  <select id="provision-role" name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="provision-dept">Department</Label>
                  <select id="provision-dept" name="departmentId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Unassigned / None</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="provision-manager">Assign Manager</Label>
                  <select id="provision-manager" name="managerId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">None</option>
                    {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Create User Identity</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <CardTitle>Organizational Directory</CardTitle>
              <CardDescription>Managing {filteredUsers.length} active identities</CardDescription>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter by name, email, or dept..." 
                  className="pl-9 w-[260px] md:w-[300px]" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Advanced Filter Popover */}
              <Popover>
                <PopoverTrigger render={
                  <Button variant="outline" size="icon" className={selectedRole !== 'ALL' || selectedDept !== 'ALL' ? 'border-blue-500 bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}>
                    <Filter className="w-4 h-4" />
                  </Button>
                } />
                <PopoverContent className="w-80 p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <h4 className="font-semibold text-slate-900">Advanced Filters</h4>
                      {hasActiveFilters && (
                        <button onClick={resetFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Reset</button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filter-role">Filter by Role</Label>
                      <select 
                        id="filter-role" 
                        value={selectedRole} 
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="ALL">All Roles</option>
                        <option value="EMPLOYEE">Employees Only</option>
                        <option value="MANAGER">Managers Only</option>
                        <option value="ADMIN">Administrators Only</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="filter-dept">Filter by Department</Label>
                      <select 
                        id="filter-dept" 
                        value={selectedDept} 
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="ALL">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button variant="ghost" className="text-xs text-slate-500 font-semibold" onClick={resetFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No users match your current filter settings.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'ADMIN' ? 'default' : user.role === 'MANAGER' ? 'secondary' : 'outline'}
                        className="text-[10px] font-bold px-2"
                      >
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1" />}
                        {user.role === 'MANAGER' && <UserCheck className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Building2 className="w-3 h-3" /> {user.department?.name || 'Unassigned'}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {user.manager?.name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        
                        {/* Edit User Dialog */}
                        <Dialog open={isEditOpen === user.id} onOpenChange={(open) => setIsEditOpen(open ? user.id : null)}>
                          <DialogTrigger render={
                            <Button variant="ghost" size="icon" title="Edit"><Edit3 className="w-4 h-4" /></Button>
                          } />
                          <DialogContent className="max-w-2xl">
                            <form onSubmit={(e) => handleUpdate(user.id, e)}>
                              <DialogHeader>
                                <DialogTitle>Edit User Identity</DialogTitle>
                                <DialogDescription>Modify workspace configuration and reporting lines.</DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4 text-left">
                                <div className="space-y-2 col-span-2">
                                  <Label htmlFor={`edit-name-${user.id}`}>Full Name</Label>
                                  <Input id={`edit-name-${user.id}`} name="name" defaultValue={user.name} required />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                  <Label htmlFor={`edit-email-${user.id}`}>Corporate Email</Label>
                                  <Input id={`edit-email-${user.id}`} name="email" type="email" defaultValue={user.email} required />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                  <Label htmlFor={`edit-role-${user.id}`}>Role</Label>
                                  <select id={`edit-role-${user.id}`} name="role" defaultValue={user.role} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="ADMIN">Administrator</option>
                                  </select>
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                  <Label htmlFor={`edit-dept-${user.id}`}>Department</Label>
                                  <select id={`edit-dept-${user.id}`} name="departmentId" defaultValue={user.departmentId || ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Unassigned / None</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                  <Label htmlFor={`edit-manager-${user.id}`}>Assign Manager</Label>
                                  <select id={`edit-manager-${user.id}`} name="managerId" defaultValue={user.managerId || ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">None</option>
                                    {managers.filter(m => m.id !== user.id).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                  </select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Save Workspace Changes</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:bg-red-50" 
                          title="Revoke Access"
                          onClick={() => handleDelete(user.id, user.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        {/* More Options Popover */}
                        <Popover>
                          <PopoverTrigger render={
                            <Button variant="ghost" size="icon" title="More Actions">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          } />
                          <PopoverContent className="w-48 p-1.5 flex flex-col gap-1">
                            <button
                              onClick={() => copyEmail(user.email, user.id)}
                              className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold text-slate-700"
                            >
                              {copiedId === user.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedId === user.id ? 'Copied Email' : 'Copy Email'}
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id, user.name)}
                              className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md hover:bg-slate-100 text-xs font-semibold text-slate-700"
                            >
                              <Key className="w-3.5 h-3.5" />
                              Reset Password
                            </button>
                          </PopoverContent>
                        </Popover>
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
