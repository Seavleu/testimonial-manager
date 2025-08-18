'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { PersonalMessageManager } from '@/components/dashboard/personal-message-manager';
import { 
  Copy, 
  ExternalLink, 
  Search, 
  Video, 
  CheckCircle, 
  X, 
  MoreHorizontal,
  Filter,
  SortAsc,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
  User,
  Star,
  Clock,
  AlertCircle,
  Download,
  CheckSquare,
  Square,
  Settings,
  FileText,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  text: string;
  video_url: string | null;
  approved: boolean;
  created_at: string;
  rating?: number;
  category?: string;
  email?: string;
  photo_url?: string | null;
}

interface TestimonialsTableProps {
  userId: string;
}

export function TestimonialsTable({ userId }: TestimonialsTableProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Bulk operations state
  const [selectedTestimonials, setSelectedTestimonials] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);
  const [bulkActionProgress, setBulkActionProgress] = useState(0);
  const [currentBulkAction, setCurrentBulkAction] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && userId) {
      fetchTestimonials();
    }
  }, [userId, mounted]);

  useEffect(() => {
    let filtered = testimonials;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(testimonial =>
      testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    }

    // Apply status filter
    if (filter === 'approved') {
      filtered = filtered.filter(t => t.approved);
    } else if (filter === 'pending') {
      filtered = filtered.filter(t => !t.approved);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = (a.approved ? 1 : 0) - (b.approved ? 1 : 0);
          break;
        case 'date':
        default:
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    setFilteredTestimonials(filtered);
  }, [testimonials, searchTerm, filter, sortBy, sortOrder]);

  // Update select all when filtered testimonials change
  useEffect(() => {
    const allSelected = filteredTestimonials.length > 0 && 
      filteredTestimonials.every(t => selectedTestimonials.has(t.id));
    setSelectAll(allSelected);
  }, [filteredTestimonials, selectedTestimonials]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      console.log('Fetching testimonials from:', `${backendUrl}/testimonials/${userId}`);
      
      const response = await fetch(
        `${backendUrl}/testimonials/${userId}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch testimonials: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      // Handle different response formats
      const testimonialsData = data.testimonials || data || [];
      setTestimonials(Array.isArray(testimonialsData) ? testimonialsData : []);
      
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: 'Error',
        description: `Failed to load testimonials: ${error.message}`,
        variant: 'destructive',
      });
      // Set empty array on error to stop loading state
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  // Bulk operations functions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredTestimonials.map(t => t.id));
      setSelectedTestimonials(allIds);
    } else {
      setSelectedTestimonials(new Set());
    }
  };

  const handleSelectTestimonial = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTestimonials);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTestimonials(newSelected);
  };

  const handleBulkApprove = async () => {
    if (selectedTestimonials.size === 0) return;
    
    if (!confirm(`Are you sure you want to approve ${selectedTestimonials.size} testimonial(s)?`)) return;

    setBulkActionInProgress(true);
    setCurrentBulkAction('Approving testimonials...');
    setBulkActionProgress(0);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const selectedArray = Array.from(selectedTestimonials);
      
      for (let i = 0; i < selectedArray.length; i++) {
        const id = selectedArray[i];
        const response = await fetch(
          `${backendUrl}/testimonials/${id}/approve`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to approve testimonial ${id}`);
        }

        setBulkActionProgress(((i + 1) / selectedArray.length) * 100);
      }

      // Update local state
      setTestimonials(prev =>
        prev.map(t => 
          selectedTestimonials.has(t.id) ? { ...t, approved: true } : t
        )
      );

      setSelectedTestimonials(new Set());
      
      toast({
        title: 'Success',
        description: `Successfully approved ${selectedArray.length} testimonial(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to approve testimonials: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setBulkActionInProgress(false);
      setCurrentBulkAction('');
      setBulkActionProgress(0);
    }
  };

  const handleBulkReject = async () => {
    if (selectedTestimonials.size === 0) return;
    
    if (!confirm(`Are you sure you want to reject ${selectedTestimonials.size} testimonial(s)?`)) return;

    setBulkActionInProgress(true);
    setCurrentBulkAction('Rejecting testimonials...');
    setBulkActionProgress(0);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const selectedArray = Array.from(selectedTestimonials);
      
      for (let i = 0; i < selectedArray.length; i++) {
        const id = selectedArray[i];
        const response = await fetch(
          `${backendUrl}/testimonials/${id}/reject`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to reject testimonial ${id}`);
        }

        setBulkActionProgress(((i + 1) / selectedArray.length) * 100);
      }

      // Update local state
      setTestimonials(prev =>
        prev.map(t => 
          selectedTestimonials.has(t.id) ? { ...t, approved: false } : t
        )
      );

      setSelectedTestimonials(new Set());
      
      toast({
        title: 'Success',
        description: `Successfully rejected ${selectedArray.length} testimonial(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to reject testimonials: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setBulkActionInProgress(false);
      setCurrentBulkAction('');
      setBulkActionProgress(0);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTestimonials.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedTestimonials.size} testimonial(s)? This action cannot be undone.`)) return;

    setBulkActionInProgress(true);
    setCurrentBulkAction('Deleting testimonials...');
    setBulkActionProgress(0);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const selectedArray = Array.from(selectedTestimonials);
      
      for (let i = 0; i < selectedArray.length; i++) {
        const id = selectedArray[i];
        const response = await fetch(
          `${backendUrl}/testimonials/${id}`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete testimonial ${id}`);
        }

        setBulkActionProgress(((i + 1) / selectedArray.length) * 100);
      }

      // Update local state
      setTestimonials(prev => prev.filter(t => !selectedTestimonials.has(t.id)));
      setSelectedTestimonials(new Set());
      
      toast({
        title: 'Success',
        description: `Successfully deleted ${selectedArray.length} testimonial(s)`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete testimonials: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setBulkActionInProgress(false);
      setCurrentBulkAction('');
      setBulkActionProgress(0);
    }
  };

  const handleBulkExport = async (format: 'csv' | 'json' | 'excel') => {
    if (selectedTestimonials.size === 0) return;

    setBulkActionInProgress(true);
    setCurrentBulkAction(`Exporting to ${format.toUpperCase()}...`);
    setBulkActionProgress(0);

    try {
      const selectedTestimonialsData = testimonials.filter(t => selectedTestimonials.has(t.id));
      
      let content = '';
      let filename = `testimonials-${format}-${new Date().toISOString().split('T')[0]}`;
      let mimeType = '';

      switch (format) {
        case 'csv':
          content = generateCSV(selectedTestimonialsData);
          filename += '.csv';
          mimeType = 'text/csv';
          break;
        case 'json':
          content = JSON.stringify(selectedTestimonialsData, null, 2);
          filename += '.json';
          mimeType = 'application/json';
          break;
        case 'excel':
          content = generateCSV(selectedTestimonialsData); // For now, using CSV format
          filename += '.csv';
          mimeType = 'text/csv';
          break;
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setBulkActionProgress(100);
      
      toast({
        title: 'Export Successful',
        description: `Exported ${selectedTestimonialsData.length} testimonials to ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: `Failed to export testimonials: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setBulkActionInProgress(false);
      setCurrentBulkAction('');
      setBulkActionProgress(0);
    }
  };

  const generateCSV = (testimonials: Testimonial[]): string => {
    const headers = ['ID', 'Name', 'Text', 'Rating', 'Category', 'Email', 'Approved', 'Created At', 'Video URL', 'Photo URL'];
    const rows = testimonials.map(t => [
      t.id,
      `"${t.name.replace(/"/g, '""')}"`,
      `"${t.text.replace(/"/g, '""')}"`,
      t.rating || '',
      t.category || '',
      t.email || '',
      t.approved ? 'Yes' : 'No',
      t.created_at,
      t.video_url || '',
      t.photo_url || ''
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };
  
  const handleApprove = async (id: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(
        `${backendUrl}/testimonials/${id}/approve`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve testimonial: ${response.status}`);
      }

      setTestimonials(prev =>
        prev.map(t => (t.id === id ? { ...t, approved: true } : t))
      );

      toast({
        title: 'Success',
        description: 'Testimonial approved successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to approve testimonial: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(
        `${backendUrl}/testimonials/${id}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete testimonial: ${response.status}`);
      }

      setTestimonials(prev => prev.filter(t => t.id !== id));

      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const copyCollectionLink = () => {
    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/collect?userId=${userId}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link);
      toast({
        title: 'Link Copied!',
        description: 'Collection link copied to clipboard',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
      return `${Math.floor(diffInHours / 168)}w ago`;
    } catch {
      return 'Unknown';
    }
  };

  const approvedCount = testimonials.filter(t => t.approved).length;
  const pendingCount = testimonials.filter(t => !t.approved).length;

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center text-2xl">
              <MessageSquare className="h-6 w-6 mr-2 text-blue-600" />
              Testimonials
            </CardTitle>
            <CardDescription>
              Manage and review your customer testimonials
            </CardDescription>
      </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={copyCollectionLink}
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            
            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <div className="space-y-1 w-4 h-4">
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                  <div className="bg-current rounded-sm h-0.5"></div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{testimonials.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-2xl font-bold text-orange-900">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">With Videos</p>
                <p className="text-2xl font-bold text-purple-900">
                  {testimonials.filter(t => t.video_url).length}
                </p>
              </div>
              <Video className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedTestimonials.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedTestimonials.size} selected
                </Badge>
                <span className="text-sm text-blue-700">
                  {currentBulkAction || 'Select an action to perform'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleBulkApprove}
                  disabled={bulkActionInProgress}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve All
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkReject}
                  disabled={bulkActionInProgress}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject All
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkExport('csv')}
                  disabled={bulkActionInProgress}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Export CSV
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkExport('json')}
                  disabled={bulkActionInProgress}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  <FileJson className="h-4 w-4 mr-1" />
                  Export JSON
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBulkDelete}
                  disabled={bulkActionInProgress}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete All
                </Button>
              </div>
            </div>
            
            {bulkActionInProgress && (
              <div className="mt-3">
                <Progress value={bulkActionProgress} className="h-2" />
                <p className="text-xs text-blue-600 mt-1">{Math.round(bulkActionProgress)}% complete</p>
              </div>
            )}
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search testimonials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All ({testimonials.length})</option>
              <option value="approved">Approved ({approvedCount})</option>
              <option value="pending">Pending ({pendingCount})</option>
            </select>
            
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy as any);
                setSortOrder(newSortOrder as any);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="status-asc">Status</option>
            </select>
          </div>
        </div>

        {/* Testimonials Display */}
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'No testimonials found' : 'No testimonials yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start collecting testimonials by sharing your collection link'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <Button onClick={copyCollectionLink} className="bg-blue-600 hover:bg-blue-700">
                <Copy className="h-4 w-4 mr-2" />
                Copy Collection Link
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedTestimonials.has(testimonial.id)}
                        onCheckedChange={(checked) => handleSelectTestimonial(testimonial.id, checked as boolean)}
                        className="mr-3"
                      />
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-gray-900">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{getTimeAgo(testimonial.created_at)}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={testimonial.approved ? "default" : "secondary"}
                      className={testimonial.approved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                    >
                      {testimonial.approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-4 line-clamp-3">&ldquo;{testimonial.text}&rdquo;</p>
                  
                  {testimonial.video_url && (
                    <div className="flex items-center text-sm text-blue-600 mb-4">
                      <Video className="h-4 w-4 mr-1" />
                      Video testimonial available
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{formatDate(testimonial.created_at)}</p>
                    
                    <div className="flex items-center gap-2">
                      {!testimonial.approved && (
                <Button 
                          size="sm"
                          onClick={() => handleApprove(testimonial.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                </Button>
              )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
            </CardContent>
          </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* List Header with Select All */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({filteredTestimonials.length})
              </span>
            </div>
            
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                  <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <Checkbox
                          checked={selectedTestimonials.has(testimonial.id)}
                          onCheckedChange={(checked) => handleSelectTestimonial(testimonial.id, checked as boolean)}
                        />
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {testimonial.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-500">{formatDate(testimonial.created_at)} • {getTimeAgo(testimonial.created_at)}</p>
                        </div>
                        <Badge 
                          variant={testimonial.approved ? "default" : "secondary"}
                          className={testimonial.approved ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                        >
                          {testimonial.approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-700 mb-3">&ldquo;{testimonial.text}&rdquo;</p>
                      
                      {testimonial.video_url && (
                        <div className="flex items-center text-sm text-blue-600 mb-3">
                          <Video className="h-4 w-4 mr-1" />
                          Video testimonial available
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                    {!testimonial.approved && (
                        <Button
                          size="sm"
                          onClick={() => handleApprove(testimonial.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
                  </div>
                )}
              </CardContent>
            </Card>
  );
}