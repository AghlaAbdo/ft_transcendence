import transporter from "./mailer.js";

const EMAIL = process.env.EMAIL  || 'ayoubhadiri0320@gmail.com';

export const sendVerificationEmail = async (email, verificationToken, username) => {
    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: '🏓 Verify your Ping Pong account',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to Ping Pong App, ${username}! 🏓</h2>
                <p>Please verify your email address to complete your registration.</p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <h3>Your verification code:</h3>
                    <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px;">
                        ${verificationToken}
                    </div>
                </div>
                
                <p><strong>This code expires in 15 minutes.</strong></p>
                <p>If you didn't create this account, please ignore this email.</p>
                
                <hr>
                <p style="color: #666; font-size: 12px;">
                    This is an automated email from Ping Pong App. Please do not reply.
                </p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}