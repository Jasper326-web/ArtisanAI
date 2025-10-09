'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface APIKeyTestResult {
  keyIndex: number;
  status: 'success' | 'error' | 'warning';
  message: string;
  errorType?: string;
  hasImage: boolean;
  hasText: boolean;
}

interface APIKeyStatus {
  totalKeys: number;
  availableKeys: number;
  failedKeys: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
}

export default function APIKeyStatusPage() {
  const [testResults, setTestResults] = useState<APIKeyTestResult[]>([]);
  const [status, setStatus] = useState<APIKeyStatus | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnosis = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/test-api-keys');
      const data = await response.json();
      
      if (data.success) {
        setTestResults(data.testResults);
        setStatus(data.summary);
        setRecommendations(data.recommendations);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('诊断请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnosis();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">正常</Badge>;
      case 'error':
        return <Badge variant="destructive">错误</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">警告</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">API Key 诊断工具</h1>
            <p className="text-muted-foreground mt-2">
              检查所有API Key的状态和使用情况
            </p>
          </div>
          <Button 
            onClick={runDiagnosis} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '诊断中...' : '重新诊断'}
          </Button>
        </div>

        {error && (
          <Alert className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总API Key数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{status.totalKeys}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">可用Key数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{status.availableKeys}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">失败Key数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{status.failedKeys}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>诊断建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>详细测试结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result) => (
                  <div key={result.keyIndex} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">API Key {result.keyIndex}</div>
                        <div className="text-sm text-muted-foreground">{result.message}</div>
                        {result.errorType && (
                          <div className="text-xs text-red-500 mt-1">
                            错误类型: {result.errorType}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      {result.hasImage && (
                        <Badge variant="outline" className="text-xs">有图像</Badge>
                      )}
                      {result.hasText && (
                        <Badge variant="outline" className="text-xs">有文本</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
