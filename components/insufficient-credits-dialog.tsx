'use client';

import React from 'react';
import { AlertTriangle, CreditCard, Gift, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';

interface InsufficientCreditsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseCredits: () => void;
  currentCredits: number;
  requiredCredits: number;
}

export function InsufficientCreditsDialog({
  isOpen,
  onClose,
  onPurchaseCredits,
  currentCredits,
  requiredCredits,
}: InsufficientCreditsDialogProps) {
  const { t } = useLanguage();

  const creditPackages = [
    {
      id: 'starter',
      credits: 200,
      price: '$9.99',
      bonus: 0,
      popular: false,
    },
    {
      id: 'pro',
      credits: 500,
      price: '$19.99',
      bonus: 100,
      popular: true,
    },
    {
      id: 'premium',
      credits: 1000,
      price: '$34.99',
      bonus: 300,
      popular: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {t?.credits?.insufficient?.title || 'Insufficient Credits'}
          </DialogTitle>
          <DialogDescription>
            {t?.credits?.insufficient?.description || 
              `You need ${requiredCredits} credits to generate an image, but you only have ${currentCredits} credits.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-medium">
                      {t?.credits?.current || 'Current Credits'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t?.credits?.required || 'Required'}: {requiredCredits} | 
                      {t?.credits?.available || 'Available'}: {currentCredits}
                    </p>
                  </div>
                </div>
                <Badge variant="destructive">
                  {currentCredits < requiredCredits ? 
                    (t?.credits?.insufficient?.badge || 'Insufficient') : 
                    (t?.credits?.sufficient?.badge || 'Sufficient')
                  }
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Credit Packages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {t?.credits?.packages?.title || 'Choose a Credit Package'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creditPackages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    pkg.popular ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    onPurchaseCredits();
                    onClose();
                  }}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                      {t?.credits?.packages?.popular || 'Most Popular'}
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">{pkg.credits} Credits</CardTitle>
                    <div className="text-2xl font-bold text-primary">{pkg.price}</div>
                  </CardHeader>
                  
                  <CardContent className="text-center space-y-2">
                    {pkg.bonus > 0 && (
                      <div className="flex items-center justify-center gap-1 text-sm text-green-600">
                        <Gift className="w-4 h-4" />
                        <span>
                          +{pkg.bonus} {t?.credits?.packages?.bonus || 'Bonus Credits'}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {t?.credits?.packages?.perCredit || 'Per credit'}: 
                      ${(parseFloat(pkg.price.replace('$', '')) / pkg.credits).toFixed(3)}
                    </div>
                    
                    <Button 
                      className="w-full mt-3"
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      {t?.credits?.packages?.purchase || 'Purchase'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium">
              {t?.credits?.info?.title || 'How Credits Work'}
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {t?.credits?.info?.generation || 'Each image generation costs 50 credits'}</li>
              <li>• {t?.credits?.info?.quality || 'Higher quality images may require more credits'}</li>
              <li>• {t?.credits?.info?.refund || 'Credits are refunded if generation fails'}</li>
              <li>• {t?.credits?.info?.expiry || 'Credits never expire'}</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              {t?.common?.cancel || 'Cancel'}
            </Button>
            <Button onClick={() => {
              onPurchaseCredits();
              onClose();
            }}>
              <CreditCard className="w-4 h-4 mr-2" />
              {t?.credits?.purchase?.title || 'Purchase Credits'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
