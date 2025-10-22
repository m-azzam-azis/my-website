import React from "react";
import { Linkedin, Github, Instagram, FileText } from "lucide-react";

export default function BentoPortfolio() {
  const name = "Azzam";
  const title = "Developer, Designer & Creator";
  const company = "Freelance";
  const email = "m.azzam.azis@gmail.com";

  const socials = [
    { name: "linkedin", icon: Linkedin, url: "#" },
    { name: "github", icon: Github, url: "#" },
    { name: "instagram", icon: Instagram, url: "#" },
  ];

  const stats = [
    { label: "Years Experience", value: "3+" },
    { label: "Projects", value: "25+" },
    { label: "Awards", value: "1" },
  ];

  const techStack = [
    "React",
    "Svelte",
    "Node.js",
    "Tailwind",
    "Figma",
    "Python",
    "and many more...",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-6 bg-transparent">
      <div className="w-full max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] space-y-3 md:space-y-4">
        {/* Top Row - Profile + Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* Profile Card */}
          <div className="bg-amber-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10">
            <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <img
                src="logo.png"
                alt="Profile"
                className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full object-cover"
              />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              {name}
              <br />
              is a {company}
              <br />
              {title}
            </h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-amber-50 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-center"
              >
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-700 mb-1 md:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm lg:text-base font-medium text-gray-700 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Row - Social + Resume */}
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {socials.map((social, i) => (
            <a
              key={i}
              href={social.url}
              className="bg-emerald-300 hover:bg-emerald-200 transition-colors rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-gray-900 font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2 md:gap-3"
            >
              <social.icon className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">{social.name}.</span>
            </a>
          ))}
          <a
            href="#resume"
            className="bg-gray-900 hover:bg-gray-800 transition-colors rounded-2xl md:rounded-3xl px-4 py-3 md:px-6 md:py-4 text-white font-medium text-sm md:text-base lg:text-lg flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 md:w-5 md:h-5 " />
            <span className="hidden sm:inline">Resume</span>
            <span className="sm:hidden">CV</span>
          </a>
        </div>

        {/* Bottom Row - Tech Stack + CTA */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
          {/* Tech Stack */}
          <div className="bg-amber-50 rounded-2xl md:rounded-3xl p-6 md:p-8 md:col-span-2">
            <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, i) => (
                <span
                  key={i}
                  className="bg-emerald-200 text-gray-900 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm lg:text-base font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="bg-emerald-700 rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center md:col-span-3">
            <h2 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 md:mb-6">
              Have a Project in Mind?
            </h2>
            <a
              href={`mailto:${email}`}
              className="bg-white hover:bg-gray-100 transition-colors text-emerald-700 px-6 py-3 md:px-10 md:py-4 rounded-full text-sm md:text-base lg:text-lg font-medium"
            >
              {email}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
