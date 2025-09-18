import userModel from "../models/userModel.js";

const initiateGoogleLogin = async (request, reply) => {
    const authURL = request.server.getGoogleAuthURL();
    reply.redirect(authURL);
}
// # Step 1: Define the token endpoint and parameters
// # Step 2: Prepare the data for the token exchange
// # Step 3: Make the POST request to exchange the code for an access token
// # Step 4: Handle the response

/*
    Use the Access Token:

    Include the access token in the Authorization header 
    (e.g., Bearer <access_token>) when making API requests.
    (Optional) Refresh the Token:
    If the access token expires, use the refresh token (if provided) to obtain a new access token.
*/
const handleGoogleCallback = async (request, reply) => {
    /*
        https://your-app.com/oauth/callback?code=AUTHORIZATION_CODE
        The code in request.query.code is the authorization code provided by Google. 
        It is a temporary code that your server can use to exchange for an access token 
        and optionally a refresh token. These tokens allow your application to access 
        the user's data on their behalf.
    */
   const code = request.query.code;

   const tokenData = new URLSearchParams({
       code: code,
       client_id: process.env.GOOGLE_CLIENT_ID,
       client_secret: process.env.GOOGLE_CLIENT_SECRET,
       redirect_uri: process.env.CALL_BACK_URI,
       grant_type: 'authorization_code'
   });

   try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: tokenData.toString()
        });
        if (!tokenResponse.ok) {
            // const errorText = await tokenResponse.text();
            // console.log('token echange error: ', errorText);
            // throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`);
            // throw new Error(`Token exchange failed: ${tokenResponse.status}`);
            reply.status(400).send({status: false,  error: 'Failed to retrieve token' });
            return ;
        }
        const data = await tokenResponse.json();

        const accessToken = data.access_token;


        const userInfo  = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userInfo.ok) {
            return reply.status(400).send({status: false,  error: 'Failed to retrieve userInfo' });
        }

        const userInfoData = await userInfo.json();

        const db = request.server.db;

        let user = userModel.getUserByEmail(db, userInfoData.email);
        const username = userInfoData.email
                                    .split('@')[0]
                                    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
                                    .toLowerCase();
        
        if (!user) {
            // console.log("---------------[not exist]---------------");
            const userdataDb = {
                username,
                email: userInfoData.email,
                password: null, 
                avatar_url: userInfoData.picture, 
                verificationToken: null,
                tokenExpiry: null
            };

            const userID = userModel.createUser(db, userdataDb);
            // console.log('\n', userInfoData.email_verified);
            if (userInfoData.email_verified === true) {
                db.prepare(`
                UPDATE USERS
                SET isAccountVerified = 1,
                    online_status = 1
                WHERE id = ?
                `).run(userID);
            }
            // auth_type: 'oauth',
                // oauth_id: userInfoData.sub,
                // oauth_provider: 'google'
            user = userModel.getUserByID(db, userID);
        }
        else {
            db.prepare(`
                UPDATE USERS
                SET online_status = 1
                WHERE id = ?
            `).run(user.id);
            
            user =  userModel.getUserByID(db, user.id);
        }

        const token = request.server.signToken({
            id: user.id,
            username: user.username,
            email: user.email
        });

        request.server.setAuthCookie(reply, token);
         
        reply.send({ 
            status: true, 
            message: "User Logged in successfully", 
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                avatar_url: user.avatar_url,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        console.error('An error occurred:', error);
        request.log.error(error);
        return reply.code(500).send({ 
            status: false, 
            message: error.message,
            error: "Internal Server Error" });
    }
}

        // Store the access token in an HttpOnly, Secure cookie
        // reply.setCookie('access_token', accessToken, {
        //     httpOnly: true,
        //     secure: true, // Ensure this is true in production (requires HTTPS)
        //     sameSite: 'Strict',
        //     maxAge: data.expires_in * 1000, // Set expiration time
        // });

        // // Optionally store the refresh token in another cookie
        // reply.setCookie('refresh_token', refreshToken, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'Strict',
        //     maxAge: 30 * 24 * 60 * 60 * 1000, // Example: 30 days
        // });

// async function verifyAccessToken(request, reply) {
//     const accessToken = request.cookies.access_token;

//     if (!accessToken) {
//         reply.status(401).send({ error: 'Unauthorized: No access token provided' });
//         return;
//     }

//     try {
//         // Validate the token (e.g., decode JWT or verify with OAuth provider)
//         const userData = jwt.verify(accessToken, process.env.JWT_SECRET); // Example for JWT
//         request.user = userData; // Attach user data to the request
//     } catch (err) {
//         reply.status(401).send({ error: 'Unauthorized: Invalid access token' });
//     }
// }

// fastify.get('/protected', { preHandler: verifyAccessToken }, async (request, reply) => {
//     reply.send({ message: 'You have access to this protected route', user: request.user });
// });

// fastify.post('/logout', async (request, reply) => {
//     reply.clearCookie('access_token');
//     reply.clearCookie('refresh_token');
//     reply.send({ message: 'Logged out successfully' });
// });

// fastify.post('/refresh-token', async (request, reply) => {
//     const refreshToken = request.cookies.refresh_token;

//     if (!refreshToken) {
//         return reply.status(401).send({ error: 'Unauthorized: No refresh token provided' });
//     }

//     try {
//         // Send the refresh token to the OAuth provider's token endpoint
//         const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams({
//                 client_id: process.env.GOOGLE_CLIENT_ID,
//                 client_secret: process.env.GOOGLE_CLIENT_SECRET,
//                 refresh_token: refreshToken,
//                 grant_type: 'refresh_token',
//             }).toString(),
//         });

//         if (!tokenResponse.ok) {
//             return reply.status(401).send({ error: 'Failed to refresh token' });
//         }

//         const data = await tokenResponse.json();
//         const newAccessToken = data.access_token;

//         // Set the new access token in an HttpOnly, Secure cookie
//         reply.setCookie('access_token', newAccessToken, {
//             httpOnly: true,
//             secure: true, // Ensure this is true in production (requires HTTPS)
//             sameSite: 'Strict',
//             maxAge: data.expires_in * 1000, // Set expiration time
//         });

//         reply.send({ message: 'Access token refreshed successfully' });
//     } catch (error) {
//         console.error('Error refreshing token:', error);
//         reply.status(500).send({ error: 'Internal Server Error' });
//     }
// });

export default { initiateGoogleLogin, handleGoogleCallback }