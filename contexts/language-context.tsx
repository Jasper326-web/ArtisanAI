"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export type Language = "en" | "zh"

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
]

const translations = {
  en: {
    howItWorks: {
      title: "How It Works",
      subtitle: "Simple and transparent pricing",
      upload: {
        title: "1. Upload",
        desc: "Upload photos and describe your vision with detailed text prompts.",
      },
      generate: {
        title: "2. Generate",
        desc: "Our AI processes your input and creates beautiful, consistent images in seconds.",
      },
      download: {
        title: "3. Download & Share",
        desc: "Download high-resolution images or share directly to your favorite platforms.",
      },
    },
    home: {
      common: { original: "Original", generated: "Generated", reference: "Reference" },
      consistency: {
        title: "Perfect Character Consistency",
        subtitle:
          "The strongest model for character consistency – maintain the same person across styles, outfits and scenes while preserving unique facial features",
      },
      case1: {
        title: "Case Study 1: Style Transformation",
        baseModel: "Base Model",
        sunglasses: "Sunglasses",
        skateboard: "Skateboard",
        styleReferences: "Style References",
        generatedResult: "Generated Result",
        perfectFusion: "Generated Perfect Fusion",
        sameFace: "Same face, new style",
      },
      case2: {
        title: "Case Study 2: Outfit Change",
        baseModel: "Base Model",
        styleReference: "Style Reference",
        perfectMatch: "Perfect Match",
        samePersonNewOutfit: "Same person, new outfit",
        greenDress: "Green Dress",
      },
      whyConsistency: {
        title: "Why Character Consistency Matters",
        facialRecognition: "Facial Recognition",
        facialRecognitionDesc:
          "AI preserves unique facial features, bone structure, and expressions across all generations",
        styleFlexibility: "Style Flexibility",
        styleFlexibilityDesc:
          "Change outfits, accessories, and backgrounds while maintaining the same person",
        professionalQuality: "Professional Quality",
        professionalQualityDesc:
          "High-resolution, studio-quality images that look natural and professional",
      },
      editing: {
        title: "Advanced AI Photo Editing",
        subtitle:
          "Delete your photo editing software! Remove watermarks and tattoos flawlessly, from basic retouching to creative transformations - experience the power of AI photo editing",
        step1: {
          title: "Step 1: Original Photo",
          original: "Original Photo with Tattoo",
          description: "Girl with chest tattoo",
          detail: "Starting point - natural photo with existing tattoo",
        },
        step2: {
          title: "Step 2: Remove Tattoo",
          result: "Tattoo Removed",
          description: "Tattoo Completely Removed",
          detail: "AI seamlessly removes the chest tattoo while preserving skin texture",
        },
        step3: {
          title: "Step 3: Add New Tattoo",
          reference: {
            title: "Reference Tattoo Design",
            description: "New tattoo design to be added",
          },
          result: {
            title: "Generated Result",
            description: "New Tattoo Applied",
            detail: "AI adds the new tattoo design to the same chest position",
          },
        },
        step4: {
          title: "Step 4: Creative Styling",
          result: "Hair and Makeup Changed",
          description: "Hair Color & Makeup Changed",
          detail:
            "AI transforms hair color and lipstick while maintaining facial features",
        },
        step5: {
          title: "Step 5: Expression Editing",
          result: "Smiling Expression",
          description: "Natural Smile Added",
          detail:
            "AI adds a natural smile while preserving the person's unique facial structure",
        },
        caseStudy2: {
          title: "Case Study 2: Accessory Replacement",
          original: {
            title: "Original Photo",
            description: "Woman with Original Necklace",
            detail: "Starting point with existing accessory",
          },
          reference: {
            title: "New Necklace Design",
            description: "New necklace design to replace the original",
          },
          result: {
            title: "Generated Result",
            description: "Necklace Successfully Replaced",
            detail:
              "AI seamlessly replaces the original necklace with the new design while maintaining natural lighting and shadows",
          },
        },
        whyChoose: {
          title: "Why Choose Our AI Photo Editor?",
          features: {
      professional: {
              icon: "🎨",
              title: "Professional Quality",
              description: "Studio-grade editing results with natural-looking outcomes",
            },
            fast: {
              icon: "⚡",
              title: "Lightning Fast",
              description: "Get results in seconds, not hours of manual editing",
            },
            precise: {
              icon: "🎯",
              title: "Precise Control",
              description: "Fine-tune every detail with advanced AI algorithms",
            },
          },
        },
      },
      model3d: {
        title: "AI 3D Model Generation",
        subtitle:
          "Personalized 3D model generation - can be further processed in 3D software, from real photos to anime characters, creating exclusive 3D figurines",
        caseStudy1: {
          title: "Case Study 1: Real Person to 3D Figurine",
          original: {
            title: "Original Photo",
            description: "Real Person Photo",
            detail: "High-quality portrait for 3D conversion",
          },
          result: {
            title: "3D Figurine Result",
            description: "Professional 3D Figurine",
            detail:
              "AI converts real person into detailed 3D collectible figurine",
          },
        },
        caseStudy2: {
          title: "Case Study 2: Anime Characters to 3D Figurines",
          example1: {
            title: "Anime Character 1",
            original: { 
              title: "Original Anime Art",
              detail: "Original anime artwork for 3D conversion"
            },
            result: {
              title: "3D Figurine Result",
              description: "3D Anime Figurine",
              detail:
                "AI transforms 2D anime into detailed 3D collectible",
            },
          },
          example2: {
            title: "Anime Character 2",
            original: { 
              title: "Original Anime Art",
              detail: "Another anime artwork for 3D conversion"
            },
            result: {
              title: "3D Figurine Result",
              description: "3D Anime Figurine",
              detail:
                "AI creates detailed 3D figurine from 2D anime art",
            },
          },
        },
        caseStudy3: {
          title: "Case Study 3: Building to 3D Model",
          original: { title: "Original Building Photo" },
          result: {
            title: "3D Model Results",
            view1: {
              title: "3D Model - View 1",
              description: "First perspective of the 3D building model",
            },
            view2: {
              title: "3D Model - View 2",
              description:
                "Different perspective of the same 3D building model",
            },
          },
        },
        whyChoose: {
          title: "Why Choose Our 3D Generation?",
      features: {
            fidelity: {
              icon: "🎯",
              title: "High Fidelity",
              description:
                "Preserve every detail from original photos and artwork",
            },
            styles: {
              icon: "🎨",
              title: "Multiple Styles",
              description:
                "Works with real photos, anime, and any 2D artwork",
            },
            quality: {
              icon: "🏆",
              title: "Collectible Quality",
              description:
                "Professional-grade 3D models ready for printing",
            },
          },
        },
      },
      product: {
        title: "AI Product Photography & Poster Design",
        subtitle:
          "Fire your product photographer and poster designer! Multi-dimensional product + scene + character display, one-click generation of professional product posters",
        caseStudy1: {
          title: "Case Study 1: Essential Oil Product",
          step1: {
            title: "Step 1: Original Product",
            description: "Essential Oil Product",
            detail: "Starting point - clean product photo for marketing",
          },
          step2: { title: "Step 2: Model Integration" },
          step3: { title: "Step 3: Product in Hand" },
          step4: { title: "Step 4: Professional Poster Design" },
        },
        caseStudy2: {
          title: "Case Study 2: Men's Skincare Product",
          original: {
            title: "Men's Skincare Product",
            description: "Men's Skincare Product",
            detail: "Professional men's skincare product for marketing campaign",
          },
          result: {
            title: "Professional Product Poster",
            description: "Men's Skincare Product Poster",
            detail:
              "AI creates professional product poster with modern design and branding",
          },
        },
        whyChoose: {
          title: "Why Choose Our AI Product Photography?",
          features: {
            professional: {
              icon: "📸",
              title: "Professional Quality",
              description:
                "Studio-grade product photography without expensive equipment",
            },
            fast: {
              icon: "⚡",
              title: "Lightning Fast",
              description:
                "Generate multiple product shots and posters in minutes",
            },
            creative: {
              icon: "🎨",
              title: "Creative Control",
              description:
                "Customize scenes, models, and layouts for your brand",
            },
          },
        },
      },
    },
    hero: {
      title: "The Most Powerful AI Image model Ever",
      subtitle: "One-stop AI image generation editor",
      subtitle2: "Creative generation, P-pictures, watermark removal, 3D redraw, nothing is impossible",
      subtitle1: "One-stop AI image generator & editor",
      subtitle2: "Create. Edit. Transform.",
      subtitle3: "nothing is impossible",
      tags: {
        nanoBanana: "Support by Nano Banana",
        consistency: "Ultra Character Consistency", 
        freeCredits: "High Free Credits"
      },
      updates: {
        title: "Recent Updates",
        v2_0_0: {
          title: "🎉 Brand New UI Design & Credit System Upgrade",
          content: "Completely redesigned user interface with modern glassmorphism effects. User registration credits increased from 120 to 220, offering more generous free credits. Added multi-language support with seamless Chinese-English switching. New tag system showcasing product features."
        },
        v1_9_0: {
          title: "🎨 UI Beautification & User Experience Optimization", 
          content: "Redesigned main title and subtitle styles with rainbow gradient effects. Optimized tag design using glassmorphism effects and semi-transparent borders. Adjusted page spacing and layout for enhanced visual appeal."
        }
      },
      profile: {
        title: "Profile",
        userInfo: "User Information",
        defaultName: "User",
        credits: "Credits",
        availableCredits: "Available Credits",
        buyMoreCredits: "Buy More Credits",
        quickActions: "Quick Actions",
        generateImages: "Generate Images",
        buyCredits: "Buy Credits",
        helpFaq: "Help & FAQ"
      },
      placeholder: "Describe your vision...",
      generate: "Generate",
      generateBtn: "Generate",
      upload: "Upload Images",
      mode: {
        generate: "Generate Mode",
        edit: "Edit Mode",
        generateModel: "Imagen-4.0",
        editModel: "Nano Banana",
        generateDesc: "Generate new images from text, supporting multiple aspect ratios",
        editDesc: "Redraw, remove watermarks, P-pictures, maintain character consistency",
        selectHint: "Please select a mode first",
        poweredBy: "powered by"
      },
      processing: "Processing Images...",
      uploadText: "Upload images and enter prompts",
      outputRatio: "Output Ratio",
      generating: {
        title: "Generating...",
        result: "Generated Result",
        creating: "AI is creating your exclusive image...",
        waiting: "This usually takes 30-60 seconds, please be patient",
        downloadNote: "Images won't be saved, please download promptly"
      },
      preview: {
        closeHint: "Click outside the image or press ESC to close",
        download: "Download",
        downloadImage: "Download Image"
      },
      download: {
        success: "Download Successful!",
        successDesc: "Image has been saved to your device",
        failed: "Download Failed",
        failedDesc: "Please try again or right-click to save the image"
      },
      promptTemplates: {
        title: "✨ Explore AI Magic:",
        multiAngle: {
          emoji: "🌀",
          label: "Multi-Angle",
          prompt: "Generate front, back, left, right, top, and bottom views of the same subject on a white background. Ensure perfect identity and proportion consistency."
        },
        actionChange: {
          emoji: "💃",
          label: "Action",
          prompt: "Keep the same person and background. Change the pose to [crossed arms / waving hand / jumping / running]. Maintain identity consistency."
        },
        backgroundSwitch: {
          emoji: "🌄",
          label: "Background",
          prompt: "Replace the background with a [mountain / city street / photography studio / beach]. Keep lighting consistent with the new environment."
        },
        hairstyleChange: {
          emoji: "💇",
          label: "Hairstyle",
          prompt: "Keep the same person. Change the hairstyle to [curly hair / bun / straight hair] and hair color to [blonde / red / black]."
        },
        timeTravel: {
          emoji: "🕰️",
          label: "Time Travel",
          prompt: "Keep the same person but place them in [ancient China / 1900s Europe / 2080 futuristic city]. Match outfit and background with the chosen era."
        },
        interaction: {
          emoji: "🤝",
          label: "Interaction",
          prompt: "Create a scene where two or more people are interacting — e.g., [drinking coffee together / performing music / taking a group photo]. Ensure realistic interaction and identity preservation."
        },
        outfit: {
          emoji: "👗",
          label: "Outfit",
          prompt: "Keep the same model. Change outfit to [casual streetwear / office suit / elegant dress]. Highlight fabric texture and lighting."
        },
        expression: {
          emoji: "😄",
          label: "Expression",
          prompt: "Keep the same person and angle. Generate expressions of [smile / surprise / sadness / confidence]."
        },
        product: {
          emoji: "📦",
          label: "Product",
          prompt: "Render the uploaded product in a studio lighting setup. Generate photorealistic images from multiple angles with soft shadows."
        },
        stylize: {
          emoji: "🎨",
          label: "Style",
          prompt: "Keep the same image composition. Apply [anime / oil painting / cyberpunk / watercolor] artistic style while preserving key identity details."
        }
      }
    },
      upload: {
      dropHere: "Drag and drop images here, or click to browse",
      supportsTpl: "Supports JPEG, PNG, WebP • Max {max} images • {size}MB each",
      tipTpl: "Upload multiple images to create a fusion of their best features (up to {max} images supported)",
    },
    nav: {
      home: "Home",
      pricing: "Pricing",
      faq: "FAQ",
      contact: "Contact",
    },
    morePlay: {
      title: "More Creative Possibilities",
      subtitle: "Explore More Creative Possibilities",
      description: "Discover the endless creative potential of Nano-Banana with these exciting tasks",
      tasks: {
        action: {
          title: "Action Tasks",
          description: "We randomly define a set of action instructions, requiring the model to adjust the subject's posture while preserving original identity details and background. This can generate rich derivative actions. For example, making a 'yes' gesture, crossing arms, or introducing new props like hats or sunglasses to create rich action expressions.",
          image: "11.png"
        },
        background: {
          title: "Background Tasks", 
          description: "We define approximately 250 different scene locations, covering landmarks, natural landscapes, and common indoor and outdoor environments. This task requires replacing the original background with new scenes while preserving the subject's personality. For example, switching backgrounds to indoor photography studios, outdoor snowy mountains, or various scenic landmarks.",
          image: "22.png"
        },
        hairstyle: {
          title: "Hairstyle Tasks",
          description: "We further explore hairstyle and hair color modification tasks based on portrait data, utilizing Nano-banana to edit the subject's hair details. For example, changing straight bangs to wavy curls or buns, and changing black hair to blonde, red, or other colors.",
          image: "33.png"
        },
        time: {
          title: "Time Tasks",
          description: "We place portrait data in different historical or temporal contexts, requiring clothing styles and background details to match the specified era. For example, a character might be placed in a 1905 daily life scene, or in a 2000 millennium environment.",
          image: "44.png"
        },
        interaction: {
          title: "Human-Computer Interaction Tasks",
          description: "We randomly select 2-4 images from the basic identity set and use GPT to generate interaction-oriented instructions. This task is not just about placing people side by side, but emphasizes interpersonal actions and interactions. For example, two people drinking coffee and chatting, or a four-person band performing together. These instructions are then combined with Nano-banana to synthesize images that capture rich interactive semantics.",
          image: "55.png"
        },
        ootd: {
          title: "OOTD Tasks",
          description: "We collect clothing samples from online resources and randomly select 2-6 pieces of clothing to match with portraits for display. The generated samples need to maintain facial feature consistency while incorporating pose changes to better highlight clothing details and presentation effects.",
          image: "66.png"
        }
      }
    },
    comparison: {
      title: "Why Choose ArtisanAI?",
      subtitle: "Compare with other AI image generation platforms",
      description: "Artisan-ai (powered by Nano-Banana) redefines AI image generation with unmatched realism and identity consistency. It outperforms even GPT-4o and Qwen-Image, keeping the same face perfectly consistent across background, pose, and style changes — a level of precision no other model has achieved.",
      features: {
        consistency: "Character Consistency",
        figurine: "3D Figurine Generation",
        inputs: "Multiple Input Types",
        identity: "Identity Preservation",
        quality: "Professional Quality",
        speed: "Processing Speed",
        model3d: "3D Model Generation",
        multipleInputs: "Multiple Input Types",
        processingSpeed: "Processing Speed",
        easyToWork: "Easy to Work",
      },
      table: {
        feature: "Feature",
        artisanAI: "ArtisanAI",
        midjourney: "MidJourney",
        qwenImage: "Qwen-Image",
        gpt4o: "GPT-4o",
        limited: "Limited",
        good: "Good",
        basic: "Basic",
        no: "No",
        textOnly: "Text Only",
        slow: "Slow",
        medium: "Medium",
        fast: "Fast",
        poor: "Poor",
        excellent: "Excellent",
      },
    },
    pricing: {
      title: "Pricing", 
      subtitle: "Simple and transparent pricing",
      pointsSystem: "Points System",
      freeStarter: "Free Starter",
      freeStarterDesc: "Perfect for trying out the platform",
      perGeneration: "Per Generation",
      perGenerationDesc: "High-quality AI generation",
      purchaseCredits: "Purchase Credits",
      secureCheckout: "Secure checkout powered by Creem",
      credits: "Credits",
      bonus_credits: "Bonus Credits",
      total: "Total",
      images: "Images",
      purchase_now: "Buy Now",
      most_popular: "Most Popular",
      value: "💰 Great Value",
      processing: "Processing...",
      login_required: "Login Required",
      login_required_description: "Please log in to purchase credits",
      purchase_error: "Purchase Failed",
      purchase_error_description: "Failed to process payment. Please try again.",
      why_choose_us: "Why Choose ArtisanAI?",
      feature1_title: "High Quality",
      feature1_description: "Professional-grade AI models for stunning results",
      feature2_title: "Fast Processing", 
      feature2_description: "Generate images in seconds, not minutes",
      feature3_title: "Consistent Results",
      feature3_description: "Maintain character consistency across all generations",
      coming_soon: "Coming Soon",
      coming_soon_description: "More features and improvements are on the way",
      starter: {
        name: "Starter Pack",
        description: "Perfect for trying out the platform",
        feature1: "300 Credits",
        feature2: "Basic Support",
        feature3: "Standard Quality"
      },
      standard: {
        name: "Standard Pack", 
        description: "Most popular choice for regular users",
        feature1: "700 Credits + 200 Bonus",
        feature2: "Priority Support",
        feature3: "High Quality"
      },
      advanced: {
        name: "Advanced Pack",
        description: "Great for power users and professionals",
        feature1: "1,600 Credits + 400 Bonus", 
        feature2: "Premium Support",
        feature3: "Premium Quality"
      },
      professional: {
        name: "Professional Pack",
        description: "For professional content creators",
        feature1: "4,500 Credits + 1,000 Bonus",
        feature2: "24/7 Support", 
        feature3: "Professional Quality"
      },
      studio: {
        name: "Studio Pack",
        description: "For studios and large teams",
        feature1: "10,000 Credits + 2,000 Bonus",
        feature2: "Dedicated Support",
        feature3: "Studio Quality"
      }
    },
    success: { title: "Payment Success", refresh: "Refresh", back_home: "Back to Home" },
    contact: { 
      title: "Contact", 
      subtitle: "Have questions about Artisan AI? Want to collaborate or need support? We'd love to hear from you. Send us a message and we'll respond within 24 hours.",
      email_us: "Email Us",
      response_time: "Response Time",
      within_24h: "Within 24 hours",
      support: "Support",
      support_scope: "Technical & General",
      form: {
        title: "Contact Us",
        name: "Name",
        email: "Email",
        subject: "Subject",
        message: "Message",
        attachment: "Attachment (Optional)",
        name_placeholder: "Your full name",
        email_placeholder: "your.email@example.com",
        subject_placeholder: "What's this about?",
        message_placeholder: "Tell us more about your inquiry...",
        file_formats: "Supported formats: JPEG, PNG, GIF, WebP (max 10MB)",
        no_file_selected: "No file selected",
        choose_file: "Choose file",
        send_message: "Send Message",
        sending: "Sending...",
        message_sent: "Message Sent!",
        message_sent_desc: "Thank you for contacting us. We'll get back to you within 24 hours.",
        send_another: "Send Another Message",
        file_too_large: "File too large",
        file_too_large_desc: "Please select a file smaller than 10MB.",
        invalid_file_type: "Invalid file type",
        invalid_file_type_desc: "Please select an image file (JPEG, PNG, GIF, WebP).",
        message_sent_success: "Message sent successfully!",
        message_sent_success_desc: "Thank you for contacting us. We'll get back to you soon.",
        failed_to_send: "Failed to send message",
        failed_to_send_desc: "Please try again later.",
        network_error: "Network error",
        network_error_desc: "Please check your connection and try again.",
        failed_to_send_error: "Failed to send message. Please try again."
      }
    },
    auth: {
      verifying: "Verifying...",
      verification_success: "Email Verified Successfully",
      verification_failed: "Verification Failed",
      verification_success_message: "Your email has been successfully verified. You are now logged in and will be redirected to the homepage.",
      verification_failed_message: "Email verification failed. Please check if the link is correct.",
      verification_complete: "Verification successful! You can now log in normally.",
      back_to_login: "Back to Login",
      retry_verification: "Retry Verification",
      verification_help: "If you encounter any issues, please contact customer service or register a new account.",
      verification_error: "An error occurred during email verification. Please try again.",
      verification_not_found: "Verification information not found. Please check if the email link is correct.",
      verification_error_message: "The email verification link is invalid or has expired. Please check if the link is correct, or resend the verification email.",
      verification_error_help: "Possible reasons: link has expired, has been used, or is incorrectly formatted.",
      back_to_home: "Back to Home",
      register_success: "Registration Successful",
      register_success_message: "Account registered successfully. Please check your email to verify your account. If you see a long security link, please click 'Apply for recovery' or copy the link to your browser.",
      signIn: {
        button: "Sign In",
        loading: "Signing in..."
      },
      signUp: {
        button: "Sign Up",
        loading: "Signing up..."
      },
      reset: {
        button: "Send Reset Email",
        loading: "Sending..."
      },
      resend_verification: "Resend Verification Email",
      welcome: "Welcome,",
      sign_out: "Sign Out",
      loading: "Loading..."
    },
    legal: { 
      common: { last_updated: "Last updated", date: "December 2024" },
      terms: {
        title: "Terms of Service",
        content: "Terms of Service content is under construction. Chinese version coming soon.",
        coming_soon: "Terms of Service content is under construction. Chinese version coming soon.",
        sections: {
          introduction: {
            title: "1. Introduction",
            content: "Welcome to ArtisanAI. These Terms of Service ('Terms') govern your use of our AI-powered image generation platform. By accessing or using our services, you agree to be bound by these Terms."
          },
          acceptance: {
            title: "2. Acceptance of Terms",
            content: "By using ArtisanAI, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services."
          },
          services: {
            title: "3. Description of Services",
            content: "ArtisanAI provides AI-powered image generation services, including but not limited to character consistency, 3D figurine generation, and style transformation. Our services are powered by advanced AI models including Nano-Banana technology."
          },
          user_accounts: {
            title: "4. User Accounts",
            content: "To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
          },
          acceptable_use: {
            title: "5. Acceptable Use",
            content: "You agree to use our services only for lawful purposes and in accordance with these Terms. You may not use our services to generate content that is illegal, harmful, threatening, abusive, or violates any applicable laws or regulations."
          },
          intellectual_property: {
            title: "6. Intellectual Property",
            content: "The ArtisanAI platform, including its design, functionality, and underlying technology, is protected by intellectual property laws. You retain ownership of content you generate, but grant us a license to provide our services."
          },
          privacy: {
            title: "7. Privacy",
            content: "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services, to understand our practices."
          },
          payment: {
            title: "8. Payment and Billing",
            content: "Certain features of our service require payment. All fees are non-refundable unless otherwise stated. We reserve the right to change our pricing with reasonable notice."
          },
          termination: {
            title: "9. Termination",
            content: "We may terminate or suspend your account and access to our services at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users."
          },
          disclaimers: {
            title: "10. Disclaimers",
            content: "Our services are provided 'as is' without warranties of any kind. We do not guarantee that our services will be uninterrupted, error-free, or meet your specific requirements."
          },
          limitation: {
            title: "11. Limitation of Liability",
            content: "To the maximum extent permitted by law, ArtisanAI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services."
          },
          changes: {
            title: "12. Changes to Terms",
            content: "We reserve the right to modify these Terms at any time. We will notify users of any material changes through our platform or by email. Continued use of our services after changes constitutes acceptance of the new Terms."
          },
          contact: {
            title: "13. Contact Information",
            content: "If you have any questions about these Terms, please contact us at jdfz13zqy@gmail.com."
          }
        }
      },
      privacy: {
        title: "Privacy Policy",
        content: "Privacy Policy content is under construction. Chinese version coming soon.",
        coming_soon: "Privacy Policy content is under construction. Chinese version coming soon.",
        sections: {
          introduction: {
            title: "1. Introduction",
            content: "This Privacy Policy describes how ArtisanAI ('we', 'us', or 'our') collects, uses, and protects your personal information when you use our AI-powered image generation platform."
          },
          information_collection: {
            title: "2. Information We Collect",
            content: "We collect information you provide directly to us, such as when you create an account, upload images, or contact us. This may include your name, email address, and uploaded content."
          },
          usage_information: {
            title: "3. Usage Information",
            content: "We automatically collect certain information about your use of our services, including device information, IP address, browser type, and usage patterns."
          },
          cookies: {
            title: "4. Cookies and Tracking",
            content: "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser."
          },
          data_usage: {
            title: "5. How We Use Your Information",
            content: "We use your information to provide, maintain, and improve our services, process transactions, communicate with you, and ensure platform security."
          },
          data_sharing: {
            title: "6. Information Sharing",
            content: "We do not sell your personal information. We may share your information with service providers who assist us in operating our platform, or when required by law."
          },
          data_security: {
            title: "7. Data Security",
            content: "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
          },
          data_retention: {
            title: "8. Data Retention",
            content: "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy."
          },
          your_rights: {
            title: "9. Your Rights",
            content: "You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us."
          },
          children_privacy: {
            title: "10. Children's Privacy",
            content: "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13."
          },
          international_transfers: {
            title: "11. International Data Transfers",
            content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place."
          },
          policy_changes: {
            title: "12. Changes to This Policy",
            content: "We may update this Privacy Policy from time to time. We will notify you of any material changes through our platform or by email."
          },
          contact: {
            title: "13. Contact Us",
            content: "If you have any questions about this Privacy Policy, please contact us at jdfz13zqy@gmail.com."
          }
        }
      },
      cookies: {
        title: "Cookie Policy",
        content: "Cookie Policy content is under construction. Chinese version coming soon.",
        coming_soon: "Cookie Policy content is under construction. Chinese version coming soon.",
        sections: {
          introduction: {
            title: "1. What Are Cookies",
            content: "Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience and understand how you use our services."
          },
          types_of_cookies: {
            title: "2. Types of Cookies We Use",
            content: "We use essential cookies for website functionality, analytics cookies to understand usage patterns, and preference cookies to remember your settings and preferences."
          },
          essential_cookies: {
            title: "3. Essential Cookies",
            content: "These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and authentication."
          },
          analytics_cookies: {
            title: "4. Analytics Cookies",
            content: "We use analytics cookies to understand how visitors interact with our website, helping us improve performance and user experience."
          },
          preference_cookies: {
            title: "5. Preference Cookies",
            content: "These cookies remember your choices and preferences, such as language settings, to provide a personalized experience on future visits."
          },
          third_party_cookies: {
            title: "6. Third-Party Cookies",
            content: "Some cookies are set by third-party services we use, such as analytics providers. These help us understand user behavior and improve our services."
          },
          cookie_management: {
            title: "7. Managing Cookies",
            content: "You can control cookies through your browser settings. You can delete existing cookies and choose to block future cookies, though this may affect website functionality."
          },
          browser_settings: {
            title: "8. Browser Settings",
            content: "Most browsers allow you to refuse cookies or delete them. Please refer to your browser's help documentation for specific instructions on cookie management."
          },
          cookie_consent: {
            title: "9. Cookie Consent",
            content: "By continuing to use our website, you consent to our use of cookies as described in this policy. You can withdraw consent at any time through your browser settings."
          },
          updates: {
            title: "10. Updates to This Policy",
            content: "We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date."
          },
          contact: {
            title: "11. Contact Us",
            content: "If you have questions about our use of cookies, please contact us at jdfz13zqy@gmail.com."
          }
        }
      },
      refund: {
        title: "Refund Policy",
        content: "Refund Policy content is under construction. Chinese version coming soon.",
        coming_soon: "Refund Policy content is under construction. Chinese version coming soon.",
        sections: {
          introduction: {
            title: "1. Refund Policy Overview",
            content: "This Refund Policy outlines the terms and conditions for refunds on ArtisanAI services. Please read this policy carefully before making a purchase."
          },
          refund_eligibility: {
            title: "2. Refund Eligibility",
            content: "Refunds may be considered for technical issues that prevent service delivery, billing errors, or duplicate charges. Refunds are not available for completed AI generation services."
          },
          technical_issues: {
            title: "3. Technical Issues",
            content: "If you experience technical problems that prevent you from using our services, please contact our support team within 7 days of the issue occurring. We will investigate and may provide a refund or credit."
          },
          billing_errors: {
            title: "4. Billing Errors",
            content: "If you believe you have been charged incorrectly, please contact us immediately. We will review the charge and provide a refund if an error is confirmed."
          },
          service_quality: {
            title: "5. Service Quality Issues",
            content: "If you are dissatisfied with the quality of AI-generated content, please contact support within 24 hours. We may offer credits or re-generation of content."
          },
          refund_process: {
            title: "6. Refund Process",
            content: "To request a refund, contact us at jdfz13zqy@gmail.com with your order details and reason for the refund request. We will respond within 2-3 business days."
          },
          processing_time: {
            title: "7. Processing Time",
            content: "Approved refunds will be processed within 5-10 business days. The refund will be credited to the original payment method used for the purchase."
          },
          non_refundable: {
            title: "8. Non-Refundable Items",
            content: "The following are not eligible for refunds: completed AI generation services, credits that have been used, and purchases made more than 30 days ago."
          },
          credit_alternatives: {
            title: "9. Credit Alternatives",
            content: "In some cases, we may offer account credits instead of refunds. Credits can be used for future purchases and do not expire."
          },
          chargebacks: {
            title: "10. Chargebacks",
            content: "If you initiate a chargeback with your bank, please contact us first to resolve the issue. Unnecessary chargebacks may result in account suspension."
          },
          policy_changes: {
            title: "11. Policy Changes",
            content: "We reserve the right to modify this refund policy at any time. Changes will be posted on this page and will apply to future purchases."
          },
          contact: {
            title: "12. Contact Us",
            content: "For refund requests or questions about this policy, please contact us at jdfz13zqy@gmail.com."
          }
        }
      }
    },
    footer: {
      tagline: "Creating the future of AI-driven image generation with consistency and creativity.",
      product: "Product",
      features: "Features",
      howToWork: "How to Work",
      moreCreative: "More Creative Possibilities",
      api: "API",
      support: "Support",
      contact: "Contact",
      legal: "Legal",
      termsOfService: "Terms of Service",
      privacyPolicy: "Privacy Policy",
      cookiePolicy: "Cookie Policy",
      refundPolicy: "Refund Policy",
      copyright: "© 2024 ArtisanAI. All rights reserved.",
    },
    feedback: {
      title: "Share Your Feedback",
      subtitle: "Help us improve ArtisanAI with your thoughts and suggestions.",
      placeholder: "Tell us what you think about ArtisanAI...",
      submit: "Submit",
      submitting: "Submitting...",
      success: {
        title: "Feedback Submitted Successfully!",
        description: "Thank you for your valuable feedback, we will seriously consider your suggestions."
      },
      error: {
        title: "Submission Failed",
        description: "Please try again later or contact us through other means."
      },
      network: {
        title: "Network Error",
        description: "Please check your network connection and try again."
      }
    },
    errors: {
      generation_failed: "Generation Failed",
      insufficient_credits: {
        title: "Insufficient Credits",
        description: "You don't have enough credits to generate images. Please purchase more credits to continue.",
        action: "Buy Credits"
      },
      api_quota: "API quota exhausted, please try again later or contact administrator",
      server_error: "Server internal error, API service may be temporarily unavailable"
    },
    faq: {
      breadcrumb: "Back to Home",
      title: "Frequently Asked Questions",
      subtitle: "Find answers to common questions about ArtisanAI",
      questions: {
        q1: {
          q: "What is ArtisanAI?",
          a: "ArtisanAI is an AI-powered image generation platform that creates stunning, consistent results with character consistency across different styles and scenes."
        },
        q2: {
          q: "How does character consistency work?",
          a: "Our advanced AI preserves unique facial features, bone structure, and expressions across all generations, ensuring the same person appears consistently in different styles and outfits."
        },
        q3: {
          q: "What file formats are supported?",
          a: "We support JPEG, PNG, and WebP formats. You can upload up to 15 images, each with a maximum size of 10MB."
        },
        q4: {
          q: "How long does generation take?",
          a: "Most generations complete within 10-30 seconds, depending on the complexity of your request and current server load."
        },
        q5: {
          q: "Can I use generated images commercially?",
          a: "Yes, all images generated through ArtisanAI can be used for commercial purposes. Please review our Terms of Service for complete details."
        }
      },
      contact: {
        title: "Still have questions?",
        subtitle: "Can't find what you're looking for? Our support team is here to help.",
        button: "Contact Support"
      }
    },
  },
  zh: {
    howItWorks: {
      title: "工作原理",
      subtitle: "简单透明的价格",
      upload: { title: "1. 上传", desc: "上传您的照片并用详细的文本提示描述您的愿景。" },
      generate: { title: "2. 生成", desc: "AI 将处理您的输入并在数秒内生成精美且一致的图像。" },
      download: { title: "3. 下载与分享", desc: "下载高分辨率图像或直接分享至您喜爱的社交平台。" },
    },
    home: {
      common: { original: "Original", generated: "Generated", reference: "Reference" },
      consistency: {
        title: "完美人物一致性",
        subtitle:
          "目前人物一致性最强的模型——在不同风格、服装和场景中保持同一人物，完美保留独特面部特征",
      },
      case1: {
        title: "案例一：风格转换",
        baseModel: "基础模型",
        sunglasses: "太阳镜",
        skateboard: "滑板",
        styleReferences: "风格参考",
        generatedResult: "生成结果",
        perfectFusion: "完美融合",
        sameFace: "同一张脸，新风格",
      },
      case2: {
        title: "案例二：服装更换",
        baseModel: "基础模型",
        styleReference: "风格参考",
        perfectMatch: "完美匹配",
        samePersonNewOutfit: "同一人，新服装",
        greenDress: "绿色连衣裙",
      },
      whyConsistency: {
        title: "为什么人物一致性很重要",
        facialRecognition: "面部识别",
        facialRecognitionDesc: "AI 在所有生成中保留独特的面部特征、骨骼结构与表情",
        styleFlexibility: "风格灵活性",
        styleFlexibilityDesc: "更换服装、配饰与背景的同时保持同一人物",
        professionalQuality: "专业品质",
        professionalQualityDesc: "高分辨率、影棚级图像，自然且专业",
      },
      editing: {
        title: "高级AI照片编辑",
        subtitle:
          "删掉你的P图软件！去水印、去纹身毫无瑕疵，从基础修图到创意变换 - 体验AI照片编辑的强大力量",
        step1: {
          title: "步骤1：原始照片",
          original: "带纹身的原始照片",
          description: "胸口处带有纹身的女孩",
          detail: "起始点 - 带有现有纹身的自然照片",
        },
        step2: {
          title: "步骤2：去除纹身",
          result: "纹身已去除",
          description: "纹身完全移除",
          detail: "AI无缝移除胸口纹身，同时保持皮肤纹理",
        },
        step3: {
          title: "步骤3：添加新纹身",
          reference: { title: "参考纹身设计", description: "要添加的新纹身设计" },
          result: { title: "生成结果", description: "新纹身已应用", detail: "AI将新纹身设计添加到同一胸口位置" },
        },
        step4: {
          title: "步骤4：创意造型",
          result: "发型和妆容已改变",
          description: "发色和妆容改变",
          detail: "AI改变发色和口红，同时保持面部特征",
        },
        step5: {
          title: "步骤5：表情编辑",
          result: "微笑表情",
          description: "自然微笑已添加",
          detail: "AI添加自然微笑，同时保持人物独特的面部结构",
        },
        caseStudy2: {
          title: "案例研究2：配饰替换",
          original: { title: "原始照片", description: "戴原始项链的女人", detail: "带有现有配饰的起始点" },
          reference: { title: "新项链设计", description: "替换原始项链的新项链设计" },
          result: {
            title: "生成结果",
            description: "项链成功替换",
            detail: "AI无缝替换原始项链与新设计，同时保持自然光线和阴影",
          },
        },
        whyChoose: {
          title: "为什么选择我们的AI照片编辑器？",
          features: {
            professional: { icon: "🎨", title: "专业品质", description: "影棚级编辑结果，自然逼真" },
            fast: { icon: "⚡", title: "闪电般快速", description: "几秒钟内获得结果，而不是几小时的手动编辑" },
            precise: { icon: "🎯", title: "精确控制", description: "使用先进的AI算法微调每个细节" },
          },
        },
      },
      model3d: {
        title: "AI 3D模型生成",
        subtitle:
          "个人定制3D模型生成 - 可在3D软件中二次加工，从真人照片到动漫角色，打造专属3D手办",
        caseStudy1: {
          title: "案例一：真人到3D手办",
          original: { title: "原始照片", description: "真人照片", detail: "高质量人像用于3D转换" },
          result: { title: "3D手办结果", description: "专业3D手办", detail: "AI将真人转换为细致的3D收藏手办" },
        },
        caseStudy2: {
          title: "案例二：动漫角色到3D手办",
          example1: {
            title: "动漫角色1",
            original: { 
              title: "原始动漫图",
              detail: "用于3D转换的原始动漫艺术作品"
            },
            result: { title: "3D手办结果", description: "3D动漫手办", detail: "AI将2D动漫转换为精细3D收藏手办" },
          },
          example2: {
            title: "动漫角色2",
            original: { 
              title: "原始动漫图",
              detail: "用于3D转换的另一个动漫艺术作品"
            },
            result: { title: "3D手办结果", description: "3D动漫手办", detail: "AI从2D动漫图生成细致3D手办" },
          },
        },
        caseStudy3: {
          title: "案例三：建筑到3D模型",
          original: { 
            title: "建筑原始照片",
            description: "真实建筑照片",
            detail: "用于3D转换的高质量建筑照片"
          },
          result: {
            title: "3D模型结果",
            view1: { title: "3D模型 - 视角1", description: "3D建筑模型的第一视角" },
            view2: { title: "3D模型 - 视角2", description: "同一3D建筑模型的不同视角" },
          },
        },
        whyChoose: {
          title: "为什么选择我们的3D生成？",
          features: {
            fidelity: { icon: "🎯", title: "高保真", description: "保留原始照片与艺术作品中的每个细节" },
            styles: { icon: "🎨", title: "多种风格", description: "支持真实照片、动漫及任何2D艺术作品" },
            quality: { icon: "🏆", title: "收藏级品质", description: "专业级3D模型，随时可打印" },
          },
        },
      },
      product: {
        title: "AI产品摄影与海报设计",
        subtitle:
          "解雇你的产品摄影师、海报制作师！产品+场景+人物多方位展示，一键生成专业级产品海报",
        caseStudy1: {
          title: "案例一：精油产品",
          step1: { title: "步骤1：原始产品", description: "精油产品", detail: "起始点 - 干净的产品照片用于营销" },
          step2: { 
            title: "步骤2：模特融合",
            result: {
              description: "专业模特",
              detail: "AI选择并融合专业模特进行产品展示"
            }
          },
          step3: { 
            title: "步骤3：手持产品",
            result: {
              description: "自然产品互动",
              detail: "AI创建真实的手持产品场景，姿势自然"
            }
          },
          step4: { 
            title: "步骤4：专业海报设计",
            result: {
              description: "营销就绪海报",
              detail: "AI生成包含产品、模特和专业布局的完整营销海报"
            }
          },
        },
        caseStudy2: {
          title: "案例二：男士护肤产品",
          original: { title: "男士护肤产品", description: "男士护肤产品", detail: "用于营销活动的专业男士护肤产品" },
          result: {
            title: "专业产品海报",
            description: "男士护肤产品海报",
            detail: "AI生成现代设计与品牌风格的专业产品海报",
          },
        },
        whyChoose: {
          title: "为什么选择我们的AI产品摄影？",
    features: {
            professional: { icon: "📸", title: "专业品质", description: "无需昂贵设备即可获得影棚级产品摄影" },
            fast: { icon: "⚡", title: "极速生成", description: "几分钟内生成多张产品照与海报" },
            creative: { icon: "🎨", title: "创意可控", description: "可按品牌自定义场景、模特与布局" },
          },
        },
      },
    },
    hero: {
      title: "迄今为止最强大的 AI 图像编辑器",
      subtitle: "一站式AI图像生成编辑器",
      subtitle2: "创意生图、P图、去水印、3D重绘，无所不能",
      subtitle1: "一站式AI图像生成&编辑工具",
      subtitle2: "创造。编辑。转换。",
      subtitle3: "一切皆有可能",
      tags: {
        nanoBanana: "由 Imagen-4.0 提供支持",
        consistency: "超高人物一致性",
        freeCredits: "高免费额度"
      },
      updates: {
        title: "最近更新",
        v2_0_0: {
          title: "🎉 全新界面设计 & 积分系统升级",
          content: "全新设计的用户界面，采用现代化玻璃拟态效果。用户注册积分从120提升至220，更慷慨的免费额度。新增多语言支持，中英文无缝切换。全新的标签系统展示产品特色。"
        },
        v1_9_0: {
          title: "🎨 界面美化 & 用户体验优化",
          content: "重新设计主标题和副标题样式，采用彩虹渐变效果。优化标签设计，使用玻璃拟态效果和半透明边框。调整页面间距和布局，提升整体视觉效果。"
        }
      },
      profile: {
        title: "个人资料",
        userInfo: "用户信息",
        defaultName: "用户",
        credits: "积分",
        availableCredits: "可用积分",
        buyMoreCredits: "购买更多积分",
        quickActions: "快速操作",
        generateImages: "生成图片",
        buyCredits: "购买积分",
        helpFaq: "帮助与常见问题"
      },
      placeholder: "描述您的愿景...",
      generate: "生成",
      generateBtn: "生成",
      upload: "上传图片",
      mode: {
        generate: "生图模式",
        edit: "编辑模式",
        generateModel: "Imagen-4.0",
        editModel: "Imagen-4.0",
        generateDesc: "从文本生成全新图像，支持多种宽高比",
        editDesc: "重绘、去水印、P图修图，保持人物一致性",
        selectHint: "请先选择模式",
        poweredBy: "由"
      },
      processing: "正在处理图片...",
      uploadText: "上传图片并输入提示词",
      outputRatio: "输出比例",
      generating: {
        title: "生成中...",
        result: "生成结果",
        creating: "AI正在创作您的专属图像...",
        waiting: "这通常需要30-60秒，请耐心等待",
        downloadNote: "图片不会保存，请及时下载"
      },
      preview: {
        closeHint: "点击图片外部区域或按ESC键关闭",
        download: "下载",
        downloadImage: "下载图片"
      },
      download: {
        success: "下载成功！",
        successDesc: "图片已保存到您的设备",
        failed: "下载失败",
        failedDesc: "请重试或右键保存图片"
      },
      promptTemplates: {
        title: "✨ 探索AI魔法:",
        multiAngle: {
          emoji: "🌀",
          label: "多角度展示",
          prompt: "生成同一主体的前、后、左、右、上、下视图，白色背景，保持面部与身体比例一致。"
        },
        actionChange: {
          emoji: "💃",
          label: "动作变换",
          prompt: "保留相同人物与背景，将姿势调整为 [交叉双臂 / 挥手 / 跑步 / 跳跃]，保持身份一致。"
        },
        backgroundSwitch: {
          emoji: "🌄",
          label: "背景切换",
          prompt: "将背景替换为 [雪山 / 城市街头 / 摄影棚 / 海滩]，光线与新环境保持一致。"
        },
        hairstyleChange: {
          emoji: "💇",
          label: "发型变化",
          prompt: "保留相同人物，将发型修改为 [卷发 / 发髻 / 直发]，发色调整为 [金色 / 红色 / 黑色]。"
        },
        timeTravel: {
          emoji: "🕰️",
          label: "时光穿越",
          prompt: "保持相同人物，将其置于 [古代中国 / 20世纪初欧洲 / 2080年未来城市]，服装与背景应符合时代特征。"
        },
        interaction: {
          emoji: "🤝",
          label: "互动场景",
          prompt: "生成两人或多人互动场景，例如 [一起喝咖啡 / 表演音乐 / 合照]，互动自然且身份保持一致。"
        },
        outfit: {
          emoji: "👗",
          label: "今日穿搭",
          prompt: "保留相同模特，更换服装为 [休闲街头风 / 职场西装 / 优雅礼服]，突出布料质感与光影细节。"
        },
        expression: {
          emoji: "😄",
          label: "表情变化",
          prompt: "保持相同人物与角度，生成 [微笑 / 惊讶 / 悲伤 / 自信] 等不同表情。"
        },
        product: {
          emoji: "📦",
          label: "产品展示",
          prompt: "对上传的产品进行渲染，使用摄影棚光效，从多个角度生成真实感图像，带柔和阴影。"
        },
        stylize: {
          emoji: "🎨",
          label: "风格化",
          prompt: "保持原图构图不变，转换为 [动漫 / 油画 / 赛博朋克 / 水彩] 风格，保留人物特征。"
        }
      }
    },
      upload: {
      dropHere: "拖拽图片到此处，或点击浏览",
      supportsTpl: "支持 JPEG、PNG、WebP • 最多 {max} 张图片 • 每张 {size}MB",
      tipTpl: "上传多张图片以融合它们的最佳特征（最多支持 {max} 张图片）",
    },
    nav: {
      home: "首页",
      pricing: "定价",
      faq: "常见问题",
      contact: "联系我们",
    },
    morePlay: {
      title: "更多创意玩法",
      subtitle: "等你探索更多玩法",
      description: "发现Nano-Banana的无限创意潜力，体验这些令人兴奋的任务",
      tasks: {
        action: {
          title: "动作任务",
          description: "我们随机定义一组动作指令，要求模型在保留原始身份细节和背景的同时调整主体的姿势。这能够生成丰富的衍生动作。例如，做出\"是\"的手势、交叉双臂，或引入帽子或墨镜等新道具来创造丰富的动作表情。",
          image: "11.png"
        },
        background: {
          title: "背景任务",
          description: "我们定义了大约250个不同的场景位置，涵盖地标、自然景观以及常见的室内外环境。该任务要求将原始背景替换为新的场景，同时保留拍摄对象的个性。例如，将背景切换为室内摄影工作室、户外雪山或各种风景地标。",
          image: "22.png"
        },
        hairstyle: {
          title: "发型任务",
          description: "我们进一步探索基于肖像数据的发型和发色修改任务，利用Nano-banana编辑拍摄对象的头发细节。例如，将直刘海改为波浪卷发或发髻，以及将黑发改为金色、红色或其他颜色。",
          image: "33.png"
        },
        time: {
          title: "时间任务",
          description: "我们将肖像数据置于不同的历史或时间背景中，要求服装风格和背景细节与指定的时代相符。例如，一个人物可能被置于1905年的日常生活场景中，也可能被置于2000年的千禧年环境中。",
          image: "44.png"
        },
        interaction: {
          title: "人机交互任务",
          description: "我们从基础身份集中随机选取2-4张图像，并使用GPT生成以交互为导向的指令。该任务并非仅仅将人物并排摆放，而是强调人际动作和互动。例如，两个人喝咖啡聊天，或者四人组乐队一起表演。这些指令随后与Nano-banana结合使用，合成能够捕捉丰富交互语义的图像。",
          image: "55.png"
        },
        ootd: {
          title: "OOTD任务",
          description: "我们从线上资源中收集服装样衣，并随机选取2-6件服装与人像进行搭配展示。生成的样衣需要保持面部特征的一致性，同时融入姿势变化，以更好地凸显服装的细节和呈现效果。",
          image: "66.png"
        }
      }
    },
    comparison: {
      title: "为什么选择ArtisanAI？",
      subtitle: "与其他AI图像生成平台对比",
      description: "Artisan-ai（基于Nano-Banana） 重新定义了 AI 图像生成，在逼真度与身份一致性方面无可匹敌。它的表现超越了 GPT-4o 与 Qwen-Image，即使在更换背景、姿势或风格时，也能完美保持同一张面孔的连贯性——这是其他模型尚未达到的精准水准。",
      features: {
        consistency: "人物一致性",
        figurine: "3D手办生成",
        inputs: "多种输入类型",
        identity: "身份保持",
        quality: "专业级质量",
        speed: "处理速度",
        model3d: "3D模型生成",
        multipleInputs: "多种输入类型",
        processingSpeed: "处理速度",
        easyToWork: "易于使用",
      },
      table: {
        feature: "功能",
        artisanAI: "ArtisanAI",
        midjourney: "MidJourney",
        qwenImage: "Qwen-Image",
        gpt4o: "GPT-4o",
        limited: "有限",
        good: "良好",
        basic: "基础",
        no: "无",
        textOnly: "仅文本",
        slow: "慢",
        medium: "中等",
        fast: "快",
        poor: "差",
        excellent: "优秀",
      },
    },
    pricing: {
      title: "定价", 
      subtitle: "简单透明的价格",
      pointsSystem: "积分系统",
      freeStarter: "免费入门",
      freeStarterDesc: "完美适合试用平台",
      perGeneration: "每次生成",
      perGenerationDesc: "高质量AI生成",
      purchaseCredits: "购买积分",
      secureCheckout: "由Creem提供安全结账",
      credits: "积分",
      bonus_credits: "额外积分",
      total: "总计",
      images: "图片",
      purchase_now: "立即购买",
      most_popular: "最受欢迎",
      value: "💰 超值优惠",
      processing: "处理中...",
      login_required: "需要登录",
      login_required_description: "请登录以购买积分",
      purchase_error: "购买失败",
      purchase_error_description: "支付处理失败，请重试",
      why_choose_us: "为什么选择ArtisanAI？",
      feature1_title: "高质量",
      feature1_description: "专业级AI模型，创造令人惊叹的结果",
      feature2_title: "快速处理",
      feature2_description: "几秒钟内生成图像，而不是几分钟",
      feature3_title: "一致结果",
      feature3_description: "在所有生成中保持角色一致性",
      coming_soon: "即将推出",
      coming_soon_description: "更多功能和改进即将到来",
      starter: {
        name: "入门包",
        description: "完美适合试用平台",
        feature1: "300积分",
        feature2: "基础支持",
        feature3: "标准质量"
      },
      standard: {
        name: "标准包",
        description: "普通用户最受欢迎的选择",
        feature1: "700积分 + 200奖励",
        feature2: "优先支持",
        feature3: "高质量"
      },
      advanced: {
        name: "高级包",
        description: "适合高级用户和专业人士",
        feature1: "1,600积分 + 400奖励",
        feature2: "高级支持",
        feature3: "高级质量"
      },
      professional: {
        name: "专业包",
        description: "适合专业内容创作者",
        feature1: "4,500积分 + 1,000奖励",
        feature2: "24/7支持",
        feature3: "专业质量"
      },
      studio: {
        name: "工作室包",
        description: "适合工作室和大型团队",
        feature1: "10,000积分 + 2,000奖励",
        feature2: "专属支持",
        feature3: "工作室质量"
      }
    },
    success: { title: "支付成功", refresh: "刷新", back_home: "返回首页" },
    contact: { 
      title: "联系我们", 
      subtitle: "对Artisan AI有疑问？想要合作或需要支持？我们很乐意听到您的声音。发送消息给我们，我们将在24小时内回复。",
      email_us: "邮件联系",
      response_time: "回复时间",
      within_24h: "24小时内",
      support: "支持",
      support_scope: "技术 & 通用",
      form: {
        title: "联系我们",
        name: "姓名",
        email: "邮箱",
        subject: "主题",
        message: "消息",
        attachment: "附件（可选）",
        name_placeholder: "您的全名",
        email_placeholder: "your.email@example.com",
        subject_placeholder: "这是关于什么的？",
        message_placeholder: "告诉我们更多关于您的询问...",
        file_formats: "支持格式：JPEG、PNG、GIF、WebP（最大10MB）",
        no_file_selected: "未选择任何文件",
        choose_file: "选择文件",
        send_message: "发送消息",
        sending: "发送中...",
        message_sent: "消息已发送！",
        message_sent_desc: "感谢您联系我们。我们将在24小时内回复您。",
        send_another: "发送另一条消息",
        file_too_large: "文件过大",
        file_too_large_desc: "请选择小于10MB的文件。",
        invalid_file_type: "无效文件类型",
        invalid_file_type_desc: "请选择图片文件（JPEG、PNG、GIF、WebP）。",
        message_sent_success: "消息发送成功！",
        message_sent_success_desc: "感谢您联系我们。我们会尽快回复您。",
        failed_to_send: "发送消息失败",
        failed_to_send_desc: "请稍后重试。",
        network_error: "网络错误",
        network_error_desc: "请检查您的连接并重试。",
        failed_to_send_error: "发送消息失败。请重试。"
      }
    },
    auth: {
      verifying: "验证中...",
      verification_success: "邮箱验证成功",
      verification_failed: "验证失败",
      verification_success_message: "您的邮箱已成功验证，正在自动登录并跳转到首页...",
      verification_failed_message: "邮箱验证失败，请检查链接是否正确。",
      verification_complete: "验证成功！您现在可以正常登录了。",
      back_to_login: "返回登录页面",
      retry_verification: "重新验证",
      verification_help: "如果您遇到问题，请联系客服或重新注册账户。",
      verification_error: "邮箱验证过程中出现错误，请重试。",
      verification_not_found: "未找到验证信息，请检查邮件链接是否正确。",
      verification_error_message: "邮箱验证链接无效或已过期。请检查链接是否正确，或重新发送验证邮件。",
      verification_error_help: "可能的原因：链接已过期、已被使用，或格式不正确。",
      back_to_home: "返回首页",
      register_success: "注册成功",
      register_success_message: "账户注册成功。请检查您的邮箱以验证账户。",
      signIn: {
        button: "登录",
        loading: "登录中..."
      },
      signUp: {
        button: "注册",
        loading: "注册中..."
      },
      reset: {
        button: "发送重置邮件",
        loading: "发送中..."
      },
      resend_verification: "重新发送验证邮件",
      welcome: "欢迎，",
      sign_out: "退出登录",
      loading: "加载中..."
    },
    legal: { 
      common: { last_updated: "最后更新", date: "2024年12月" },
      terms: {
        title: "服务条款",
        content: "服务条款内容正在建设中，敬请期待完整版本。",
        coming_soon: "服务条款内容正在建设中，敬请期待完整版本。",
        sections: {
          introduction: {
            title: "1. 介绍",
            content: "欢迎使用ArtisanAI。本服务条款（'条款'）规范您对我们AI驱动的图像生成平台的使用。通过访问或使用我们的服务，您同意受这些条款的约束。"
          },
          acceptance: {
            title: "2. 条款接受",
            content: "通过使用ArtisanAI，您确认已阅读、理解并同意受这些条款的约束。如果您不同意这些条款，请不要使用我们的服务。"
          },
          services: {
            title: "3. 服务描述",
            content: "ArtisanAI提供AI驱动的图像生成服务，包括但不限于人物一致性、3D手办生成和风格转换。我们的服务由先进的AI模型提供支持，包括Nano-Banana技术。"
          },
          user_accounts: {
            title: "4. 用户账户",
            content: "要访问某些功能，您可能需要创建一个账户。您有责任维护账户凭据的机密性，并对您账户下发生的所有活动负责。"
          },
          acceptable_use: {
            title: "5. 可接受使用",
            content: "您同意仅将我们的服务用于合法目的，并符合这些条款。您不得使用我们的服务生成非法、有害、威胁、滥用或违反任何适用法律法规的内容。"
          },
          intellectual_property: {
            title: "6. 知识产权",
            content: "ArtisanAI平台，包括其设计、功能和底层技术，受知识产权法保护。您保留生成内容的所有权，但授予我们提供服务的许可。"
          },
          privacy: {
            title: "7. 隐私",
            content: "您的隐私对我们很重要。请查看我们的隐私政策，该政策也规范您对我们服务的使用，以了解我们的做法。"
          },
          payment: {
            title: "8. 付款和计费",
            content: "我们服务的某些功能需要付费。除非另有说明，所有费用均不可退还。我们保留在合理通知下更改价格的权利。"
          },
          termination: {
            title: "9. 终止",
            content: "我们可自行决定终止或暂停您的账户和对我们服务的访问，无需事先通知，对于我们认为违反这些条款或对其他用户有害的行为。"
          },
          disclaimers: {
            title: "10. 免责声明",
            content: "我们的服务按'现状'提供，不提供任何形式的保证。我们不保证我们的服务将不间断、无错误或满足您的特定要求。"
          },
          limitation: {
            title: "11. 责任限制",
            content: "在法律允许的最大范围内，ArtisanAI不对因使用我们的服务而产生的任何间接、偶然、特殊、后果性或惩罚性损害承担责任。"
          },
          changes: {
            title: "12. 条款变更",
            content: "我们保留随时修改这些条款的权利。我们将通过我们的平台或电子邮件通知用户任何重大变更。在变更后继续使用我们的服务即构成接受新条款。"
          },
          contact: {
            title: "13. 联系信息",
            content: "如果您对这些条款有任何疑问，请通过jdfz13zqy@gmail.com联系我们。"
          }
        }
      },
      privacy: {
        title: "隐私政策",
        content: "隐私政策内容正在建设中，敬请期待中文版本。",
        coming_soon: "隐私政策内容正在建设中，敬请期待中文版本。",
        sections: {
          introduction: {
            title: "1. 介绍",
            content: "本隐私政策描述了ArtisanAI（'我们'、'我们的'）在您使用我们AI驱动的图像生成平台时如何收集、使用和保护您的个人信息。"
          },
          information_collection: {
            title: "2. 我们收集的信息",
            content: "我们收集您直接提供给我们的信息，例如当您创建账户、上传图像或联系我们时。这可能包括您的姓名、电子邮件地址和上传的内容。"
          },
          usage_information: {
            title: "3. 使用信息",
            content: "我们自动收集有关您使用我们服务的某些信息，包括设备信息、IP地址、浏览器类型和使用模式。"
          },
          cookies: {
            title: "4. Cookie和跟踪",
            content: "我们使用Cookie和类似技术来增强您的体验、分析使用模式并提供个性化内容。您可以通过浏览器控制Cookie设置。"
          },
          data_usage: {
            title: "5. 我们如何使用您的信息",
            content: "我们使用您的信息来提供、维护和改进我们的服务，处理交易，与您沟通，并确保平台安全。"
          },
          data_sharing: {
            title: "6. 信息共享",
            content: "我们不出售您的个人信息。我们可能与协助我们运营平台的服务提供商共享您的信息，或在法律要求时共享。"
          },
          data_security: {
            title: "7. 数据安全",
            content: "我们实施适当的安全措施来保护您的个人信息免受未经授权的访问、更改、披露或破坏。"
          },
          data_retention: {
            title: "8. 数据保留",
            content: "我们保留您的个人信息，只要有必要提供我们的服务并履行本隐私政策中概述的目的。"
          },
          your_rights: {
            title: "9. 您的权利",
            content: "您有权访问、更新或删除您的个人信息。您也可以选择退出我们的某些通信。"
          },
          children_privacy: {
            title: "10. 儿童隐私",
            content: "我们的服务不适用于13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。"
          },
          international_transfers: {
            title: "11. 国际数据传输",
            content: "您的信息可能会被传输到您所在国家以外的国家并在那里处理。我们确保有适当的保障措施。"
          },
          policy_changes: {
            title: "12. 政策变更",
            content: "我们可能会不时更新本隐私政策。我们将通过我们的平台或电子邮件通知您任何重大变更。"
          },
          contact: {
            title: "13. 联系我们",
            content: "如果您对本隐私政策有任何疑问，请通过jdfz13zqy@gmail.com联系我们。"
          }
        }
      },
      cookies: {
        title: "Cookie政策",
        content: "Cookie政策内容正在建设中，敬请期待中文版本。",
        coming_soon: "Cookie政策内容正在建设中，敬请期待中文版本。",
        sections: {
          introduction: {
            title: "1. 什么是Cookie",
            content: "Cookie是您访问我们网站时存储在您设备上的小文本文件。它们帮助我们为您提供更好的体验并了解您如何使用我们的服务。"
          },
          types_of_cookies: {
            title: "2. 我们使用的Cookie类型",
            content: "我们使用基本Cookie用于网站功能，分析Cookie来了解使用模式，以及偏好Cookie来记住您的设置和偏好。"
          },
          essential_cookies: {
            title: "3. 基本Cookie",
            content: "这些Cookie对于网站正常运行是必要的。它们启用基本功能，如页面导航、访问安全区域和身份验证。"
          },
          analytics_cookies: {
            title: "4. 分析Cookie",
            content: "我们使用分析Cookie来了解访问者如何与我们的网站互动，帮助我们改善性能用户体验。"
          },
          preference_cookies: {
            title: "5. 偏好Cookie",
            content: "这些Cookie记住您的选择和偏好，如语言设置，以便在未来的访问中提供个性化体验。"
          },
          third_party_cookies: {
            title: "6. 第三方Cookie",
            content: "一些Cookie由我们使用的第三方服务设置，如分析提供商。这些帮助我们了解用户行为并改善我们的服务。"
          },
          cookie_management: {
            title: "7. 管理Cookie",
            content: "您可以通过浏览器设置控制Cookie。您可以删除现有Cookie并选择阻止未来的Cookie，尽管这可能会影响网站功能。"
          },
          browser_settings: {
            title: "8. 浏览器设置",
            content: "大多数浏览器允许您拒绝Cookie或删除它们。请参考您浏览器的帮助文档获取Cookie管理的具体说明。"
          },
          cookie_consent: {
            title: "9. Cookie同意",
            content: "通过继续使用我们的网站，您同意我们按照本政策中描述的方式使用Cookie。您可以随时通过浏览器设置撤回同意。"
          },
          updates: {
            title: "10. 政策更新",
            content: "我们可能会不时更新本Cookie政策。任何更改都将在此页面上发布，并附有更新的修订日期。"
          },
          contact: {
            title: "11. 联系我们",
            content: "如果您对我们使用Cookie有疑问，请通过jdfz13zqy@gmail.com联系我们。"
          }
        }
      },
      refund: {
        title: "退款政策",
        content: "退款政策内容正在建设中，敬请期待中文版本。",
        coming_soon: "退款政策内容正在建设中，敬请期待中文版本。",
        sections: {
          introduction: {
            title: "1. 退款政策概述",
            content: "本退款政策概述了ArtisanAI服务退款的条款和条件。请在购买前仔细阅读本政策。"
          },
          refund_eligibility: {
            title: "2. 退款资格",
            content: "对于阻止服务交付的技术问题、计费错误或重复收费，可考虑退款。已完成的AI生成服务不提供退款。"
          },
          technical_issues: {
            title: "3. 技术问题",
            content: "如果您遇到阻止您使用我们服务的技术问题，请在问题发生后的7天内联系我们的支持团队。我们将进行调查并可能提供退款或积分。"
          },
          billing_errors: {
            title: "4. 计费错误",
            content: "如果您认为被错误收费，请立即联系我们。我们将审查收费情况，如果确认有错误，将提供退款。"
          },
          service_quality: {
            title: "5. 服务质量问题",
            content: "如果您对AI生成内容的质量不满意，请在24小时内联系支持。我们可能提供积分或重新生成内容。"
          },
          refund_process: {
            title: "6. 退款流程",
            content: "要申请退款，请通过jdfz13zqy@gmail.com联系我们，提供您的订单详情和退款申请原因。我们将在2-3个工作日内回复。"
          },
          processing_time: {
            title: "7. 处理时间",
            content: "已批准的退款将在5-10个工作日内处理。退款将记入用于购买的原付款方式。"
          },
          non_refundable: {
            title: "8. 不可退款项目",
            content: "以下项目不符合退款条件：已完成的AI生成服务、已使用的积分，以及30天前进行的购买。"
          },
          credit_alternatives: {
            title: "9. 积分替代方案",
            content: "在某些情况下，我们可能提供账户积分而不是退款。积分可用于未来购买且不会过期。"
          },
          chargebacks: {
            title: "10. 拒付",
            content: "如果您与银行发起拒付，请先联系我们解决问题。不必要的拒付可能导致账户暂停。"
          },
          policy_changes: {
            title: "11. 政策变更",
            content: "我们保留随时修改本退款政策的权利。变更将在此页面上发布，并适用于未来的购买。"
          },
          contact: {
            title: "12. 联系我们",
            content: "如需退款申请或对本政策有疑问，请通过jdfz13zqy@gmail.com联系我们。"
          }
        }
      }
    },
    footer: {
      tagline: "以一致性和创造力创造AI驱动图像生成的未来。",
      product: "产品",
      features: "功能特色",
      howToWork: "使用方法",
      moreCreative: "更多创意玩法",
      api: "API",
      support: "支持",
      contact: "联系我们",
      legal: "法律条款",
      termsOfService: "服务条款",
      privacyPolicy: "隐私政策",
      cookiePolicy: "Cookie政策",
      refundPolicy: "退款政策",
      copyright: "© 2024 ArtisanAI. 全著作権所有。",
    },
    feedback: {
      title: "分享您的反馈",
      subtitle: "帮助我们通过您的想法和建议改进ArtisanAI。",
      placeholder: "告诉我们您对ArtisanAI的想法...",
      submit: "提交",
      submitting: "提交中...",
      success: {
        title: "反馈提交成功！",
        description: "感谢您的宝贵意见，我们会认真考虑您的建议。"
      },
      error: {
        title: "提交失败",
        description: "请稍后重试，或通过其他方式联系我们。"
      },
      network: {
        title: "网络错误",
        description: "请检查网络连接后重试。"
      }
    },
    errors: {
      generation_failed: "生成失败",
      insufficient_credits: {
        title: "积分不足",
        description: "您的积分不足以生成图像。请购买更多积分以继续使用。",
        action: "购买积分"
      },
      api_quota: "API额度已用完，请稍后再试或联系管理员",
      server_error: "服务器内部错误，可能是API服务暂时不可用"
    },
    faq: {
      breadcrumb: "返回首页",
      title: "常见问题",
      subtitle: "找到关于ArtisanAI常见问题的答案",
      questions: {
        q1: {
          q: "什么是ArtisanAI？",
          a: "ArtisanAI是一个AI驱动的图像生成平台，能够创建令人惊叹的一致结果，在不同风格和场景中保持人物一致性。"
        },
        q2: {
          q: "人物一致性是如何工作的？",
          a: "我们的先进AI在所有生成中保留独特的面部特征、骨骼结构和表情，确保同一人物在不同风格和服装中保持一致。"
        },
        q3: {
          q: "支持哪些文件格式？",
          a: "我们支持JPEG、PNG和WebP格式。您可以上传最多15张图片，每张最大10MB。"
        },
        q4: {
          q: "生成需要多长时间？",
          a: "大多数生成在10-30秒内完成，具体取决于您请求的复杂性和当前服务器负载。"
        },
        q5: {
          q: "生成的图片可以商用吗？",
          a: "是的，通过ArtisanAI生成的所有图片都可以用于商业用途。请查看我们的服务条款了解完整详情。"
        }
      },
      contact: {
        title: "还有问题？",
        subtitle: "找不到您要的内容？我们的支持团队随时为您提供帮助。",
        button: "联系支持"
      }
    },
  },
} as const

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // 始终默认为英文，忽略localStorage中的设置
    setLanguage("en")
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("language", language)
  }, [language])

  const value = { language, setLanguage, t: translations[language] as any }
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}
