import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'border-orange-500',
    'border-yellow-500',
    'border-gray-500',
    'bg-orange-500',
    'bg-yellow-500', 
    'bg-gray-500',
    'mt-8',
    'mt-12',
    'mt-16',
    'w-[50%]',
    'w-[30%]',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
