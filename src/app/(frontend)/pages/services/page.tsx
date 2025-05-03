'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Navbar from '@/frontend/components/main/Navbar'
import { ScrollProvider } from '@/frontend/contexts/ScrollContext'
import {
  FaCode,
  FaReact,
  FaNodeJs,
  FaDatabase,
  FaComments,
  FaDollarSign,
  FaPuzzlePiece,
  FaUserClock,
  FaHeart,
} from 'react-icons/fa'
import { SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import PixelArtAnimation from '@/app/(frontend)/components/animation/PixelArtAnimation'
import {
  ProjectShowcaseDialog,
  BannerSection,
  DescriptionSection,
  BackgroundSection,
  IdeasSection,
  LogoSection,
  ColorPaletteSection,
  ProcessSection,
  TechnologiesSection,
  PresentationSection,
  ProjectDetailsSection,
  VisitWebsiteButton,
} from '@/app/(frontend)/components/services/project-dialog'
import { projectsData } from '@/app/(frontend)/constants/data/services'
import { ContactForm } from '@/app/(frontend)/components/services/forms/ContactForm'
import { httpClient } from '@/frontend/api/Api'
import { ContactSubmissionForm } from '@/app/(frontend)/components/services/forms/ContactForm'
import Message from '@/frontend/components/common/Message'
import { Footer } from '@/frontend/components/footer/Footer'

// Import our extracted components
import {
  TypingAnimation,
  HeroSection,
  ServicesSection,
  FreelancerSection,
  TechSection,
  ShowcaseSection,
  CareersSection,
  ContactSection,
  CTASection,
  Service,
  FreelancerAdvantage,
  Technology,
} from '@/app/(frontend)/components/services'

const services: Service[] = [
  {
    id: 1,
    title: 'Frontend Development',
    icon: <FaCode className="text-accent-color text-2xl z-10" />,
    description:
      'Modern and responsive web applications built with React and Next.js. Clean, maintainable code with a focus on user experience.',
    features: ['Responsive Design', 'Modern UI/UX', 'SEO Optimization', 'Performance Focus'],
  },
  {
    id: 2,
    title: 'Full-Stack Solutions',
    icon: <FaNodeJs className="text-accent-color text-2xl z-10" />,
    description:
      'End-to-end web applications with secure backend integration. RESTful APIs and database management included.',
    features: ['API Development', 'Database Design', 'Authentication', 'Cloud Deployment'],
  },

  {
    id: 3,
    title: 'Why not DIY?',
    icon: <FaPuzzlePiece className="text-accent-color text-2xl z-10 " />,
    description:
      "Your website is your brand's growth engine, not a digital afterthought. DIY tools box like Wix and WordPress trap you in with generic templates and limited capabilities. A professional developer crafts a custom, powerful website that captivates audiences, drives conversions, and scales with your ambitions. \n\n We leverage advanced tech and bespoke design to create unforgettable sites that are more than just functional. \n\n Stop settling for basic – invest in expertise and make your website your competitive edge.",
    features: [
      'Tailored Customization',
      'Technical Expertise & Advanced Functionality',
      'Future-Proof Scalability',
      'Brand Integrity',
    ],
  },
]

const technologies: Technology[] = [
  {
    id: 1,
    name: 'React',
    icon: <FaReact className="text-accent-color text-4xl transition-all duration-300 z-10" />,
  },
  {
    id: 2,
    name: 'Next.js',
    icon: <SiNextdotjs className="text-accent-color text-4xl transition-all duration-300 z-10" />,
  },
  {
    id: 3,
    name: 'TypeScript',
    icon: <SiTypescript className="text-accent-color text-4xl transition-all duration-300 z-10" />,
  },
  {
    id: 4,
    name: 'Node.js',
    icon: <FaNodeJs className="text-accent-color text-4xl transition-all duration-300 z-10" />,
  },
  {
    id: 5,
    name: 'Tailwind CSS',
    icon: <SiTailwindcss className="text-accent-color text-4xl transition-all duration-300 z-10" />,
  },
  {
    id: 6,
    name: 'Firebase',
    icon: <FaDatabase className="text-accent-color text-4xl transition-all duration-300 z-10" />,
  },
]

const referralSources = [
  'LinkedIn',
  'GitHub',
  'Search Engine',
  'Personal Referral',
  'Professional Network',
  'Uber',
  'Other',
]

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const freelancerAdvantages: FreelancerAdvantage[] = [
  {
    icon: <FaComments />,
    title: 'Direct Communication',
    description: (
      <>
        You'll work <span className="pixel-underline">directly with me</span>, eliminating the
        potential for miscommunication and ensuring your vision is{' '}
        <span className="pixel-underline">accurately translated</span> into reality.
      </>
    ),
    bgClass: 'bg-amber-100',
  },
  {
    icon: <FaDollarSign />,
    title: 'Cost-Effective Solutions',
    description: (
      <>
        With <span className="pixel-underline">lower overhead</span> than larger agencies, I can
        offer <span className="pixel-underline">highly competitive rates</span> without compromising
        on quality.
      </>
    ),
  },
  {
    icon: <FaPuzzlePiece />,
    title: 'Flexibility and Customization',
    description: (
      <>
        I can <span className="pixel-underline">adapt to your specific needs</span> and tailor my
        approach to create a <span className="pixel-underline">truly unique solution</span> that
        aligns perfectly with your goals.
      </>
    ),
  },
  {
    icon: <FaUserClock />,
    title: 'Personalized Attention',
    description: (
      <>
        Your project will receive my{' '}
        <span className="pixel-underline">full focus and dedication</span>, ensuring a{' '}
        <span className="pixel-underline">high level of care</span> and attention to detail.
      </>
    ),
  },
  {
    icon: <FaHeart />,
    title: 'Passion and Commitment',
    description: (
      <>
        I'm <span className="pixel-underline">passionate about web development</span> and committed
        to delivering <span className="pixel-underline">exceptional results</span> for every client.
      </>
    ),
  },
]

const Services = () => {
  const [selectedProject, setSelectedProject] = useState<(typeof projectsData)[0] | null>(null)
  const [formData, setFormData] = useState<ContactSubmissionForm>({
    name: '',
    email: '',
    budget: '',
    content: '',
    source: '',
  })
  const [formErrors, setFormErrors] = useState<{
    [key in keyof ContactSubmissionForm]?: string
  }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isProjectShowcaseOpen, setIsProjectShowcaseOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string>('')

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const titleText = 'Building modern web solutions with passion and precision'

  const handleReCaptchaVerify = useCallback((token: string) => {
    setRecaptchaToken(token)
  }, [])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recaptchaToken) {
      setMessage({
        type: 'error',
        text: 'Please complete the reCAPTCHA verification',
      })
      return
    }

    const errors: { [key in keyof ContactSubmissionForm]?: string } = {}
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    if (!formData.content.trim()) {
      errors.content = 'Message is required'
    }
    if (!formData.budget.trim()) {
      errors.budget = 'Budget is required'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({}) // Clear previous errors
    setIsSending(true) // Start loading animation
    setIsSuccess(false) // Reset success state

    try {
      const response = await httpClient.cms_authenticated.post('/contact-submissions', {
        data: {
          ...formData,
          recaptchaToken,
        },
      })

      setIsSuccess(true) // Show success message
      setFormData({
        name: '',
        email: '',
        budget: '',
        content: '',
        source: '',
      })
      setRecaptchaToken('')
      setMessage({ type: 'success', text: 'Message sent successfully!' })
    } catch (error: any) {
      console.error('Error:', error)

      // Check for Strapi validation error structure
      if (
        error.response &&
        error.response.data &&
        error.response.data.error &&
        error.response.data.error.details &&
        error.response.data.error.details.errors
      ) {
        const strapiErrors = error.response.data.error.details.errors
        const updatedFormErrors = { ...formErrors }

        strapiErrors.forEach((err: any) => {
          // Assuming Strapi error path matches form field names
          if (err.path && err.path.length > 0 && err.message) {
            const fieldName = err.path[0]
            if (fieldName in updatedFormErrors) {
              // Append to existing error message for the field
              updatedFormErrors[fieldName as keyof ContactSubmissionForm] += `, ${err.message}`
            } else {
              updatedFormErrors[fieldName as keyof ContactSubmissionForm] = err.message
            }
          }
        })

        setFormErrors(updatedFormErrors)
        setMessage({ type: 'error', text: 'Failed to send message' })
      } else {
        // Handle other types of errors
        setMessage({ type: 'error', text: 'Failed to send message' })
      }
    } finally {
      setIsSending(false) // Stop loading animation
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <ScrollProvider>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div className="fixed inset-0 w-full h-screen">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut', delay: 1 }}
          >
            <PixelArtAnimation
              opacity={0.3}
              sizeRange={[50, 100]}
              numSquares={20}
              interactionDistance={200}
              colors={['#ffe580']}
              className="w-full h-screen"
            />
          </motion.div>
        </div>
        <div className="relative w-full min-h-screen flex flex-col bg-transparent">
          <Navbar className="w-full" />
          <main className="relative flex-grow w-full max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 py-4 sm:py-6 md:py-8 mt-[100px] sm:mt-[120px] md:mt-[140px] lg:mt-[180px] bg-transparent">
            <HeroSection titleText={titleText} TypingAnimation={TypingAnimation} />

            <div className="w-full flex justify-center items-center mb-16 min-h-screen relative">
              <motion.div initial="initial" animate="animate" variants={floatingAnimation}>
                <Image
                  src="/question-mark-pixel-art.svg"
                  alt="Question Mark Pixel Art"
                  width={768}
                  height={768}
                  className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
                />
              </motion.div>
            </div>
            <ServicesSection services={services} />

            <FreelancerSection freelancerAdvantages={freelancerAdvantages} />
            <div className="w-full flex justify-center items-center mb-16 min-h-[300px] relative">
              <motion.div initial="initial" animate="animate" variants={floatingAnimation}>
                <Image
                  src="/screwdriver-pixel-art.svg"
                  alt="Screwdriver Pixel Art"
                  width={1024}
                  height={1024}
                  className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
                />
              </motion.div>
            </div>
            <TechSection technologies={technologies} />

            <ShowcaseSection
              projectsData={projectsData}
              setIsProjectShowcaseOpen={setIsProjectShowcaseOpen}
              setSelectedProject={setSelectedProject}
            />
            <div className="w-full flex justify-center items-center mb-16 min-h-[300px] relative">
              <motion.div initial="initial" animate="animate" variants={floatingAnimation}>
                <Image
                  src="/briefcase-pixel-art.svg"
                  alt="Briefcase Pixel Art"
                  width={768}
                  height={768}
                  className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
                />
              </motion.div>
            </div>
            <CareersSection />
            <div className="w-full flex justify-center items-center mb-16 min-h-[300px] relative">
              <motion.div initial="initial" animate="animate" variants={floatingAnimation}>
                <Image
                  src="/touch-pixel-art.svg"
                  alt="Touch Pixel Art"
                  width={1024}
                  height={1024}
                  className="flex justify-center items-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-[filter] duration-300 will-change-transform hover:drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
                />
              </motion.div>
            </div>
            <ContactSection>
              <AnimatePresence>
                {message && (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Message type={message.type as 'success' | 'error'} message={message.text} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="max-w-6xl mx-auto px-8">
                <ContactForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleFormSubmit={handleFormSubmit}
                  referralSources={referralSources}
                  formErrors={formErrors}
                  isSuccess={isSuccess}
                  isSending={isSending}
                  onVerifyReCaptcha={handleReCaptchaVerify}
                />
              </div>
            </ContactSection>

            <CTASection />
          </main>

          <Footer />

          {selectedProject && (
            <ProjectShowcaseDialog
              open={isProjectShowcaseOpen}
              onClose={() => {
                setIsProjectShowcaseOpen(false)
                setSelectedProject(null)
              }}
              title={selectedProject.title}
            >
              <BannerSection bannerText={selectedProject.bannerText} />
              <DescriptionSection description={selectedProject.description} />
              <BackgroundSection background={selectedProject.background} />
              <IdeasSection ideas={selectedProject.ideas} />
              <LogoSection logoDescription={selectedProject.logoDescription} />
              <ColorPaletteSection lightTheme={selectedProject.colorPalette.lightTheme} />
              <ProcessSection process={selectedProject.process} />
              <TechnologiesSection technologies={selectedProject.technologies} />
              <PresentationSection presentation={selectedProject.presentation} />
              <ProjectDetailsSection
                client={selectedProject.client}
                industry={selectedProject.industry}
                services={selectedProject.services}
              />
              <VisitWebsiteButton websiteUrl={selectedProject.websiteUrl} />
            </ProjectShowcaseDialog>
          )}
        </div>
      </motion.div>
    </ScrollProvider>
  )
}

export default Services
