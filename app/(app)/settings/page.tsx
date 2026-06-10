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
<<<<<<< HEAD
import { Store, Tag, Percent, Plus, Trash2, Save, Loader2, Ruler, Pencil, Search } from "lucide-react"
import Swal from "sweetalert2"
import { useSettings } from "@/hooks/use-settings"
import { useCategories } from "@/hooks/use-products"
import { UserManagement } from "@/components/user-management"
import { useUnits } from "@/hooks/use-units"

export default function SettingsPage() {
  const { settings, loading: settingsLoading, updateSettings } = useSettings()
  const { categories, loading: categoriesLoading, createCategory, deleteCategory, updateCategory } = useCategories()
  const { units, loading: unitsLoading, createUnit, deleteUnit, updateUnit } = useUnits()

  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [newCategory, setNewCategory] = useState({ name: "", description: "" })
  const [newUnit, setNewUnit] = useState({ code: "", name: "", symbol: "" })
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddUnit, setShowAddUnit] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [categoryPage, setCategoryPage] = useState(1)
  const [categoryPageSize, setCategoryPageSize] = useState(10)
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [editCategory, setEditCategory] = useState<{ id: string; name: string; description: string } | null>(null)
  const [showEditUnit, setShowEditUnit] = useState(false)
  const [editUnit, setEditUnit] = useState<{ id: string; code: string; name: string; symbol: string } | null>(null)
=======
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
>>>>>>> origin/alimentation
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
      try {
        await createCategory(newCategory)
        setNewCategory({ name: "", description: "" })
        setShowAddCategory(false)
        await Swal.fire({
          icon: "success",
          title: "Category added",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Failed to add category",
        })
      }
    }
  }

  const handleDeleteCategory = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete category?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    })

    if (result.isConfirmed) {
      try {
        await deleteCategory(id)
        await Swal.fire({
          icon: "success",
          title: "Category deleted",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Failed to delete category",
        })
      }
    }
  }

<<<<<<< HEAD
  const filteredCategories = categories.filter((category) => {
    const searchValue = categorySearch.trim().toLowerCase()
    if (!searchValue) return true
    const name = category.name?.toLowerCase() ?? ""
    const description = category.description?.toLowerCase() ?? ""
    return name.includes(searchValue) || description.includes(searchValue)
  })
  const categoryTotalPages = Math.max(1, Math.ceil(filteredCategories.length / categoryPageSize))
  const categoryCurrentPage = Math.min(categoryPage, categoryTotalPages)
  const paginatedCategories = filteredCategories.slice(
    (categoryCurrentPage - 1) * categoryPageSize,
    categoryCurrentPage * categoryPageSize,
  )

  const handleCategorySearchChange = (value: string) => {
    setCategorySearch(value)
    setCategoryPage(1)
  }

  const handleCategoryPageSizeChange = (value: string) => {
    const nextSize = Number(value)
    setCategoryPageSize(nextSize)
    setCategoryPage(1)
  }

  const handleStartEditCategory = (category: any) => {
    setEditCategory({
      id: category.id,
      name: category.name ?? "",
      description: category.description ?? "",
    })
    setShowEditCategory(true)
  }

  const handleUpdateCategory = async () => {
    if (!editCategory) return
    if (editCategory.name.trim()) {
      try {
        await updateCategory(editCategory.id, {
          name: editCategory.name,
          description: editCategory.description,
        })
        setShowEditCategory(false)
        setEditCategory(null)
        await Swal.fire({
          icon: "success",
          title: "Category updated",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Failed to update category",
        })
      }
    }
  }

  const handleAddUnit = async () => {
    if (newUnit.code.trim() && newUnit.name.trim()) {
      try {
        await createUnit(newUnit)
        setNewUnit({ code: "", name: "", symbol: "" })
        setShowAddUnit(false)
        await Swal.fire({
          icon: "success",
          title: "Unit added",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Failed to add unit",
        })
      }
    }
  }

  const handleDeleteUnit = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete unit?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    })

    if (result.isConfirmed) {
      try {
        await deleteUnit(id)
        await Swal.fire({
          icon: "success",
          title: "Unit deleted",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Failed to delete unit",
        })
      }
    }
  }

  const handleStartEditUnit = (unit: any) => {
    setEditUnit({
      id: unit.id,
      code: unit.code ?? "",
      name: unit.name ?? "",
      symbol: unit.symbol ?? "",
    })
    setShowEditUnit(true)
  }

  const handleUpdateUnit = async () => {
    if (!editUnit) return
    if (editUnit.code.trim() && editUnit.name.trim()) {
      try {
        await updateUnit(editUnit.id, {
          code: editUnit.code,
          name: editUnit.name,
          symbol: editUnit.symbol,
        })
        setShowEditUnit(false)
        setEditUnit(null)
        await Swal.fire({
          icon: "success",
          title: "Unit updated",
          timer: 1500,
          showConfirmButton: false,
        })
      } catch {
        await Swal.fire({
          icon: "error",
          title: "Failed to update unit",
        })
      }
=======
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
>>>>>>> origin/alimentation
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
<<<<<<< HEAD
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
          <TabsTrigger value="tax">Tax & Discounts</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
=======
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="menus">Menu Permissions</TabsTrigger>
>>>>>>> origin/alimentation
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
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Product Categories
                </CardTitle>
                <CardDescription>Manage product categories</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => handleCategorySearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={String(categoryPageSize)} onValueChange={handleCategoryPageSizeChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 rows</SelectItem>
                    <SelectItem value="20">20 rows</SelectItem>
                    <SelectItem value="50">50 rows</SelectItem>
                  </SelectContent>
                </Select>
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
              </div>
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
                    ) : paginatedCategories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No categories found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCategories.map((category) => (
                        <TableRow key={category.id} className="border-border">
                          <TableCell className="font-mono text-xs overflow-hidden text-ellipsis block max-w-[100px]">{category.id}</TableCell>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="text-muted-foreground">{category.description || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                title="Edit category"
                                aria-label="Edit category"
                                onClick={() => handleStartEditCategory(category)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
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
              <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(categoryCurrentPage - 1) * categoryPageSize + 1}-
                  {Math.min(categoryCurrentPage * categoryPageSize, filteredCategories.length)} of {filteredCategories.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryPage((p) => Math.max(1, p - 1))}
                    disabled={categoryCurrentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {categoryCurrentPage} of {categoryTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCategoryPage((p) => Math.min(categoryTotalPages, p + 1))}
                    disabled={categoryCurrentPage === categoryTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Dialog
            open={showEditCategory}
            onOpenChange={(open) => {
              setShowEditCategory(open)
              if (!open) setEditCategory(null)
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogDescription>Update category details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g. Bakery"
                    value={editCategory?.name ?? ""}
                    onChange={(e) =>
                      setEditCategory((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Input
                    placeholder="Category description"
                    value={editCategory?.description ?? ""}
                    onChange={(e) =>
                      setEditCategory((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditCategory(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCategory}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
<<<<<<< HEAD
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Discount Settings</CardTitle>
              <CardDescription>Configure discount options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Allow Line Item Discounts</p>
                  <p className="text-sm text-muted-foreground">Enable discounts on individual items</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Allow Order Level Discounts</p>
                  <p className="text-sm text-muted-foreground">Enable discounts on entire orders</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Require Manager Approval</p>
                  <p className="text-sm text-muted-foreground">Require manager approval for discounts over 20%</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units */}
        <TabsContent value="units" className="mt-4">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Measurement Units
                </CardTitle>
                <CardDescription>Manage product measurement units</CardDescription>
              </div>
              <Dialog open={showAddUnit} onOpenChange={setShowAddUnit}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Unit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Unit</DialogTitle>
                    <DialogDescription>Create a new measurement unit</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input
                        placeholder="e.g. kg"
                        value={newUnit.code}
                        onChange={(e) => setNewUnit({ ...newUnit, code: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        placeholder="e.g. Kilogramme"
                        value={newUnit.name}
                        onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Symbol (optional)</Label>
                      <Input
                        placeholder="e.g. kg"
                        value={newUnit.symbol}
                        onChange={(e) => setNewUnit({ ...newUnit, symbol: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddUnit(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUnit}>Add Unit</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
=======
>>>>>>> origin/alimentation
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border">
<<<<<<< HEAD
                      <TableHead className="text-muted-foreground">Code</TableHead>
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Symbol</TableHead>
                      <TableHead className="text-muted-foreground w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unitsLoading ? (
=======
                      <TableHead className="text-muted-foreground">Menu Item</TableHead>
                      <TableHead className="text-muted-foreground">Admin</TableHead>
                      <TableHead className="text-muted-foreground">Manager</TableHead>
                      <TableHead className="text-muted-foreground">Cashier</TableHead>
                      <TableHead className="text-muted-foreground">Waiter</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuLoading ? (
>>>>>>> origin/alimentation
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                        </TableCell>
                      </TableRow>
<<<<<<< HEAD
                    ) : units.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No units found
                        </TableCell>
                      </TableRow>
                    ) : (
                      units.map((unit) => (
                        <TableRow key={unit.id} className="border-border">
                          <TableCell className="font-mono text-xs">{unit.code}</TableCell>
                          <TableCell className="font-medium">{unit.name}</TableCell>
                          <TableCell className="text-muted-foreground">{unit.symbol || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground"
                                title="Edit unit"
                                aria-label="Edit unit"
                                onClick={() => handleStartEditUnit(unit)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => handleDeleteUnit(unit.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
=======
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
>>>>>>> origin/alimentation
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <Dialog
            open={showEditUnit}
            onOpenChange={(open) => {
              setShowEditUnit(open)
              if (!open) setEditUnit(null)
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Unit</DialogTitle>
                <DialogDescription>Update measurement unit details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    placeholder="e.g. kg"
                    value={editUnit?.code ?? ""}
                    onChange={(e) =>
                      setEditUnit((prev) => (prev ? { ...prev, code: e.target.value } : prev))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g. Kilogramme"
                    value={editUnit?.name ?? ""}
                    onChange={(e) =>
                      setEditUnit((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Symbol (optional)</Label>
                  <Input
                    placeholder="e.g. kg"
                    value={editUnit?.symbol ?? ""}
                    onChange={(e) =>
                      setEditUnit((prev) => (prev ? { ...prev, symbol: e.target.value } : prev))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditUnit(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUnit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Users & Roles */}
        <TabsContent value="users" className="mt-4">
          <UserManagement />
        </TabsContent>

      </Tabs>
    </div>
  )
}
