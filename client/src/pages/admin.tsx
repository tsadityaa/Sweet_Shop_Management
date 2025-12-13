import { useState, useEffect } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Package, 
  DollarSign, 
  AlertTriangle,
  ShoppingBag,
  PackagePlus,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSweets } from '@/context/sweets-context';
import { useToast } from '@/hooks/use-toast';
import { SWEET_CATEGORIES } from '@/lib/types';
import type { Sweet } from '@/lib/types';
import { Header } from '@/components/header';
import { AdminTableSkeleton } from '@/components/loading-skeleton';

const sweetFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  category: z.string().min(1, 'Category is required'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Price must be a positive number'),
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Quantity must be a non-negative number'),
  description: z.string().min(1, 'Description is required').max(500, 'Description is too long'),
  image: z.string().url('Please enter a valid image URL'),
});

type SweetFormData = z.infer<typeof sweetFormSchema>;

const restockSchema = z.object({
  quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be a positive number'),
});

type RestockFormData = z.infer<typeof restockSchema>;

export default function Admin() {
  const { sweets, isLoading, error, addSweet, updateSweet, deleteSweet, restockSweet, refreshSweets } = useSweets();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [deletingSweet, setDeletingSweet] = useState<Sweet | null>(null);
  const [restockingSweetId, setRestockingSweetId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSweets = sweets.length;
  const lowStockCount = sweets.filter(s => s.stock > 0 && s.stock <= 5).length;
  const outOfStockCount = sweets.filter(s => s.stock === 0).length;
  const totalValue = sweets.reduce((sum, s) => {
    const price = typeof s.price === 'string' ? parseFloat(s.price) : s.price;
    return sum + (price * s.stock);
  }, 0);

  const form = useForm<SweetFormData>({
    resolver: zodResolver(sweetFormSchema),
    defaultValues: {
      name: '',
      category: '',
      price: '',
      quantity: '',
      description: '',
      image: '',
    },
  });

  const restockForm = useForm<RestockFormData>({
    resolver: zodResolver(restockSchema),
    defaultValues: {
      quantity: '',
    },
  });

  const openAddDialog = () => {
    form.reset({
      name: '',
      category: '',
      price: '',
      quantity: '',
      description: '',
      image: '',
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (sweet: Sweet) => {
    const price = typeof sweet.price === 'string' ? sweet.price : String(sweet.price);
    form.reset({
      name: sweet.name,
      category: sweet.category,
      price: price,
      quantity: String(sweet.stock),
      description: sweet.description,
      image: sweet.image,
    });
    setEditingSweet(sweet);
  };

  const handleAddSubmit = async (data: SweetFormData) => {
    setIsSubmitting(true);
    const result = await addSweet({
      name: data.name,
      category: data.category,
      price: Number(data.price),
      stock: Number(data.quantity),
      description: data.description,
      image: data.image,
    });
    setIsSubmitting(false);
    
    if (result.success) {
      setIsAddDialogOpen(false);
      toast({
        title: 'Sweet added!',
        description: `${data.name} has been added to the inventory.`,
      });
    } else {
      toast({
        title: 'Failed to add sweet',
        description: result.error || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const handleEditSubmit = async (data: SweetFormData) => {
    if (!editingSweet) return;
    setIsSubmitting(true);
    const result = await updateSweet(editingSweet.id, {
      name: data.name,
      category: data.category,
      price: Number(data.price),
      stock: Number(data.quantity),
      description: data.description,
      image: data.image,
    });
    setIsSubmitting(false);
    
    if (result.success) {
      setEditingSweet(null);
      toast({
        title: 'Sweet updated!',
        description: `${data.name} has been updated.`,
      });
    } else {
      toast({
        title: 'Failed to update sweet',
        description: result.error || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingSweet) return;
    setIsSubmitting(true);
    const result = await deleteSweet(deletingSweet.id);
    setIsSubmitting(false);
    
    if (result.success) {
      const deletedName = deletingSweet.name;
      setDeletingSweet(null);
      toast({
        title: 'Sweet deleted',
        description: `${deletedName} has been removed from inventory.`,
      });
    } else {
      toast({
        title: 'Failed to delete sweet',
        description: result.error || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const handleRestock = async (data: RestockFormData) => {
    if (!restockingSweetId) return;
    setIsSubmitting(true);
    const result = await restockSweet(restockingSweetId, Number(data.quantity));
    setIsSubmitting(false);
    
    if (result.success) {
      const sweet = sweets.find(s => s.id === restockingSweetId);
      setRestockingSweetId(null);
      restockForm.reset();
      toast({
        title: 'Restocked!',
        description: `${sweet?.name} has been restocked with ${data.quantity} units.`,
      });
    } else {
      toast({
        title: 'Restock failed',
        description: result.error || 'Something went wrong.',
        variant: 'destructive',
      });
    }
  };

  const SweetFormContent = ({ onSubmit, isEdit }: { onSubmit: (data: SweetFormData) => Promise<void>; isEdit: boolean }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Sweet name" {...field} data-testid="input-sweet-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SWEET_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} data-testid={`option-category-${cat}`}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} data-testid="input-price" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} data-testid="input-quantity" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-image" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the sweet..." 
                  className="resize-none" 
                  rows={3}
                  {...field} 
                  data-testid="textarea-description" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button type="submit" disabled={isSubmitting} data-testid={isEdit ? 'button-update-sweet' : 'button-add-sweet'}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              isEdit ? 'Update Sweet' : 'Add Sweet'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold" data-testid="text-admin-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your sweet shop inventory
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshSweets} disabled={isLoading} data-testid="button-refresh">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={openAddDialog} data-testid="button-add-new-sweet">
              <Plus className="h-4 w-4 mr-2" />
              Add Sweet
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 mb-6" data-testid="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sweets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-sweets">{totalSweets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500" data-testid="stat-low-stock">{lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
              <ShoppingBag className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive" data-testid="stat-out-of-stock">{outOfStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-inventory-value">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <AdminTableSkeleton />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sweet</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sweets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No sweets in inventory. Add your first sweet!
                        </TableCell>
                      </TableRow>
                    ) : sweets.map((sweet) => {
                      const price = typeof sweet.price === 'string' ? parseFloat(sweet.price) : sweet.price;
                      return (
                        <TableRow key={sweet.id} data-testid={`row-sweet-${sweet.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={sweet.image}
                                alt={sweet.name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                              <div>
                                <p className="font-medium" data-testid={`cell-name-${sweet.id}`}>{sweet.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" data-testid={`cell-category-${sweet.id}`}>{sweet.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right" data-testid={`cell-price-${sweet.id}`}>
                            ${price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {sweet.quantity === 0 ? (
                              <Badge variant="destructive" data-testid={`cell-stock-${sweet.id}`}>Out of Stock</Badge>
                            ) : sweet.quantity <= 5 ? (
                              <Badge className="bg-amber-500" data-testid={`cell-stock-${sweet.id}`}>{sweet.quantity} left</Badge>
                            ) : (
                              <span className="text-muted-foreground" data-testid={`cell-stock-${sweet.id}`}>{sweet.quantity}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setRestockingSweetId(sweet.id)}
                                data-testid={`button-restock-${sweet.id}`}
                              >
                                <PackagePlus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(sweet)}
                                data-testid={`button-edit-${sweet.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingSweet(sweet)}
                                className="text-destructive"
                                data-testid={`button-delete-${sweet.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Add New Sweet</DialogTitle>
            <DialogDescription>
              Add a new sweet to your inventory
            </DialogDescription>
          </DialogHeader>
          <SweetFormContent onSubmit={handleAddSubmit} isEdit={false} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingSweet} onOpenChange={(open) => !open && setEditingSweet(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Sweet</DialogTitle>
            <DialogDescription>
              Update the details for {editingSweet?.name}
            </DialogDescription>
          </DialogHeader>
          <SweetFormContent onSubmit={handleEditSubmit} isEdit={true} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingSweet} onOpenChange={(open) => !open && setDeletingSweet(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Delete Sweet</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingSweet?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingSweet(null)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} data-testid="button-confirm-delete">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restockingSweetId} onOpenChange={(open) => {
        if (!open) {
          setRestockingSweetId(null);
          restockForm.reset();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Restock Sweet</DialogTitle>
            <DialogDescription>
              Add stock to {sweets.find(s => s.id === restockingSweetId)?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...restockForm}>
            <form onSubmit={restockForm.handleSubmit(handleRestock)} className="space-y-4">
              <FormField
                control={restockForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity to Add</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter quantity" {...field} data-testid="input-restock-quantity" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} data-testid="button-confirm-restock">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Restock'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
