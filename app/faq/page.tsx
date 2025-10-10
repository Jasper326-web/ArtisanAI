"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, ArrowLeft, HelpCircle } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function FAQPage() {
  const { t } = useLanguage()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="min-h-screen bg-transparent">

      {/* Breadcrumb - Enhanced with glow effect */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.faq.breadcrumb || "Back to Home"}
        </Link>
      </div>

      {/* FAQ Section - Enhanced with futuristic styling */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full mb-6 shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transition-all duration-500">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              {t.faq.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{t.faq.subtitle}</p>
          </div>

          <div className="space-y-4">
            {Object.entries(t.faq.questions).map(([key, item]) => (
              <Card
                key={key}
                className="backdrop-blur-xl bg-card/30 border border-primary/20 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:border-primary/40 group"
              >
                <CardHeader className="cursor-pointer" onClick={() => toggleExpanded(key)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-left text-foreground pr-4 group-hover:text-primary transition-colors duration-300">
                      {item.q}
                    </CardTitle>
                    <div className="flex-shrink-0 p-2 rounded-full group-hover:bg-primary/10 transition-all duration-300">
                      {expandedItems.has(key) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {expandedItems.has(key) && (
                  <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-primary/10 pt-4">
                      <CardDescription className="text-muted-foreground leading-relaxed">{item.a}</CardDescription>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Contact Section - Enhanced with glassmorphism */}
          <div className="mt-16 text-center">
            <Card className="backdrop-blur-xl bg-card/30 border border-primary/30 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-500">
              <CardContent className="p-8">
                <div className="relative inline-block mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                    <HelpCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {t.faq.contact?.title || "Still have questions?"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t.faq.contact?.subtitle ||
                    "Can't find the answer you're looking for? Our support team is here to help."}
                </p>
                <Link href="/contact">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all duration-300"
                  >
                    {t.faq.contact?.button || "Contact Support"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer removed to avoid duplicate/global footer */}
    </div>
  )
}
