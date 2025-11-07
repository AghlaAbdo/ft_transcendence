import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import fs from "fs";
import path from "path";
import { authenticator } from 'otplib';

import QRcode from 'qrcode';

const getUserById = async (request, reply) => {
    const { id } = request.params;

    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
        return reply.code(400).send({
            status: false,
            message: 'Invalid user ID.'
        });
    }
    try {
        const db = request.server.db;

        const user = userModel.getUserByID(db, userId);

        if (!user) {
            return reply.code(404).send({
                status: false,
                message: 'No user found'
            });
        }
        const { password, 
                resetPasswordToken, 
                verificationToken, 
                verificationTokenExpiresAt, 
                resetPasswordExpiresAt,
                createdAt,
                updatedAt,
                location,
                ...userWhitoutPassword } = user;

        reply.send({
            status: true,
            user: userWhitoutPassword
        });

    } catch (error) {
        reply.code(500).send({
            status: false,
            message: error.message || 'Failed to fetch user'
        });
    }
}

const  getAllUsers = async (request, reply) => {
    try {

        const db = request.server.db;

        const users = userModel.getAllUsers(db);

        if (!users || users.length == 0) {
            return reply.send({
                status: true,
                users: [],
                message: 'No users found'
            });
        }
        reply.send({
            status: true,
            count: users.length,
            users: users
        });

    } catch (error) {
        reply.code(500).send({
            status: false,
            message: error.message || 'Failed to fetch users'
        });
    }
}

const uploadAvatar = async (request, reply) => {
    try {
        const user = request.user;
        const file = await request.file();
        
        if (!file) {
            return reply.code(400).send({
                status: false,
                message: "No file uploaded"
            });
        }

        const uploadDir = path.join(process.cwd(), "uploads", "avatars");

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true});
        }

        const filePath = path.join(uploadDir, `${user.id}-${file.filename}`);

        const buffer = await file.toBuffer();
        await fs.promises.writeFile(filePath, buffer);
        
        // const avatar_url = `https://localhost:8080/uploads/avatars/${user.id}-${file.filename}`;
        const avatar_url = `/uploads/avatars/${user.id}-${file.filename}`;    
        const db = request.server.db;

        db.prepare(`
            UPDATE USERS
            SET avatar_url = ?
            WHERE id = ?
        `).run(avatar_url,user.id);

        reply.send({
            status: true,
            message: "Avatar uploaded successfully"
        });

    } catch (error) {
        console.error("Avatar upload failed:", err);
        return reply.status(500).send( { status: false, error: "Internal Server Error" });
    }
}

const changePassword = async (request, reply) => {
    try {
        const user = request.user;
        
        const { currentPassword, newPassword } = request.body;
        
        if (!currentPassword || !newPassword) {
            return reply.code(400).send({
                status: false,
                message: "Current password and new password are required"
            });
        }

        const db = request.server.db;

        const currentUser = db.prepare(`
            SELECT password, is_google_auth
            FROM USERS
            WHERE id = ?
        `).get(user.id);

        if (!currentUser) {
            return reply.code(404).send({
                status: false,
                message: "User not found"
            });
        }
        if (currentUser.is_google_auth) {
            return reply.code(400).send({
                status: false,
                message: "Password change is not allowed for Google accounts"
            });
        }
        

        const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
        if(!isPasswordValid) {
            return reply.code(401).send({
                status: false,
                message: "Current password is incorrect"
            });
        }


        const isSamePassword = await bcrypt.compare(newPassword, currentUser.password);
        if (isSamePassword) {
            return reply.code(400).send({
                status: false,
                message: "New password must be different from current password"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        db.prepare(`
            UPDATE USERS
            SET password = ?
            WHERE id = ?
        `).run(hashedPassword, user.id);
        

        reply.send({
            status: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Password change failed:", error);
        return reply.status(500).send({ 
            status: false,
            message: "Internal Server Error" 
        });
    }
}

const updateInfo = async (request, reply) => {
    try {
        const user = request.user;
        const { username } = request.body;

        if (!username) {
            return reply.code(400).send({
                status: false,
                message: "Username is required"
            });
        }

        if (username.length < 8 || username.length > 20) {
            return reply.code(400).send({
                status: false,
                message: "Username must be between 8 and 20 characters"
            });
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            return reply.code(400).send({
                status: false,
                message: "Username can only contain letters, numbers, and underscores"
            });
        }

        const db = request.server.db;

        const currentUser = db.prepare(`
            SELECT username 
            FROM USERS 
            WHERE id = ? 
        `).get(user.id);

        if (currentUser.username === username) {
            return reply.code(400).send({
                status: false,
                message: "No changes detected"
            });
        }

        const usernameAlreadyExist = userModel.getUserByUsername(db, username);
        if (usernameAlreadyExist) {
            return reply.code(409).send({
                status: false,
                message: "Username is already taken"
            });
        }

        db.prepare(`
            UPDATE USERS
            SET username = ?
            WHERE id = ?
        `).run(username, user.id);

        reply.send({
            status: true,
            message: "Username updated successfully",
        });


    } catch (error) {
        console.error("Info change failed:", error);
        return reply.status(500).send({ 
            status: false,
            message: "Internal Server Error" 
        });
    }
}

const searchQuery = async (request, reply) => {
    try {
        const { query } = request.query;
        const trimQuery = query?.trim();

        if (!trimQuery || trimQuery.length < 2) {
            return reply.code(400).send({
                status: false,
                message: "Query must be at least 2 characters"
            });
        }
        const db = request.server.db;

        const users = db.prepare(`
            SELECT id, username, avatar_url, online_status
            FROM USERS
            WHERE username LIKE ?
        `).all(`%${trimQuery}%`);

        reply.send( {
            status: true,
            count: users.length,
            users: users
        });

    } catch (error) {
        reply.code(500).send({
            status: false,
            message: error.message || 'Failed to search users'
        });
    }
}
 
const  getProfile = async (request, reply) => {
}

const  updateProfile = async (request, reply) => {
}

const  deleteAccount = async (request, reply) => {
}

const twoFactorAuth = async (request, reply) => {
    try {
        const user = request.user;
        const { enable } = request.body;

        if (enable === undefined) {
            return reply.code(400).send({
                status: false,
                message: "enable required"
            });
        }

        console.log("-------> 2fa : ", enable);
        const db = request.server.db;


        
        if (enable) {
            const secret = authenticator.generateSecret();
            console.log("secret: ", secret);

            db.prepare(`
                UPDATE USERS
                SET totp_secret = ?
                WHERE id = ?
            `).run(secret, user.id);
            
            const otpauth = authenticator.keyuri(user.username, 'PingPongGame', secret);
            const qrCodeDataURL = await QRcode.toDataURL(otpauth);

            return reply.code(200).send({
                status: true,
                message: "2FA enabled. Scan this QR code with your authenticator app.",
                qrCode: qrCodeDataURL
            });
        }

        const enableValue = enable ? 1 : 0;

        db.prepare(`
            UPDATE USERS
            SET is_2fa_enabled = ?
            WHERE id = ?
        `).run(enableValue, user.id);

        return reply.code(200).send({
            status: true,
            message: `2FA has been ${enable ? "enabled" : "disabled"} successfully.`
        });

        
    } catch (error) {
        console.error(error);
        return reply.code(500).send({
            status: false,
            message: "Internal server error"
        });
    }
}

const updateStats = async (request, reply) => {
    const { winnerId, loserId } = request.body;
    
    try {
        const db = request.server.db;

        if (!winnerId || !loserId) {
            return reply.status(400).send({ 
                status : false,
                message: "Missing required fields" 
            });
        }

        db.prepare(`
            UPDATE USERS
            SET wins = wins + 1,
                points = points + 3,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?;
        `).run(winnerId);

        db.prepare(`
            UPDATE USERS
            SET losses = losses + 1,
                points = points + 1,
                updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?;
        `).run(loserId);

        userModel.recalculateRanks(db);

        return reply.status(200).send({ 
            status: true,
            message: "Stats updated successfully" 
        });
    } catch (err) {
        console.error("❌ Error updating user stats:", err);
        return reply.status(500).send({ 
            status: false,
            message: "Error updating user stats" 
        });
    }
}


export default { 
    getUserById, 
    getAllUsers, 
    getProfile, 
    updateProfile, 
    deleteAccount, 
    uploadAvatar, 
    changePassword,
    updateInfo,
    twoFactorAuth,
    searchQuery,
    updateStats,
};