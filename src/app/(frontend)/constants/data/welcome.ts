import { routes } from '@/frontend/constants/routes'

export const introText =
  "Hi everyone! Nelson here, hailing from the vibrant city of Hong Kong. Armed with a Computer Science degree from Deakin University (still figuring out how to wield it properly!), I'm on the hunt for thrilling software engineering escapades. In the meantime, I'm whipping up code concoctions and soaking up new knowledge like a sponge. 🥔"

export interface WelcomeParagraph {
  title: string
  content: (string | { text: string; href: string })[][]
}

export const welcomeParagraphs: WelcomeParagraph[] = [
  {
    title: 'About this site',
    content: [
      [
        'This site is built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4. It is hosted on Vercel with PayloadCMS as a headless CMS. Features include:',
      ],
      ['☆ A ', { text: 'Projects', href: `${routes.projects}` }, ' portfolio showcasing my work'],
      ['☆ ', { text: 'Services', href: `${routes.services}` }, ' that I offer'],
      ['☆ Useful ', { text: 'Resources', href: `${routes.resources}` }, ' for developers'],
      ['☆ Code statistics via API integration'],
      ['☆ More details ', { text: 'About Me', href: `${routes.about}` }],
    ],
  },
  {
    title: 'About me',
    content: [
      [
        "I'm a junior software developer with a strong foundation in multiple programming languages and technologies. My current focus is on web development with Next.js, React, and TypeScript, along with backend experience in C# and various database technologies.",
      ],
      [
        'My GitHub profile (',
        { text: 'lst97', href: 'https://github.com/lst97' },
        ") showcases my various projects including SplitTab, a web app for expense management, and several libraries for common services. When not coding, I'm working as a cabinet maker and previously had experiences as a kitchen hand and automotive mechanic.",
      ],
      [
        'Check out my ',
        { text: 'About page', href: `${routes.about}` },
        ' for my detailed timeline, skill set, and live code statistics from WakaTime.',
      ],
    ],
  },
]
