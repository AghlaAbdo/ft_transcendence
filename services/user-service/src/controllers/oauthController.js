import { logEvent } from "../app.js";
import userModel from "../models/userModel.js";

const initiateGoogleLogin = async (request, reply) => {
    const authURL = request.server.getGoogleAuthURL();
    reply.redirect(authURL);
}

function getUniqueUsername(db, baseUsername) {
    let username = baseUsername;
    let counter = 1;
    
    // Check if username exists
    while (userModel.getUserByUsername(db, username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    
    return username;
  }

const handleGoogleCallback = async (request, reply) => {
   const resUrl = process.env.FRONTEND_URL || 'https://localhost:8080';
   const code = request.query.code;
   if (!code) {
     return reply.redirect(`${resUrl}/login`);
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
  
            return reply.redirect(`${resUrl}/login?error=token_failed`);
        }
        const data = await tokenResponse.json();

        const accessToken = data.access_token;


        const userInfo  = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userInfo.ok) {
            return reply.redirect(`${resUrl}/login`);
        }

        const userInfoData = await userInfo.json();

        const db = request.server.db;

        let user = userModel.getUserByEmail(db, userInfoData.email);
        let username = userInfoData.email
                                    .split('@')[0]
                                    .replace(/[^a-zA-Z0-9]/g, '')
                                    .toLowerCase();
        
        username = getUniqueUsername(db, username);    
        
        // console.log("unique usename: ", username);
        
        if (!user) {
            const userdataDb = {
                username,
                email: userInfoData.email,
                password: null, 
                avatar_url: userInfoData.picture, 
                verificationToken: null,
                tokenExpiry: null
            };

            const userID = userModel.createUser(db, userdataDb);
            if (userInfoData.email_verified === true) {
                db.prepare(`
                UPDATE USERS
                SET isAccountVerified = 1,
                    online_status = 1,
                    is_google_auth = 1
                WHERE id = ?
                `).run(userID);
            }
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

        request.server.setAuthCookie(reply, token);
         
        logEvent("info", "user", "user_login", {result: "success", provider: "google"})
        return reply.redirect(`${resUrl}/success`);
        
    } catch (error) {
        console.error('An error occurred:', error);
        request.log.error(error);

            logEvent("info", "user", "user_login", {result: "failure", provider: "google"})
        return reply.redirect(`${resUrl}/login`);
    }
}

   

export default { initiateGoogleLogin, handleGoogleCallback }