'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  Save,
  X,
  TestTube,
  History,
  Filter,
  Star,
  MessageSquare,
  Clock,
  Zap
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  type: 'auto_approval' | 'spam_detection' | 'categorization';
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'regex';
  value: string;
  logical_operator?: 'AND' | 'OR';
}

interface RuleAction {
  type: 'approve' | 'reject' | 'categorize' | 'flag' | 'notify';
  value: string;
}

interface AutomationRulesManagerProps {
  userId: string;
}

const RULE_TYPES = [
  { value: 'auto_approval', label: 'Auto Approval', icon: CheckCircle, color: 'green' },
  { value: 'spam_detection', label: 'Spam Detection', icon: Shield, color: 'red' },
  { value: 'categorization', label: 'Smart Categorization', icon: Filter, color: 'blue' }
];

const CONDITION_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'text', label: 'Text Content' },
  { value: 'email', label: 'Email' },
  { value: 'rating', label: 'Rating' },
  { value: 'category', label: 'Category' },
  { value: 'created_at', label: 'Submission Date' },
  { value: 'text_length', label: 'Text Length' }
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'greater_than', label: 'Greater than' },
  { value: 'less_than', label: 'Less than' },
  { value: 'regex', label: 'Regex match' }
];

export function AutomationRulesManager({ userId }: AutomationRulesManagerProps) {
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'auto_approval' as AutomationRule['type'],
    conditions: [{ field: 'text', operator: 'contains', value: '', logical_operator: 'AND' }] as RuleCondition[],
    actions: [{ type: 'approve', value: '' }] as RuleAction[],
    priority: 1,
    enabled: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && userId) {
      fetchRules();
    }
  }, [userId, mounted]);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(
        `${backendUrl}/automation/rules/${userId}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch rules: ${response.status}`);
      }

      const data = await response.json();
      setRules(data.rules || []);
      
    } catch (error: any) {
      console.error('Error fetching rules:', error);
      toast({
        title: 'Error',
        description: `Failed to load automation rules: ${error.message}`,
        variant: 'destructive',
      });
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(
        `${backendUrl}/automation/rules`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            ...formData
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create rule: ${response.status}`);
      }

      await fetchRules();
      setShowCreateForm(false);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Automation rule created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to create rule: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRule = async () => {
    if (!editingRule) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(
        `${backendUrl}/automation/rules/${editingRule.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update rule: ${response.status}`);
      }

      await fetchRules();
      setEditingRule(null);
      resetForm();
      
      toast({
        title: 'Success',
        description: 'Automation rule updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update rule: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(
        `${backendUrl}/automation/rules/${ruleId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete rule: ${response.status}`);
      }

      await fetchRules();
      
      toast({
        title: 'Success',
        description: 'Automation rule deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to delete rule: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(
        `${backendUrl}/automation/rules/${ruleId}/toggle`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to toggle rule: ${response.status}`);
      }

      await fetchRules();
      
      toast({
        title: 'Success',
        description: `Rule ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to toggle rule: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'auto_approval',
      conditions: [{ field: 'text', operator: 'contains', value: '', logical_operator: 'AND' }],
      actions: [{ type: 'approve', value: '' }],
      priority: 1,
      enabled: true
    });
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'text', operator: 'contains', value: '', logical_operator: 'AND' }]
    }));
  };

  const removeCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateCondition = (index: number, field: keyof RuleCondition, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.map((condition, i) => 
        i === index ? { ...condition, [field]: value } : condition
      )
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: 'approve', value: '' }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const updateAction = (index: number, field: keyof RuleAction, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { ...action, [field]: value } : action
      )
    }));
  };

  const getRuleTypeInfo = (type: string) => {
    return RULE_TYPES.find(t => t.value === type) || RULE_TYPES[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!mounted) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automation Rules</h2>
          <p className="text-gray-600">Create rules to automatically process testimonials</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowLogs(!showLogs)}
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </Button>
          
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Rules Grid */}
      {rules.length === 0 ? (
        <Card className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No automation rules yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first automation rule to automatically process testimonials
          </p>
          <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create First Rule
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule) => {
            const typeInfo = getRuleTypeInfo(rule.type);
            const IconComponent = typeInfo.icon;
            
            return (
              <Card key={rule.id} className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 bg-${typeInfo.color}-100 rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 text-${typeInfo.color}-600`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {typeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => handleToggleRule(rule.id, enabled)}
                      />
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingRule(rule);
                          setFormData({
                            name: rule.name,
                            description: rule.description,
                            type: rule.type,
                            conditions: rule.conditions,
                            actions: rule.actions,
                            priority: rule.priority,
                            enabled: rule.enabled
                          });
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{rule.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">CONDITIONS</p>
                      <div className="space-y-1">
                        {rule.conditions.map((condition, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {condition.field} {condition.operator} "{condition.value}"
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">ACTIONS</p>
                      <div className="space-y-1">
                        {rule.actions.map((action, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            {action.type} {action.value}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Priority: {rule.priority}
                      </Badge>
                      <Badge variant={rule.enabled ? "default" : "secondary"} className="text-xs">
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      {formatDate(rule.updated_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Rule Modal */}
      {(showCreateForm || editingRule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {editingRule ? 'Edit Rule' : 'Create New Rule'}
              </h3>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingRule(null);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Auto-approve 5-star reviews"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Rule Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as AutomationRule['type'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this rule does..."
                  rows={3}
                />
              </div>
              
              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Conditions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {index > 0 && (
                        <Select
                          value={condition.logical_operator}
                          onValueChange={(value) => updateCondition(index, 'logical_operator', value)}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      
                      <Select
                        value={condition.field}
                        onValueChange={(value) => updateCondition(index, 'field', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_FIELDS.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(index, 'operator', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPERATORS.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={condition.value}
                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="flex-1"
                      />
                      
                      {formData.conditions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Actions</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addAction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Action
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Select
                        value={action.type}
                        onValueChange={(value) => updateAction(index, 'type', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approve">Approve</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                          <SelectItem value="categorize">Categorize</SelectItem>
                          <SelectItem value="flag">Flag</SelectItem>
                          <SelectItem value="notify">Notify</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Input
                        value={action.value}
                        onChange={(e) => updateAction(index, 'value', e.target.value)}
                        placeholder="Action value (e.g., category name)"
                        className="flex-1"
                      />
                      
                      {formData.actions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Priority */}
              <div>
                <Label htmlFor="priority">Priority (1-10, higher = more important)</Label>
                <Input
                  id="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-32"
                />
              </div>
              
              {/* Enabled */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
                />
                <Label htmlFor="enabled">Enable this rule</Label>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingRule(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              
              <Button
                onClick={editingRule ? handleUpdateRule : handleCreateRule}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
