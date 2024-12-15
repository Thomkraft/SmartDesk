import fetch from 'node-fetch';

const clientId = "f34a83c0460345769ab81d8491433902";
const clientSecret = "9ee4046ca4344040a94e32fa3901aa44";
const redirectUri = "http://85.215.130.37:3000/api/spotify-auth";

const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://85.215.130.37:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export async function GET({ url }) {
    const code = url.searchParams.get('code');
    if (code) {
        return new Response(
            `<script>
                window.opener.spotifyCallback('${code}');
                window.close();
            </script>`,
            {
                headers: { 
                    ...corsHeaders,
                    'Content-Type': 'text/html'
                }
            }
        );
    }
    return new Response('No code provided', { 
        status: 400,
        headers: corsHeaders
    });
}

export async function POST({ request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    try {
        const code = await request.text();
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri
            })
        });

        const data = await response.json();
        if (data.error) {
            return new Response(JSON.stringify({ error: data.error }), { 
                status: 400,
                headers: corsHeaders
            });
        }
        
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { 
            status: 500,
            headers: corsHeaders
        });
    }
}

export async function PUT({ request }) {
    try {
        const refreshToken = await request.text();
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        });

        const data = await response.json();
        if (data.error) {
            return new Response(JSON.stringify({ error: data.error }), { 
                status: 400,
                headers: corsHeaders
            });
        }

        return new Response(JSON.stringify(data), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Server error' }), { 
            status: 500,
            headers: corsHeaders
        });
    }
}