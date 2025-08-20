'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Users,
  Shield,
  Key,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from 'lucide-react'

interface Permission {
  id: string
  name: string
  description: string
  category: string
  granted: boolean
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  mfaEnabled: boolean
}

interface RBACManagementProps {
  userId: string
}

const PERMISSIONS: Permission[] = [
  // Dashboard & Analytics
  { id: 'dashboard.view', name: 'View Dashboard', description: 'Access to main dashboard and overview', category: 'Dashboard', granted: false },
  { id: 'dashboard.analytics', name: 'View Analytics', description: 'Access to analytics and reporting', category: 'Dashboard', granted: false },
  { id: 'dashboard.export', name: 'Export Data', description: 'Export data and reports', category: 'Dashboard', granted: false },
  
  // Testimonials
  { id: 'testimonials.view', name: 'View Testimonials', description: 'View all testimonials', category: 'Testimonials', granted: false },
  { id: 'testimonials.create', name: 'Create Testimonials', description: 'Create new testimonials', category: 'Testimonials', granted: false },
  { id: 'testimonials.edit', name: 'Edit Testimonials', description: 'Edit existing testimonials', category: 'Testimonials', granted: false },
  { id: 'testimonials.delete', name: 'Delete Testimonials', description: 'Delete testimonials', category: 'Testimonials', granted: false },
  { id: 'testimonials.approve', name: 'Approve Testimonials', description: 'Approve pending testimonials', category: 'Testimonials', granted: false },
  { id: 'testimonials.moderate', name: 'Moderate Testimonials', description: 'Moderate and filter testimonials', category: 'Testimonials', granted: false },
  
  // Widgets
  { id: 'widgets.view', name: 'View Widgets', description: 'View testimonial widgets', category: 'Widgets', granted: false },
  { id: 'widgets.create', name: 'Create Widgets', description: 'Create new widgets', category: 'Widgets', granted: false },
  { id: 'widgets.edit', name: 'Edit Widgets', description: 'Edit widget settings', category: 'Widgets', granted: false },
  { id: 'widgets.delete', name: 'Delete Widgets', description: 'Delete widgets', category: 'Widgets', granted: false },
  { id: 'widgets.customize', name: 'Customize Widgets', description: 'Customize widget appearance and behavior', category: 'Widgets', granted: false },
  
  // Social Media
  { id: 'social.view', name: 'View Social Media', description: 'View social media integration', category: 'Social Media', granted: false },
  { id: 'social.manage', name: 'Manage Social Media', description: 'Manage social media accounts and posts', category: 'Social Media', granted: false },
  { id: 'social.analytics', name: 'Social Analytics', description: 'View social media analytics', category: 'Social Media', granted: false },
  
  // Automation
  { id: 'automation.view', name: 'View Automation', description: 'View automation rules', category: 'Automation', granted: false },
  { id: 'automation.create', name: 'Create Automation', description: 'Create automation rules', category: 'Automation', granted: false },
  { id: 'automation.edit', name: 'Edit Automation', description: 'Edit automation rules', category: 'Automation', granted: false },
  { id: 'automation.delete', name: 'Delete Automation', description: 'Delete automation rules', category: 'Automation', granted: false },
  
  // Users & Security
  { id: 'users.view', name: 'View Users', description: 'View user accounts', category: 'Users & Security', granted: false },
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'Users & Security', granted: false },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user accounts', category: 'Users & Security', granted: false },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'Users & Security', granted: false },
  { id: 'security.manage', name: 'Manage Security', description: 'Manage security settings and policies', category: 'Users & Security', granted: false },
  { id: 'roles.manage', name: 'Manage Roles', description: 'Manage user roles and permissions', category: 'Users & Security', granted: false },
  
  // System
  { id: 'system.settings', name: 'System Settings', description: 'Access to system configuration', category: 'System', granted: false },
  { id: 'system.logs', name: 'System Logs', description: 'View system logs and audit trails', category: 'System', granted: false },
  { id: 'system.backup', name: 'System Backup', description: 'Manage system backups', category: 'System', granted: false }
]

const DEFAULT_ROLES: Role[] = [
  {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    permissions: PERMISSIONS.map(p => p.id),
    userCount: 1,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to most features with some system restrictions',
    permissions: PERMISSIONS.filter(p => !p.id.startsWith('system.')).map(p => p.id),
    userCount: 2,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage testimonials, widgets, and social media',
    permissions: [
      'dashboard.view', 'dashboard.analytics', 'dashboard.export',
      'testimonials.view', 'testimonials.create', 'testimonials.edit', 'testimonials.approve', 'testimonials.moderate',
      'widgets.view', 'widgets.create', 'widgets.edit', 'widgets.customize',
      'social.view', 'social.manage', 'social.analytics',
      'automation.view', 'automation.create', 'automation.edit'
    ],
    userCount: 3,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Create and edit testimonials and widgets',
    permissions: [
      'dashboard.view', 'dashboard.analytics',
      'testimonials.view', 'testimonials.create', 'testimonials.edit',
      'widgets.view', 'widgets.create', 'widgets.edit',
      'social.view'
    ],
    userCount: 5,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'View-only access to testimonials and basic analytics',
    permissions: [
      'dashboard.view',
      'testimonials.view',
      'widgets.view',
      'social.view'
    ],
    userCount: 8,
    isSystem: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
]

export function RBACManagement({ userId }: RBACManagementProps) {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES)
  const [users, setUsers] = useState<User[]>([])
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] })
  const [activeTab, setActiveTab] = useState('roles')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock users data
  const mockUsers: User[] = [
    { id: '1', name: 'John Admin', email: 'john@company.com', role: 'super-admin', status: 'active', lastLogin: '2024-02-07T10:30:00Z', mfaEnabled: true },
    { id: '2', name: 'Sarah Manager', email: 'sarah@company.com', role: 'manager', status: 'active', lastLogin: '2024-02-07T09:15:00Z', mfaEnabled: true },
    { id: '3', name: 'Mike Editor', email: 'mike@company.com', role: 'editor', status: 'active', lastLogin: '2024-02-06T16:45:00Z', mfaEnabled: false },
    { id: '4', name: 'Lisa Viewer', email: 'lisa@company.com', role: 'viewer', status: 'active', lastLogin: '2024-02-05T14:20:00Z', mfaEnabled: false },
    { id: '5', name: 'Tom Suspended', email: 'tom@company.com', role: 'editor', status: 'suspended', lastLogin: '2024-02-01T11:00:00Z', mfaEnabled: true }
  ]

  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [userId])

  const loadData = async () => {
    try {
      setLoading(true)
      // In production, this would fetch from your API
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
      setUsers(mockUsers)
    } catch (error) {
      console.error('Failed to load RBAC data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load RBAC data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const createRole = async () => {
    if (!newRole.name.trim() || !newRole.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide role name and description',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      const role: Role = {
        id: `role-${Date.now()}`,
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.permissions,
        userCount: 0,
        isSystem: false,
        createdAt: new Date().toISOString()
      }

      setRoles(prev => [...prev, role])
      setNewRole({ name: '', description: '', permissions: [] })
      setShowCreateRole(false)
      
      toast({
        title: 'Success',
        description: 'Role created successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async () => {
    if (!editingRole) return

    try {
      setLoading(true)
      setRoles(prev => prev.map(role => 
        role.id === editingRole.id ? editingRole : role
      ))
      
      setEditingRole(null)
      toast({
        title: 'Success',
        description: 'Role updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) {
      toast({
        title: 'Cannot Delete',
        description: 'System roles cannot be deleted',
        variant: 'destructive'
      })
      return
    }

    if (role?.userCount && role.userCount > 0) {
      toast({
        title: 'Cannot Delete',
        description: 'Role has active users. Reassign users before deleting.',
        variant: 'destructive'
      })
      return
    }

    try {
      setRoles(prev => prev.filter(role => role.id !== roleId))
      toast({
        title: 'Success',
        description: 'Role deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive'
      })
    }
  }

  const togglePermission = (permissionId: string) => {
    if (!editingRole) return
    
    setEditingRole(prev => {
      if (!prev) return null
      const permissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
      return { ...prev, permissions }
    })
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ))
      
      // Update role user counts
      setRoles(prev => prev.map(role => ({
        ...role,
        userCount: users.filter(u => u.role === role.id).length
      })))
      
      toast({
        title: 'Success',
        description: 'User role updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      })
    }
  }

  const updateUserStatus = async (userId: string, status: User['status']) => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status } : user
      ))
      
      toast({
        title: 'Success',
        description: `User status updated to ${status}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      })
    }
  }

  const getPermissionCategory = (permissionId: string) => {
    return PERMISSIONS.find(p => p.id === permissionId)?.category || 'Other'
  }

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {}
    PERMISSIONS.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = []
      }
      categories[permission.category].push(permission)
    })
    return categories
  }

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive'
    } as const

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role-Based Access Control</h2>
          <p className="text-gray-600">Manage user roles, permissions, and access controls</p>
        </div>
        <Button onClick={() => setShowCreateRole(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="audit">Access Audit</TabsTrigger>
        </TabsList>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-6">
          {/* Roles Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card key={role.id} className={`${role.isSystem ? 'border-blue-200 bg-blue-50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <CardDescription className="text-sm">{role.description}</CardDescription>
                      </div>
                    </div>
                    {role.isSystem && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300">
                        System
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Users: {role.userCount}</span>
                    <span>Permissions: {role.permissions.length}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setEditingRole(role)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {!role.isSystem && (
                      <Button
                        onClick={() => deleteRole(role.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Role Form */}
          {showCreateRole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Role
                </CardTitle>
                <CardDescription>Define a new role with specific permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Content Moderator"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleDescription">Description</Label>
                    <Input
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the role"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`new-${permission.id}`}
                                checked={newRole.permissions.includes(permission.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewRole(prev => ({
                                      ...prev,
                                      permissions: [...prev.permissions, permission.id]
                                    }))
                                  } else {
                                    setNewRole(prev => ({
                                      ...prev,
                                      permissions: prev.permissions.filter(p => p !== permission.id)
                                    }))
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`new-${permission.id}`} className="text-sm">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button onClick={createRole} disabled={loading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Create Role
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateRole(false)
                      setNewRole({ name: '', description: '', permissions: [] })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Role Modal */}
          {editingRole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Edit Role: {editingRole.name}
                </CardTitle>
                <CardDescription>Modify role permissions and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editRoleName">Role Name</Label>
                    <Input
                      id="editRoleName"
                      value={editingRole.name}
                      onChange={(e) => setEditingRole(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editRoleDescription">Description</Label>
                    <Input
                      id="editRoleDescription"
                      value={editingRole.description}
                      onChange={(e) => setEditingRole(prev => prev ? { ...prev, description: e.target.value } : null)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Permissions</Label>
                  <div className="mt-2 max-h-60 overflow-y-auto border rounded-lg p-4">
                    {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                      <div key={category} className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`edit-${permission.id}`}
                                checked={editingRole.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="rounded border-gray-300"
                              />
                              <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button onClick={updateRole} disabled={loading} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Update Role
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingRole(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts, roles, and access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(user.status)}
                          {user.mfaEnabled && (
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              MFA Enabled
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Last Login</p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <Select value={user.role} onValueChange={(value) => updateUserRole(user.id, value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={user.status} onValueChange={(value: User['status']) => updateUserStatus(user.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Audit Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Audit Trail
              </CardTitle>
              <CardDescription>Monitor user access and permission changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Role Permission Changes</span>
                    <Badge variant="outline">Last 30 days</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Track all changes to role permissions and user assignments
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">User Access Logs</span>
                    <Badge variant="outline">Real-time</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Monitor user login attempts, permission checks, and system access
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Security Events</span>
                    <Badge variant="outline">24/7 monitoring</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Track failed login attempts, suspicious activities, and security violations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
