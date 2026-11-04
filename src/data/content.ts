// All the words on the site live here, so you can edit copy without touching components.
// Images go in /public/images and are referenced by filename (e.g. 'tracklist-1.png').

export type Project = {
  id: string;
  title: string;
  kicker: string;
  when: string;
  role: string;
  summary: string;
  tools: string[];
  award?: string; // shown as an ink stamp on the screenshot
  images: string[];
  imageNote: string;
  story: { heading: string; body?: string; bullets?: string[] }[];
  link?: { label: string; href: string };
};

export const profile = {
  first: 'Yara',
  last: 'Ibrahim',
  tagline: 'I pour my heart into designing and building products that are thoughtful and delightful to use.',
  caption: 'Information Science, Systems & Technology @ Cornell · class of 2029',
  roles: ['product design', 'UI/UX', 'product management'],
  email: 'yi98@cornell.edu',
  linkedin: 'https://www.linkedin.com/in/yaraibrahimm',
  github: 'https://github.com/yaraio',
  photo: 'headshot.webp', // in /public/images
  home: 'Southeast Michigan',
};

export const projects: Project[] = [
  {
    id: 'tracklist',
    title: 'Tracklist',
    kicker: 'iOS app · Cornell AppDev Hack Challenge',
    when: 'May 2026',
    role: 'Frontend design and UI implementation',
    summary:
      'A study app that turns your to-do list into a vinyl record. Every task is a track, a progress ring fills as you finish them, and clearing the list completes Side A.',
    tools: ['SwiftUI', 'Figma', 'Custom animation', 'CodeX'],
    award: 'Best Design',
    images: ['tracklist.webp'],
    imageNote: 'Tracklist screenshots',
    story: [
      {
        heading: 'The brief',
        body: 'Tracklist is a music-themed native iOS study app that gamifies task completion through a vinyl record progress ring. Every task you add becomes a track on the record — as you complete them, the ring fills. When all tasks are done, Side A is complete.',
      },
      {
        heading: 'What I did',
        bullets: [
          'Designed and built the full SwiftUI frontend, from task creation to the focus timer.',
          'Created the record-inspired visual system and the vinyl progress ring.',
          'Expandable music player UI on each task with a real time countdown timer and scrubbable progress bar',
          'Built custom animations, including a spinning disc on completion and a record-scratch haptic when a timer runs out.',
          'Worked with the backend team so live data stayed on-theme.',
        ],
      },
      { heading: 'How it landed', body: 'Won Best Design out of 8 teams in the AppDev Hack Challenge at Cornell Unviersity.' },
    ],
    link: { label: 'see the code', href: 'https://github.com/yaraio/hackchallenge-frontend' },
  },
  {
    id: 'flux',
    title: 'Flux',
    kicker: 'Web app · AmplifyHacks',
    when: 'May 2026',
    role: 'Co-developer, product & ML',
    summary:
      'A dashboard that lets businesses test a price change or a restock before it costs them money, with an AI forecaster that spots where profit is leaking.',
    tools: ['React', 'TypeScript','LSTM'],
    award: '3rd Place',
    images: ['flux.webp'],
    imageNote: 'Flux dashboard screenshot',
    story: [
      {
        heading: 'What I did',
        bullets: [
          'Co-built revenue, profit and margin views across various retail products.',
          'Built an LSTM forecaster on historical sales to project inventory and flag profit leaks, with plain-language next steps for owners.',
          'Shaped the what-if simulator: price and stock sliders with a live profit curve.',
          'Transparent feedback and confidence scales show the plausible risks of various business decisions before action.'
        ],
      },
      { heading: 'How it landed', body: 'Placed 3rd of 10 teams in the URMC x WICC 1st AmplifyHacks Hackathon at Cornell University.' },
    ],
    link: { label: 'see the code', href: 'https://github.com/yaraio/flux' },
  },
  {
    id: 'hackdearborn',
    title: 'Hack Dearborn 5',
    kicker: 'Brand & web · Hack Dearborn',
    when: 'Feb – Oct 2026',
    role: 'Development & marketing',
    summary:
      "The site, app, merch, and all things designing and implementing for Southeast Michigan's largest hackathon, built alongside the team that ran it.",
    tools: ['React', 'TypeScript', 'Figma', 'Canva'],
    images: ['hackdearborn.webp'],
    imageNote: 'site, app or merch photo',
    story: [
      {
        heading: 'What I did',
        bullets: [
          'Built site and app features in React and TypeScript.',
          'Designed web, app and merchandise assets in Figma and Canva.',
          'Connected the design and development teams so both shipped the same vision.',
        ],
      },
      {
        heading: 'How it landed',
        body: 'About 200 hackers came for the weekend, one of the biggest hackathons in Southeast Michigan, and more than 15 sponsors signed on, including Google, AMD, and Ford. Recieved immense positive feedback and recognition for the devotion to the theme, Conjure Reality, shown through the site and merch.',
      },
    ],
  },
];

export const experience = [
  {
    when: 'Apr – Oct 2026',
    org: 'Handshake AI',
    role: 'Training Fellow',
    body: 'Wrote and evaluated prompts testing AI image, video and audio generation, and reviewed 50 specialized prompts for accuracy and clarity.',
  },
  {
    when: 'Jan 2026 – now',
    org: 'Women of MENA Magazine',
    role: 'Secretary',
    body: 'Ran meetings, sponsor outreach and editorial planning for a Cornell publication, and help host events with nearly 10 sponsors and clubs.',
  },
  {
    when: 'Feb – Oct 2026',
    org: 'Hack Dearborn 5',
    role: 'Development & Marketing',
    body: 'Built the site and designed everything from app screens to merch for a 200-person hackathon.',
  },
];

export const awards = [
  { title: 'NCWIT Aspirations in Computing', detail: 'Michigan Affiliate Winner 2025 · National Honorable Mention 2024' },
  { title: 'Bridges Scholar', detail: 'Duffield Engineering, Office of Inclusive Excellence' },
  { title: 'BPA Web Design', detail: 'National qualifier · 6th in state, 2024' },
];

export const toolkit = ['Figma', 'Prototyping', 'User research', 'Product strategy', 'SwiftUI', 'React', 'TypeScript', 'Python', 'Java'];

export const letter = [
  'As a sophomore studying Information Science at Cornell, with a minor in Comparative Literature, I am passionate about how technology works and the impact it has on society.',
  'I love projects with a theme strong enough to shape every detail, with real, tangible, impact that can serve the user or consumer. Designing and implementing products and projects with grand purpose is at the heart of my work.'
];
export const letterTodo = 'As someone with grand experience in web and app development, I greatly value the impact that design has on the perception and utilization of a technology, a phenomenon that pulled me into design and which continues to fascinate me.';

// The typed index card in About.
export const indexCard = [
  'Info Science, Systems & Tech',
  'minor in Comparative Literature',
  'Cornell University, class of 2029',
  'from Southeast Michigan',
  'hobbies: gym, wellness & being creative',
];

// The postcard at the bottom of the page. Write it the way you'd actually say it.
export const postcard = {
  greeting: 'Hi there,',
  body: [
    "Thanks for reading all the way down here and visiting my mind palace. I'm currently looking for internships and research in product, design and UI/UX! Whether is a new opportunity, creative insight or conversation, or anything in between, feel free to write to me."
  ],
  postmark: { top: 'Ithaca · NY', bottom: '2026' },
};

export const certifications = [
  { name: 'IT Fundamentals Pro', issuer: 'TestOut', year: '2024' },
  { name: 'PC Pro', issuer: 'TestOut', year: '2025' },
  { name: 'IT Specialist: Device Configuration & Management', issuer: 'Certiport', year: '2024' },
  { name: 'IT Specialist: HTML & CSS', issuer: 'Certiport', year: '2024' },
  { name: 'IT Specialist: Java', issuer: 'Certiport', year: '2024' },
];
