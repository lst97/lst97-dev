import { CVData } from '@/frontend/models/CV'

export const cvData: CVData = {
  pages: [
    {
      header: {
        name: 'SIO TOU (NELSON) LAI',
        jobTitle: 'JUNIOR DEVELOPER',
        location: 'MELBOURNE, VIC 3168, AUSTRALIA',
        phone: '+61 0478 561 361',
        email: 'laisiotou1997@gmail.com',
        imageUrl: '/me-pixel-art.png',
      },
      leftSections: [
        {
          id: '2',
          title: 'LINKS',
          items: [
            { id: '1', text: 'GitHub', link: 'https://github.com' },
            { id: '2', text: 'Personal Website', link: 'https://example.com' },
            { id: '3', text: 'LinkedIn', link: 'https://linkedin.com' },
          ],
        },
        {
          id: '3',
          title: 'LANGs',
          items: [
            { id: '1', text: 'Cantonese (Native)', progress: 95 },
            { id: '2', text: 'English', progress: 60 },
            { id: '3', text: 'Mandarin', progress: 80 },
          ],
        },
        {
          id: '4',
          title: 'SKILLS',
          items: [
            { id: '1', text: 'TypeScript' },
            { id: '2', text: 'NextJS' },
            { id: '3', text: 'NodeJS' },
            { id: '4', text: '.NET' },
            { id: '5', text: 'Python' },
            { id: '6', text: 'SQLite' },
            { id: '7', text: 'Figma' },
            { id: '8', text: 'Firebase' },
          ],
        },
      ],
      rightSections: [
        {
          id: '1',
          title: 'PROFILE',
          icon: '👨‍💻',
          description:
            'Enthusiastic junior developer with hands-on experience building cross-platform solutions for web, mobile, and backend technologies. Able to effectively self-manage during independent projects, as well as collaborate in a team setting.',
          items: [],
          action: {
            title: 'Download Resume',
            link: '/resume.pdf',
          },
        },
        {
          id: '2',
          title: 'PROJECTS',
          icon: '🚀',
          items: [
            {
              id: '1',
              title: 'PEViewer',
              startDate: 'January 2019',
              endDate: 'July 2019',
              icon: '🔍',
              bulletPoints: [
                { id: '1', text: 'Software architecture' },
                {
                  id: '2',
                  text: 'Developed PE structure explorer components in C',
                },
                {
                  id: '3',
                  text: 'Gained understanding of execution principles, storage, memory',
                },
              ],
              action: {
                title: 'GitHub',
                link: 'https://github.com/lst97/ASSEMBLY-WIN32_practise',
              },
            },
            {
              id: '2',
              title: 'Software Architecture',
              startDate: 'September 2020',
              endDate: 'February 2021',
              icon: '🤖',
              bulletPoints: [
                {
                  id: '1',
                  text: 'Core:  Understanding data representation, memory organization.',
                },
                {
                  id: '2',
                  text: 'Essentials:  Grasping functions, parameters, arrays, structures, and pointers.',
                },
                {
                  id: '3',
                  text: 'OOP: Focus on classes, objects, inheritance (virtual functions), polymorphism, and templates in C++.',
                },
                {
                  id: '4',
                  text: 'Advanced C++: Dynamic memory (new/delete, std::vector), operator overloading, and libraries (DLLs/SOs).',
                },
                {
                  id: '5',
                  text: 'System & Project: Includes Win32 API, PE file structure, and a simple 8-bit Minecraft computer.',
                },
              ],
              action: {
                title: 'My notes',
                link: 'https://drive.google.com/open?id=1v3jBBBdN438benK7urPRiM-0qTR9Sgoa&usp=drive_fs',
              },
            },
          ],
        },
      ],
    },
    {
      header: {
        name: 'SIO TOU (NELSON) LAI',
        jobTitle: 'JUNIOR DEVELOPER',
        location: 'MELBOURNE, 3168, AUSTRALIA',
        phone: '+61 0478 561 361',
        email: 'laisiotou1997@gmail.com',
        imageUrl: '/me-pixel-art.png',
      },
      leftSections: [
        {
          id: '5',
          title: 'EDUCATION',
          items: [
            {
              id: '1',
              text: 'Box Hill Institute of TAFE',
            },
            {
              id: '2',
              text: 'Diploma of Automotive Technology',
            },
            {
              id: '3',
              text: '(2016 - 2019)',
            },
            {
              id: '4',
              text: '', // placeholder
            },
            {
              id: '5',
              text: 'Deakin University',
            },
            {
              id: '6',
              text: 'Bachelor of Computer Science',
            },
            {
              id: '7',
              text: '(2020 - 2023)',
            },
          ],
        },
        {
          id: '6',
          title: 'EMPLOYMENT',
          items: [
            {
              id: '1',
              text: 'Automotive Mechanic',
            },
            {
              id: '2',
              text: 'Internship',
            },
            {
              id: '3',
              text: 'Kmart Auto Repair',
            },
            {
              id: '4',
              text: '(2018 - 2019)',
            },
            {
              id: '5',
              text: '', // placeholder
            },
            {
              id: '6',
              text: 'Kitchen Hand',
            },
            {
              id: '7',
              text: 'Part-time',
            },
            {
              id: '8',
              text: "ST Zita's Cafe",
            },
            {
              id: '9',
              text: '(2021 - 2022)',
            },
            {
              id: '10',
              text: '', // placeholder
            },
            {
              id: '11',
              text: 'Cabinet Maker',
            },
            {
              id: '12',
              text: 'Part-time',
            },
            {
              id: '13',
              text: 'Cabinet Makers',
            },
            {
              id: '14',
              text: "Yoon's Cabinetry",
            },
            {
              id: '15',
              text: '(2024 - Present)',
            },
          ],
        },
      ],
      rightSections: [
        {
          id: '3',
          title: 'PROJECTS',
          icon: '🚀',
          items: [
            {
              id: '1',
              title: 'BLELock',
              startDate: 'June 2022',
              endDate: 'July 2022',
              icon: '🔍',
              bulletPoints: [
                {
                  id: '1',
                  text: 'Wireless Control: The system allows to lock or unlock a door wirelessly using a mobile app via Bluetooth Low Energy (BLE).',
                },
                {
                  id: '2',
                  text: 'Particle Argon: The brains of the operation is the Particle Argon, a small and powerful microcontroller with built-in BLE and Wi-Fi capabilities.',
                },
                {
                  id: '3',
                  text: 'Mobile App: A custom Android app provides the user interface for interacting with the lock.',
                },
                {
                  id: '4',
                  text: 'Security: The project employs security measures to prevent unauthorized access using TOTP.',
                },
                {
                  id: '5',
                  text: "Physical Lock Integration: The Argon would need to be connected to a physical locking mechanism to control the door's state.",
                },
              ],
              action: {
                title: 'GitHub',
                link: 'https://github.com/lst97/SIT210-Remote-Lock-Project',
              },
            },
            {
              id: '2',
              title: 'SplitTab',
              startDate: 'October 2024',
              endDate: 'Present',
              icon: '🔍',
              bulletPoints: [
                {
                  id: '1',
                  text: 'Expense Tracking: Easily input and categorize expenses, assign them to individuals, and track who paid.',
                },
                {
                  id: '2',
                  text: 'Bill Splitting: Automatically calculate how much each person owes or is owed, with options for equal or custom splits.',
                },
                {
                  id: '3',
                  text: 'Settlement Management: Create settlement requests, track their status, and simplify debt settlement with suggested transactions.',
                },
                {
                  id: '4',
                  text: 'Household/Group Management: Create or join households, manage members, and control privacy settings.',
                },
                {
                  id: '5',
                  text: 'Transaction History: View and export a history of all expenses and settlements.',
                },
                {
                  id: '6',
                  text: 'Notifications and Reminders: Receive alerts for upcoming settlements, new expenses, and payment reminders.',
                },
              ],
              action: {
                title: 'Available on request',
                link: 'https://github.com/lst97/split-tab-client',
              },
            },
          ],
        },
      ],
    },
  ],
}
