import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js';
import { sendPasswordResetEmail } from "../utils/sendPasswordResetEmail.js";
import { generateSecret, verifyToken } from '../2fa/TwoFactorService.js';
import { error } from "console";

const signup = async (request, reply) => {
    const {username, email, password} = request.body;

    try {
        const db = request.server.db;
        if (!username || !email || !password)
            throw new Error('All fields are required');

        const usernameAlreadyExist = userModel.getUserByUsername(db, username);
        const emailAlreadyExist = userModel.getUserByEmail(db, email);

        if (usernameAlreadyExist && emailAlreadyExist) {
            if (usernameAlreadyExist.isAccountVerified === 0) {

                // const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
                // const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
                
                // const email = emailAlreadyExist.email;
                // const username = usernameAlreadyExist.username;
                
                // await sendVerificationEmail(email, verificationToken, username);
                
                // db.prepare(`
                //     UPDATE USERS
                //     SET verificationToken = ?,
                //     verificationTokenExpiresAt = ?
                //     WHERE email = ?
                //     `).run(verificationToken, tokenExpiry, emailAlreadyExist.email);

                // await sendVerificationEmail(email, verificationToken, username);
                
                return reply.code(200).send({
                    status: true,
                    message: "VERIFICATION_EMAIL"
                });
            }
        }

        if (usernameAlreadyExist)
            throw new Error('Username already exists');

        if (emailAlreadyExist)
            throw new Error('Email already exists');
          
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes


        const userId = userModel.createUser(db, {
            username,
            email,
            password: hashedPassword,
            avatar_url: null,
            verificationToken,
            tokenExpiry,
            // location
        });
        
        await sendVerificationEmail(email, verificationToken, username);

        reply.code(201).send({ 
            status: true, 
            message: 'User registered successfully.', 
        });    
    } catch (error) {
        console.error("Signup error:", error);
        reply.code(400).send({status: false, message: error.message});
    }
};

const login = async (request, reply) => {
    const {email, password} = request.body;
    
    try {
        const db = request.server.db;

        if (!email || !password)
            throw new Error("Email and password are required fields.");

        const user = userModel.getUserByEmail(db, email);
        if (!user)
            throw new Error("No account found with this email.");

        if (user.is_google_auth) {
            return reply.code(400).send({
                status: false,
                message: "This account uses Google Sign-In. Please use the 'Continue with Google' button to log in."
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            throw new Error("Incorrect password.");
        
        // generateTokenAndSetCookie(reply, user.id, user.username, user.email);

        if (!user.isAccountVerified) {
            return reply.code(401).send({
                status: false,
                error: "EMAIL_NOT_VERIFIED",
                message: "Email not verified. Please verify your email address.",
                resendVerificationUrl: "/api/auth/resend-verification"
            });
        }

        // update online_status = ;
        if (!user.online_status) {
            userModel.updateOnlineStatus(db, user.id, 1);
            user.isAccountVerified = 1;
        }
        const token = request.server.signToken({
            id: user.id,
            username: user.username,
            email: user.email,
            isAccountVerified: user.isAccountVerified
        });

        request.server.setAuthCookie(reply, token);

        reply.send({status: true, message: 'User Logged in successfully'});

    } catch(error) {
        console.error("login error:", error);
        reply.code(400).send( { status:false, message: error.message } );
    }
};

const logout = async (request, reply) => {
    try {
        const db = request.server.db;

        if (request.user && request.user.id)
            userModel.updateOnlineStatus(db, request.user.id, 0);
        
        request.server.clearAuthCookie(reply);

        reply.send({status: true, message: 'Logged out successfully'});
    } catch (error) {
        console.error("logout error:", error);
        reply.code(500).send({ 
            status: false, 
            message: 'An error occurred during logout'
        });
    }    
};


const getMe = async (request, reply) => {
    const user = request.user;

    // return reply.code(200).send({
    //     status: true,
    //     user: user
    // });
    
    return {
        status: true,
        user: user
    };
}

const verifyEmail = async (request, reply) => {
    
    try {
        const { email, token } = request.body;

        if (!email || !token)
            throw new Error('Email and verification token are required');

        const db = request.server.db;
        
        
        const user = db.prepare(`
            SELECT id, username, email, verificationTokenExpiresAt, isAccountVerified
            FROM USERS
            WHERE email = ?
            AND verificationToken = ?
            AND isAccountVerified = 0`
        ).get(email, token);
        
        if (!user) {
            return reply.code(400).send({
                status: false,
                message: 'Invalid email or verification token '
            });
        }
        const now = new Date().toISOString();
        
        if (new Date(user.verificationTokenExpiresAt).toISOString() <= now) {
            return reply.code(400).send({
                success: false,
                error: "TOKEN_EXPIRED",
                message: "Verification token has expired",
            });
        }
        // verifiedAt = CURRENT_TIMESTAMP,
        db.prepare(`
            UPDATE USERS
            SET isAccountVerified = 1,
                verificationToken = null,
                verificationTokenExpiresAt = null
            WHERE id = ?
        `).run(user.id);

        const newToken = request.server.signToken({
            id: user.id,
            username: user.username,
            email: user.email,
        });

        request.server.setAuthCookie(reply, newToken);

        if (!user.online_status) {
            userModel.updateOnlineStatus(db, user.id, 1);
            user.isAccountVerified = 1;
        }

        reply.code(200).send({ 
            success: true, 
            message: 'Email verified successfully!',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAccountVerified: true
            }
        });

    } catch (error) {
        reply.code(400).send( { status: false, error: "TOKEN_REQUIRED" , message: error.message });
    }
}

const resendVerificationEmail = async (request, reply) => {
    const { email } = request.body;

    try {
        if (!email)
            return reply.code(400).send({
                status: false,
                message: "Email is required."
            });

        const db = request.server.db;

        const user = userModel.getUserByEmail(db, email);
        if (!user)
            return reply.code(404).send({ status:false, error: 'User not found' });

        if (user.isAccountVerified)
            return reply.code(400).send({ status:false, error: 'Email already verified' });


        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        db.prepare(`
            UPDATE USERS
            SET verificationToken = ?, verificationTokenExpiresAt = ?
            WHERE id = ?
        `).run(token, tokenExpiry, user.id);

        await sendVerificationEmail(email, token, user.username);

        reply.send({
            status: true,
            expiresIn: '15 minutes',
            message: 'Verification email sent successfully. Please check your inbox.'
        });
        
    } catch (error) {
        return reply.code(400).send({
            status: false,
            error: error.message,
            message: "Failed to resend verification email."
        });
    }

}

const forgotPassword = async (request, reply) => {
    const { email } = request.body;

    try {
        if (!email)
            return reply.code(400).send({
                status: false,
                message: "Email is required."
            });
        
        const db = request.server.db;

        const user = userModel.getUserByEmail(db, email);
        if (!user) {
            return reply.code(404).send({
                status: false,
                message: "No account found with this email."
            });
        }

        if (!user.isAccountVerified) {
            return reply.code(401).send({
                status: false,
                error: "EMAIL_NOT_VERIFIED",
                message: "Email not verified. Please verify your email address.",
                // resendVerificationUrl: "/api/auth/resend-verification"
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        // const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString();

        // const existingToken = db.prepare(`
        //     SELECT resetPasswordExpiresAt FROM users 
        //     WHERE id = ? AND resetPasswordExpiresAt > ?
        // `).get(user.id, new Date().toISOString());

        // if (existingToken) {
        //     return reply.code(429).send({ 
        //         error: 'Password reset already requested. Please check your email or wait before requesting another.',
        //         code: 'RESET_ALREADY_REQUESTED'
        //     });
        // }

        db.prepare(`
            UPDATE USERS
            SET resetPasswordToken = ?,
            resetPasswordExpiresAt = ?
            WHERE id = ?
        `).run(resetToken, tokenExpiry, user.id);
        
        await sendPasswordResetEmail(email, resetToken, user.username);

        reply.send({
            status: true,
            message: 'If the email exists, a password reset link has been sent',
            expiresIn: '15 min'
        });
    } catch (error) {
        console.error("Password reset request error:", error);
        reply.code(500).send({ 
            error: 'Failed to process password reset request',
            code: 'SERVER_ERROR',
            message: error.message
        });
    }
}

    // setup 2fa
const setup2fa = async (req, rep) => {
try {
    const db = req.server.db;
//    if (!db) {
//       console.error("DB not available on request.server.db");
//       return rep.status(500).send({ error: "Database not initialized" });
//     }
    console.log('allo from 2fa backend');
    const userId = req.user?.id; // Get from session/JWT
    const userEmail = req.user?.email;
    console.log('user id: ', userId);
    console.log("useremail: ", userEmail);
    
    
    if (!userId || !userEmail) {
      return rep.status(401).send({ error: 'Unauthorized' });
    }

    // Generate secret and QR code
    const setup = await generateSecret(userId, userEmail);
    console.log('allo from setup 2fa');
    
    // Store the secret temporarily (don't enable 2FA yet)
    // You'll confirm it in the next step


    await db.prepare(`
      UPDATE users 
      SET totp_secret = ? 
      WHERE id = ?
    `).run(setup.secret, userId);

    return {
      qrCode: setup.qrCode,
      manualEntryKey: setup.manualEntryKey,
      message: 'Scan this QR code with Google Authenticator',
    };
  } catch (error) {
    console.error('2FA setup error:', error);
    return rep.status(500).send({ error: 'Failed to setup 2FA' });
  }
}
// verfy 2fa token
const verify2Fa = async (req, rep) => {
try {
    // console.log('verfify backend');
    const db = req.server.db;
    const userId = req.user?.id;
    const { token } = req.body;

    console.log('user:', userId);
    console.log('token:', token);
    if (!userId || !token) {
        // console.log('ists her 1');
      return rep.status(400).send({ error: 'Missing required fields' });
    }

    // Get the secret from database
    const user = await db.prepare(`
      SELECT totp_secret 
      FROM users 
      WHERE id = ?
    `).get(userId);

    if (!user?.totp_secret) {
      return rep.status(400).send({ error: '2FA not set up' });
    }

    const isValid = verifyToken(user.totp_secret, token);

    if (!isValid) {
      return rep.status(400).send({ error: 'Invalid verification code' });
    }

    await db.prepare(`
      UPDATE users 
      SET is_2fa_enabled = TRUE 
      WHERE id = ?
    `).run(userId);

    return {
      status: true,
      message: '2FA enabled successfully',
    };
  } catch (error) {
    console.error('2FA verify error:', error);
    return rep.status(500).send({ error: 'Failed to verify 2FA' });
  }
}

// disable 2fa
const disable2fa = async(req, rep) => {
try {
    const userId = req.user?.id;
    const { token } = req.body;

    if (!userId || !token) {
      return rep.status(400).send({ error: 'Missing required fields' });
    }

    // Get the secret
    const user = await db.prepare(`
      SELECT totp_secret 
      FROM users 
      WHERE id = ?
    `).get(userId);

    if (!user?.totp_secret) {
      return rep.status(400).send({ error: '2FA not enabled' });
    }

    // Verify token before disabling
    const isValid = TwoFactorService.verifyToken(user.totp_secret, token);

    if (!isValid) {
      return rep.status(400).send({ error: 'Invalid verification code' });
    }

    // Disable 2FA and clear secret
    await db.prepare(`
      UPDATE users 
      SET is_2fa_enabled = FALSE,
          totp_secret = NULL 
      WHERE id = ?
    `).run(userId);

    return {
      status: false,
      message: '2FA disabled successfully',
    };
  } catch (error) {
    console.error('2FA disable error:', error);
    return rep.status(500).send({ error: 'Failed to disable 2FA' });
  }
}

const resetPassword = async (request, reply) => {
    try {
        const { token, newPassword } = request.body;
        const db = request.server.db;
        
        if (!token || !newPassword) {
            return reply.code(400).send({
                status: false,
                error: 'Token and new password are required',
                code: 'TOKEN_AND_PASSWORD_REQUIRED'
            });
        }

        if (newPassword.length < 8) {
            return reply.code(400).send({ 
                error: 'Password must be at least 8 characters',
                code: 'PASSWORD_TOO_SHORT'
            });
        }

        const now = new Date().toISOString();

        const user = db.prepare(`
            SELECT id FROM USERS
            WHERE resetPasswordToken = ?
            AND resetPasswordToken > ?
        `).get(token, now);

        if (!user) {
            return reply.code(404).send({
                status: false,
                error: "Invalid or expired reset token"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        db.prepare(`
            UPDATE USERS
            SET password = ?,
                resetPasswordToken = null,
                resetPasswordExpiresAt = null
            WHERE id = ?
        `).run(hashedPassword, user.id);

        reply.send({ 
            success: true, 
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error("Password reset error:", error);
        reply.code(500).send({ 
            error: 'Failed to reset password',
            code: 'SERVER_ERROR',
            message: error.message
        });
    }
}


export default {disable2fa, setup2fa, verify2Fa, login, signup, logout, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, getMe};