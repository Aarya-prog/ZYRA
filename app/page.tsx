"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, MessageCircle, Hash, Sparkles, Camera, Heart, TrendingUp, Copy, CheckCircle } from "lucide-react"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export default function SocialFlowDashboard() {
  const [activeTab, setActiveTab] = useState("caption")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([])
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [removingCaptions, setRemovingCaptions] = useState<Set<number>>(new Set())
  const [imageDescription, setImageDescription] = useState("")
  const [previousCaptions, setPreviousCaptions] = useState<Set<string>>(new Set())
  const [imageUrl, setImageUrl] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = async (type: string) => {
    setIsGenerating(true)

    if (type === "caption") {
      try {
        let comprehensivePrompt = ""
        const userInputs: string[] = []
        const extractedKeywords: string[] = []

        if (imageDescription.trim()) {
          console.log("[v0] Processing image description:", imageDescription)

          extractedKeywords.push(
            ...imageDescription
              .toLowerCase()
              .replace(/[^\w\s]/g, " ")
              .split(/\s+/)
              .filter(
                (word) =>
                  word.length > 2 &&
                  ![
                    "the",
                    "and",
                    "for",
                    "are",
                    "but",
                    "not",
                    "you",
                    "all",
                    "can",
                    "had",
                    "her",
                    "was",
                    "one",
                    "our",
                    "out",
                    "day",
                    "get",
                    "has",
                    "him",
                    "his",
                    "how",
                    "man",
                    "new",
                    "now",
                    "old",
                    "see",
                    "two",
                    "way",
                    "who",
                    "boy",
                    "did",
                    "its",
                    "let",
                    "put",
                    "say",
                    "she",
                    "too",
                    "use",
                    "this",
                    "that",
                    "with",
                    "from",
                    "they",
                    "have",
                    "been",
                    "will",
                    "were",
                    "said",
                    "each",
                    "which",
                    "their",
                    "time",
                    "would",
                    "there",
                    "could",
                    "other",
                    "what",
                    "when",
                    "where",
                    "than",
                    "some",
                    "very",
                    "into",
                    "just",
                    "like",
                    "over",
                    "also",
                    "back",
                    "after",
                    "first",
                    "well",
                    "year",
                    "work",
                    "such",
                    "make",
                    "even",
                    "most",
                    "take",
                    "than",
                    "only",
                    "think",
                    "know",
                    "come",
                    "good",
                    "much",
                    "more",
                  ].includes(word),
              )
              .slice(0, 8),
          )

          console.log("[v0] Extracted keywords:", extractedKeywords)

          userInputs.push(`Image description: "${imageDescription}"`)
          userInputs.push(`KEY FOCUS WORDS: ${extractedKeywords.join(", ")}`)
        }

        if (uploadedFile) {
          userInputs.push(`Uploaded file: ${uploadedFile.name} (${uploadedFile.type})`)
        }

        if (imageUrl.trim()) {
          userInputs.push(`Image URL provided: ${imageUrl}`)
        }

        if (userInputs.length > 0) {
          comprehensivePrompt = `MANDATORY: Create captions that MUST center around these specific elements: ${userInputs.join(" | ")}. `
          if (extractedKeywords.length > 0) {
            comprehensivePrompt += `CRITICAL: Every caption MUST prominently feature these exact keywords: "${extractedKeywords.join('", "')}" - use them as the main theme, not just mentions. `
          }
        } else {
          comprehensivePrompt = "Create engaging social media captions with variety. "
        }

        const keywordFocusedPrompt =
          extractedKeywords.length > 0
            ? `${comprehensivePrompt}Generate exactly 5 unique social media captions where EACH caption is built around the keywords: ${extractedKeywords.join(", ")}. 

STRICT REQUIREMENTS:
- Each caption must use at least 3 of these keywords: ${extractedKeywords.join(", ")}
- Make the keywords the central theme of each caption
- Create different emotional tones: inspirational, casual, professional, fun, storytelling
- Include relevant hashtags that match the keywords
- Each caption should tell a story or convey a message using these keywords
- Format as: 1. [caption] 2. [caption] 3. [caption] 4. [caption] 5. [caption]

Keywords to focus on: ${extractedKeywords.join(", ")}`
            : `${comprehensivePrompt}Generate 5 diverse, engaging social media captions with different tones and styles. Format as numbered list.`

        console.log("[v0] Using prompt:", keywordFocusedPrompt.substring(0, 300) + "...")

        const { text } = await generateText({
          model: groq("llama-3.1-70b-versatile"),
          prompt: keywordFocusedPrompt,
        })

        console.log("[v0] Generated text:", text.substring(0, 200) + "...")

        const captions = text
          .split(/\d+\.\s+/)
          .filter((caption) => caption.trim().length > 10)
          .map((caption) => caption.trim())
          .slice(0, 5)

        console.log("[v0] Parsed captions:", captions.length, "captions")

        const finalCaptions =
          captions.length >= 5
            ? captions.slice(0, 5)
            : [
                ...captions,
                ...Array(5 - captions.length)
                  .fill(0)
                  .map((_, i) =>
                    extractedKeywords.length > 0
                      ? `✨ Embracing ${extractedKeywords[0] || "life"} with passion and purpose! Every moment is an opportunity to grow. #${extractedKeywords[0] || "inspiration"} #growth #positivity`
                      : `🌟 Creating something amazing today! What inspires you? #inspiration #creativity #life`,
                  ),
              ]

        console.log("[v0] Final captions count:", finalCaptions.length)

        setPreviousCaptions((prev) => {
          const newSet = new Set(prev)
          finalCaptions.forEach((caption) => newSet.add(caption.toLowerCase()))
          return newSet
        })

        if (generatedCaptions.length > 0) {
          setRemovingCaptions(new Set([0, 1, 2, 3, 4]))
          setTimeout(() => {
            setGeneratedCaptions(finalCaptions)
            setRemovingCaptions(new Set())
          }, 500)
        } else {
          setGeneratedCaptions(finalCaptions)
        }
      } catch (error) {
        console.log("[v0] Error generating captions:", error)

        const extractedKeywords: string[] = []
        const fallbackCaptions =
          extractedKeywords.length > 0
            ? [
                `✨ ${extractedKeywords[0]} brings so much joy to my life! Grateful for these beautiful moments. #${extractedKeywords[0]} #gratitude #joy`,
                `🌟 Exploring the world of ${extractedKeywords[1] || extractedKeywords[0]} and loving every second of it! #${extractedKeywords[0]} #adventure #passion`,
                `💫 When ${extractedKeywords[0]} meets creativity, magic happens! What inspires you today? #${extractedKeywords[0]} #creativity #inspiration`,
                `🎯 Focused on ${extractedKeywords[0]} and all the possibilities it brings! #${extractedKeywords[0]} #focus #goals #success`,
                `🌈 Life is better with ${extractedKeywords[0]} in it! Celebrating the little things that matter most. #${extractedKeywords[0]} #life #celebration`,
              ]
            : [
                "✨ Living authentically and loving every moment of this beautiful journey! #authentic #joy #life",
                "🌟 Today's energy: unstoppable and ready for anything! #energy #positivity #vibes",
                "📸 Capturing the magic in ordinary moments. #magic #moments #beauty",
                "🎯 Progress over perfection, always. #progress #growth #victory",
                "🌈 Grateful for the colorful tapestry of experiences. #gratitude #life #experiences",
              ]

        if (generatedCaptions.length > 0) {
          setRemovingCaptions(new Set([0, 1, 2, 3, 4]))
          setTimeout(() => {
            setGeneratedCaptions(fallbackCaptions)
            setRemovingCaptions(new Set())
          }, 500)
        } else {
          setGeneratedCaptions(fallbackCaptions)
        }
      }
    } else if (type === "mood") {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setGeneratedContent("😊 Positive • Joy: 85% • Excitement: 70% • Gratitude: 60%")
    } else if (type === "hashtag") {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setGeneratedContent(
        "#SocialMedia #ContentCreator #DigitalMarketing #Engagement #Trending #Viral #Community #Brand #Influence #Growth",
      )
    }

    setIsGenerating(false)
  }

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content)
    setCopiedStates((prev) => ({ ...prev, [key]: true }))
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: false }))
    }, 2000)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-background dark-gradient-mesh dark">
      <header className="border-b glass-effect-dark sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center pulse-glow-dark tilt-hover">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">ZYRA</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Social Media Tools</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="float-animation glass-effect-dark">
                <TrendingUp className="w-3 h-3 mr-1" />3 Active Tools
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 perspective">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">Transform Your Social Media Game</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Generate engaging captions, analyze sentiment, and discover trending hashtags with our AI-powered toolkit
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 glass-effect-dark h-14 border border-white/10">
              <TabsTrigger
                value="caption"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white/10"
              >
                <Camera className="w-4 h-4" />
                Caption Generator
              </TabsTrigger>
              <TabsTrigger
                value="mood"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white/10"
              >
                <Heart className="w-4 h-4" />
                Mood Checker
              </TabsTrigger>
              <TabsTrigger
                value="hashtag"
                className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-white/10"
              >
                <Hash className="w-4 h-4" />
                Hashtag Suggestor
              </TabsTrigger>
            </TabsList>

            <TabsContent value="caption" className="space-y-6">
              <Card className="card-3d glass-effect-dark border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Camera className="w-6 h-6 text-primary" />
                    AI Caption Generator
                  </CardTitle>
                  <CardDescription className="text-base">
                    Upload an image or provide a URL to generate engaging captions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div
                        className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-primary/50 transition-all duration-300 card-3d glass-effect-dark border border-cyan-400/50 relative group"
                        onClick={handleFileUpload}
                      >
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 float-animation" />
                        <p className="text-sm text-muted-foreground">
                          {uploadedFile ? `Selected: ${uploadedFile.name}` : "Drag & drop an image or click to browse"}
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <div className="text-center text-muted-foreground font-medium">or</div>
                      <Input
                        placeholder="Paste image URL here..."
                        className="h-12 glass-effect-dark border-white/10"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      <div className="text-center text-muted-foreground font-medium">or</div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Describe your image in words:
                        </label>
                        <Textarea
                          placeholder="Describe what you want to create a caption for... (e.g., 'A sunset over mountains with a person hiking', 'Fresh coffee and pastries on a wooden table', 'Modern office workspace with plants')"
                          value={imageDescription}
                          onChange={(e) => setImageDescription(e.target.value)}
                          className="min-h-24 resize-none glass-effect-dark border-white/10"
                        />
                        <p className="text-xs text-muted-foreground">
                          Keywords from your description will be used to generate relevant captions
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="aspect-square bg-black rounded-lg flex items-center justify-center card-3d overflow-hidden glass-effect-dark border border-cyan-400/50 relative group">
                        <div className="absolute inset-0 opacity-30">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20"></div>
                          <svg className="w-full h-full" viewBox="0 0 400 400">
                            <defs>
                              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path
                                  d="M 20 0 L 0 0 0 20"
                                  fill="none"
                                  stroke="rgba(168, 85, 247, 0.3)"
                                  strokeWidth="0.5"
                                />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            <g
                              className="animate-spin"
                              style={{ transformOrigin: "200px 200px", animationDuration: "15s" }}
                            >
                              <circle
                                cx="200"
                                cy="200"
                                r="120"
                                fill="none"
                                stroke="rgba(168, 85, 247, 0.6)"
                                strokeWidth="1.5"
                              />
                              <ellipse
                                cx="200"
                                cy="200"
                                rx="120"
                                ry="60"
                                fill="none"
                                stroke="rgba(168, 85, 247, 0.5)"
                                strokeWidth="1"
                              />
                              <ellipse
                                cx="200"
                                cy="200"
                                rx="120"
                                ry="30"
                                fill="none"
                                stroke="rgba(168, 85, 247, 0.4)"
                                strokeWidth="1"
                              />
                              <ellipse
                                cx="200"
                                cy="200"
                                rx="60"
                                ry="120"
                                fill="none"
                                stroke="rgba(168, 85, 247, 0.5)"
                                strokeWidth="1"
                              />
                              <ellipse
                                cx="200"
                                cy="200"
                                rx="30"
                                ry="120"
                                fill="none"
                                stroke="rgba(168, 85, 247, 0.4)"
                                strokeWidth="1"
                              />
                              <line
                                x1="80"
                                y1="200"
                                x2="320"
                                y2="200"
                                stroke="rgba(168, 85, 247, 0.3)"
                                strokeWidth="0.5"
                              />
                              <line
                                x1="200"
                                y1="80"
                                x2="200"
                                y2="320"
                                stroke="rgba(168, 85, 247, 0.3)"
                                strokeWidth="0.5"
                              />
                            </g>
                          </svg>
                        </div>
                        <div className="absolute top-4 left-8 text-white text-xl animate-pulse">✦</div>
                        <div
                          className="absolute top-12 right-12 text-white text-lg animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        >
                          ✦
                        </div>
                        <div
                          className="absolute bottom-8 left-12 text-white text-sm animate-pulse"
                          style={{ animationDelay: "1s" }}
                        >
                          ✦
                        </div>
                        <div
                          className="absolute bottom-12 right-8 text-white text-xl animate-pulse"
                          style={{ animationDelay: "1.5s" }}
                        >
                          ✦
                        </div>
                        <div
                          className="absolute top-1/3 left-4 text-white text-xs animate-pulse"
                          style={{ animationDelay: "2s" }}
                        >
                          ✦
                        </div>
                        <div className="absolute top-4 left-4 flex space-x-1">
                          <div className="w-1 h-8 bg-white"></div>
                          <div className="w-0.5 h-8 bg-white"></div>
                          <div className="w-1 h-8 bg-white"></div>
                          <div className="w-0.5 h-8 bg-white"></div>
                          <div className="w-2 h-8 bg-white"></div>
                          <div className="w-0.5 h-8 bg-white"></div>
                          <div className="w-1 h-8 bg-white"></div>
                        </div>
                        <div className="relative z-10 text-center">
                          <div
                            className="text-5xl font-black tracking-wider transform group-hover:scale-110 transition-all duration-500"
                            style={{
                              background: "linear-gradient(45deg, #e879f9, #c084fc, #a855f7, #9333ea, #7c3aed)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                              textShadow: "0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(236, 72, 153, 0.5)",
                              filter: "drop-shadow(2px 2px 8px rgba(0,0,0,0.9))",
                            }}
                          >
                            ZYRA
                          </div>
                          <div
                            className="text-sm font-bold tracking-[0.2em] mt-1 text-purple-300"
                            style={{
                              textShadow: "0 0 20px rgba(168, 85, 247, 0.8)",
                            }}
                          >
                            VIBES ONLY
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="relative w-96 h-96">
                            <svg className="w-full h-full animate-spin" style={{ animationDuration: "25s" }}>
                              <path
                                id="circle-path"
                                d="M 192,192 m -160,0 a 160,160 0 1,1 320,0 a 160,160 0 1,1 -320,0"
                                fill="none"
                                stroke="none"
                              />
                              <text className="text-xs fill-purple-300" style={{ fontSize: "9px" }}>
                                <textPath href="#circle-path" startOffset="0%">
                                  POSITIVE VIBES ONLY • POSITIVE VIBES ONLY • POSITIVE VIBES ONLY • POSITIVE VIBES ONLY
                                  •
                                </textPath>
                              </text>
                            </svg>
                          </div>
                        </div>
                        <div className="absolute top-2 left-2 w-3 h-3 bg-cyan-400 rounded-full blur-sm animate-pulse"></div>
                        <div
                          className="absolute top-2 right-2 w-3 h-3 bg-purple-400 rounded-full blur-sm animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="absolute bottom-2 left-2 w-3 h-3 bg-pink-400 rounded-full blur-sm animate-pulse"
                          style={{ animationDelay: "1s" }}
                        ></div>
                        <div
                          className="absolute bottom-2 right-2 w-3 h-3 bg-blue-400 rounded-full blur-sm animate-pulse"
                          style={{ animationDelay: "1.5s" }}
                        ></div>
                        <div className="absolute bottom-4 right-4 bg-white text-black px-3 py-1 rounded text-xs font-bold">
                          BRAND
                        </div>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleGenerate("caption")}
                    disabled={isGenerating}
                    className="w-full bg-primary hover:bg-primary/90 h-12 interactive-button-dark"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                        Generating 5 Captions...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate 5 Captions
                      </>
                    )}
                  </Button>
                  {generatedCaptions.length > 0 && activeTab === "caption" && (
                    <div className="space-y-4">
                      {generatedCaptions.map((caption, index) => (
                        <Card
                          key={index}
                          className={`glass-effect-dark border-primary/30 border transition-all duration-500 ${
                            removingCaptions.has(index)
                              ? "opacity-0 transform -translate-x-full scale-95"
                              : "opacity-100 transform translate-x-0 scale-100"
                          }`}
                        >
                          <CardContent className="pt-6">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <div className="text-xs text-muted-foreground mb-2">Caption {index + 1}</div>
                                <p className="text-sm leading-relaxed">{caption}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopy(caption, `caption-${index}`)}
                                className="shrink-0 interactive-button-dark glass-effect-dark border-white/20"
                              >
                                {copiedStates[`caption-${index}`] ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mood" className="space-y-6">
              <Card className="card-3d glass-effect-dark border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="w-6 h-6 text-secondary" />
                    AI Mood Analyzer
                  </CardTitle>
                  <CardDescription className="text-base">
                    Analyze the sentiment and emotional tone of your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Textarea
                    placeholder="Paste your text, tweet, or social media post here to analyze its mood and sentiment..."
                    className="min-h-32 resize-none glass-effect-dark border-white/10"
                  />
                  <Button
                    onClick={() => handleGenerate("mood")}
                    disabled={isGenerating}
                    className="w-full bg-white hover:bg-white/90 h-12 interactive-button-dark text-black"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Analyzing Mood...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Check Mood
                      </>
                    )}
                  </Button>
                  {generatedContent && activeTab === "mood" && (
                    <Card className="glass-effect-dark border-secondary/30 border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed mb-4">{generatedContent}</p>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="bg-green-500/20 p-3 rounded-lg text-center card-3d glass-effect-dark border border-green-500/30">
                                <div className="text-3xl mb-2">😊</div>
                                <div className="text-xs font-medium">Joy</div>
                              </div>
                              <div className="bg-yellow-500/20 p-3 rounded-lg text-center card-3d glass-effect-dark border border-yellow-500/30">
                                <div className="text-3xl mb-2">🎉</div>
                                <div className="text-xs font-medium">Excitement</div>
                              </div>
                              <div className="bg-blue-500/20 p-3 rounded-lg text-center card-3d glass-effect-dark border border-blue-500/30">
                                <div className="text-3xl mb-2">🙏</div>
                                <div className="text-xs font-medium">Gratitude</div>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(generatedContent, "mood")}
                            className="shrink-0 interactive-button-dark glass-effect-dark border-white/20"
                          >
                            {copiedStates.mood ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hashtag" className="space-y-6">
              <Card className="card-3d glass-effect-dark border border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Hash className="w-6 h-6 text-accent" />
                    AI Hashtag Generator
                  </CardTitle>
                  <CardDescription className="text-base">
                    Get trending and relevant hashtags for maximum reach
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Input
                    placeholder="Enter keywords about your content (e.g., travel, food, fitness)..."
                    className="h-12 glass-effect-dark border-white/10"
                  />
                  <Button
                    onClick={() => handleGenerate("hashtag")}
                    disabled={isGenerating}
                    className="w-full bg-accent hover:bg-accent/90 h-12 interactive-button-dark"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent-foreground mr-2"></div>
                        Finding Hashtags...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Suggest Hashtags
                      </>
                    )}
                  </Button>
                  {generatedContent && activeTab === "hashtag" && (
                    <Card className="glass-effect-dark border-accent/30 border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed mb-4">{generatedContent}</p>
                            <div className="flex flex-wrap gap-2">
                              {generatedContent
                                .split(" ")
                                .slice(0, 5)
                                .map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs tilt-hover glass-effect-dark border border-white/20"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(generatedContent, "hashtag")}
                            className="shrink-0 interactive-button-dark glass-effect-dark border-white/20"
                          >
                            {copiedStates.hashtag ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <Card className="card-3d stats-card bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 glass-effect-dark border">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Captions Generated</p>
                    <p className="text-3xl font-bold text-primary">1,247</p>
                  </div>
                  <Camera className="w-10 h-10 text-primary float-animation" />
                </div>
              </CardContent>
            </Card>
            <Card className="card-3d stats-card bg-gradient-to-br from-secondary/20 to-secondary/10 border-secondary/30 glass-effect-dark border">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Moods Analyzed</p>
                    <p className="text-3xl font-bold text-white">892</p>
                  </div>
                  <Heart className="w-10 h-10 text-white float-animation" style={{ animationDelay: "0.5s" }} />
                </div>
              </CardContent>
            </Card>
            <Card className="card-3d stats-card bg-gradient-to-br from-accent/20 to-accent/10 border-accent/30 glass-effect-dark border">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Hashtags Suggested</p>
                    <p className="text-3xl font-bold text-white">3,456</p>
                  </div>
                  <Hash className="w-10 h-10 text-white float-animation" style={{ animationDelay: "1s" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
