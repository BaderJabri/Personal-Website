"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Linkedin, Mail, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 relative">
      <div className="max-w-4xl mx-auto text-center flex-1 flex flex-col justify-center">
        <div className={`mb-8 w-auto mt-0 flex-row ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-4xl font-bold text-primary hover:scale-110 transition-transform duration-300 cursor-pointer">
            BA
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Bader Aljabri 
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Hey! I'm Bader, a 2nd Year Computer Science and Business Administration student at The University of Waterloo. 
          </p>
        </div>

        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 ${isVisible ? "animate-slide-in-left" : "opacity-0"}`}
          style={{ animationDelay: "0.2s" }}
        >
          <Button size="lg" className="w-full sm:w-auto hover:scale-105 transition-transform" asChild>
            <a href="/Bader-Aljabri-2025.pdf" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Resume
            </a>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto bg-transparent hover:scale-105 transition-transform"
            onClick={() => scrollToSection("contact")}
          >
            <Mail className="mr-2 h-4 w-4" />
            Get In Touch
          </Button>
        </div>

        <div
          className={`flex justify-center space-x-6 ${isVisible ? "animate-slide-in-right" : "opacity-0"}`}
          style={{ animationDelay: "0.4s" }}
        >
          <Button variant="ghost" size="sm" className="hover:scale-110 hover:text-primary transition-all" asChild>
            <a href="https://www.linkedin.com/in/baderaljabri/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-5 w-5" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="hover:scale-110 hover:text-primary transition-all" asChild>
            <a href="https://github.com/BaderJabri" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
      
      {/* Down arrow to indicate more content below */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Button
          variant="ghost"
          className="text-gray-500 hover:text-gray-700 hover:bg-transparent p-4 rounded-full hover:scale-110 transition-all duration-300"
          onClick={() => scrollToSection("about")}
          aria-label="Scroll to about section"
        >
          <ChevronDown className="h-16 w-16 animate-bounce" />
        </Button>
      </div>
    </section>
  )
}
