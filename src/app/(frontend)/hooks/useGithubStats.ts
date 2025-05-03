import { useQuery } from '@tanstack/react-query'

interface GithubStatsOptions {
  username?: string
  theme?: string
  showIcons?: boolean
  includeAllCommits?: boolean
  countPrivate?: boolean
  hideRank?: boolean
  hideBorder?: boolean
  lineHeight?: number
  titleColor?: string
  textColor?: string
  bgColor?: string
  iconColor?: string
  cardWidth?: number
  showGithubLogo?: boolean
}

/**
 * Hook to fetch GitHub stats using the GitHub README Stats API
 */
export function useGithubStats(options: GithubStatsOptions = {}) {
  const {
    username = 'lst97',
    theme = 'custom', // Default to custom theme now
    showIcons = true,
    includeAllCommits = true,
    countPrivate = true,
    hideRank = false,
    hideBorder = false,
    lineHeight,
    titleColor = 'b58900', // Solarized yellow
    textColor = '2c2c2c', // Dark text
    bgColor = 'fff7e0', // Light background
    iconColor = 'b58900', // Solarized yellow
    cardWidth,
    showGithubLogo = true,
  } = options

  return useQuery({
    queryKey: [
      'github-stats',
      username,
      theme,
      showIcons,
      includeAllCommits,
      countPrivate,
      hideRank,
      hideBorder,
      lineHeight,
      titleColor,
      textColor,
      bgColor,
      iconColor,
      cardWidth,
      showGithubLogo,
    ],
    queryFn: async () => {
      // Build the query parameters
      const params = new URLSearchParams()
      params.append('username', username)

      // Apply theme or custom colors
      if (theme && theme !== 'custom') {
        params.append('theme', theme)
      }

      // If we're using a custom theme, always apply these colors
      if (theme === 'custom') {
        if (titleColor) params.append('title_color', titleColor)
        if (textColor) params.append('text_color', textColor)
        if (bgColor) params.append('bg_color', bgColor)
        if (iconColor) params.append('icon_color', iconColor)
      }

      if (showIcons) params.append('show_icons', 'true')
      if (includeAllCommits) params.append('include_all_commits', 'true')
      if (countPrivate) params.append('count_private', 'true')
      if (hideRank) params.append('hide_rank', 'true')
      if (hideBorder) params.append('hide_border', 'true')
      if (lineHeight) params.append('line_height', lineHeight.toString())
      if (cardWidth) params.append('card_width', cardWidth.toString())

      // GitHub Logo option
      if (showGithubLogo) params.append('show_owner', 'true')

      // Call our API endpoint that proxies to github-readme-stats
      const url = `/api/github?${params.toString()}`

      return { url }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  })
}

/**
 * Hook to fetch GitHub top languages using the GitHub README Stats API
 */
export function useGithubTopLanguages(
  options: Omit<
    GithubStatsOptions,
    'showIcons' | 'includeAllCommits' | 'countPrivate' | 'hideRank' | 'showGithubLogo'
  > = {},
) {
  const {
    username = 'lst97',
    theme = 'custom',
    hideBorder = false,
    titleColor = 'b58900',
    textColor = '2c2c2c',
    bgColor = 'fff7e0',
  } = options

  return useQuery({
    queryKey: ['github-top-langs', username, theme, hideBorder, titleColor, textColor, bgColor],
    queryFn: async () => {
      // Build the query parameters
      const params = new URLSearchParams()
      params.append('username', username)

      // Apply theme or custom colors
      if (theme && theme !== 'custom') {
        params.append('theme', theme)
      } else {
        if (titleColor) params.append('title_color', titleColor)
        if (textColor) params.append('text_color', textColor)
        if (bgColor) params.append('bg_color', bgColor)
      }

      if (hideBorder) params.append('hide_border', 'true')
      params.append('layout', 'compact') // Use compact layout for better space usage

      // Call our API endpoint that proxies to github-readme-stats
      const url = `/api/github/top-langs?${params.toString()}`

      return { url }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  })
}
