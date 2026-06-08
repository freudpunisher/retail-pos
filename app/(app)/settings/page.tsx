"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, Tag, Shield, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { useSettings } from "@/hooks/use-settings"
import { useCategories } from "@/hooks/use-products"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { settings, loading: settingsLoading, updateSettings } = useSettings()
  const { categories, loading: categoriesLoading, createCategory, deleteCategory } = useCategories()

  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuSaving, setMenuSaving] = useState(false)

  useEffect(() => {
    if (settings) {
      setStoreInfo({ ...settings })
    }
  }, [settings])

  const handleSaveStore = async () => {
    setIsSaving(true)
    try {
      await updateSettings(storeInfo)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddCategory = async () => {
    if (newCategory.name.trim()) {
      await createCategory(newCategory)
      setNewCategory({ name: "", description: "" })
      setShowAddCategory(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteCategory(id)
    }
  }

  const fetchMenuItems = async () => {
    setMenuLoading(true)
    try {
      const res = await fetch("/api/menus")
      if (res.ok) {
        const data = await res.json()
        setMenuItems(data)
      }
    } catch {} finally {
      setMenuLoading(false)
    }
  }

  const toggleMenuRole = (menuId: string, role: string) => {
    setMenuItems(prev => prev.map(m => {
      if (m.id !== menuId) return m
      const roles = m.roles || []
      const idx = roles.indexOf(role)
      if (idx >= 0) {
        return { ...m, roles: roles.filter((r: string) => r !== role) }
      }
      return { ...m, roles: [...roles, role] }
    }))
  }

  const saveMenuPermissions = async () => {
    setMenuSaving(true)
    try {
      await fetch("/api/menus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: menuItems.map(m => ({ id: m.id, roles: m.roles }))
        }),
      })
    } finally {
      setMenuSaving(false)
    }
  }

  useEffect(() => { fetchMenuItems() }, [])

  if (settingsLoading || !storeInfo) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your store configuration</p>
      </div>

      <Tabs defaultValue="store">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="menus">Menu Permissions</TabsTrigger>
        </TabsList>

        {/* Store Information */}
        <TabsContent value="store" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Store Information
              </CardTitle>
              <CardDescription>Update your store details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeInfo.name}
                    onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={storeInfo.phone}
                    onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={storeInfo.email}
                    onChange={(e) => setStoreInfo({ ...storeInfo, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={storeInfo.currency}
                    onValueChange={(value) => {
                      const symbolMap: Record<string, string> = {
                        USD: "$",
                        EUR: "€",
                        GBP: "£",
                        FBU: "FBU ",
                      }
                      setStoreInfo({ ...storeInfo, currency: value, currencySymbol: symbolMap[value] || value })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="FBU">FBU (FBU)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={storeInfo.address}
                  onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={storeInfo.taxRate}
                    onChange={(e) => setStoreInfo({ ...storeInfo, taxRate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveStore} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Product Categories
                </CardTitle>
                <CardDescription>Manage product categories</CardDescription>
              </div>
              <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogDescription>Create a new product category</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Category Name</Label>
                      <Input
                        placeholder="Enter category name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="Enter description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddCategory}>Add Category</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">ID</TableHead>
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Description</TableHead>
                      <TableHead className="text-muted-foreground w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoriesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <TableRow key={category.id} className="border-border">
                          <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{category.id}</TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-muted-foreground">{category.description || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menu Permissions */}
        <TabsContent value="menus" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Menu Permissions
                  </CardTitle>
                  <CardDescription>Control which roles can see each menu item</CardDescription>
                </div>
                <Button
                  onClick={saveMenuPermissions}
                  disabled={menuSaving}
                  className="gap-2"
                >
                  {menuSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
                      <TableHead className="text-muted-foreground">Menu Item</TableHead>
                      <TableHead className="text-muted-foreground">Admin</TableHead>
                      <TableHead className="text-muted-foreground">Manager</TableHead>
                      <TableHead className="text-muted-foreground">Cashier</TableHead>
                      <TableHead className="text-muted-foreground">Waiter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
                    ) : menuItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No menu items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      menuItems.map((item) => {
                        const roles: string[] = item.roles || []
                        return (
                          <TableRow key={item.id} className="border-border">
                            <TableCell className="font-medium">{item.label}</TableCell>
                            {["admin", "manager", "cashier", "waiter"].map((role) => (
                              <TableCell key={role}>
                                <Button
                                  variant={roles.includes(role) ? "default" : "outline"}
                                  size="sm"
                                  className={cn(
                                    "h-7 w-7 p-0",
                                    roles.includes(role)
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground border-border"
                                  )}
                                  onClick={() => toggleMenuRole(item.id, role)}
                                >
                                  {roles.includes(role) ? "✓" : "—"}
                                </Button>
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
