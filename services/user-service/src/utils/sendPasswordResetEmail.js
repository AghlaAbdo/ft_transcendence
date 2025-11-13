import transporter from "./mailer.js";

const EMAIL = process.env.EMAIL;

export const sendPasswordResetEmail = async (email, resetToken, username) => {
    const url = `${process.env.BACKEND_BASE_URL}/resetPassword?token=${resetToken}`;

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: "🔑 Reset your Ping Pong account password",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Hello ${username},</h2>
                <p>We received a request to reset your password for your Ping Pong App account.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <a href="${url}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                        Reset Password
                    </a>
                </div>

                <p><strong>This link will expire in 15 minutes.</strong></p>
                <p>If you did not request a password reset, please ignore this email. Your account is safe.</p>
                
                <hr>
                <p style="color: #666; font-size: 12px;">
                    This is an automated email from Ping Pong App. Please do not reply.
                </p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};
