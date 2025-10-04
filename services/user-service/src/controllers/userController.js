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

const  getProfile = async (request, reply) => {
}

const  updateProfile = async (request, reply) => {
}

const  deleteAccount = async (request, reply) => {
}

export default { getUserById, getAllUsers, getProfile, updateProfile, deleteAccount, uploadAvatar };