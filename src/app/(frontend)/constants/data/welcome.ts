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
        'This site is built with Next.js, TypeScript, and Tailwind CSS. It is hosted on Vercel and the content is managed by a ',
        { text: 'headless CMS', href: 'https://github.com/lst97/simple-cms-frontend/tree/dev' },
        '. This site contains:',
      ],
      ['☆ A portfolio of some ', { text: 'Projects', href: '/pages/projects' }],
      ['☆ Some ', { text: 'Resources', href: '/pages/resources' }, ' that I found useful'],
      ['☆ More thing described ', { text: 'About Me', href: '/pages/resources' }],
    ],
  },
  {
    title: 'About me',
    content: [
      [
        'I\'m a junior programmer expanding my skillset through a private C# and MySQL project called "Conndy." Concurrently, I\'m building "Split Tab," an expense management web app using Deno, Next.js, and SQLite.',
      ],
      [
        "I'm also actively pursuing new job opportunities where I can further contribute and grow. GitHub: ",
        { text: 'lst97', href: 'https://github.com/lst97' },
        '. In the mean time, I am doing Uber Eats deliveries for keeping my body in shape.',
      ],
    ],
  },
]
