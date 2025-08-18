'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { AutomationRulesManager } from '@/components/dashboard/automation-rules-manager';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Zap, 
  Shield, 
  CheckCircle, 
  Filter,
  ArrowLeft,
  BarChart3,
  Clock,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function AutomationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    rulesExecuted: 0,
    automationRate: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user?.id) {
      fetchAutomationStats();
    }
  }, [mounted, user?.id]);

  const fetchAutomationStats = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(
        `${backendUrl}/automation/stats/${user?.id}`,
        { 
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching automation stats:', error);
      // Use default stats if API is not available yet
      setStats({
        totalRules: 0,
        activeRules: 0,
        rulesExecuted: 0,
        automationRate: 0
      });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Automation Rules
              </h1>
              <p className="text-gray-600 text-lg">
                Create intelligent rules to automatically process and manage testimonials
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  User ID: {user?.id || 'Not logged in'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {stats.activeRules} active rules
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4 lg:mt-0">
              <Link href="/dashboard/analytics">
                <Button variant="outline" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Rules</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalRules}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Rules</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activeRules}</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Rules Executed</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.rulesExecuted}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Automation Rate</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.automationRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rule Types Overview */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Rule Types
            </CardTitle>
            <CardDescription>
              Different types of automation rules you can create
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto Approval</h3>
                <p className="text-gray-600 text-sm">
                  Automatically approve testimonials that meet specific criteria
                </p>
              </div>
              
              <div className="text-center p-6 bg-red-50 rounded-lg">
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Spam Detection</h3>
                <p className="text-gray-600 text-sm">
                  Identify and flag potentially spammy or inappropriate content
                </p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <Filter className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Categorization</h3>
                <p className="text-gray-600 text-sm">
                  Automatically categorize testimonials based on content and ratings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automation Rules Manager */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <AutomationRulesManager userId={user?.id || ''} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
