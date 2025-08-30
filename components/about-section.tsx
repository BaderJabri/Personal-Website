"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Code, TrendingUp, Users, Zap } from "lucide-react"
import { useEffect, useState } from "react"

export function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("about")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const skills = [
    {
      icon: Code,
      title: "Full-Stack Development",
      description: "React, Next.js, TypeScript, Node.js, Python, Canva Apps SDK",
    },
    {
      icon: TrendingUp,
      title: "AI & Data Science",
      description: "Machine Learning, Data Visualization, Pattern Generation, OpenAI API",
    },
    {
      icon: Users,
      title: "Business Strategy",
      description: "Market analysis, Financial modeling, Product development, Entrepreneurship",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Startup experience, Creative problem-solving, Rapid prototyping",
    },
  ]

  return (
    <section id="about" className={`py-12 px-4 sm:px-6 lg:px-8 scroll-animate ${isVisible ? "in-view" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">About Me</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            I'm currently working at Patterned AI as a Software Developer.
            I've always been interested in all kinds ofadvancements in technology, hence my major choice.
            I also enjoy participating in all kinds of sports, like soccer, volleball, and table tennis,
            and while it might be considered a sport, I also enjoy playing chess.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {skills.map((skill, index) => (
            <Card key={index} className="text-center hover-lift group" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <skill.icon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {skill.title}
                </h3>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-card rounded-lg p-8 hover-lift">
          <h3 className="text-2xl font-bold text-card-foreground mb-4">My Journey</h3>
          <p className="text-card-foreground leading-relaxed">
            As a double degree student at the University of Waterloo and Wilfrid Laurier University, I've built 
            innovative applications ranging from AI-powered data visualization tools to pattern generators and 
            educational platforms. My projects include developing Canva applications like Plotit AI for automated 
            data analysis, AnimePattern for seamless pattern generation, and educational tools like Integration Bee. 
            This unique combination of technical expertise and business understanding allows me to create solutions 
            that are both technically robust and commercially viable.
          </p>
        </div>
      </div>
    </section>
  )
}
