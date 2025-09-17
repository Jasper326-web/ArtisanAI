"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Language = "en" | "zh" | "es" | "fr" | "de" | "ja" | "ko" | "pt" | "ru" | "ar"

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
]

const translations = {
  en: {
    nav: {
      home: "Home",
      pricing: "Pricing",
      faq: "FAQ",
    },
    hero: {
      // Structured keys for precise two-tone headline rendering
      title: "Fire Your Photographer",
      titlePrefix: "Fire Your Photographer",
      titleAnywhere: "",
      subtitle: "The Most Powerful AI Image Generation Model - Keep the same you, anywhere",
      uploadText: "Upload your photos",
      uploadSubtext: "Drag & drop or click to select multiple images",
      placeholder:
        "Describe your vision... (e.g., 'professional headshot in a modern office', '3D figurine on a wooden desk')",
      generateBtn: "Generate Now",
    },
    features: {
      title: "Unleash Your Creative Vision",
      person: {
        title: "Person + Object Generation",
        desc: "Upload person photos with props or backgrounds to generate highly consistent new images in any style.",
        detail: "Perfect for product shots, lifestyle photos, and creative compositions.",
      },
      model3d: {
        title: "3D Model Generation",
        desc: "Transform full-body photos into stunning 3D figurine renderings with multiple viewing angles.",
        detail: "Create collectible figurines, game characters, and 3D avatars.",
      },
      editing: {
        title: "Advanced Photo Editing",
        desc: "Change hairstyles, backgrounds, expressions, and more with AI-powered precision editing.",
        detail: "Professional-quality edits in seconds, not hours.",
      },
    },
    comparison: {
      title: "Why Choose ArtisanAI?",
      features: {
        consistency: "Portrait Consistency",
        figurine: "3D Figurine Generation",
        inputs: "Multiple Input Types",
        speed: "Processing Speed",
      },
    },
    howItWorks: {
      title: "How It Works",
      upload: {
        title: "1. Upload",
        desc: "Upload your photos and describe your vision with detailed text prompts.",
      },
      generate: {
        title: "2. Generate",
        desc: "Our AI processes your inputs and creates stunning, consistent images in seconds.",
      },
      download: {
        title: "3. Download & Share",
        desc: "Download high-resolution images or share directly to your favorite platforms.",
      },
    },
    pricing: {
      title: "Simple, Transparent Pricing",
      subtitle: "Choose the perfect plan for your creative needs. Start with free credits and scale as you grow.",
      most_popular: "Most Popular",
      credits: "Credits",
      images: "Images",
      credits_per_image: "credits per image",
      purchase_now: "Purchase Now",
      processing: "Processing...",
      coming_soon: "Coming Soon",
      coming_soon_description: "This plan will be available after testing is complete.",
      purchase_error: "Purchase Error",
      purchase_error_description: "Failed to create checkout session. Please try again.",
      testing_mode: "Testing Mode",
      why_choose_us: "Why Choose ArtisanAI?",
      feature1_title: "High Quality",
      feature1_description: "Professional-grade AI models for stunning results",
      feature2_title: "Fast Processing",
      feature2_description: "Generate images in seconds, not minutes",
      feature3_title: "Consistent Results",
      feature3_description: "Maintain character consistency across all generations",
      starter: {
        name: "Starter Pack",
        description: "Perfect for beginners",
        feature1: "300 Credits included",
        feature2: "6 High-quality images",
        feature3: "Email support"
      },
      standard: {
        name: "Standard Pack",
        description: "Most popular choice",
        feature1: "700 Credits included",
        feature2: "14 High-quality images",
        feature3: "Priority support"
      },
      advanced: {
        name: "Advanced Pack",
        description: "Better value",
        feature1: "1,600 Credits included",
        feature2: "32 High-quality images",
        feature3: "Priority support"
      },
      professional: {
        name: "Professional Pack",
        description: "For creators",
        feature1: "4,500 Credits included",
        feature2: "90 High-quality images",
        feature3: "Premium support"
      },
      studio: {
        name: "Studio Pack",
        description: "For teams",
        feature1: "10,000 Credits included",
        feature2: "200 High-quality images",
        feature3: "Dedicated support"
      }
    },
    gallery: {
      title: "Community Gallery",
      viewMore: "View More Creations",
    },
    footer: {
      tagline: "Creating the future of AI-powered image generation with consistency and creativity.",
      product: "Product",
      support: "Support",
      legal: "Legal",
      copyright: "© 2024 ArtisanAI. All rights reserved.",
      features: "Features",
      api: "API",
      helpCenter: "Help Center",
      contact: "Contact",
      status: "Status",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      cookiePolicy: "Cookie Policy",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about ArtisanAI",
      questions: {
        whatIs: {
          q: "What is ArtisanAI?",
          a: "ArtisanAI is an advanced AI-powered image generation platform that specializes in creating highly consistent portraits and 3D figurines from your photos.",
        },
        howConsistent: {
          q: "How does ArtisanAI ensure portrait consistency?",
          a: "Our proprietary AI technology analyzes facial features, expressions, and characteristics to maintain consistency across different styles and scenarios.",
        },
        whatFormats: {
          q: "What image formats are supported?",
          a: "We support JPG, PNG, and WebP formats for uploads. Generated images are provided in high-resolution PNG format.",
        },
        howLong: {
          q: "How long does generation take?",
          a: "Most generations complete within 30-60 seconds, depending on complexity and current server load.",
        },
        canCommercial: {
          q: "Can I use generated images commercially?",
          a: "Yes, you have full commercial rights to images generated using your own photos and prompts.",
        },
      },
    },
  },
  zh: {
    nav: {
      home: "首页",
      pricing: "定价",
      faq: "常见问题",
    },
    hero: {
      // Structured keys for precise two-tone headline rendering
      title: "解雇你的摄影师",
      titlePrefix: "解雇你的摄影师",
      titleAnywhere: "",
      subtitle: "最强AI生图模型面世 - 保持同样的你，在任何地方",
      uploadText: "上传您的照片",
      uploadSubtext: "拖放或点击选择多张图片",
      placeholder: "描述您的愿景...（例如：'现代办公室中的专业头像'，'木桌上的3D手办'）",
      generateBtn: "立即生成",
    },
    features: {
      title: "释放您的创意愿景",
      person: {
        title: "人物+物体生成",
        desc: "上传带有道具或背景的人物照片，以任何风格生成高度一致的新图像。",
        detail: "非常适合产品拍摄、生活方式照片和创意构图。",
      },
      model3d: {
        title: "3D模型生成",
        desc: "将全身照片转换为具有多个视角的精美3D手办渲染。",
        detail: "创建收藏手办、游戏角色和3D头像。",
      },
      editing: {
        title: "高级照片编辑",
        desc: "使用AI精确编辑更改发型、背景、表情等。",
        detail: "几秒钟内完成专业质量的编辑，而不是几小时。",
      },
    },
    comparison: {
      title: "为什么选择ArtisanAI？",
      features: {
        consistency: "肖像一致性",
        figurine: "3D手办生成",
        inputs: "多种输入类型",
        speed: "处理速度",
      },
    },
    howItWorks: {
      title: "工作原理",
      upload: {
        title: "1. 上传",
        desc: "上传您的照片并用详细的文本提示描述您的愿景。",
      },
      generate: {
        title: "2. 生成",
        desc: "我们的AI处理您的输入，在几秒钟内创建令人惊叹的一致图像。",
      },
      download: {
        title: "3. 下载和分享",
        desc: "下载高分辨率图像或直接分享到您喜爱的平台。",
      },
    },
    pricing: {
      title: "简单透明的定价",
      subtitle: "选择适合你创意需求的完美计划。从免费积分开始，随成长而扩展。",
      most_popular: "最受欢迎",
      credits: "积分",
      images: "图片",
      credits_per_image: "积分每张图片",
      purchase_now: "立即购买",
      processing: "处理中...",
      coming_soon: "即将推出",
      coming_soon_description: "此计划将在测试完成后提供。",
      purchase_error: "购买错误",
      purchase_error_description: "创建结账会话失败。请重试。",
      testing_mode: "测试模式",
      why_choose_us: "为什么选择ArtisanAI？",
      feature1_title: "高质量",
      feature1_description: "专业级AI模型，带来令人惊叹的结果",
      feature2_title: "快速处理",
      feature2_description: "几秒钟内生成图像，而不是几分钟",
      feature3_title: "一致的结果",
      feature3_description: "在所有生成中保持角色一致性",
      starter: {
        name: "入门包",
        description: "适合初学者",
        feature1: "包含300积分",
        feature2: "6张高质量图片",
        feature3: "邮件支持"
      },
      standard: {
        name: "标准包",
        description: "最受欢迎的选择",
        feature1: "包含700积分",
        feature2: "14张高质量图片",
        feature3: "优先支持"
      },
      advanced: {
        name: "高级包",
        description: "更好的价值",
        feature1: "包含1,600积分",
        feature2: "32张高质量图片",
        feature3: "优先支持"
      },
      professional: {
        name: "专业包",
        description: "为创作者设计",
        feature1: "包含4,500积分",
        feature2: "90张高质量图片",
        feature3: "高级支持"
      },
      studio: {
        name: "工作室包",
        description: "为团队设计",
        feature1: "包含10,000积分",
        feature2: "200张高质量图片",
        feature3: "专属支持"
      }
    },
    gallery: {
      title: "社区画廊",
      viewMore: "查看更多作品",
    },
    footer: {
      tagline: "用一致性和创造力创造AI驱动图像生成的未来。",
      product: "产品",
      support: "支持",
      legal: "法律",
      copyright: "© 2024 ArtisanAI. 保留所有权利。",
      features: "功能",
      api: "API",
      helpCenter: "帮助中心",
      contact: "联系我们",
      status: "状态",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      cookiePolicy: "Cookie政策",
    },
    faq: {
      title: "常见问题",
      subtitle: "找到关于ArtisanAI常见问题的答案",
      questions: {
        whatIs: {
          q: "什么是ArtisanAI？",
          a: "ArtisanAI是一个先进的AI驱动图像生成平台，专门从您的照片创建高度一致的肖像和3D手办。",
        },
        howConsistent: {
          q: "ArtisanAI如何确保肖像一致性？",
          a: "我们的专有AI技术分析面部特征、表情和特征，以在不同风格和场景中保持一致性。",
        },
        whatFormats: {
          q: "支持哪些图像格式？",
          a: "我们支持JPG、PNG和WebP格式上传。生成的图像以高分辨率PNG格式提供。",
        },
        howLong: {
          q: "生成需要多长时间？",
          a: "大多数生成在30-60秒内完成，具体取决于复杂性和当前服务器负载。",
        },
        canCommercial: {
          q: "我可以商业使用生成的图像吗？",
          a: "是的，您对使用自己的照片和提示生成的图像拥有完全的商业权利。",
        },
      },
    },
  },
  es: {
    nav: {
      home: "Inicio",
      pricing: "Precios",
      faq: "Preguntas Frecuentes",
    },
    hero: {
      title: "Despide a tu fotógrafo",
      titlePrefix: "Despide a tu fotógrafo",
      titleAnywhere: "",
      subtitle: "El modelo de generación de imágenes AI más poderoso - Mantén el mismo tú, en cualquier lugar",
      uploadText: "Sube tus fotos",
      uploadSubtext: "Arrastra y suelta o haz clic para seleccionar múltiples imágenes",
      placeholder:
        "Describe tu visión... (ej., 'foto profesional en una oficina moderna', 'figurita 3D en un escritorio de madera')",
      generateBtn: "Generar Ahora",
    },
    features: {
      title: "Libera Tu Visión Creativa",
      person: {
        title: "Generación Persona + Objeto",
        desc: "Sube fotos de personas con accesorios o fondos para generar nuevas imágenes altamente consistentes en cualquier estilo.",
        detail: "Perfecto para fotos de productos, fotos de estilo de vida y composiciones creativas.",
      },
      model3d: {
        title: "Generación de Modelos 3D",
        desc: "Transforma fotos de cuerpo completo en impresionantes renderizados de figuritas 3D con múltiples ángulos de vista.",
        detail: "Crea figuritas coleccionables, personajes de juegos y avatares 3D.",
      },
      editing: {
        title: "Edición Avanzada de Fotos",
        desc: "Cambia peinados, fondos, expresiones y más con edición de precisión impulsada por IA.",
        detail: "Ediciones de calidad profesional en segundos, no horas.",
      },
    },
    comparison: {
      title: "¿Por Qué Elegir ArtisanAI?",
      features: {
        consistency: "Consistencia de Retratos",
        figurine: "Generación de Figuritas 3D",
        inputs: "Múltiples Tipos de Entrada",
        speed: "Velocidad de Procesamiento",
      },
    },
    howItWorks: {
      title: "Cómo Funciona",
      upload: {
        title: "1. Subir",
        desc: "Sube tus fotos y describe tu visión con prompts de texto detallados.",
      },
      generate: {
        title: "2. Generar",
        desc: "Nuestra IA procesa tus entradas y crea imágenes impresionantes y consistentes en segundos.",
      },
      download: {
        title: "3. Descargar y Compartir",
        desc: "Descarga imágenes de alta resolución o comparte directamente en tus plataformas favoritas.",
      },
    },
    pricing: {
      title: "Precios Simples y Transparentes",
      subtitle: "Comienza con 120 puntos gratis. Cada generación cuesta 50 puntos.",
      free: {
        title: "Inicio Gratuito",
        points: "120 Puntos",
        desc: "Perfecto para probar la plataforma",
      },
      perGen: {
        title: "Por Generación",
        points: "50 Puntos",
        desc: "Generación IA de alta calidad",
      },
      purchaseBtn: "Comprar Más Puntos",
      secure: "Procesamiento de pagos seguro vía integración Cream",
    },
    gallery: {
      title: "Galería de la Comunidad",
      viewMore: "Ver Más Creaciones",
    },
    footer: {
      tagline: "Creando el futuro de la generación de imágenes impulsada por IA con consistencia y creatividad.",
      product: "Producto",
      support: "Soporte",
      legal: "Legal",
      copyright: "© 2024 ArtisanAI. Todos los derechos reservados.",
      features: "Características",
      api: "API",
      helpCenter: "Centro de Ayuda",
      contact: "Contacto",
      status: "Estado",
      termsOfService: "Términos de Servicio",
      privacyPolicy: "Política de Privacidad",
      cookiePolicy: "Política de Cookies",
    },
    faq: {
      title: "Preguntas Frecuentes",
      subtitle: "Encuentra respuestas a preguntas comunes sobre ArtisanAI",
      questions: {
        whatIs: {
          q: "¿Qué es ArtisanAI?",
          a: "ArtisanAI es una plataforma avanzada de generación de imágenes impulsada por IA que se especializa en crear retratos altamente consistentes y figuritas 3D a partir de tus fotos.",
        },
        howConsistent: {
          q: "¿Cómo asegura ArtisanAI la consistencia de retratos?",
          a: "Nuestra tecnología IA propietaria analiza características faciales, expresiones y características para mantener consistencia a través de diferentes estilos y escenarios.",
        },
        whatFormats: {
          q: "¿Qué formatos de imagen son compatibles?",
          a: "Soportamos formatos JPG, PNG y WebP para subidas. Las imágenes generadas se proporcionan en formato PNG de alta resolución.",
        },
        howLong: {
          q: "¿Cuánto tiempo toma la generación?",
          a: "La mayoría de las generaciones se completan en 30-60 segundos, dependiendo de la complejidad y la carga actual del servidor.",
        },
        canCommercial: {
          q: "¿Puedo usar las imágenes generadas comercialmente?",
          a: "Sí, tienes derechos comerciales completos sobre las imágenes generadas usando tus propias fotos y prompts.",
        },
      },
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      pricing: "Tarifs",
      faq: "FAQ",
    },
    hero: {
      title: "Licenciez votre photographe",
      titlePrefix: "Licenciez votre photographe",
      titleAnywhere: "",
      subtitle: "Le modèle de génération d'images IA le plus puissant - Gardez le même vous, partout",
      uploadText: "Téléchargez vos photos",
      uploadSubtext: "Glissez-déposez ou cliquez pour sélectionner plusieurs images",
      placeholder:
        "Décrivez votre vision... (ex., 'photo professionnelle dans un bureau moderne', 'figurine 3D sur un bureau en bois')",
      generateBtn: "Générer Maintenant",
    },
    features: {
      title: "Libérez Votre Vision Créative",
      person: {
        title: "Génération Personne + Objet",
        desc: "Téléchargez des photos de personnes avec des accessoires ou des arrière-plans pour générer de nouvelles images hautement cohérentes dans n'importe quel style.",
        detail: "Parfait pour les photos de produits, les photos de style de vie et les compositions créatives.",
      },
      model3d: {
        title: "Génération de Modèles 3D",
        desc: "Transformez des photos en pied en superbes rendus de figurines 3D avec plusieurs angles de vue.",
        detail: "Créez des figurines de collection, des personnages de jeu et des avatars 3D.",
      },
      editing: {
        title: "Édition Photo Avancée",
        desc: "Changez les coiffures, les arrière-plans, les expressions et plus avec l'édition de précision alimentée par l'IA.",
        detail: "Éditions de qualité professionnelle en secondes, pas en heures.",
      },
    },
    comparison: {
      title: "Pourquoi Choisir ArtisanAI?",
      features: {
        consistency: "Cohérence des Portraits",
        figurine: "Génération de Figurines 3D",
        inputs: "Multiples Types d'Entrée",
        speed: "Vitesse de Traitement",
      },
    },
    howItWorks: {
      title: "Comment Ça Marche",
      upload: {
        title: "1. Télécharger",
        desc: "Téléchargez vos photos et décrivez votre vision avec des prompts texte détaillés.",
      },
      generate: {
        title: "2. Générer",
        desc: "Notre IA traite vos entrées et crée des images époustouflantes et cohérentes en secondes.",
      },
      download: {
        title: "3. Télécharger et Partager",
        desc: "Téléchargez des images haute résolution ou partagez directement sur vos plateformes préférées.",
      },
    },
    pricing: {
      title: "Tarifs Simples et Transparents",
      subtitle: "Commencez avec 120 points gratuits. Chaque génération coûte 50 points.",
      free: {
        title: "Démarrage Gratuit",
        points: "120 Points",
        desc: "Parfait pour essayer la plateforme",
      },
      perGen: {
        title: "Par Génération",
        points: "50 Points",
        desc: "Génération IA de haute qualité",
      },
      purchaseBtn: "Acheter Plus de Points",
      secure: "Traitement de paiement sécurisé via l'intégration Cream",
    },
    gallery: {
      title: "Galerie Communautaire",
      viewMore: "Voir Plus de Créations",
    },
    footer: {
      tagline: "Créer l'avenir de la génération d'images alimentée par l'IA avec cohérence et créativité.",
      product: "Produit",
      support: "Support",
      legal: "Légal",
      copyright: "© 2024 ArtisanAI. Tous droits réservés.",
      features: "Fonctionnalités",
      api: "API",
      helpCenter: "Centre d'Aide",
      contact: "Contact",
      status: "Statut",
      termsOfService: "Conditions de Service",
      privacyPolicy: "Politique de Confidentialité",
      cookiePolicy: "Politique des Cookies",
    },
    faq: {
      title: "Questions Fréquemment Posées",
      subtitle: "Trouvez des réponses aux questions courantes sur ArtisanAI",
      questions: {
        whatIs: {
          q: "Qu'est-ce qu'ArtisanAI?",
          a: "ArtisanAI est une plateforme avancée de génération d'images alimentée par l'IA qui se spécialise dans la création de portraits hautement cohérents et de figurines 3D à partir de vos photos.",
        },
        howConsistent: {
          q: "Comment ArtisanAI assure-t-il la cohérence des portraits?",
          a: "Notre technologie IA propriétaire analyse les traits du visage, les expressions et les caractéristiques pour maintenir la cohérence à travers différents styles et scénarios.",
        },
        whatFormats: {
          q: "Quels formats d'image sont pris en charge?",
          a: "Nous prenons en charge les formats JPG, PNG et WebP pour les téléchargements. Les images générées sont fournies au format PNG haute résolution.",
        },
        howLong: {
          q: "Combien de temps prend la génération?",
          a: "La plupart des générations se terminent en 30-60 secondes, selon la complexité et la charge actuelle du serveur.",
        },
        canCommercial: {
          q: "Puis-je utiliser les images générées commercialement?",
          a: "Oui, vous avez des droits commerciaux complets sur les images générées en utilisant vos propres photos et prompts.",
        },
      },
    },
  },
  de: {
    nav: {
      home: "Startseite",
      pricing: "Preise",
      faq: "FAQ",
    },
    hero: {
      title: "Entlassen Sie Ihren Fotografen",
      titlePrefix: "Entlassen Sie Ihren Fotografen",
      titleAnywhere: "",
      subtitle: "Das leistungsstärkste KI-Bildgenerierungsmodell - Bleiben Sie überall derselbe",
      uploadText: "Lade deine Fotos hoch",
      uploadSubtext: "Ziehen & ablegen oder klicken, um mehrere Bilder auszuwählen",
      placeholder:
        "Beschreibe deine Vision... (z.B. 'professionelles Headshot in einem modernen Büro', '3D-Figur auf einem Holzschreibtisch')",
      generateBtn: "Jetzt Generieren",
    },
    features: {
      title: "Entfessle Deine Kreative Vision",
      person: {
        title: "Person + Objekt Generierung",
        desc: "Lade Personenfotos mit Requisiten oder Hintergründen hoch, um hochkonsistente neue Bilder in jedem Stil zu generieren.",
        detail: "Perfekt für Produktaufnahmen, Lifestyle-Fotos und kreative Kompositionen.",
      },
      model3d: {
        title: "3D-Modell Generierung",
        desc: "Verwandle Ganzkörperfotos in atemberaubende 3D-Figuren-Renderings mit mehreren Betrachtungswinkeln.",
        detail: "Erstelle Sammelfiguren, Spielcharaktere und 3D-Avatare.",
      },
      editing: {
        title: "Erweiterte Fotobearbeitung",
        desc: "Ändere Frisuren, Hintergründe, Ausdrücke und mehr mit KI-gestützter Präzisionsbearbeitung.",
        detail: "Professionelle Bearbeitungen in Sekunden, nicht Stunden.",
      },
    },
    comparison: {
      title: "Warum ArtisanAI Wählen?",
      features: {
        consistency: "Porträt-Konsistenz",
        figurine: "3D-Figuren Generierung",
        inputs: "Mehrere Eingabetypen",
        speed: "Verarbeitungsgeschwindigkeit",
      },
    },
    howItWorks: {
      title: "Wie Es Funktioniert",
      upload: {
        title: "1. Hochladen",
        desc: "Lade deine Fotos hoch und beschreibe deine Vision mit detaillierten Textprompts.",
      },
      generate: {
        title: "2. Generieren",
        desc: "Unsere KI verarbeitet deine Eingaben und erstellt atemberaubende, konsistente Bilder in Sekunden.",
      },
      download: {
        title: "3. Herunterladen & Teilen",
        desc: "Lade hochauflösende Bilder herunter oder teile direkt auf deinen Lieblingsplattformen.",
      },
    },
    pricing: {
      title: "Einfache, Transparente Preise",
      subtitle: "Starte mit 120 kostenlosen Punkten. Jede Generierung kostet 50 Punkte.",
      free: {
        title: "Kostenloser Start",
        points: "120 Punkte",
        desc: "Perfekt zum Ausprobieren der Plattform",
      },
      perGen: {
        title: "Pro Generierung",
        points: "50 Punkte",
        desc: "Hochwertige KI-Generierung",
      },
      purchaseBtn: "Mehr Punkte Kaufen",
      secure: "Sichere Zahlungsabwicklung über Cream-Integration",
    },
    gallery: {
      title: "Community-Galerie",
      viewMore: "Mehr Kreationen Ansehen",
    },
    footer: {
      tagline: "Die Zukunft der KI-gestützten Bildgenerierung mit Konsistenz und Kreativität schaffen.",
      product: "Produkt",
      support: "Support",
      legal: "Rechtliches",
      copyright: "© 2024 ArtisanAI. Alle Rechte vorbehalten.",
      features: "Funktionen",
      api: "API",
      helpCenter: "Hilfezentrum",
      contact: "Kontakt",
      status: "Status",
      termsOfService: "Nutzungsbedingungen",
      privacyPolicy: "Datenschutzrichtlinie",
      cookiePolicy: "Cookie-Richtlinie",
    },
    faq: {
      title: "Häufig Gestellte Fragen",
      subtitle: "Finde Antworten auf häufige Fragen zu ArtisanAI",
      questions: {
        whatIs: {
          q: "Was ist ArtisanAI?",
          a: "ArtisanAI ist eine fortschrittliche KI-gestützte Bildgenerierungsplattform, die sich auf die Erstellung hochkonsistenter Porträts und 3D-Figuren aus deinen Fotos spezialisiert hat.",
        },
        howConsistent: {
          q: "Wie gewährleistet ArtisanAI Porträt-Konsistenz?",
          a: "Unsere proprietäre KI-Technologie analysiert Gesichtszüge, Ausdrücke und Eigenschaften, um Konsistenz über verschiedene Stile und Szenarien hinweg zu gewährleisten.",
        },
        whatFormats: {
          q: "Welche Bildformate werden unterstützt?",
          a: "Wir unterstützen JPG-, PNG- und WebP-Formate für Uploads. Generierte Bilder werden im hochauflösenden PNG-Format bereitgestellt.",
        },
        howLong: {
          q: "Wie lange dauert die Generierung?",
          a: "Die meisten Generierungen werden in 30-60 Sekunden abgeschlossen, abhängig von der Komplexität und der aktuellen Serverlast.",
        },
        canCommercial: {
          q: "Kann ich generierte Bilder kommerziell nutzen?",
          a: "Ja, du hast vollständige kommerzielle Rechte an Bildern, die mit deinen eigenen Fotos und Prompts generiert wurden.",
        },
      },
    },
  },
  ja: {
    nav: {
      home: "ホーム",
      pricing: "料金",
      faq: "よくある質問",
    },
    hero: {
      title: "カメラマンを解雇しよう",
      titlePrefix: "カメラマンを解雇しよう",
      titleAnywhere: "",
      subtitle: "最強のAI画像生成モデル - どこでも同じあなたで",
      uploadText: "写真をアップロード",
      uploadSubtext: "ドラッグ＆ドロップまたはクリックして複数の画像を選択",
      placeholder:
        "あなたのビジョンを説明してください...（例：「モダンなオフィスでのプロフェッショナルなヘッドショット」、「木製デスクの上の3Dフィギュア」）",
      generateBtn: "今すぐ生成",
    },
    features: {
      title: "創造的なビジョンを解き放つ",
      person: {
        title: "人物＋オブジェクト生成",
        desc: "小道具や背景のある人物写真をアップロードして、あらゆるスタイルで高度に一貫した新しい画像を生成します。",
        detail: "商品撮影、ライフスタイル写真、クリエイティブな構成に最適です。",
      },
      model3d: {
        title: "3Dモデル生成",
        desc: "全身写真を複数の視点を持つ美しい3Dフィギュアレンダリングに変換します。",
        detail: "コレクタブルフィギュア、ゲームキャラクター、3Dアバターを作成します。",
      },
      editing: {
        title: "高度な写真編集",
        desc: "AI搭載の精密編集で髪型、背景、表情などを変更します。",
        detail: "数時間ではなく数秒でプロ品質の編集。",
      },
    },
    comparison: {
      title: "なぜArtisanAIを選ぶのか？",
      features: {
        consistency: "ポートレートの一貫性",
        figurine: "3Dフィギュア生成",
        inputs: "複数の入力タイプ",
        speed: "処理速度",
      },
    },
    howItWorks: {
      title: "仕組み",
      upload: {
        title: "1. アップロード",
        desc: "写真をアップロードし、詳細なテキストプロンプトでビジョンを説明します。",
      },
      generate: {
        title: "2. 生成",
        desc: "私たちのAIがあなたの入力を処理し、数秒で美しく一貫した画像を作成します。",
      },
      download: {
        title: "3. ダウンロード＆シェア",
        desc: "高解像度画像をダウンロードするか、お気に入りのプラットフォームに直接シェアします。",
      },
    },
    pricing: {
      title: "シンプルで透明な料金",
      subtitle: "120の無料ポイントで始めましょう。各生成は50ポイントです。",
      free: {
        title: "無料スターター",
        points: "120ポイント",
        desc: "プラットフォームを試すのに最適",
      },
      perGen: {
        title: "生成あたり",
        points: "50ポイント",
        desc: "高品質AI生成",
      },
      purchaseBtn: "もっとポイントを購入",
      secure: "Cream統合による安全な決済処理",
    },
    gallery: {
      title: "コミュニティギャラリー",
      viewMore: "もっと作品を見る",
    },
    footer: {
      tagline: "一貫性と創造性でAI駆動画像生成の未来を創造しています。",
      product: "製品",
      support: "サポート",
      legal: "法的事項",
      copyright: "© 2024 ArtisanAI. 全著作権所有。",
      features: "機能",
      api: "API",
      helpCenter: "ヘルプセンター",
      contact: "お問い合わせ",
      status: "ステータス",
      termsOfService: "利用規約",
      privacyPolicy: "プライバシーポリシー",
      cookiePolicy: "Cookieポリシー",
    },
    faq: {
      title: "よくある質問",
      subtitle: "ArtisanAIに関するよくある質問の回答を見つけてください",
      questions: {
        whatIs: {
          q: "ArtisanAIとは何ですか？",
          a: "ArtisanAIは、あなたの写真から高度に一貫したポートレートと3Dフィギュアを作成することに特化した先進的なAI駆動画像生成プラットフォームです。",
        },
        howConsistent: {
          q: "ArtisanAIはどのようにポートレートの一貫性を確保しますか？",
          a: "私たちの独自のAI技術は、顔の特徴、表情、特性を分析して、異なるスタイルやシナリオ間で一貫性を維持します。",
        },
        whatFormats: {
          q: "どの画像フォーマットがサポートされていますか？",
          a: "アップロードにはJPG、PNG、WebPフォーマットをサポートしています。生成された画像は高解像度PNG形式で提供されます。",
        },
        howLong: {
          q: "生成にはどのくらい時間がかかりますか？",
          a: "ほとんどの生成は、複雑さと現在のサーバー負荷に応じて30-60秒で完了します。",
        },
        canCommercial: {
          q: "生成された画像を商用利用できますか？",
          a: "はい、あなた自身の写真とプロンプトを使用して生成された画像に対して完全な商用権利を持っています。",
        },
      },
    },
  },
  ko: {
    nav: {
      home: "홈",
      pricing: "가격",
      faq: "자주 묻는 질문",
    },
    hero: {
      title: "사진작가를 해고하세요",
      titlePrefix: "사진작가를 해고하세요",
      titleAnywhere: "",
      subtitle: "가장 강력한 AI 이미지 생성 모델 - 어디서나 같은 당신으로",
      uploadText: "사진 업로드",
      uploadSubtext: "드래그 앤 드롭하거나 클릭하여 여러 이미지 선택",
      placeholder:
        "당신의 비전을 설명하세요... (예: '현대적인 사무실에서의 전문적인 헤드샷', '나무 책상 위의 3D 피규어')",
      generateBtn: "지금 생성",
    },
    features: {
      title: "창의적 비전을 해방하세요",
      person: {
        title: "인물 + 객체 생성",
        desc: "소품이나 배경이 있는 인물 사진을 업로드하여 모든 스타일에서 고도로 일관된 새로운 이미지를 생성하세요.",
        detail: "제품 촬영, 라이프스타일 사진, 창의적 구성에 완벽합니다.",
      },
      model3d: {
        title: "3D 모델 생성",
        desc: "전신 사진을 여러 시점을 가진 멋진 3D 피규어 렌더링으로 변환하세요.",
        detail: "수집용 피규어, 게임 캐릭터, 3D 아바타를 만드세요.",
      },
      editing: {
        title: "고급 사진 편집",
        desc: "AI 기반 정밀 편집으로 헤어스타일, 배경, 표정 등을 변경하세요.",
        detail: "몇 시간이 아닌 몇 초 만에 전문가 수준의 편집.",
      },
    },
    comparison: {
      title: "왜 ArtisanAI를 선택해야 할까요?",
      features: {
        consistency: "초상화 일관성",
        figurine: "3D 피규어 생성",
        inputs: "다중 입력 유형",
        speed: "처리 속도",
      },
    },
    howItWorks: {
      title: "작동 방식",
      upload: {
        title: "1. 업로드",
        desc: "사진을 업로드하고 상세한 텍스트 프롬프트로 비전을 설명하세요.",
      },
      generate: {
        title: "2. 생성",
        desc: "우리의 AI가 입력을 처리하고 몇 초 만에 놀라운 일관된 이미지를 생성합니다.",
      },
      download: {
        title: "3. 다운로드 및 공유",
        desc: "고해상도 이미지를 다운로드하거나 좋아하는 플랫폼에 직접 공유하세요.",
      },
    },
    pricing: {
      title: "간단하고 투명한 가격",
      subtitle: "120개의 무료 포인트로 시작하세요. 각 생성은 50포인트입니다.",
      free: {
        title: "무료 스타터",
        points: "120포인트",
        desc: "플랫폼을 시도해보기에 완벽",
      },
      perGen: {
        title: "생성당",
        points: "50포인트",
        desc: "고품질 AI 생성",
      },
      purchaseBtn: "더 많은 포인트 구매",
      secure: "Cream 통합을 통한 안전한 결제 처리",
    },
    gallery: {
      title: "커뮤니티 갤러리",
      viewMore: "더 많은 작품 보기",
    },
    footer: {
      tagline: "일관성과 창의성으로 AI 기반 이미지 생성의 미래를 만들어갑니다.",
      product: "제품",
      support: "지원",
      legal: "법적 사항",
      copyright: "© 2024 ArtisanAI. 모든 권리 보유.",
      features: "기능",
      api: "API",
      helpCenter: "도움말 센터",
      contact: "연락처",
      status: "상태",
      termsOfService: "서비스 약관",
      privacyPolicy: "개인정보 보호정책",
      cookiePolicy: "쿠키 정책",
    },
    faq: {
      title: "자주 묻는 질문",
      subtitle: "ArtisanAI에 대한 일반적인 질문의 답변을 찾아보세요",
      questions: {
        whatIs: {
          q: "ArtisanAI란 무엇인가요?",
          a: "ArtisanAI는 사진에서 고도로 일관된 초상화와 3D 피규어를 만드는 데 특화된 고급 AI 기반 이미지 생성 플랫폼입니다.",
        },
        howConsistent: {
          q: "ArtisanAI는 어떻게 초상화 일관성을 보장하나요?",
          a: "우리의 독점 AI 기술은 얼굴 특징, 표정, 특성을 분석하여 다양한 스타일과 시나리오에서 일관성을 유지합니다.",
        },
        whatFormats: {
          q: "어떤 이미지 형식이 지원되나요?",
          a: "업로드에는 JPG, PNG, WebP 형식을 지원합니다. 생성된 이미지는 고해상도 PNG 형식으로 제공됩니다.",
        },
        howLong: {
          q: "생성에는 얼마나 걸리나요?",
          a: "대부분의 생성은 복잡성과 현재 서버 부하에 따라 30-60초 내에 완료됩니다.",
        },
        canCommercial: {
          q: "생성된 이미지를 상업적으로 사용할 수 있나요?",
          a: "네, 자신의 사진과 프롬프트를 사용하여 생성된 이미지에 대한 완전한 상업적 권리를 가집니다.",
        },
      },
    },
  },
  pt: {
    nav: {
      home: "Início",
      pricing: "Preços",
      faq: "Perguntas Frequentes",
    },
    hero: {
      title: "Demita seu fotógrafo",
      titlePrefix: "Demita seu fotógrafo",
      titleAnywhere: "",
      subtitle: "O modelo de geração de imagens IA mais poderoso - Mantenha o mesmo você, em qualquer lugar",
      uploadText: "Faça upload das suas fotos",
      uploadSubtext: "Arraste e solte ou clique para selecionar múltiplas imagens",
      placeholder:
        "Descreva sua visão... (ex., 'foto profissional em um escritório moderno', 'figura 3D em uma mesa de madeira')",
      generateBtn: "Gerar Agora",
    },
    features: {
      title: "Liberte Sua Visão Criativa",
      person: {
        title: "Geração Pessoa + Objeto",
        desc: "Faça upload de fotos de pessoas com adereços ou fundos para gerar novas imagens altamente consistentes em qualquer estilo.",
        detail: "Perfeito para fotos de produtos, fotos de estilo de vida e composições criativas.",
      },
      model3d: {
        title: "Geração de Modelos 3D",
        desc: "Transforme fotos de corpo inteiro em renderizações impressionantes de figuras 3D com múltiplos ângulos de visualização.",
        detail: "Crie figuras colecionáveis, personagens de jogos e avatares 3D.",
      },
      editing: {
        title: "Edição Avançada de Fotos",
        desc: "Mude penteados, fundos, expressões e mais com edição de precisão alimentada por IA.",
        detail: "Edições de qualidade profissional em segundos, não horas.",
      },
    },
    comparison: {
      title: "Por Que Escolher ArtisanAI?",
      features: {
        consistency: "Consistência de Retratos",
        figurine: "Geração de Figuras 3D",
        inputs: "Múltiplos Tipos de Entrada",
        speed: "Velocidade de Processamento",
      },
    },
    howItWorks: {
      title: "Como Funciona",
      upload: {
        title: "1. Upload",
        desc: "Faça upload das suas fotos e descreva sua visão com prompts de texto detalhados.",
      },
      generate: {
        title: "2. Gerar",
        desc: "Nossa IA processa suas entradas e cria imagens impressionantes e consistentes em segundos.",
      },
      download: {
        title: "3. Download e Compartilhar",
        desc: "Baixe imagens em alta resolução ou compartilhe diretamente nas suas plataformas favoritas.",
      },
    },
    pricing: {
      title: "Preços Simples e Transparentes",
      subtitle: "Comece com 120 pontos grátis. Cada geração custa 50 pontos.",
      free: {
        title: "Início Gratuito",
        points: "120 Pontos",
        desc: "Perfeito para experimentar a plataforma",
      },
      perGen: {
        title: "Por Geração",
        points: "50 Pontos",
        desc: "Geração IA de alta qualidade",
      },
      purchaseBtn: "Comprar Mais Pontos",
      secure: "Processamento de pagamento seguro via integração Cream",
    },
    gallery: {
      title: "Galeria da Comunidade",
      viewMore: "Ver Mais Criações",
    },
    footer: {
      tagline: "Criando o futuro da geração de imagens alimentada por IA com consistência e criatividade.",
      product: "Produto",
      support: "Suporte",
      legal: "Legal",
      copyright: "© 2024 ArtisanAI. Todos os direitos reservados.",
      features: "Recursos",
      api: "API",
      helpCenter: "Central de Ajuda",
      contact: "Contato",
      status: "Status",
      termsOfService: "Termos de Serviço",
      privacyPolicy: "Política de Privacidade",
      cookiePolicy: "Política de Cookies",
    },
    faq: {
      title: "Perguntas Frequentes",
      subtitle: "Encontre respostas para perguntas comuns sobre ArtisanAI",
      questions: {
        whatIs: {
          q: "O que é ArtisanAI?",
          a: "ArtisanAI é uma plataforma avançada de geração de imagens alimentada por IA que se especializa em criar retratos altamente consistentes e figuras 3D a partir das suas fotos.",
        },
        howConsistent: {
          q: "Como o ArtisanAI garante a consistência dos retratos?",
          a: "Nossa tecnologia IA proprietária analisa características faciais, expressões e características para manter consistência através de diferentes estilos e cenários.",
        },
        whatFormats: {
          q: "Quais formatos de imagem são suportados?",
          a: "Suportamos formatos JPG, PNG e WebP para uploads. Imagens geradas são fornecidas em formato PNG de alta resolução.",
        },
        howLong: {
          q: "Quanto tempo leva a geração?",
          a: "A maioria das gerações completa em 30-60 segundos, dependendo da complexidade e carga atual do servidor.",
        },
        canCommercial: {
          q: "Posso usar imagens geradas comercialmente?",
          a: "Sim, você tem direitos comerciais completos sobre imagens geradas usando suas próprias fotos e prompts.",
        },
      },
    },
  },
  ru: {
    nav: {
      home: "Главная",
      pricing: "Цены",
      faq: "Часто задаваемые вопросы",
    },
    hero: {
      title: "Увольте своего фотографа",
      titlePrefix: "Увольте своего фотографа",
      titleAnywhere: "",
      subtitle: "Самая мощная модель генерации изображений ИИ - Оставайтесь собой везде",
      uploadText: "Загрузите ваши фотографии",
      uploadSubtext: "Перетащите или нажмите для выбора нескольких изображений",
      placeholder:
        "Опишите ваше видение... (например, 'профессиональный портрет в современном офисе', '3D фигурка на деревянном столе')",
      generateBtn: "Создать сейчас",
    },
    features: {
      title: "Освободите ваше творческое видение",
      person: {
        title: "Генерация Человек + Объект",
        desc: "Загружайте фотографии людей с реквизитом или фонами для создания высококонсистентных новых изображений в любом стиле.",
        detail: "Идеально для продуктовых съемок, lifestyle фотографий и творческих композиций.",
      },
      model3d: {
        title: "Генерация 3D моделей",
        desc: "Превращайте фотографии в полный рост в потрясающие 3D рендеры фигурок с множественными углами обзора.",
        detail: "Создавайте коллекционные фигурки, игровых персонажей и 3D аватары.",
      },
      editing: {
        title: "Продвинутое редактирование фото",
        desc: "Изменяйте прически, фоны, выражения лица и многое другое с помощью точного редактирования на основе ИИ.",
        detail: "Профессиональное качество редактирования за секунды, а не часы.",
      },
    },
    comparison: {
      title: "Почему выбрать ArtisanAI?",
      features: {
        consistency: "Консистентность портретов",
        figurine: "Генерация 3D фигурок",
        inputs: "Множественные типы ввода",
        speed: "Скорость обработки",
      },
    },
    howItWorks: {
      title: "Как это работает",
      upload: {
        title: "1. Загрузка",
        desc: "Загрузите ваши фотографии и опишите ваше видение детальными текстовыми подсказками.",
      },
      generate: {
        title: "2. Генерация",
        desc: "Наш ИИ обрабатывает ваши данные и создает потрясающие, консистентные изображения за секунды.",
      },
      download: {
        title: "3. Скачивание и Поделиться",
        desc: "Скачивайте изображения высокого разрешения или делитесь напрямую на ваших любимых платформах.",
      },
    },
    pricing: {
      title: "Простые, прозрачные цены",
      subtitle: "Начните со 120 бесплатными очками. Каждая генерация стоит 50 очков.",
      free: {
        title: "Бесплатный старт",
        points: "120 очков",
        desc: "Идеально для знакомства с платформой",
      },
      perGen: {
        title: "За генерацию",
        points: "50 очков",
        desc: "Высококачественная ИИ генерация",
      },
      purchaseBtn: "Купить больше очков",
      secure: "Безопасная обработка платежей через интеграцию Cream",
    },
    gallery: {
      title: "Галерея сообщества",
      viewMore: "Посмотреть больше творений",
    },
    footer: {
      tagline: "Создаем будущее ИИ-генерации изображений с консистентностью и креативностью.",
      product: "Продукт",
      support: "Поддержка",
      legal: "Правовая информация",
      copyright: "© 2024 ArtisanAI. Все права защищены.",
      features: "Функции",
      api: "API",
      helpCenter: "Центр помощи",
      contact: "Контакты",
      status: "Статус",
      termsOfService: "Условия обслуживания",
      privacyPolicy: "Политика конфиденциальности",
      cookiePolicy: "Политика использования файлов cookie",
    },
    faq: {
      title: "Часто задаваемые вопросы",
      subtitle: "Найдите ответы на распространенные вопросы об ArtisanAI",
      questions: {
        whatIs: {
          q: "Что такое ArtisanAI?",
          a: "ArtisanAI - это продвинутая платформа генерации изображений на основе ИИ, которая специализируется на создании высококонсистентных портретов и 3D фигурок из ваших фотографий.",
        },
        howConsistent: {
          q: "Как ArtisanAI обеспечивает консистентность портретов?",
          a: "Наша собственная ИИ технология анализирует черты лица, выражения и характеристики для поддержания консистентности в разных стилях и сценариях.",
        },
        whatFormats: {
          q: "Какие форматы изображений поддерживаются?",
          a: "Мы поддерживаем форматы JPG, PNG и WebP для загрузки. Сгенерированные изображения предоставляются в высоком разрешении PNG.",
        },
        howLong: {
          q: "Сколько времени занимает генерация?",
          a: "Большинство генераций завершается за 30-60 секунд, в зависимости от сложности и текущей нагрузки сервера.",
        },
        canCommercial: {
          q: "Могу ли я использовать сгенерированные изображения коммерчески?",
          a: "Да, у вас есть полные коммерческие права на изображения, сгенерированные с использованием ваших собственных фотографий и подсказок.",
        },
      },
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      pricing: "الأسعار",
      faq: "الأسئلة الشائعة",
    },
    hero: {
      title: "اطرد مصورك",
      titlePrefix: "اطرد مصورك",
      titleAnywhere: "",
      subtitle: "أقوى نموذج لتوليد الصور بالذكاء الاصطناعي - ابق نفسك، في أي مكان",
      uploadText: "ارفع صورك",
      uploadSubtext: "اسحب وأفلت أو انقر لاختيار صور متعددة",
      placeholder: "صف رؤيتك... (مثل، 'صورة مهنية في مكتب حديث'، 'تمثال ثلاثي الأبعاد على مكتب خشبي')",
      generateBtn: "إنتاج الآن",
    },
    features: {
      title: "أطلق رؤيتك الإبداعية",
      person: {
        title: "إنتاج شخص + كائن",
        desc: "ارفع صور أشخاص مع دعائم أو خلفيات لإنتاج صور جديدة عالية الاتساق بأي نمط.",
        detail: "مثالي لصور المنتجات، صور نمط الحياة، والتركيبات الإبداعية.",
      },
      model3d: {
        title: "إنتاج نماذج ثلاثية الأبعاد",
        desc: "حول صور الجسم الكامل إلى عروض تماثيل ثلاثية الأبعاد مذهلة بزوايا عرض متعددة.",
        detail: "إنشاء تماثيل قابلة للجمع، شخصيات ألعاب، وصور رمزية ثلاثية الأبعاد.",
      },
      editing: {
        title: "تحرير صور متقدم",
        desc: "غير تسريحات الشعر، الخلفيات، التعبيرات وأكثر بتحرير دقيق مدعوم بالذكاء الاصطناعي.",
        detail: "تحريرات بجودة احترافية في ثوانٍ، وليس ساعات.",
      },
    },
    comparison: {
      title: "لماذا تختار ArtisanAI؟",
      features: {
        consistency: "اتساق الصور الشخصية",
        figurine: "إنتاج تماثيل ثلاثية الأبعاد",
        inputs: "أنواع إدخال متعددة",
        speed: "سرعة المعالجة",
      },
    },
    howItWorks: {
      title: "كيف يعمل",
      upload: {
        title: "1. الرفع",
        desc: "ارفع صورك وصف رؤيتك بنصوص توجيه مفصلة.",
      },
      generate: {
        title: "2. الإنتاج",
        desc: "يعالج ذكاؤنا الاصطناعي مدخلاتك وينشئ صوراً مذهلة ومتسقة في ثوانٍ.",
      },
      download: {
        title: "3. التحميل والمشاركة",
        desc: "حمل صوراً عالية الدقة أو شارك مباشرة على منصاتك المفضلة.",
      },
    },
    pricing: {
      title: "أسعار بسيطة وشفافة",
      subtitle: "ابدأ بـ 120 نقطة مجانية. كل إنتاج يكلف 50 نقطة.",
      free: {
        title: "البداية المجانية",
        points: "120 نقطة",
        desc: "مثالي لتجربة المنصة",
      },
      perGen: {
        title: "لكل إنتاج",
        points: "50 نقطة",
        desc: "إنتاج ذكاء اصطناعي عالي الجودة",
      },
      purchaseBtn: "شراء المزيد من النقاط",
      secure: "معالجة دفع آمنة عبر تكامل Cream",
    },
    gallery: {
      title: "معرض المجتمع",
      viewMore: "عرض المزيد من الإبداعات",
    },
    footer: {
      tagline: "إنشاء مستقبل إنتاج الصور المدعوم بالذكاء الاصطناعي بالاتساق والإبداع.",
      product: "المنتج",
      support: "الدعم",
      legal: "قانوني",
      copyright: "© 2024 ArtisanAI. جميع الحقوق محفوظة.",
      features: "الميزات",
      api: "واجهة برمجة التطبيقات",
      helpCenter: "مركز المساعدة",
      contact: "اتصل بنا",
      status: "الحالة",
      termsOfService: "شروط الخدمة",
      privacyPolicy: "سياسة الخصوصية",
      cookiePolicy: "سياسة ملفات تعريف الارتباط",
    },
    faq: {
      title: "الأسئلة الشائعة",
      subtitle: "اعثر على إجابات للأسئلة الشائعة حول ArtisanAI",
      questions: {
        whatIs: {
          q: "ما هو ArtisanAI؟",
          a: "ArtisanAI هو منصة متقدمة لإنتاج الصور مدعومة بالذكاء الاصطناعي متخصصة في إنشاء صور شخصية عالية الاتساق وتماثيل ثلاثية الأبعاد من صورك.",
        },
        howConsistent: {
          q: "كيف يضمن ArtisanAI اتساق الصور الشخصية؟",
          a: "تقنية الذكاء الاصطناعي الخاصة بنا تحلل ملامح الوجه والتعبيرات والخصائص للحفاظ على الاتساق عبر أنماط وسيناريوهات مختلفة.",
        },
        whatFormats: {
          q: "ما هي تنسيقات الصور المدعومة؟",
          a: "ندعم تنسيقات JPG وPNG وWebP للرفع. الصور المنتجة تُقدم بتنسيق PNG عالي الدقة.",
        },
        howLong: {
          q: "كم يستغرق الإنتاج؟",
          a: "معظم عمليات الإنتاج تكتمل في 30-60 ثانية، حسب التعقيد والحمولة الحالية للخادم.",
        },
        canCommercial: {
          q: "هل يمكنني استخدام الصور المنتجة تجارياً؟",
          a: "نعم، لديك حقوق تجارية كاملة على الصور المنتجة باستخدام صورك ونصوص التوجيه الخاصة بك.",
        },
      },
    },
  },
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && languages.find((lang) => lang.code === savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  const value = {
    language,
    setLanguage,
    t: translations[language],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
