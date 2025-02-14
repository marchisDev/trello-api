import { env } from '~/config/environment'

export const WHITELIST_DOMAINS = [
  'https://trello-web-steel.vercel.app'
  // 'http://localhost:5173'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT