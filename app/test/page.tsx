'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function TestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    const tests: TestResult[] = [
      { name: 'Supabase Connection', status: 'pending' },
      { name: 'Credits API', status: 'pending' },
      { name: 'Feedback API', status: 'pending' },
      { name: 'Generate API (Mock)', status: 'pending' },
    ];

    setResults([...tests]);

    // Test 1: Supabase Connection
    try {
      const response = await fetch('/api/credits?user_id=test-user');
      if (response.ok) {
        tests[0].status = 'success';
        tests[0].message = 'Supabase connection successful';
        tests[0].data = await response.json();
      } else {
        tests[0].status = 'error';
        tests[0].message = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      tests[0].status = 'error';
      tests[0].message = error instanceof Error ? error.message : 'Unknown error';
    }
    setResults([...tests]);

    // Test 2: Credits API
    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'test-user', amount: 100 }),
      });
      if (response.ok) {
        tests[1].status = 'success';
        tests[1].message = 'Credits API working';
        tests[1].data = await response.json();
      } else {
        tests[1].status = 'error';
        tests[1].message = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      tests[1].status = 'error';
      tests[1].message = error instanceof Error ? error.message : 'Unknown error';
    }
    setResults([...tests]);

    // Test 3: Feedback API
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: 'test-user', 
          content: 'Test feedback message',
          meta: { test: true }
        }),
      });
      if (response.ok) {
        tests[2].status = 'success';
        tests[2].message = 'Feedback API working';
        tests[2].data = await response.json();
      } else {
        tests[2].status = 'error';
        tests[2].message = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      tests[2].status = 'error';
      tests[2].message = error instanceof Error ? error.message : 'Unknown error';
    }
    setResults([...tests]);

    // Test 4: Generate API (Mock - will fail without OpenRouter key)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: 'test-user', 
          prompt: 'Test prompt',
          images: []
        }),
      });
      if (response.ok) {
        tests[3].status = 'success';
        tests[3].message = 'Generate API working';
        tests[3].data = await response.json();
      } else {
        const errorData = await response.json();
        if (response.status === 500 && errorData.error?.includes('OPENROUTER_API_KEY')) {
          tests[3].status = 'error';
          tests[3].message = 'OpenRouter API key not configured (expected)';
        } else {
          tests[3].status = 'error';
          tests[3].message = `HTTP ${response.status}: ${errorData.error || response.statusText}`;
        }
      }
    } catch (error) {
      tests[3].status = 'error';
      tests[3].message = error instanceof Error ? error.message : 'Unknown error';
    }
    setResults([...tests]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">API Test Suite</h1>
          <p className="text-muted-foreground">
            Test all API endpoints and connections
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                'Run All Tests'
              )}
            </Button>

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <p className="font-medium">{result.name}</p>
                        {result.message && (
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>
            )}

            {results.length === 0 && !isRunning && (
              <Alert>
                <AlertDescription>
                  Click "Run All Tests" to test your API endpoints and connections.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Supabase Setup</h4>
              <p className="text-sm text-muted-foreground">
                Run the SQL script in <code>supabase/schema.sql</code> in your Supabase dashboard.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">2. OpenRouter API Key</h4>
              <p className="text-sm text-muted-foreground">
                Get your API key from <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenRouter</a> and add it to <code>.env.local</code>.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">3. Test the APIs</h4>
              <p className="text-sm text-muted-foreground">
                Use the test suite above to verify all connections are working.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
