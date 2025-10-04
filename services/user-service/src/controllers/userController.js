import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import fs from "fs";
import path from "path";

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
        const { password, resetPasswordToken, ...userWhitoutPassword } = user;

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
            SELECT password
            FROM USERS
            WHERE id = ?
        `).get(user.id);

        if (!currentUser) {
            return reply.code(404).send({
                status: false,
                message: "User not found"
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
        const { username, email } = request.body;

        if (!username || !email) {
            return reply.code(400).send({
                status: false,
                message: "Username and email are required"
            });
        }

        const db = request.server.db;

        const currentUser = db.prepare(`
            SELECT username, email 
            FROM USERS 
            WHERE id = ? 
        `).get(user.id);

        if (currentUser.username === username && currentUser.email === email) {
            return reply.code(400).send({
                status: false,
                message: "No changes detected"
            });
        }

        if (username !== currentUser.username) {
            const usernameAlreadyExist = userModel.getUserByUsername(db, username);
            if (usernameAlreadyExist) {
                return reply.code(409).send({
                    status: false,
                    message: "Username is already taken"
                });
            }
        }

        if (email !== currentUser.email) {
            const emailAlreadyExist = userModel.getUserByEmail(db, email);
            if (emailAlreadyExist) { 
                return reply.code(409).send({
                    status: false,
                    message: "Email is already registered"
                });
            }
        }

        db.prepare(`
            UPDATE USERS
            SET username = ?,
                email = ?
            WHERE id = ?
        `).run(username, email, user.id);

        reply.send({
            status: true,
            message: "Profile updated successfully",
        });


    } catch (error) {
        console.error("Info change failed:", error);
        return reply.status(500).send({ 
            status: false,
            message: "Internal Server Error" 
        });
    }
}

const  getProfile = async (request, reply) => {
}

const  updateProfile = async (request, reply) => {
}

const  deleteAccount = async (request, reply) => {
}

export default { 
    getUserById, 
    getAllUsers, 
    getProfile, 
    updateProfile, 
    deleteAccount, 
    uploadAvatar, 
    changePassword,
    updateInfo 
};