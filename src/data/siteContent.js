export const services = [
  {
    code: '01',
    signal: 'BUILD',
    title: 'Custom Software',
    description: 'Purpose-built desktop, web, and internal tools shaped around the way you actually work.',
    detail: 'Product systems · Workflow tools · Interfaces',
    outputs: ['Desktop tools', 'Web applications', 'Internal systems'],
  },
  {
    code: '02',
    signal: 'AUTOMATE',
    title: 'AI & Automation',
    description: 'Practical automation that removes repetitive work, connects processes, and keeps people in control.',
    detail: 'Applied AI · Process automation · Tooling',
    outputs: ['Task automation', 'Applied AI tools', 'Connected workflows'],
  },
  {
    code: '03',
    signal: 'SIMULATE',
    title: 'FiveM / Game Systems',
    description: 'Server-ready gameplay systems and frameworks designed for clarity, performance, and maintainability.',
    detail: 'Gameplay systems · Frameworks · UI',
    outputs: ['Gameplay logic', 'Server systems', 'Player interfaces'],
  },
  {
    code: '04',
    signal: 'IDENTIFY',
    title: 'Branding & Digital Design',
    description: 'Identity, interface, and digital asset work that gives technical products a considered visual voice.',
    detail: 'Identity · UI systems · Digital assets',
    outputs: ['Visual identity', 'Interface systems', 'Digital assets'],
  },
  {
    code: '05',
    signal: 'HARDEN',
    title: 'Cybersecurity-Informed Development',
    description: 'Software built with a security engineering mindset from the first decision—not bolted on at the end.',
    detail: 'Secure patterns · Risk awareness · Resilience',
    outputs: ['Secure patterns', 'Risk-aware architecture', 'Resilient systems'],
  },
]

export const projects = [
  {
    name: 'LFOS',
    fullName: 'Livery Forge Operating System',
    description: 'A focused production environment for creating, organizing, and moving vehicle livery work from source assets to finished output.',
    status: 'In Development',
    mark: 'LF',
    meta: ['Workflow', 'Desktop Tooling'],
    variant: 'forge',
    size: 'large',
    systemId: 'GFS-LFOS-01',
    brief: 'LFOS brings livery production into one dedicated operating environment, replacing scattered steps with a clear, repeatable flow.',
    focus: ['Asset organization', 'Production workflow', 'Output management'],
    // Add image: '/projects/lfos.jpg' to replace the generated project artwork.
  },
  {
    name: 'WireFactory',
    description: 'Internal tooling that streamlines the repetitive parts of preparing vehicle wireframes and production-ready template assets.',
    status: 'Internal Tech',
    mark: 'WF',
    meta: ['Pipeline', 'Automation'],
    variant: 'wire',
    size: 'medium',
    systemId: 'GFS-WF-02',
    brief: 'WireFactory concentrates a specialized preparation pipeline into internal tooling built for repeatable production work.',
    focus: ['Wireframe preparation', 'Template assets', 'Pipeline automation'],
    // Add image: '/projects/wirefactory.jpg' to replace the generated project artwork.
  },
  {
    name: 'REV Framework',
    description: 'A modular foundation for connected roleplay server systems, built around shared conventions and reusable services.',
    status: 'Prototype',
    mark: 'REV',
    meta: ['Framework', 'FiveM'],
    variant: 'rev',
    size: 'third',
    systemId: 'GFS-REV-03',
    brief: 'REV explores a shared technical foundation for roleplay systems that need to remain understandable as they grow.',
    focus: ['Shared conventions', 'Reusable services', 'Modular architecture'],
    // Add image: '/projects/rev.jpg' to replace the generated project artwork.
  },
  {
    name: 'LSC Dealership Systems',
    description: 'Dealership tooling for inventory browsing, vehicle purchasing, and a clear player-facing sales flow.',
    status: 'Live Server Tool',
    mark: 'LSC',
    meta: ['Commerce', 'Game System'],
    variant: 'lsc',
    size: 'third',
    systemId: 'GFS-LSC-04',
    brief: 'A connected dealership experience covering the path from viewing available inventory to completing a player purchase.',
    focus: ['Inventory browsing', 'Purchase flow', 'Player experience'],
    // Add image: '/projects/lsc.jpg' to replace the generated project artwork.
  },
  {
    name: 'Drag Strip System',
    description: 'Race staging, timing, and result handling designed for consistent server logic and immediate player feedback.',
    status: 'Live Server Tool',
    mark: '1320',
    meta: ['Racing', 'Game System'],
    variant: 'drag',
    size: 'third',
    systemId: 'GFS-DRG-05',
    brief: 'A focused racing system that coordinates the sequence from staging through timing and results.',
    focus: ['Race staging', 'Timing logic', 'Result feedback'],
    // Add image: '/projects/drag-strip.jpg' to replace the generated project artwork.
  },
  {
    name: 'Custom Logos & Chains',
    description: 'Identity and custom digital asset work that carries one visual language across brands, servers, and communities.',
    status: 'Selected Work',
    mark: 'G/S',
    meta: ['Identity', 'Digital Assets'],
    variant: 'identity',
    size: 'wide',
    systemId: 'GFS-ID-06',
    brief: 'Identity work for digital-first brands and communities, developed to stay coherent across varied touchpoints and assets.',
    focus: ['Brand identity', 'Custom assets', 'Visual consistency'],
    // Add image: '/projects/identity-work.jpg' to replace the generated project artwork.
  },
]

// Replace these placeholder anchors with real email, Discord, and portfolio URLs.
export const contactLinks = [
  { label: 'Email channel', href: '#contact', note: 'Replace with your email' },
  { label: 'Discord channel', href: '#contact', note: 'Replace with your invite' },
  { label: 'View project modules', href: '#work', note: 'Review selected work' },
]
