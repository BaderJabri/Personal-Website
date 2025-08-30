"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, GraduationCap } from "lucide-react"
import { useState, useEffect } from "react"

export function EducationSection() {
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

    const section = document.getElementById("education")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const education = [
    {
      degree: "Bachelor of Computer Science",
      school: "University of Waterloo",
      location: "Waterloo, ON",
      period: "2024 - 2029 (Expected)",
      details:
        "Focused on Software Engineering and Artificial Intelligence • Relevant Coursework: Data Structures, Algorithms, Software Design, Machine Learning",
      gpa: "BCS",
      achievements: ["Personal Project Development", "Hackathon Participation", "AI/ML Specialization"],
    },
    {
      degree: "Bachelor of Business Administration",
      school: "Wilfrid Laurier University",
      location: "Waterloo, ON",
      period: "2024 - 2029 (Expected)",
      details:
        "Double Degree Program • Relevant Coursework: Financial Accounting, Marketing, Operations Management, Business Strategy, Entrepreneurship",
      gpa: "BBA",
      achievements: ["Business Case Competition Participation", "Leadership Development", "President's Gold Scholarship ($20,000) 95%+ Average"],
    },
  ]

  return (
    <section id="education" className={`py-12 px-4 sm:px-6 lg:px-8 scroll-animate ${isVisible ? "in-view" : ""}`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Education</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            The combination of technical expertise with the business mindset would be a great asset to any company.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {education.map((edu, index) => (
            <Card key={index} className="hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl flex items-center gap-2 mb-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {edu.degree}
                    </CardTitle>
                    <div className="text-primary font-semibold text-lg">{edu.school}</div>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {edu.gpa}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {edu.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {edu.period}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-4">{edu.details}</p>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Key Achievements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {edu.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
