"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi, WifiOff, Globe, Clock } from 'lucide-react'
import { NetworkMonitor } from '@/lib/network-utils'

interface NetworkTest {
  name: string
  status: 'pending' | 'success' | 'error' | 'running'
  message: string
  duration?: number
}

export function NetworkDiagnostics() {
  const [isOpen, setIsOpen] = useState(false)
  const [tests, setTests] = useState<NetworkTest[]>([
    { name: '网络连接', status: 'pending', message: '检查网络连接状态' },
    { name: 'DNS 解析', status: 'pending', message: '测试域名解析' },
    { name: 'API 连接', status: 'pending', message: '测试 API 服务器连接' },
    { name: '响应时间', status: 'pending', message: '测量网络延迟' }
  ])
  const [isRunning, setIsRunning] = useState(false)
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine)

  useEffect(() => {
    const networkMonitor = NetworkMonitor.getInstance()
    const removeListener = networkMonitor.addListener((isOnline) => {
      setNetworkStatus(isOnline)
    })
    
    return () => {
      removeListener()
    }
  }, [])

  const runDiagnostics = async () => {
    setIsRunning(true)
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: '等待测试...' })))

    // 测试 1: 网络连接
    setTests(prev => prev.map((test, index) => 
      index === 0 ? { ...test, status: 'running', message: '检查网络连接...' } : test
    ))
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setTests(prev => prev.map((test, index) => 
      index === 0 ? { 
        ...test, 
        status: networkStatus ? 'success' : 'error', 
        message: networkStatus ? '网络连接正常' : '网络连接断开'
      } : test
    ))

    // 测试 2: DNS 解析
    setTests(prev => prev.map((test, index) => 
      index === 1 ? { ...test, status: 'running', message: '测试 DNS 解析...' } : test
    ))
    
    const dnsStart = Date.now()
    try {
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      })
      const dnsDuration = Date.now() - dnsStart
      setTests(prev => prev.map((test, index) => 
        index === 1 ? { 
          ...test, 
          status: 'success', 
          message: `DNS 解析正常 (${dnsDuration}ms)`,
          duration: dnsDuration
        } : test
      ))
    } catch (error) {
      setTests(prev => prev.map((test, index) => 
        index === 1 ? { 
          ...test, 
          status: 'error', 
          message: 'DNS 解析失败'
        } : test
      ))
    }

    // 测试 3: API 连接
    setTests(prev => prev.map((test, index) => 
      index === 2 ? { ...test, status: 'running', message: '测试 API 连接...' } : test
    ))
    
    const apiStart = Date.now()
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache'
      })
      const apiDuration = Date.now() - apiStart
      
      if (response.ok) {
        setTests(prev => prev.map((test, index) => 
          index === 2 ? { 
            ...test, 
            status: 'success', 
            message: `API 连接正常 (${apiDuration}ms)`,
            duration: apiDuration
          } : test
        ))
      } else {
        setTests(prev => prev.map((test, index) => 
          index === 2 ? { 
            ...test, 
            status: 'error', 
            message: `API 响应错误: ${response.status}`
          } : test
        ))
      }
    } catch (error) {
      setTests(prev => prev.map((test, index) => 
        index === 2 ? { 
          ...test, 
          status: 'error', 
          message: 'API 连接失败'
        } : test
      ))
    }

    // 测试 4: 响应时间
    setTests(prev => prev.map((test, index) => 
      index === 3 ? { ...test, status: 'running', message: '测量响应时间...' } : test
    ))
    
    const pingStart = Date.now()
    try {
      await fetch('/api/generate', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
        signal: AbortSignal.timeout(5000)
      })
    } catch (error) {
      // 预期的错误，我们只是测试连接
    }
    const pingDuration = Date.now() - pingStart
    
    setTests(prev => prev.map((test, index) => 
      index === 3 ? { 
        ...test, 
        status: pingDuration < 3000 ? 'success' : 'error', 
        message: `响应时间: ${pingDuration}ms ${pingDuration < 3000 ? '(正常)' : '(较慢)'}`,
        duration: pingDuration
      } : test
    ))

    setIsRunning(false)
  }

  const getStatusIcon = (status: NetworkTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: NetworkTest['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">正常</Badge>
      case 'error':
        return <Badge variant="destructive">错误</Badge>
      case 'running':
        return <Badge variant="secondary">测试中</Badge>
      default:
        return <Badge variant="outline">等待</Badge>
    }
  }

  const hasErrors = tests.some(test => test.status === 'error')
  const allComplete = tests.every(test => test.status !== 'pending' && test.status !== 'running')

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {networkStatus ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              网络诊断
            </CardTitle>
            <CardDescription>
              检测网络连接状态和性能问题
            </CardDescription>
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                诊断中...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                开始诊断
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 网络状态概览 */}
        <Alert className={networkStatus ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {networkStatus ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={networkStatus ? "text-green-800" : "text-red-800"}>
              {networkStatus ? '网络连接正常' : '网络连接断开'}
            </AlertDescription>
          </div>
        </Alert>

        {/* 测试结果 */}
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-gray-600">{test.message}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {test.duration && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    {test.duration}ms
                  </div>
                )}
                {getStatusBadge(test.status)}
              </div>
            </div>
          ))}
        </div>

        {/* 诊断建议 */}
        {allComplete && (
          <Alert className={hasErrors ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
            <Globe className="h-4 w-4" />
            <AlertDescription className={hasErrors ? "text-orange-800" : "text-green-800"}>
              {hasErrors ? (
                <div>
                  <div className="font-medium mb-2">检测到网络问题，建议：</div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>检查网络连接是否稳定</li>
                    <li>尝试刷新页面或重新连接网络</li>
                    <li>如果问题持续，请联系技术支持</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <div className="font-medium">网络连接正常！</div>
                  <div className="text-sm mt-1">所有测试通过，网络状态良好。</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
