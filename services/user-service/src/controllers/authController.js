import userModel from "../models/userModel.js";
import bcrypt from 'bcryptjs'
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/sendVerificationEmail.js';
import { sendPasswordResetEmail } from "../utils/sendPasswordResetEmail.js";

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

                const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
                const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
                
                const email = emailAlreadyExist.email;
                const username = usernameAlreadyExist.username;
                
                await sendVerificationEmail(email, verificationToken, username);
                
                db.prepare(`
                    UPDATE USERS
                    SET verificationToken = ?,
                    verificationTokenExpiresAt = ?
                    WHERE email = ?
                    `).run(verificationToken, tokenExpiry, emailAlreadyExist.email);

                await sendVerificationEmail(email, verificationToken, username);
                
                return reply.code(200).send({
                    status: true,
                    message: "VERIFICATION_EMAIL_RESENT"
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


export default {login, signup, logout, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword, getMe};