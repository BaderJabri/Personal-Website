"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function ExperienceSection() {
  const [expandedExperience, setExpandedExperience] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [cardRect, setCardRect] = useState<DOMRect | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("experience")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (expandedExperience !== null) {
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
  }, [expandedExperience])

  const experiences = [
    {
      title: "Software Developer",
      company: "Patterned AI",
      location: "Remote",
      period: "2024 - Present",
      description:
        "Developed Canva applications for AI-powered pattern generation, working on seamless pattern creation tools used by thousands of designers worldwide.",
      detailedDescription:
        "Built and maintained multiple Canva applications for Patterned AI's platform, including anime-style pattern generators and tile repeating tools. Implemented real-time pattern preview systems, SVG generation algorithms, and seamless Canva SDK integration. Worked closely with the design team to create user-friendly interfaces for complex pattern generation workflows. Applications are actively used by designers and have contributed to Patterned AI's recognition in the Canva App Store.",
      achievements: ["Built multiple Canva applications", "Thousands of active users", "Real-time pattern generation"],
      skills: ["TypeScript", "React", "Canva Apps SDK", "SVG", "Pattern Generation"],
    },
    {
      title: "Volunteer",
      company: "MAC Alhuda Schools",
      location: "Ontario",
      period: "2019 - 2023",
      description:
        "Volunteered at a weekend school for over 4 years, handling various tasks including general morning setups, teacher assisting, and front office duties.",
      detailedDescription:
        "Volunteered at MAC Alhuda Schools weekend program for over 4 years, handling various responsibilities including general morning setups, teacher assisting, and front office duties consisting of organization and planning tasks. Illustrated a high level of adaptability by pivoting between last-minute classroom support, front-office coordination, and facility setup ensuring that everything kept running smoothly for 400+ students and staff. Built upon communication and interpersonal skills through various interactions with a range of different types of people, including 4 year olds, teachers, parents, and staff members.",
      achievements: [
        "Supported 400+ students and staff weekly",
        "Demonstrated high adaptability across multiple roles",
        "Developed strong interpersonal and communication skills",
      ],
      skills: ["Classroom Support", "Administrative Tasks", "Communication", "Organization", "Adaptability"],
    },
  ]

  const education = [
    {
      degree: "Bachelor of Computer Science",
      school: "University of Waterloo",
      location: "Waterloo, ON",
      period: "2022 - 2026 (Expected)",
      details:
        "Focused on Software Engineering and Artificial Intelligence • Relevant Coursework: Data Structures, Algorithms, Software Design, Machine Learning, Computer Graphics",
    },
  ]

  const handleCardClick = (index: number) => {
    if (expandedExperience === index) {
      setExpandedExperience(null)
      setCardRect(null)
    } else {
      const cardElement = cardRefs.current[index]
      if (cardElement) {
        const rect = cardElement.getBoundingClientRect()
        setCardRect(rect)
      }
      setExpandedExperience(index)
    }
  }

  return (
    <>
      <section id="experience" className={`py-12 px-4 sm:px-6 lg:px-8 scroll-animate ${isVisible ? "in-view" : ""}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Work Experience</h2>

          </div>

          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <div key={index} className="relative">
                {/* Invisible placeholder when expanded to maintain layout */}
                {expandedExperience === index ? (
                  <div className="invisible">
                    <Card className="hover-lift">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {exp.title}
                        </CardTitle>
                        <div className="text-primary font-semibold">{exp.company}</div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {exp.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {exp.period}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {exp.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {exp.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card
                    ref={(el) => { cardRefs.current[index] = el }}
                    className={`hover-lift cursor-pointer transition-all duration-300 ${
                      expandedExperience !== null && expandedExperience !== index
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }`}
                    onClick={() => handleCardClick(index)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {exp.title}
                      </CardTitle>
                      <div className="text-primary font-semibold">{exp.company}</div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {exp.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exp.period}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {exp.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {exp.skills.map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="outline"
                            className="hover:bg-primary hover:text-primary-foreground transition-colors"
                          >
                            {skill}
                          </Badge>
                        ))}
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
      {expandedExperience !== null && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          data-modal-open
        >
          {/* Backdrop with proper fade animation */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => handleCardClick(expandedExperience)}
            style={{
              animation: 'backdropFadeIn 0.3s ease-out forwards',
            }}
          />
          
          {/* Modal Content with relative expansion animation */}
          <div 
            className="relative z-10 w-full max-w-2xl"
            style={{
              animation: cardRect 
                ? `modalExpandFrom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`
                : 'modalSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              transformOrigin: cardRect 
                ? `${((cardRect.left + cardRect.width / 2) / window.innerWidth) * 100}% ${((cardRect.top + cardRect.height / 2) / window.innerHeight) * 100}%`
                : 'center',
              maxHeight: 'calc(100vh - 2rem)',
              overflow: 'auto',
            }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  {experiences[expandedExperience].title}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCardClick(expandedExperience)}
                    className="hover:bg-red-100 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <div className="text-primary font-semibold">{experiences[expandedExperience].company}</div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {experiences[expandedExperience].location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {experiences[expandedExperience].period}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {experiences[expandedExperience].detailedDescription}
                </p>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Key Achievements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {experiences[expandedExperience].achievements.map((achievement, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2">
                  {experiences[expandedExperience].skills.map((skill, skillIndex) => (
                    <Badge
                      key={skillIndex}
                      variant="outline"
                      className="hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {skill}
                    </Badge>
                  ))}
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
