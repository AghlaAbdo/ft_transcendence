import { logEvent } from "../app.js";
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
   if (!code) {
     return reply.redirect('https://localhost:8080/login');
   }

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
            // reply.status(400).send({status: false,  error: 'Failed to retrieve token' });
            // return ;
            return reply.redirect('https://localhost:8080/login?error=token_failed');
        }
        const data = await tokenResponse.json();

        const accessToken = data.access_token;


        const userInfo  = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userInfo.ok) {
            // return reply.status(400).send({status: false,  error: 'Failed to retrieve userInfo' });
            return reply.redirect('https://localhost:8080/login');
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
                    online_status = 1,
                    is_google_auth = 1
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
            email: user.email,
            isAccountVerified: user.isAccountVerified
        });

        // request.server.setAuthCookie(reply, token);
        reply.setCookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Must be false for localhost // false on dev , true on prod
            sameSite: 'lax', // Must be 'lax' for OAuth redirects
            path: '/',
            maxAge: 7 * 24 * 60 * 60
        });
         
        logEvent("info", "user", "user_login", {result: "success", provider: "google"})
        return reply.redirect('https://localhost:8080/success');
        // return reply.redirect(302, `${process.env.FRONTEND_URL}/success`);
        
    } catch (error) {
        console.error('An error occurred:', error);
        request.log.error(error);

            logEvent("info", "user", "user_login", {result: "failure", provider: "google"})
        return reply.redirect('https://localhost:8080/login');
    }
}

   

export default { initiateGoogleLogin, handleGoogleCallback }