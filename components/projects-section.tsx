"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function ProjectsSection() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [cardRect, setCardRect] = useState<DOMRect | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // PROJECT VISIBILITY CONFIGURATION
  // Toggle these boolean values to show/hide projects dynamically
  const projectVisibility = {
    plotitAI: true,
    animePattern: true,
    tileToPattern: true,
    whisper4Windows: true,
    integrationBee: false, // Hidden for now - set to true to show
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("projects")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (expandedProject !== null) {
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Store original values
      const originalBodyOverflow = document.body.style.overflow
      const originalBodyPaddingRight = document.body.style.paddingRight
      
      // Apply scrollbar compensation
      document.body.style.overflow = "hidden"
      document.body.style.paddingRight = `calc(${document.body.style.paddingRight || '0px'} + ${scrollbarWidth}px)`
      
      // Set CSS custom property for any fixed elements to use
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
      
      // Apply to the html element as well
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`
      
      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.body.style.paddingRight = originalBodyPaddingRight
        document.documentElement.style.removeProperty('--scrollbar-width')
        document.documentElement.style.paddingRight = ""
      }
    }
  }, [expandedProject])

  const projects = [
    {
      title: "Whisper4Windows - Voice to Text",
      description:
        "SuperWhisper did not have a Windows version, so I built a completely private, offline speech-to-text application for Windows that uses OpenAI's Whisper models for instant voice transcription with a simple keyboard shortcut.",
      detailedDescription:
        "Whisper4Windows transforms your voice into text anywhere on Windows with a simple F9 keyboard shortcut. Built with Tauri and FastAPI, it runs OpenAI's Whisper model completely locally - your voice never leaves your computer. Features include GPU acceleration for lightning-fast transcription (30 seconds of speech in under 1 seconds), support for 99 languages with automatic detection, customizable keyboard shortcuts, multiple model quality options (Tiny to Large V3), real-time wave visualization during recording, and clipboard integration. Perfect for writing emails, taking notes, coding documentation, or any text input task - completely private and free with no internet required after initial setup.",
      technologies: ["Tauri", "Rust", "Python", "Systems Programming", "TypeScript", "React", "FastAPI"],
      achievements: ["100% private offline transcription", "GPU-accelerated processing", "99 language support", "Works system-wide with hotkeys"],
      liveUrl: null,
      githubUrl: "https://github.com/BaderJabri/Whisper4Windows",
      image: "/Whisper4Windows.png",
      visible: projectVisibility.whisper4Windows,
    },
    {
      title: "AnimePattern - AI Pattern Generator",
      description:
        "A Canva application that generates seamless animated patterns using mathematical based animations, featuring real-time preview and export functionality.",
      detailedDescription:
        "Built for Patterned AI, this Canva application allows users to generate anime-style seamless patterns with AI. Features include real-time pattern preview, customizable animation controls, color palette selection, SVG pattern generation, and seamless integration with Canva's design workflow. The app uses advanced pattern generation algorithms and provides export options for various use cases including print and digital media.",
      technologies: ["TypeScript", "React", "SVG", "Canva Apps SDK", "CSS Animations"],
      achievements: ["Integrated with Patterned AI platform", "Real-time pattern generation", "Seamless Canva integration"],
      liveUrl: null, // Removed demo button
      githubUrl: null, // Removed GitHub button
      image: "/pattern-animation.gif",
      visible: projectVisibility.animePattern,
    },
    {
      title: "Tile To Pattern - Pattern Repeater",
      description:
        "A comprehensive tile repeating application that creates seamless patterns from user-uploaded tiles with advanced offset and scaling controls.",
      detailedDescription:
        "Tile To Pattern is a sophisticated pattern generation tool that transforms single tiles into seamless repeating patterns. Features include drag-and-drop tile upload (PNG/JPG/SVG), real-time zoom controls (10-400%), horizontal and vertical offset sliders, live DPI calculation, pattern preview with exact positioning, and export functionality. The application ensures production-ready patterns with proper validation and size constraints for professional use.",
      technologies: ["TypeScript", "React", "Canvas API", "Image Processing", "Tailwind CSS"],
      achievements: ["1,200+ installations in first month", "500+ active users", "Professional pattern generation", "Production-ready exports"],
      liveUrl: "https://www.canva.com/your-apps/AAGlhOFGfZE/tile-to-pattern?q=tile+to+pattern",
      githubUrl: null, // Removed GitHub button
      image: "/Tile_To_Pattern.png",
      visible: projectVisibility.tileToPattern,
    },
    {
      title: "Plotit AI - AI-Powered Data Visualization",
      description:
        "A Canva application that automates the extraction of insights from tabular data and creates customizable visualizations using AI.",
      detailedDescription:
        "Plotit AI automates data analysis processes that data scientists typically handle manually. Users simply upload their datasets, and the AI identifies key trends, patterns, and insights, generating a range of charts and graphs that can be customized to fit brand aesthetics. Built with automated data loading, cleaning, preprocessing, exploratory data analysis (EDA), and insight generation. Leverages machine learning and data processing libraries to handle a wide variety of datasets and consistently generate meaningful visualizations that integrate seamlessly into Canva designs.",
      technologies: ["Python", "React", "Canva Apps SDK", "Machine Learning", "Data Processing"],
      achievements: ["Automated data analysis pipeline", "AI-powered insight generation", "Seamless Canva integration"],
      liveUrl: null, // Removed demo button
      githubUrl: "https://github.com/BaderJabri/Plotit-Canva",
      image: "turn datasets into stunning visuals.png",
      visible: projectVisibility.plotitAI,
    },
    {
      title: "Integration Bee - Math Learning Platform",
      description:
        "An educational platform for practicing mathematical integration with AI-powered problem generation and competitive elements.",
      detailedDescription:
        "Integration Bee is a comprehensive math learning platform built with Next.js that helps students practice calculus integration. Features include AI-powered problem generation using Google's Generative AI, interactive math rendering with KaTeX, multiple game modes (practice and rush), progress tracking, competitive leaderboards, and comprehensive problem validation. The platform provides a gamified approach to learning complex mathematical concepts.",
      technologies: ["Next.js", "TypeScript", "Google Generative AI", "KaTeX", "Tailwind CSS"],
      achievements: ["AI-powered problem generation", "Interactive math rendering", "Gamified learning experience"],
      liveUrl: "#",
      githubUrl: "https://github.com/BaderJabri",
      image: "/financial-charts-and-spreadsheet-interface.png",
      visible: projectVisibility.integrationBee,
    },
  ]

  // Filter visible projects
  const visibleProjects = projects.filter(project => project.visible)

  const handleCardClick = (index: number) => {
    if (expandedProject === index) {
      setExpandedProject(null)
      setCardRect(null)
    } else {
      const cardElement = cardRefs.current[index]
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect()
        setCardRect(rect)
      }
      setExpandedProject(index)
    }
  }

  return (
    <>
      <section id="projects" className={`py-12 px-4 sm:px-6 lg:px-8 scroll-animate ${isVisible ? "in-view" : ""}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Here are some of my recent projects that showcase my technical skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProjects.map((project, index) => (
              <div key={index} className="relative">
                {/* Invisible placeholder when expanded to maintain layout */}
                {expandedProject === index ? (
                  <div className="invisible">
                    <Card className="overflow-hidden">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        <img
                          src={project.image || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          {project.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.slice(0, 3).map((tech, techIndex) => (
                            <Badge key={techIndex} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {project.technologies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                        {/* Action buttons placeholder to maintain layout */}
                        <div className="flex gap-2">
                          {project.liveUrl && (
                            <Button size="sm" variant="outline" className="text-xs h-8">
                              <ExternalLink className="mr-1 h-3 w-3" />
                              Launch
                            </Button>
                          )}
                          {project.githubUrl && (
                            <Button size="sm" variant="outline" className="text-xs h-8">
                              <Github className="mr-1 h-3 w-3" />
                              Code
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card
                    ref={(el) => { cardRefs.current[index] = el }}
                    className={`overflow-hidden hover-lift cursor-pointer transition-all duration-300 ${
                      expandedProject !== null && expandedProject !== index
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                    onClick={() => handleCardClick(index)}
                  >
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {project.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 3).map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {project.liveUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(project.liveUrl, '_blank', 'noopener,noreferrer')
                            }}
                            className="text-xs h-8"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            Launch
                          </Button>
                        )}
                        {project.githubUrl && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(project.githubUrl, '_blank', 'noopener,noreferrer')
                            }}
                            className="text-xs h-8"
                          >
                            <Github className="mr-1 h-3 w-3" />
                            Code
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Portal with Animations */}
      {expandedProject !== null && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          data-modal-open
        >
          {/* Backdrop with proper fade animation */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => handleCardClick(expandedProject)}
            style={{
              animation: 'backdropFadeIn 0.3s ease-out forwards',
            }}
          />
          
          {/* Modal Content with relative expansion animation */}
          <div 
            className="relative z-10 w-full max-w-2xl"
            style={{
              animation: cardRect 
                ? `modalExpandFrom 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards`
                : "modalSlideIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              transformOrigin: cardRect 
                ? `${((cardRect.left + cardRect.width / 2) / window.innerWidth) * 100}% ${((cardRect.top + cardRect.height / 2) / window.innerHeight) * 100}%`
                : "center"
            }}
          >
            <Card className="border-0 shadow-2xl">
              <div className="aspect-video bg-muted relative overflow-hidden">
                <img
                  src={visibleProjects[expandedProject].image || "/placeholder.svg"}
                  alt={visibleProjects[expandedProject].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  {visibleProjects[expandedProject].title}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCardClick(expandedProject)}
                    className="hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {visibleProjects[expandedProject].detailedDescription}
                </p>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Key Achievements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {visibleProjects[expandedProject].achievements.map((achievement, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {visibleProjects[expandedProject].technologies.map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      variant="secondary"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  {visibleProjects[expandedProject].liveUrl && (
                    <Button size="sm" asChild>
                      <a href={visibleProjects[expandedProject].liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Launch
                      </a>
                    </Button>
                  )}
                  {visibleProjects[expandedProject].githubUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={visibleProjects[expandedProject].githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* CSS Keyframes for animations */}
      <style jsx global>{`
        /* Scrollbar compensation for fixed elements */
        body:has([data-modal-open]) {
          overflow: hidden;
        }
        
        body:has([data-modal-open]) [style*="position: fixed"],
        body:has([data-modal-open]) [style*="position:fixed"] {
          padding-right: var(--scrollbar-width, 0px);
        }

        @keyframes backdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalExpandFrom {
          from {
            opacity: 0;
            transform: scale(0.1);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  )
}
