import userModel from '../models/userModel.js';

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

const  getProfile = async (request, reply) => {
}

const  updateProfile = async (request, reply) => {
}

const  deleteAccount = async (request, reply) => {
}

export default { getUserById, getAllUsers, getProfile, updateProfile, deleteAccount };