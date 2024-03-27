import {NextResponse} from "next/server";
import {headers} from "next/headers";

// apparently it has to take in the req as a Request for Next to not cache it ;-;
export async function GET(req: Request) {
    let path = '/';
    try {
        path = new URL(headers().get('referer')!).pathname;
    } catch {}

    return NextResponse.json({
        name: 'LASA Coffeehouse',
        short_name: 'Coffeehouse',
        description: 'Coffeehouse performer tracker',
        orientation: 'portrait',
        start_url: path,
        id: path,
        display: 'standalone',
        background_color: '#fff',
        theme_color: '#fff',
        icons: [
            {
                src: '/icons/192.png',
                sizes: '192x192',
                type: 'image/png'
            },
            {
                src: '/icons/384.png',
                sizes: '384x384',
                type: 'image/png'
            },
            {
                src: '/icons/512.png',
                sizes: '512x512',
                type: 'image/png'
            },
            {
                src: '/icons/1024.png',
                sizes: '1024x1024',
                type: 'image/png'
            },
            {
                src: '/images/logo.svg',
                sizes: 'any',
                type: 'image/svg+xml'
            },
        ],
    })
}