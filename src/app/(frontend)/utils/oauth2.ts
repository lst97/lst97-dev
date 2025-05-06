import { google } from 'googleapis'

// OAuth2 client setup
export const createOAuth2Client = () => {
  const OAuth2 = google.auth.OAuth2

  const oauth2Client = new OAuth2(
    process.env.GOOGLE_OAUTH2_CLIENT_ID,
    process.env.GOOGLE_OAUTH2_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH2_REDIRECT_URI,
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH2_REFRESH_TOKEN,
  })

  return oauth2Client
}

// Get a Gmail-authorized access token
export const getAccessToken = async () => {
  try {
    const oauth2Client = createOAuth2Client()
    const { token } = await oauth2Client.getAccessToken()
    return token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw new Error('Failed to get access token')
  }
}
