import fp from 'fastify-plugin';

const redirectUri = process.env.CALL_BACK_URI;
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

const googleOAuth = async (fastify, options) => {
    fastify.decorate('getGoogleAuthURL', () => {
        const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = new URLSearchParams({
            redirect_uri: redirectUri,
            client_id: clientID,
            access_type: 'offline',
            response_type: 'code',
            prompt: 'consent',
            scope: ['profile', 'email'].map(
                scope => `https://www.googleapis.com/auth/userinfo.${scope}`
            ).join(' ')
        });

        return `${rootURL}?${options}`;
    });
}

export default fp(googleOAuth, {
    name: 'google-oauth',
    // dependencies: ['@fastify/session'] // Declares that this plugin needs the session plugin to be registered first
});
