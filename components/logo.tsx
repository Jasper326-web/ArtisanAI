import Image from 'next/image'
import ShinyText from './shiny-text'

interface LogoProps {
  size?: number;
  className?: string;
  src?: string; // allow overriding the logo path
  showText?: boolean; // whether to show the rotating text
}

export default function Logo({ size = 40, className = '', src = '/截屏2025-09-05 09.40.53.png', showText = true }: LogoProps) {
  // Use the new logo image
  const fallbackSrc = '/placeholder-logo.png'
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div
        className="relative overflow-hidden rounded-full"
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt="Artisan AI Logo"
          fill
          sizes={`${size}px`}
          className="object-cover rounded-full"
          onError={(e) => {
            const img = e.currentTarget as any
            if (img && img.src !== fallbackSrc) img.src = fallbackSrc
          }}
        />
      </div>
      {showText && (
        <div className="flex items-center">
          <span className="text-white font-bold text-lg mr-2">Artisan</span>
          <ShinyText
            text="AI"
            disabled={false}
            speed={2}
            className="px-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-1 rounded-lg font-bold text-lg"
          />
        </div>
      )}
    </div>
  )
}
