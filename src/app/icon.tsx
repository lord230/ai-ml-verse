import { ImageResponse } from 'next/og'
import * as fs from 'fs'
import * as path from 'path'

// Image metadata
export const size = {
    width: 64,
    height: 64,
}
export const contentType = 'image/png'

// Output the Image
export default function Icon() {
    const imagePath = path.join(process.cwd(), 'public', 'favicon-base.png')
    const imageData = fs.readFileSync(imagePath)

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                }}
            >
                <img
                    // Use the raw base64 buffer for Vercel edge/node support
                    src={`data:image/png;base64,${imageData.toString('base64')}`}
                    style={{ width: '130%', height: '130%', objectFit: 'cover' }}
                />
            </div>
        ),
        {
            ...size,
        }
    )
}
