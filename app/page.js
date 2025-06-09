import React from "react";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Contect from "./_components/Contect";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const page = () => {
  return (
    // <div className='p-10 flex flex-col items-center justify-center' >
    //   <h1 className='red font-bold text-[22px]'>Welcome to AI Mock Interview</h1>
    // <a  ><h1><Button>Start</Button></h1></a>
    // </div>

    <div>
      <Head>
        <title>AI Mock Interview</title>
        <meta
          name="description"
          content="Ace your next interview with AI-powered mock interviews"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        {/* Header Section */}
        <header className="w-full sticky top-0 z-50 bg-white shadow-md transition-all duration-300">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6 py-4">
            <h1 className="text-3xl font-extrabold text-blue-600 hover:tracking-wide transition-all duration-300">
              AI Mock Interview
            </h1>

            <nav className="flex flex-col sm:flex-row items-center mt-4 md:mt-0 space-y-2 sm:space-y-0 sm:space-x-6">
              <a
                href="https://github.com/shreyaankapoor/Ai-mock-Interview.git"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-blue-600 transition-colors duration-300"
                title="View on GitHub"
              >
                <FaGithub className="w-7 h-7" />
              </a>

              <a
                href="#features"
                className="text-lg text-gray-700 hover:text-blue-600 font-medium transition duration-300"
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="text-lg text-gray-700 hover:text-blue-600 font-medium transition duration-300"
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="text-lg text-gray-700 hover:text-blue-600 font-medium transition duration-300"
              >
                Contact
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#1a1a40] via-[#3f2b96] to-[#a8c0ff] py-28 text-white px-6 md:px-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10 z-0" />

          <div className="relative z-10 max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Ace Your Next Interview
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
              Get personalized feedback and AI-powered mock interviews to boost
              your confidence and performance.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5">
              <a
                href="/dashboard"
                className="px-8 py-4 bg-white text-indigo-800 font-bold rounded-xl shadow-lg hover:bg-gray-100 transition duration-300"
              >
                Get Started
              </a>
              <a
                href="#features"
                className="px-8 py-4 border-2 border-white font-bold rounded-xl hover:bg-white hover:text-black transition duration-300"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Decorative glass card for style */}
          <div className="hidden md:block absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-[90%] max-w-5xl h-40 bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-2xl border border-white border-opacity-10"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-100 px-6 md:px-0">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              ✨ Powerful Features
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Get access to a suite of tools to help you nail your interviews
              with confidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
              {[
                {
                  title: "AI Mock Interviews",
                  desc: "Experience realistic interview scenarios with our advanced AI.",
                  icon: "🤖",
                },
                {
                  title: "Instant Feedback",
                  desc: "Get immediate insights and suggestions to improve your answers.",
                  icon: "⚡",
                },
                {
                  title: "Comprehensive Reports",
                  desc: "Visualize strengths & weaknesses to track your progress.",
                  icon: "📊",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl shadow-xl p-8 hover:-translate-y-1 hover:shadow-2xl transition-transform duration-300"
                >
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-indigo-700 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section
          id="testimonials"
          className="py-20 bg-gradient-to-br from-white to-blue-50 px-6 md:px-0"
        >
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-6">
              💬 What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Real feedback from real users.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "The AI mock interviews were incredibly helpful. I felt much more confident going into my real interview.",
                  name: "Shreyaan Kapoor",
                },
                {
                  quote:
                    "The feedback was spot on and helped me improve my answers. Highly recommend this service!",
                  name: "Muskan Gupta",
                },
                {
                  quote:
                    "The insights were incredibly helpful and allowed me to refine my responses. I would definitely recommend using this platform!",
                  name: "Shashank Chauhan",
                },
              ].map((testimony, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <p className="text-gray-700 italic mb-4">
                    “{testimony.quote}”
                  </p>
                  <h4 className="text-blue-600 font-semibold">
                    - {testimony.name}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-white px-6 md:px-0">
          <Contect />
        </section>
      </main>

      <footer className="py-8 bg-black text-white text-center">
        <p>© 2025 AI Mock Interview. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default page;
