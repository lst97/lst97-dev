// Values and Passions

export interface ValueItem {
  id: string
  iconSrc: string
  iconAlt: string
  title: string
  description: string
}

export const valuesData: ValueItem[] = [
  {
    id: 'innovation',
    iconSrc: '/pixel-art-innovation.svg',
    iconAlt: 'Innovation',
    title: 'Innovation & Creativity',
    description:
      'Passionate about creating elegant solutions to complex problems. I thrive on pushing boundaries and thinking outside the box to develop innovative approaches that make a real difference.',
  },
  {
    id: 'growth',
    iconSrc: '/pixel-art-growth.svg',
    iconAlt: 'Growth',
    title: 'Continuous Growth',
    description:
      'Committed to learning and staying at the forefront of technology. Every day is an opportunity to expand my knowledge, master new skills, and embrace emerging technologies that shape our digital future.',
  },
  {
    id: 'collaboration',
    iconSrc: '/pixel-art-collaboration.svg',
    iconAlt: 'Collaboration',
    title: 'Collaborative Spirit',
    description:
      'Believe in the power of teamwork and knowledge sharing. Great achievements come from combining diverse perspectives, supporting each other, and building on our collective strengths to create something extraordinary.',
  },
]
