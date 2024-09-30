import { transporter } from "../config/emailConfig.js";



export const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: 'agronomics@gmail.com',
            to: email,
            subject: 'Agronomics email - OTP Verification',
            text: `Your OTP for Agronomics is ${otp}.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${email}`);
        return true; // Return true if email sent successfully
    } catch (error) {
        console.error('Failed to send OTP email:', error);
        return false; // Return false if email sending failed
    }
};