export const COLORS = {
  primary: {
    DEFAULT: '#1e40af',
    hover: '#1d4ed8',
    light: '#3b82f6',
    dark: '#1e3a8a',
  },
  pay: {
    DEFAULT: '#0d9488',
    light: '#5eead4',
    dark: '#0f766e',
    muted: 'bg-teal-50 text-teal-700',
  },
  go: {
    DEFAULT: '#0891b2',
    light: '#67e8f9',
    dark: '#0e7490',
    muted: 'bg-cyan-50 text-cyan-700',
  },
  stays: {
    DEFAULT: '#4f46e5',
    light: '#a5b4fc',
    dark: '#4338ca',
    muted: 'bg-indigo-50 text-indigo-700',
  },
} as const

export const ADMIN_SCOPES = {
  SUPER: 'super',
  PAY: 'pay',
  GO: 'go',
  STAYS: 'stays',
} as const

export type AdminScope = (typeof ADMIN_SCOPES)[keyof typeof ADMIN_SCOPES]
