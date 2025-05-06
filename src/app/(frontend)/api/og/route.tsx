import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get query parameters with fallbacks
    const title = searchParams.get('title') || 'LST97'
    const description =
      searchParams.get('description') || 'Full-Stack Developer & Software Engineer'
    const type = searchParams.get('type') || 'website'

    // Font loading
    const pixelFont = await fetch(
      new URL('public/fonts/PressStart2P-Regular.ttf', import.meta.url),
    ).then((res) => res.arrayBuffer())

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: '#fdf6e3',
            padding: '40px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background grid pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `
                linear-gradient(to right, #2c2c2c10 1px, transparent 1px), 
                linear-gradient(to bottom, #2c2c2c10 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
              zIndex: 0,
            }}
          />

          {/* Border */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              bottom: 20,
              border: '8px solid #2c2c2c',
              boxShadow: '8px 8px 0 #00000033',
              zIndex: 1,
            }}
          />

          {/* Content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 80px',
              textAlign: 'center',
              zIndex: 2,
              width: '100%',
              height: '100%',
            }}
          >
            {/* Logo/Title */}
            <div
              style={{
                fontSize: 72,
                fontFamily: '"Press Start 2P"',
                color: '#2c2c2c',
                marginBottom: 40,
                letterSpacing: '-2px',
                lineHeight: 1.2,
                textShadow: '4px 4px 0 #b5890033',
              }}
            >
              {title}
            </div>

            {/* Description */}
            <div
              style={{
                fontSize: 28,
                fontFamily: '"Press Start 2P"',
                color: '#2c2c2c',
                opacity: 0.9,
                marginBottom: 40,
                lineHeight: 1.4,
                maxWidth: '80%',
              }}
            >
              {description}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 40,
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontFamily: '"Press Start 2P"',
                  color: '#b58900',
                  margin: '0 20px',
                }}
              >
                {type === 'article' ? 'BLOG POST' : 'LST97.DEV'}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Press Start 2P',
            data: pixelFont,
            style: 'normal',
          },
        ],
      },
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response(`Failed to generate image`, {
      status: 500,
    })
  }
}
