"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  Sparkles,
  Zap,
  Users,
  Download,
  Camera,
  Palette,
  Box,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Play,
  X,
  Eye,
  Maximize2,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LottieArrow } from "@/components/lottie-arrow"
import CircularGallery from "@/components/circular-gallery"
import { FeedbackPanel } from "@/components/feedback-panel"
import LightRays from "@/components/light-rays"
import GradientText from "@/components/gradient-text"
import ShinyText from "@/components/shiny-text"
import SplashCursor from "@/components/splash-cursor.jsx"
import { ImageUpload } from "@/components/image-upload"
import type { UploadedImage } from "@/lib/upload"
import { createClient } from "@/lib/supabase-client"
import { useToast } from "@/hooks/use-toast"
import { CookieConsent } from '@/components/cookie-consent'
import { trackEvent, trackPromptTemplate, trackGeneration, trackFeedback, trackNavigation, trackPageView, trackSectionView } from '@/lib/umami'

export default function AIImageGenerator() {
  const [feedback, setFeedback] = useState("")
  const [prompt, setPrompt] = useState("")
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<{src: string, alt: string, title?: string} | null>(null)
  const supabase = createClient()

  const { t } = useLanguage()
  const { toast } = useToast()

  // 图片预览功能
  const handleImagePreview = (src: string, alt: string, title?: string) => {
    setPreviewImage({ src, alt, title })
    setIsPreviewOpen(true)
  }

  // 下载图片功能
  const handleDownloadImage = async () => {
    if (!generatedImage) return

    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `artisan-ai-generated-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "下载成功！",
        description: "图片已保存到您的设备",
      })
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: "下载失败",
        description: "请重试或右键保存图片",
        variant: "destructive",
      })
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setIsSubmittingFeedback(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          content: feedback,
          meta: {
            type: 'page_feedback',
            source: 'homepage_bottom',
            timestamp: new Date().toISOString()
          }
        }),
      })

      if (response.ok) {
        setFeedback("")
        toast({
          title: t?.feedback?.success?.title || "反馈提交成功！",
          description: t?.feedback?.success?.description || "感谢您的宝贵意见，我们会认真考虑您的建议。",
        })
      } else {
        toast({
          title: t?.feedback?.error?.title || "提交失败",
          description: t?.feedback?.error?.description || "请稍后重试，或通过其他方式联系我们。",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Feedback submission error:", error)
      toast({
        title: t?.feedback?.network?.title || "网络错误",
        description: t?.feedback?.network?.description || "请检查网络连接后重试。",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  useEffect(() => {
    // 页面访问追踪
    trackPageView('home');
    
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user?.id ?? null)
    }
    loadSession()
  }, [])

  // 处理提示词模板点击
  const handlePromptTemplate = (templateName: string, prompt: string) => {
    setPrompt(prompt);
    trackPromptTemplate(templateName);
  };

  const handleGenerate = async () => {
    // 追踪生成按钮点击
    trackGeneration('start', { prompt: prompt.substring(0, 50), hasImages: images.length > 0 });
    
    // 检查用户是否已登录
    if (!userId) {
      toast({
        title: "请先登录",
        description: "登录后即可开始生成您的专属AI图像！",
        variant: "default",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // 滚动到导航栏的登录按钮
              const navElement = document.querySelector('nav')
              if (navElement) {
                navElement.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            立即登录
          </Button>
        ),
      })
      return
    }

    try {
      setIsGenerating(true)
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          prompt,
          images: images.map(i => i.url),
          model: undefined,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        console.error('Generate failed:', {
          status: res.status,
          statusText: res.statusText,
          data: data,
          url: res.url
        })
        
        // 检查是否是API额度问题
        let errorMessage = data?.error || `HTTP ${res.status}: ${res.statusText}`
        if (res.status === 429 || (data?.error && data.error.includes('quota'))) {
          errorMessage = "API额度已用完，请稍后再试或联系管理员"
        } else if (res.status === 500 && !data?.error) {
          errorMessage = "服务器内部错误，可能是API服务暂时不可用"
        }
        
        toast({
          title: "生成失败",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }
      console.log('Generate success:', data)
      
      // Display the generated image
      if (data.image) {
        setGeneratedImage(data.image)
        // 追踪生成成功
        trackGeneration('success', { 
          prompt: prompt.substring(0, 50), 
          hasImages: images.length > 0,
          creditsUsed: 1
        });
        // Trigger credits update in navigation with the remaining balance
        window.dispatchEvent(new CustomEvent('credits:update', {
          detail: { 
            balance: data.remaining,
            remaining: data.remaining 
          }
        }))
      }
    } catch (e: any) {
      console.error(e)
      
      // 追踪生成失败
      trackGeneration('error', { 
        prompt: prompt.substring(0, 50), 
        hasImages: images.length > 0,
        error: e?.message || 'unknown'
      });
      
      toast({
        title: "网络错误",
        description: e?.message || '未知错误，请重试',
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Light Rays Background */}
      <div className="fixed inset-0 z-[1]">
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Splash Cursor Effect - Temporarily disabled for stability */}
        {/* <SplashCursor 
          paused={isGenerating} 
          DYE_RESOLUTION={isGenerating ? 256 : 720}
          PRESSURE_ITERATIONS={isGenerating ? 10 : 20}
        /> */}
        
        {/* Feedback Panel */}
        <FeedbackPanel />

      {/* Hero Section - Enhanced with neon effects */}
      <section id="home" className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
            <GradientText
              colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]}
              animationSpeed={8}
              showBorder={false}
              className="inline-block"
            >
              {t?.hero?.title || '解雇你的摄影师'}
            </GradientText>
          </div>
          <div className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-pretty">
            <GradientText
              colors={["#FF7F50", "#FF3B30", "#FFD93D", "#FF7F50", "#FF3B30"]}
              animationSpeed={12}
              showBorder={false}
              className="inline-block"
            >
              {t?.hero?.subtitle || 'AI驱动的图像生成，创造令人惊叹的一致结果'}
            </GradientText>
          </div>

          {/* Core Input Area - Enhanced with glassmorphism and glowing borders */}
          <Card className="max-w-2xl mx-auto backdrop-blur-xl bg-card/30 border-2 border-primary/60 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500 hover:border-primary/50">
            <CardContent className="p-8">
              <div className="space-y-6">
                <ImageUpload onImagesChange={setImages} className="rounded-lg" />

                <Textarea
                  placeholder={t.hero.placeholder}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] bg-input/50 border-primary/20 focus:border-primary/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300"
                />

                {/* Prompt Templates */}
                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">{t?.hero?.promptTemplates?.title || '✨ Explore AI Magic:'}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Multi-Angle View */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('multi-angle', t?.hero?.promptTemplates?.multiAngle?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.multiAngle?.label || 'Multi-Angle View'}</span>
                    </Button>

                    {/* Action Change */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('action-change', t?.hero?.promptTemplates?.actionChange?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.actionChange?.label || 'Action Change'}</span>
                    </Button>

                    {/* Background Switch */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('background-switch', t?.hero?.promptTemplates?.backgroundSwitch?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.backgroundSwitch?.label || 'Background Switch'}</span>
                    </Button>

                    {/* Hairstyle Change */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('hairstyle-change', t?.hero?.promptTemplates?.hairstyleChange?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.hairstyleChange?.label || 'Hairstyle Change'}</span>
                    </Button>

                    {/* Time Travel */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('time-travel', t?.hero?.promptTemplates?.timeTravel?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.timeTravel?.label || 'Time Travel'}</span>
                    </Button>

                    {/* Interaction Scene */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('interaction', t?.hero?.promptTemplates?.interaction?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.interaction?.label || 'Interaction Scene'}</span>
                    </Button>

                    {/* Today's Outfit */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('outfit', t?.hero?.promptTemplates?.outfit?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.outfit?.label || 'Today\'s Outfit'}</span>
                    </Button>

                    {/* Expression Change */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('expression', t?.hero?.promptTemplates?.expression?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.expression?.label || 'Expression Change'}</span>
                    </Button>

                    {/* Product Display */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('product', t?.hero?.promptTemplates?.product?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.product?.label || 'Product Display'}</span>
                    </Button>

                    {/* Stylization */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handlePromptTemplate('stylize', t?.hero?.promptTemplates?.stylize?.prompt || '')}
                      className="group relative h-12 px-3 text-xs font-medium bg-gradient-to-br from-card/80 to-card/60 border-2 !border-white text-white hover:from-primary/20 hover:to-primary/10 hover:!border-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-primary/20 transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{t?.hero?.promptTemplates?.stylize?.label || 'Stylization'}</span>
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-4 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      AI正在创作中...
                    </>
                  ) : (
                    <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.hero.generateBtn}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Image Display */}
          {(generatedImage || isGenerating) && (
            <Card className="max-w-2xl mx-auto mt-8 backdrop-blur-xl bg-card/30 border-2 border-primary/60 shadow-2xl shadow-primary/10">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
                  {isGenerating ? '生成中...' : '生成结果'}
                </h3>
                <div className="relative">
                  {isGenerating ? (
                    <div className="w-full h-64 flex items-center justify-center bg-muted/20 rounded-lg border border-primary/20">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-muted-foreground mb-2">AI正在创作您的专属图像...</p>
                        <p className="text-xs text-muted-foreground/70">这通常需要30-60秒，请耐心等待</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={generatedImage!}
                        alt="Generated image"
                        className="w-full h-auto rounded-lg border border-primary/20 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setIsPreviewOpen(true)}
                      />
                      
                      {/* 图片不保存提示 */}
                      <div className="absolute top-2 left-2 bg-yellow-500/90 text-white text-xs px-2 py-1 rounded-md">
                        ⚠️ 图片不会保存，请及时下载
                      </div>
                      
                      {/* 操作按钮组 */}
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/90 hover:bg-white text-gray-800"
                          onClick={() => setIsPreviewOpen(true)}
                          title="预览大图"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/90 hover:bg-white text-gray-800"
                          onClick={handleDownloadImage}
                          title="下载图片"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/90 hover:bg-white text-gray-800"
                          onClick={() => setGeneratedImage(null)}
                          title="关闭"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </section>

      {/* Character Consistency Showcase */}
        <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent">
          <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {t?.home?.consistency?.title || 'Perfect Character Consistency'}
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto text-lg">
            {t?.home?.consistency?.subtitle || 'The strongest model for character consistency – maintain the same person across styles, outfits and scenes while preserving unique facial features'}
          </p>

          {/* Case Study 1: Male Model */}
          <div className="mb-32">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">{t?.home?.case1?.title || 'Case Study 1: Style Transformation'}</h3>
            
            <div className="flex flex-col lg:flex-row items-center gap-8 mx-auto px-4">
              {/* Left Side - Input Materials */}
              <div className="flex-[1.2] space-y-6">
                {/* Original Photo */}
                <div className="text-center">
                  <div className="relative overflow-hidden rounded-2xl border-4 border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-2 mb-4">
                    <img 
                      src="/o1.jpg" 
                      alt="Original Male Model" 
                      className="w-full max-h-[350px] object-cover rounded-xl"
                    />
                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span className="text-white font-semibold text-sm">{t?.home?.common?.original || 'Original'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{t?.home?.case1?.baseModel || 'Base Model'}</p>
                </div>

                {/* Style References */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative overflow-hidden rounded-xl border-2 border-accent/30 shadow-lg bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                    <img 
                      src="/s1.jpg" 
                      alt={t?.home?.case1?.sunglasses || 'Sunglasses'} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-accent/90 backdrop-blur-sm rounded px-2 py-1">
                      <span className="text-white text-xs font-medium">{t?.home?.case1?.sunglasses || '太阳镜'}</span>
                    </div>
                  </div>
                  
                  <div className="relative overflow-hidden rounded-xl border-2 border-accent/30 shadow-lg bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                    <img 
                      src="/s2.jpg" 
                      alt={t?.home?.case1?.skateboard || 'Skateboard'} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-accent/90 backdrop-blur-sm rounded px-2 py-1">
                      <span className="text-white text-xs font-medium">{t?.home?.case1?.skateboard || '滑板'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">{t?.home?.case1?.styleReferences || 'Style References'}</p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <LottieArrow size={120} />
              </div>

              {/* Right Side - Generated Result (Main Focus) */}
              <div className="flex-[1.8] text-center">
                <div className="relative">
                  <img 
                    src="/g2.png" 
                    alt="Generated Result" 
                    className="max-w-[437px] h-auto object-contain rounded-xl shadow-2xl"
                  />
                  <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {t?.home?.common?.generated || 'Generated'}
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-lg text-foreground font-bold">{t?.home?.case1?.perfectFusion || 'Perfect Fusion'}</p>
                  <p className="text-sm text-muted-foreground">{t?.home?.case1?.sameFace || 'Same face, new style'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Case Study 2: Female Model */}
          <div className="mb-32">
                <h3 className="text-2xl font-bold text-foreground mb-8 text-center">{t?.home?.case2?.title || '案例二：服装更换'}</h3>
            
            <div className="flex flex-col lg:flex-row items-center gap-8 mx-auto px-4">
              {/* Left Side - Input Materials */}
              <div className="flex-[1.2] space-y-6">
                {/* Original Photo */}
                <div className="text-center">
                  <div className="relative overflow-hidden rounded-2xl border-4 border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-2 mb-4">
                    <img 
                      src="/p1.jpg" 
                      alt="Original Female Model" 
                      className="w-full max-h-[350px] object-cover rounded-xl"
                    />
                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span className="text-white font-semibold text-sm">{t?.home?.common?.original || 'Original'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{t?.home?.case2?.baseModel || '基础模型'}</p>
                </div>

                {/* Style References */}
                <div className="text-center">
                  <div className="relative overflow-hidden rounded-xl border-2 border-accent/30 shadow-lg bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                    <img 
                      src="/p2.jpg" 
                      alt="Green Dress Style" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-accent/90 backdrop-blur-sm rounded px-2 py-1">
                      <span className="text-white text-xs font-medium">{t?.home?.case2?.greenDress || 'Green Dress'}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{t?.home?.case2?.styleReference || '风格参考'}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <LottieArrow size={120} />
              </div>

              {/* Right Side - Generated Result (Main Focus) */}
              <div className="flex-[1.8] text-center">
                <div className="relative">
                  <img 
                    src="/g3.png" 
                    alt="Generated Result" 
                    className="max-w-[437px] h-auto object-contain rounded-xl shadow-2xl"
                  />
                  <div className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {t?.home?.common?.generated || 'Generated'}
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-lg text-foreground font-bold">{t?.home?.case2?.perfectMatch || '完美匹配'}</p>
                  <p className="text-sm text-muted-foreground">{t?.home?.case2?.samePersonNewOutfit || '同一人，新服装'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground mb-8">{t?.home?.whyConsistency?.title || 'Why Character Consistency Matters'}</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">{t?.home?.whyConsistency?.facialRecognition || 'Facial Recognition'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.whyConsistency?.facialRecognitionDesc || 'AI preserves unique facial features, bone structure, and expressions across all generations'}</p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Palette className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">{t?.home?.whyConsistency?.styleFlexibility || 'Style Flexibility'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.whyConsistency?.styleFlexibilityDesc || 'Change outfits, accessories, and backgrounds while maintaining the same person'}</p>
              </div>
              
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">{t?.home?.whyConsistency?.professionalQuality || 'Professional Quality'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.whyConsistency?.professionalQualityDesc || 'High-resolution, studio-quality images that look natural and professional'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Photo Editing Showcase */}
      <section id="photo-editing" className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {t?.home?.editing?.title || 'Advanced AI Photo Editing'}
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto text-lg">
            {t?.home?.editing?.subtitle || 'Delete your photo editing software! Flawless watermark and tattoo removal - Experience the power of AI photo editing'}
          </p>
          
          {/* Editing Process Flow */}
          <div className="space-y-20">
            {/* Step 1 & 2: Original Photo and Remove Tattoo */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-8">{t?.home?.editing?.step1?.title || 'Step 1: Original Photo'}</h3>
                <div className="relative inline-block">
                  <div className="relative overflow-hidden rounded-2xl border-4 border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-2">
                    <img 
                      src="/d1.jpg" 
                      alt="Original Photo with Tattoo" 
                      className="w-full max-h-[400px] object-cover rounded-xl"
                    />
                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span className="text-white font-semibold text-sm">{t?.home?.common?.original || 'Original'}</span>
                </div>
                </div>
                </div>
                <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.editing?.step1?.description || 'Girl with arm tattoo'}</p>
                <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.step1?.detail || 'Starting point - natural photo with existing tattoo'}</p>
              </div>
              
              <div className="flex justify-center">
                <LottieArrow size={80} />
                </div>
              
              <div className="flex-1 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-8">{t?.home?.editing?.step2?.title || 'Step 2: Remove Tattoo'}</h3>
                <div className="relative inline-block">
                  <div className="relative overflow-hidden rounded-2xl border-4 border-accent/30 shadow-2xl shadow-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                    <img 
                      src="/g5.png" 
                      alt="Tattoo Removed" 
                      className="w-full max-h-[400px] object-cover rounded-xl"
                    />
                    <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {t?.home?.common?.generated || 'Generated'}
                </div>
                  </div>
                </div>
                <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.editing?.step2?.description || 'Tattoo Completely Removed'}</p>
                <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.step2?.detail || 'AI seamlessly removes the arm tattoo while preserving skin texture'}</p>
              </div>
            </div>

            {/* Step 3: Add New Tattoo */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-8">{t?.home?.editing?.step3?.title || 'Step 3: Add New Tattoo'}</h3>
                <div className="space-y-6">
                  {/* Reference Tattoo */}
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-4">{t?.home?.editing?.step3?.reference?.title || 'Reference Tattoo Design'}</h4>
                    <div className="relative inline-block">
                      <div className="relative overflow-hidden rounded-xl border-2 border-accent/30 shadow-lg bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                        <img 
                          src="/d2.jpg" 
                          alt="New Tattoo Design" 
                          className="w-full max-h-[200px] object-cover rounded-lg"
                        />
                        <div className="absolute top-2 left-2 bg-accent/90 backdrop-blur-sm rounded px-2 py-1">
                          <span className="text-white text-xs font-medium">{t?.home?.common?.reference || 'Reference'}</span>
                </div>
                  </div>
                  </div>
                    <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.step3?.reference?.description || '要添加的新纹身设计'}</p>
                </div>
                  
                  {/* Generated Result */}
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-4">{t?.home?.editing?.step3?.result?.title || '生成结果'}</h4>
                    <div className="relative inline-block">
                      <div className="relative overflow-hidden rounded-2xl border-4 border-accent/30 shadow-2xl shadow-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                        <img 
                          src="/g6.png" 
                          alt="New Tattoo Added" 
                          className="w-full max-h-[400px] object-cover rounded-xl"
                        />
                        <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {t?.home?.common?.generated || 'Generated'}
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-foreground mt-4 font-semibold">{t?.home?.editing?.step3?.result?.description || '新纹身已应用'}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.step3?.result?.detail || 'AI将新纹身设计添加到同一手臂位置'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <LottieArrow size={80} />
              </div>
              
              <div className="flex-1 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-8">{t?.home?.editing?.step4?.title || 'Step 4: Creative Styling'}</h3>
                <div className="relative inline-block">
                  <div className="relative overflow-hidden rounded-2xl border-4 border-accent/30 shadow-2xl shadow-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                    <img 
                      src="/g10.png" 
                      alt="Hair and Makeup Changed" 
                      className="w-full max-h-[400px] object-cover rounded-xl"
                    />
                    <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {t?.home?.common?.generated || 'Generated'}
                    </div>
                  </div>
                </div>
                <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.editing?.step4?.description || 'Hair Color & Makeup Changed'}</p>
                <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.step4?.detail || 'AI transforms hair color and lipstick while maintaining facial features'}</p>
              </div>
            </div>

            {/* Step 5: Expression Editing */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-foreground mb-8">{t?.home?.editing?.step5?.title || 'Step 5: Expression Editing'}</h3>
              <div className="relative inline-block">
                <div className="relative overflow-hidden rounded-2xl border-4 border-accent/30 shadow-2xl shadow-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                  <img 
                    src="/g11.png" 
                    alt="Smiling Expression" 
                    className="w-full max-h-[400px] object-cover rounded-xl"
                  />
                  <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {t?.home?.common?.generated || 'Generated'}
                  </div>
                </div>
              </div>
              <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.editing?.step5?.description || 'Natural Smile Added'}</p>
              <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.step5?.detail || "AI adds a natural smile while preserving the person's unique facial structure"}</p>
            </div>
          </div>

          {/* Case Study 2: Accessory Replacement */}
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center text-foreground mb-12">{t?.home?.editing?.caseStudy2?.title || 'Case Study 2: Accessory Replacement'}</h3>
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-center">
                <h4 className="text-xl font-semibold text-foreground mb-6">{t?.home?.editing?.caseStudy2?.original?.title || 'Original Photo'}</h4>
                <div className="space-y-6">
                  {/* Original Photo */}
                  <div>
                    <div className="relative inline-block">
                      <div className="relative overflow-hidden rounded-2xl border-4 border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-2">
                        <img 
                          src="/h1.jpg" 
                          alt="Woman with Original Necklace" 
                          className="w-full max-h-[300px] object-cover rounded-xl"
                        />
                        <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                          <span className="text-white font-semibold text-sm">{t?.home?.common?.original || 'Original'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-foreground mt-4 font-semibold">{t?.home?.editing?.caseStudy2?.original?.description || 'Woman with Original Necklace'}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.caseStudy2?.original?.detail || 'Starting point with existing accessory'}</p>
                  </div>
                  
                  {/* Reference Accessory */}
                  <div>
                    <h5 className="text-lg font-semibold text-foreground mb-4">{t?.home?.editing?.caseStudy2?.reference?.title || 'New Necklace Design'}</h5>
                    <div className="relative inline-block">
                      <div className="relative overflow-hidden rounded-xl border-2 border-accent/30 shadow-lg bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                        <img 
                          src="/h2.jpg" 
                          alt="New Necklace Design" 
                          className="w-full max-h-[200px] object-cover rounded-lg"
                        />
                        <div className="absolute top-2 left-2 bg-accent/90 backdrop-blur-sm rounded px-2 py-1">
                          <span className="text-white text-xs font-medium">{t?.home?.common?.reference || 'Reference'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.caseStudy2?.reference?.description || '替换原始项链的新项链设计'}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <LottieArrow size={80} />
              </div>
              
              <div className="flex-1 text-center">
                <h4 className="text-xl font-semibold text-foreground mb-6">{t?.home?.editing?.caseStudy2?.result?.title || '生成结果'}</h4>
                <div className="relative inline-block">
                  <div className="relative overflow-hidden rounded-2xl border-4 border-accent/30 shadow-2xl shadow-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                    <img 
                      src="/g4.png" 
                      alt="Woman with New Necklace" 
                      className="w-full max-h-[400px] object-cover rounded-xl"
                    />
                    <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {t?.home?.common?.generated || 'Generated'}
                    </div>
                  </div>
                </div>
                <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.editing?.caseStudy2?.result?.description || 'Necklace Successfully Replaced'}</p>
                <p className="text-sm text-muted-foreground mt-2">{t?.home?.editing?.caseStudy2?.result?.detail || 'AI seamlessly replaces the original necklace with the new design while maintaining natural lighting and shadows'}</p>
              </div>
            </div>
          </div>

          {/* Key Features */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">{t?.home?.editing?.whyChoose?.title || 'Why Choose Our AI Photo Editor?'}</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎨</span>
                </div>
                <h4 className="font-semibold text-foreground">{t?.home?.editing?.whyChoose?.features?.professional?.title || 'Professional Quality'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.editing?.whyChoose?.features?.professional?.description || 'Studio-grade editing results with natural-looking outcomes'}</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">⚡</span>
                </div>
                <h4 className="font-semibold text-foreground">{t?.home?.editing?.whyChoose?.features?.fast?.title || 'Lightning Fast'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.editing?.whyChoose?.features?.fast?.description || 'Get results in seconds, not hours of manual editing'}</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold text-foreground">{t?.home?.editing?.whyChoose?.features?.precise?.title || 'Precise Control'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.editing?.whyChoose?.features?.precise?.description || 'Fine-tune every detail with advanced AI algorithms'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Model Generation Showcase */}
      <section id="3d-generation" className="py-32 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {t?.home?.model3d?.title || 'AI 3D Model Generation'}
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-3xl mx-auto text-lg">
            {t?.home?.model3d?.subtitle || '个人定制3D模型生成 - 可直接在3D软件中二次加工，从真人照片到动漫角色，打造专属3D手办'}
          </p>
          
          {/* 3D Generation Process */}
          <div className="space-y-20">
            {/* Case Study 1: Real Person to 3D Figurine */}
            <div>
              <h3 className="text-2xl font-bold text-center text-foreground mb-12">{t?.home?.model3d?.caseStudy1?.title || 'Case Study 1: Real Person to 3D Figurine'}</h3>
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-6">{t?.home?.model3d?.caseStudy1?.original?.title || 'Original Photo'}</h4>
                  <div className="relative inline-block">
                    <div className="relative overflow-hidden rounded-2xl border-4 border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-2">
                      <img 
                        src="/k1.jpg" 
                        alt="Original Female Photo" 
                        className="w-full max-h-[400px] object-cover rounded-xl"
                      />
                      <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                        <span className="text-white font-semibold text-sm">{t?.home?.common?.original || 'Original'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.model3d?.caseStudy1?.original?.description || 'Real Person Photo'}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t?.home?.model3d?.caseStudy1?.original?.detail || 'High-quality portrait for 3D conversion'}</p>
                </div>
                
                <div className="flex justify-center">
                  <LottieArrow size={80} />
                </div>
                
                <div className="flex-1 text-center">
                  <h4 className="text-xl font-semibold text-foreground mb-6">{t?.home?.model3d?.caseStudy1?.result?.title || '3D手办结果'}</h4>
                  <div className="relative inline-block">
                    <div className="relative overflow-hidden rounded-2xl border-4 border-accent/30 shadow-2xl shadow-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                      <img 
                        src="/g7.png" 
                        alt="3D Figurine Model" 
                        className="w-full max-h-[400px] object-cover rounded-xl"
                      />
                      <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {t?.home?.common?.generated || 'Generated'}
                      </div>
                    </div>
                  </div>
                  <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.model3d?.caseStudy1?.result?.description || 'Professional 3D Figurine'}</p>
                  <p className="text-sm text-muted-foreground mt-2">{t?.home?.model3d?.caseStudy1?.result?.detail || 'AI converts real person into detailed 3D collectible figurine'}</p>
                </div>
              </div>
            </div>

            {/* Case Study 2: Anime to 3D Figurine */}
            <div>
              <h3 className="text-2xl font-bold text-center text-foreground mb-12">{t?.home?.model3d?.caseStudy2?.title || 'Case Study 2: Anime Characters to 3D Figurines'}</h3>
              
              {/* Anime Example 1 */}
              <div className="mb-16">
                <h4 className="text-xl font-semibold text-center text-foreground mb-8">{t?.home?.model3d?.caseStudy2?.example1?.title || 'Anime Character 1'}</h4>
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="flex-1 text-center">
                    <h5 className="text-lg font-semibold text-foreground mb-6">{t?.home?.model3d?.caseStudy2?.example1?.original?.title || 'Original Anime Art'}</h5>
                    <div className="relative inline-block">
                      <div className="relative overflow-hidden rounded-2xl border-4 border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-2">
                        <img 
                          src="/i1.jpg" 
                          alt="Original Anime Character" 
                          className="w-full max-h-[400px] object-cover rounded-xl"
                        />
                        <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                          <span className="text-white font-semibold text-sm">{t?.home?.common?.original || 'Original'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.model3d?.caseStudy2?.example1?.original?.title || '2D动漫角色'}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t?.home?.model3d?.caseStudy2?.example1?.original?.detail || '用于3D转换的原始动漫艺术作品'}</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <LottieArrow size={80} />
                  </div>
                  
                  <div className="flex-1 text-center">
                    <h5 className="text-lg font-semibold text-foreground mb-6">{t?.home?.model3d?.caseStudy2?.example1?.result?.title || '3D手办结果'}</h5>
                    <div className="relative inline-block">
                      <div className="relative overflow-hidden rounded-2xl border-4 border-accent/30 shadow-2xl shadow-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                        <img 
                          src="/g9.png" 
                          alt="3D Anime Figurine" 
                          className="w-full max-h-[400px] object-cover rounded-xl"
                        />
                        <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {t?.home?.common?.generated || 'Generated'}
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.model3d?.caseStudy2?.example1?.result?.description || '3D Anime Figurine'}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t?.home?.model3d?.caseStudy2?.example1?.result?.detail || 'AI transforms 2D anime into detailed 3D collectible'}</p>
                  </div>
                </div>
              </div>

              {/* Anime Example 2 */}
              <div>
                <h4 className="text-xl font-semibold text-center text-foreground mb-8">{t?.home?.model3d?.caseStudy2?.example2?.title || 'Anime Character 2'}</h4>
                <div className="flex flex-col lg:flex-row items-center gap-12">
                  <div className="flex-1 text-center">
                    <h5 className="text-lg font-semibold text-foreground mb-6">{t?.home?.model3d?.caseStudy2?.example2?.original?.title || 'Original Anime Art'}</h5>
                    <div className="relative inline-block">
                      <div className="relative overflow-hidden rounded-2xl border-4 border-primary/30 shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary/10 to-accent/10 p-2">
                        <img 
                          src="/i2.jpg" 
                          alt="Original Anime Character 2" 
                          className="w-full max-h-[400px] object-cover rounded-xl"
                        />
                        <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm rounded-lg px-3 py-2">
                          <span className="text-white font-semibold text-sm">{t?.home?.common?.original || 'Original'}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.model3d?.caseStudy2?.example2?.original?.title || '2D动漫角色'}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t?.home?.model3d?.caseStudy2?.example2?.original?.detail || '用于3D转换的另一个动漫艺术作品'}</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <LottieArrow size={80} />
                  </div>
                  
                  <div className="flex-1 text-center">
                    <h5 className="text-lg font-semibold text-foreground mb-6">{t?.home?.model3d?.caseStudy2?.example2?.result?.title || '3D Figurine Result'}</h5>
                    <div className="relative inline-block">
                      <div className="relative overflow-hidden rounded-2xl border-4 border-accent/30 shadow-2xl shadow-accent/20 bg-gradient-to-br from-accent/10 to-primary/10 p-2">
                        <img 
                          src="/g8.png" 
                          alt="3D Anime Figurine 2" 
                          className="w-full max-h-[400px] object-cover rounded-xl"
                        />
                        <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {t?.home?.common?.generated || 'Generated'}
                        </div>
                      </div>
                    </div>
                    <p className="text-lg text-foreground mt-6 font-semibold">{t?.home?.model3d?.caseStudy2?.example2?.result?.description || '3D Anime Figurine'}</p>
                    <p className="text-sm text-muted-foreground mt-2">{t?.home?.model3d?.caseStudy2?.example2?.result?.detail || 'AI creates detailed 3D figurine from 2D anime art'}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Key Features */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-foreground mb-8">{t?.home?.model3d?.whyChoose?.title || 'Why Choose Our 3D Generation?'}</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-semibold text-foreground">{t?.home?.model3d?.whyChoose?.features?.fidelity?.title || 'High Fidelity'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.model3d?.whyChoose?.features?.fidelity?.description || 'Preserve every detail from original photos and artwork'}</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎨</span>
                </div>
                <h4 className="font-semibold text-foreground">{t?.home?.model3d?.whyChoose?.features?.styles?.title || 'Multiple Styles'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.model3d?.whyChoose?.features?.styles?.description || 'Works with real photos, anime, and any 2D artwork'}</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🏆</span>
                </div>
                <h4 className="font-semibold text-foreground">{t?.home?.model3d?.whyChoose?.features?.quality?.title || 'Collectible Quality'}</h4>
                <p className="text-sm text-muted-foreground">{t?.home?.model3d?.whyChoose?.features?.quality?.description || 'Professional-grade 3D models ready for printing'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* More Play Section */}
      <section id="more-creative" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              {t?.morePlay?.title || '更多创意玩法'}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t?.morePlay?.subtitle || '等你探索更多玩法'}
            </p>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto mt-4">
              {t?.morePlay?.description || '发现Nano-Banana的无限创意潜力，体验这些令人兴奋的任务'}
            </p>
          </div>

          <div className="space-y-12">
            {/* Action Tasks */}
            <div className="backdrop-blur-xl bg-card/30 border border-primary/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40">
              <div className="flex flex-col items-center gap-8">
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{t?.morePlay?.tasks?.action?.title || '动作任务'}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t?.morePlay?.tasks?.action?.description || '我们随机定义一组动作指令，要求模型在保留原始身份细节和背景的同时调整主体的姿势。这能够生成丰富的衍生动作。例如，做出"是"的手势、交叉双臂，或引入帽子或墨镜等新道具来创造丰富的动作表情。'}
                  </p>
                </div>
                <div className="text-center w-full">
                  <img 
                    src="/11.png" 
                    alt="Action Tasks Example"
                    className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Background Tasks */}
            <div className="backdrop-blur-xl bg-card/30 border border-primary/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40">
              <div className="flex flex-col items-center gap-8">
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{t?.morePlay?.tasks?.background?.title || '背景任务'}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t?.morePlay?.tasks?.background?.description || '我们定义了大约250个不同的场景位置，涵盖地标、自然景观以及常见的室内外环境。该任务要求将原始背景替换为新的场景，同时保留拍摄对象的个性。例如，将背景切换为室内摄影工作室、户外雪山或各种风景地标。'}
                  </p>
                </div>
                <div className="text-center w-full">
                  <img 
                    src="/22.png" 
                    alt="Background Tasks Example"
                    className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Hairstyle Tasks */}
            <div className="backdrop-blur-xl bg-card/30 border border-primary/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40">
              <div className="flex flex-col items-center gap-8">
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{t?.morePlay?.tasks?.hairstyle?.title || '发型任务'}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t?.morePlay?.tasks?.hairstyle?.description || '我们进一步探索基于肖像数据的发型和发色修改任务，利用Nano-banana编辑拍摄对象的头发细节。例如，将直刘海改为波浪卷发或发髻，以及将黑发改为金色、红色或其他颜色。'}
                  </p>
                </div>
                <div className="text-center w-full">
                  <img 
                    src="/33.png" 
                    alt="Hairstyle Tasks Example"
                    className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Time Tasks */}
            <div className="backdrop-blur-xl bg-card/30 border border-primary/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40">
              <div className="flex flex-col items-center gap-8">
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{t?.morePlay?.tasks?.time?.title || '时间任务'}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t?.morePlay?.tasks?.time?.description || '我们将肖像数据置于不同的历史或时间背景中，要求服装风格和背景细节与指定的时代相符。例如，一个人物可能被置于1905年的日常生活场景中，也可能被置于2000年的千禧年环境中。'}
                  </p>
                </div>
                <div className="text-center w-full">
                  <img 
                    src="/44.png" 
                    alt="Time Tasks Example"
                    className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Interaction Tasks */}
            <div className="backdrop-blur-xl bg-card/30 border border-primary/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40">
              <div className="flex flex-col items-center gap-8">
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{t?.morePlay?.tasks?.interaction?.title || '人机交互任务'}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t?.morePlay?.tasks?.interaction?.description || '我们从基础身份集中随机选取2-4张图像，并使用GPT生成以交互为导向的指令。该任务并非仅仅将人物并排摆放，而是强调人际动作和互动。例如，两个人喝咖啡聊天，或者四人组乐队一起表演。这些指令随后与Nano-banana结合使用，合成能够捕捉丰富交互语义的图像。'}
                  </p>
                </div>
                <div className="text-center w-full">
                  <img 
                    src="/55.png" 
                    alt="Interaction Tasks Example"
                    className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* OOTD Tasks */}
            <div className="backdrop-blur-xl bg-card/30 border border-primary/20 rounded-2xl p-8 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40">
              <div className="flex flex-col items-center gap-8">
                <div className="w-full">
                  <h3 className="text-2xl font-bold text-foreground mb-4">{t?.morePlay?.tasks?.ootd?.title || 'OOTD任务'}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t?.morePlay?.tasks?.ootd?.description || '我们从线上资源中收集服装样衣，并随机选取2-6件服装与人像进行搭配展示。生成的样衣需要保持面部特征的一致性，同时融入姿势变化，以更好地凸显服装的细节和呈现效果。'}
                  </p>
                </div>
                <div className="text-center w-full">
                  <img 
                    src="/66.png" 
                    alt="OOTD Tasks Example"
                    className="w-full max-h-96 object-contain rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section - Enhanced with glassmorphism */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {t.comparison.title}
          </h2>

          {/* Description */}
          <div className="text-center mb-12">
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t?.comparison?.description || 'Artisan-ai（基于Nano-Banana） 重新定义了 AI 图像生成，在逼真度与身份一致性方面无可匹敌。它的表现超越了 GPT-4o 与 Qwen-Image，即使在更换背景、姿势或风格时，也能完美保持同一张面孔的连贯性——这是其他模型尚未达到的精准水准。'}
            </p>
          </div>

          {/* AI Model Comparison Image */}
          <div className="text-center mb-12">
            <img 
              src="/ww.png" 
              alt="AI Model Comparison - Nano-Banana vs GPT-4o vs Qwen-Image"
              className="max-w-4xl mx-auto rounded-lg shadow-2xl border border-primary/20"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full backdrop-blur-xl bg-card/80 rounded-lg border-2 border-primary/60 shadow-2xl shadow-primary/10">
              <thead>
                <tr className="border-b border-primary/20">
                  <th className="text-left p-6 text-foreground font-semibold">{t?.comparison?.table?.feature || '功能'}</th>
                  <th className="text-center p-6 text-primary font-semibold drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    {t?.comparison?.table?.artisanAI || 'ArtisanAI'}
                  </th>
                  <th className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.midjourney || 'MidJourney'}</th>
                  <th className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.qwenImage || 'Qwen-Image'}</th>
                  <th className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.gpt4o || 'GPT-4o'}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-primary/10 hover:bg-primary/5 transition-colors duration-300">
                  <td className="p-6 text-foreground">{t.comparison.features.consistency}</td>
                  <td className="text-center p-6 text-accent font-semibold">{t?.comparison?.table?.excellent || '优秀'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.limited || '有限'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.good || '良好'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.basic || '基础'}</td>
                </tr>
                <tr className="border-b border-primary/10 hover:bg-primary/5 transition-colors duration-300">
                  <td className="p-6 text-foreground">{t.comparison.features.figurine}</td>
                  <td className="text-center p-6">
                    <CheckCircle className="h-5 w-5 text-accent mx-auto drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.no || '无'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.no || '无'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.no || '无'}</td>
                </tr>
                <tr className="border-b border-primary/10 hover:bg-primary/5 transition-colors duration-300">
                  <td className="p-6 text-foreground">{t.comparison.features.inputs}</td>
                  <td className="text-center p-6">
                    <CheckCircle className="h-5 w-5 text-accent mx-auto drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.textOnly || '仅文本'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.limited || '有限'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.textOnly || '仅文本'}</td>
                </tr>
                <tr className="border-b border-primary/10 hover:bg-primary/5 transition-colors duration-300">
                  <td className="p-6 text-foreground">{t.comparison.features.identity || '身份保持'}</td>
                  <td className="text-center p-6">
                    <CheckCircle className="h-5 w-5 text-accent mx-auto drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.poor || '差'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.limited || '有限'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.basic || '基础'}</td>
                </tr>
                <tr className="border-b border-primary/10 hover:bg-primary/5 transition-colors duration-300">
                  <td className="p-6 text-foreground">{t.comparison.features.quality || '专业级质量'}</td>
                  <td className="text-center p-6">
                    <CheckCircle className="h-5 w-5 text-accent mx-auto drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.good || '良好'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.good || '良好'}</td>
                  <td className="text-center p-6 text-muted-foreground">{t?.comparison?.table?.excellent || '优秀'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Easy to Work - Enhanced with neon effects */}
      <section id="how-to-work" className="py-12 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {t.comparison.features.easyToWork}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t.howItWorks.upload.title}</h3>
              <p className="text-muted-foreground">{t.howItWorks.upload.desc}</p>
            </div>

            <div className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t.howItWorks.generate.title}</h3>
              <p className="text-muted-foreground">{t.howItWorks.generate.desc}</p>
            </div>

            <div className="text-center group">
              <div className="h-20 w-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500">
                <Download className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">{t.howItWorks.download.title}</h3>
              <p className="text-muted-foreground">{t.howItWorks.download.desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Enhanced with glassmorphism */}
      <section id="pricing" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-16 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            {t.pricing.title}
          </h2>

          <Card className="backdrop-blur-xl bg-card/30 border-2 border-primary/60 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">{t.pricing.pointsSystem}</h3>
                <p className="text-muted-foreground">{t.pricing.subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-6 rounded-lg bg-muted/50 border border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <div className="relative inline-block mb-4">
                    <Sparkles className="h-8 w-8 text-primary mx-auto" />
                    <div className="absolute inset-0 h-8 w-8 bg-primary/20 rounded-full blur-lg animate-pulse" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{t.pricing.freeStarter}</h4>
                  <p className="text-3xl font-bold text-foreground mb-2">120 Points</p>
                  <p className="text-sm text-muted-foreground">{t.pricing.freeStarterDesc}</p>
                </div>

                <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/60 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <div className="relative inline-block mb-4">
                    <Zap className="h-8 w-8 text-accent mx-auto" />
                    <div className="absolute inset-0 h-8 w-8 bg-accent/20 rounded-full blur-lg animate-pulse" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{t.pricing.perGeneration}</h4>
                  <p className="text-3xl font-bold text-foreground mb-2">50 Points</p>
                  <p className="text-sm text-muted-foreground">{t.pricing.perGenerationDesc}</p>
                </div>
              </div>

              <div className="text-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                >
                  {t.pricing.purchaseCredits}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">{t.pricing.secureCheckout}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>


      {/* Feedback Section - Enhanced with glassmorphism */}
      <section id="feedback" className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="backdrop-blur-xl bg-card/80 border-2 border-primary/60 shadow-2xl shadow-primary/10">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center text-foreground">{t.feedback.title}</CardTitle>
              <CardDescription className="text-center">
                {t.feedback.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <Textarea
                  placeholder={t.feedback.placeholder}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[120px] bg-input/50 border-primary/20 focus:border-primary/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300"
                />
                <Button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t.feedback.submitting || '提交中...'}
                    </>
                  ) : (
                    t.feedback.submit
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer - Enhanced with subtle glow effects */}
      <footer className="bg-transparent border-t border-primary/20 py-12 px-4 sm:px-6 lg:px-8 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="relative">
                  <Sparkles className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <div className="absolute inset-0 h-6 w-6 bg-primary/20 rounded-full blur-md animate-pulse" />
                </div>
                <span className="text-lg font-bold text-foreground">ArtisanAI</span>
              </div>
              <p className="text-muted-foreground text-sm">{t.footer.tagline}</p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">{t.footer.product}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/pricing"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.nav.pricing}
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.footer.features}
                  </a>
                </li>
                <li>
                  <a
                    href="#how-to-work"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.footer.howToWork}
                  </a>
                </li>
                <li>
                  <a
                    href="#more-creative"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.footer.moreCreative}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">{t.footer.support}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/faq"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.nav.faq}
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.footer.contact}
                  </a>
                </li>
                <li>
                  <a
                    href="#feedback"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    Feedback
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="/terms"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.footer.termsOfService}
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.footer.privacyPolicy}
                  </a>
                </li>
                <li>
                  <a
                    href="/cookies"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.footer.cookiePolicy}
                  </a>
                </li>
                <li>
                  <a
                    href="/refund"
                    className="hover:text-primary transition-colors duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  >
                    {t.footer.refundPolicy}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary/20 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
      </div>

      {/* 图片预览模态框 */}
      {isPreviewOpen && generatedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <img
              src={generatedImage}
              alt="{t?.home?.common?.generated || 'Generated'} image preview"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            
            {/* 预览操作按钮 */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-800"
                onClick={handleDownloadImage}
                title="下载图片"
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white text-gray-800"
                onClick={() => setIsPreviewOpen(false)}
                title="关闭预览"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 点击背景关闭 */}
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setIsPreviewOpen(false)}
          />
        </div>
      )}
      
      {/* Cookie Consent Banner */}
      <CookieConsent />
    </div>
  )
}
