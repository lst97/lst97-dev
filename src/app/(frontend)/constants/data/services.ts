export interface ProjectProcessStep {
  title: string
  description: string
  icon: string
}

export interface ProjectIdea {
  title: string
  content: string
}

export interface ProjectColorPalette {
  lightTheme: string[]
  darkTheme: string[]
}

export interface ProjectTechnology {
  title: string
  icon: string
}

export interface ProjectData {
  id: number
  title: string
  bannerText: string
  description: string
  image: string
  logoUrl: string
  logoDescription: string
  process: ProjectProcessStep[]
  presentation: string
  background: string
  ideas: ProjectIdea[]
  client: string
  industry: string
  services: string[]
  websiteUrl: string
  technologies: ProjectTechnology[]
  colorPalette: ProjectColorPalette
  features: string[]
  liveUrl: string
  githubUrl: string
}

export const projectsData: ProjectData[] = [
  {
    id: 1,
    title: 'lst97.dev',
    bannerText:
      'A modern portfolio website built with love using Next.js and Payload CMS with retro gaming theme.',
    description:
      'Where explore the creation of a pixel art-themed personal site using Next.js and React. It showcases my journey in blending retro aesthetics with modern web development techniques.',
    image: '/lst97-personal-website-screenshot.png',
    logoUrl: '/construction-site-pixel-art-background.jpeg',
    logoDescription:
      "Unlike a traditional static icon, the logo is an interactive ASCII art generated using the DOOM font family. This choice aligns with the site's pixel art design, as DOOM is a renowned pixel art game.",
    process: [
      {
        title: 'Planning',
        description: 'Requirements gathering and design planning',
        icon: '📝',
      },
      {
        title: 'UI/UX Design',
        description: 'UI/UX design with pixel art elements',
        icon: '🎨',
      },
      {
        title: 'Project Structure',
        description:
          'Established project structure with Next.js and implemented core components like navigation and layout',
        icon: '🛠️',
      },
      {
        title: 'Content Integration',
        description:
          'Content sections for key areas and integrated dynamic content fetching where needed.',
        icon: '📦',
      },
      {
        title: 'Styling',
        description:
          'Applied a consistent visual style with a retro gaming theme and ensured responsiveness.',
        icon: '🎮',
      },
      {
        title: 'Data Handling',
        description: 'Implemented data fetching, caching, and handled loading/error states.',
        icon: '🔄',
      },
    ],
    presentation: 'The portfolio website presents a unique blend of...',
    background:
      'This project originated from a desire to build a modern website from scratch to experience firsthand the challenges and time commitment involved in web development.  I also wanted to explore integrating a headless CMS into a project.  Driven by a personal fondness for pixel art and the amber color palette, I envisioned a retro gaming theme, drawing particular inspiration from Pokémon, to give the site a unique and engaging aesthetic.',
    ideas: [
      {
        title: 'Retro Gaming Theme',
        content:
          'The website incorporates a retro gaming aesthetic, drawing inspiration from pixel art and games like Pokémon. This theme is evident in the color palette, design elements, and overall user experience.',
      },
      {
        title: 'Pixel Art Aesthetic',
        content:
          "The project emphasizes a pixel art style, which is a form of digital art created through the use of software, where images are edited on the pixel level. This is reflected in the site's design, including icons, backgrounds, and potentially animations.",
      },
      {
        title: 'Modern Web Design',
        content:
          'Despite the retro theme, the website utilizes modern web development practices and technologies, such as Next.js, React, and TypeScript, to create a responsive and dynamic user experience.',
      },
      {
        title: 'Interactive User Experience',
        content:
          'The site aims to provide an engaging and interactive experience for visitors. This could be achieved through animations, interactive elements, and a user-friendly interface.',
      },
      {
        title: 'Headless CMS Integration',
        content:
          'The project was an opportunity to explore integrating a headless CMS, suggesting a focus on content management and potentially dynamic content updates.',
      },
      {
        title: 'Personal Learning and Experimentation',
        content:
          'The project served as a personal challenge to build a modern website from scratch, highlighting a desire to learn about the challenges and time commitment involved in web development.',
      },
    ],
    client: 'Self-initiated',
    industry: 'Web Development',
    services: ['Web Design', 'Frontend Development', 'UI/UX Design'],
    websiteUrl: 'https://lst97.dev',
    technologies: [
      { title: 'React', icon: 'RiReactjsFill' },
      { title: 'Next.js', icon: 'RiNextjsFill' },
      { title: 'Vercel', icon: 'RiVercelFill' },
    ],
    colorPalette: {
      lightTheme: ['#fffbeb', '#fdf6e3', '#979489', '#2c2c2c', '#fdf3c9', '#f9e796', '#b28a2d'],
      darkTheme: ['#fdf6e3', '#3a3a3a', '#fff3c4', '#b58900', '#fff3c4', '#fff3c4', '#b28a2d'],
    },
    features: ['Responsive Design', 'Dark/Light Theme', 'Custom Animations', 'SEO Optimized'],
    liveUrl: 'https://lst97.dev',
    githubUrl: 'https://github.com/lst97/lst97.dev',
  },
]
