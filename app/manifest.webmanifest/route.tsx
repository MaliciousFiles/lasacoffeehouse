import {NextResponse} from "next/server";
import {headers} from "next/headers";

export async function GET(request: Request) {
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
        test: Array.from(headers().entries()),
    })
}