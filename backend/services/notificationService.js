/**
 * Notification Service
 * 
 * This service handles sending notifications to subscribers when alerts are created.
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'coastlealert@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'app_password_here'
  }
});

/**
 * Notify subscribers about a new alert
 * @param {Object} alert - The alert object
 * @returns {Promise<void>}
 */
async function notifySubscribers(alert) {
  try {
    // In a real application, you would fetch subscribers from a database
    // For now, we'll just log the notification
    console.log(`Would send notification for alert: ${alert.summary}`);
    
    // Example of sending an email notification
    // Uncomment and configure when ready to implement email notifications
    /*
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'subscriber@example.com',
      subject: `Coastle Alert: ${alert.summary}`,
      text: `
        Alert Details:
        Type: ${alert.kind}
        Severity: ${alert.severity}
        Area: ${alert.area}
        Time: ${new Date(alert.ts).toLocaleString()}
        
        ${alert.summary}
        
        View more details on the Coastle Alert dashboard.
      `,
      html: `
        <h2>Coastle Alert: ${alert.summary}</h2>
        <p><strong>Type:</strong> ${alert.kind}</p>
        <p><strong>Severity:</strong> ${alert.severity}</p>
        <p><strong>Area:</strong> ${alert.area}</p>
        <p><strong>Time:</strong> ${new Date(alert.ts).toLocaleString()}</p>
        <p>${alert.summary}</p>
        <p><a href="${process.env.CLIENT_URL}">View more details on the Coastle Alert dashboard</a></p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    */
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

export {
  notifySubscribers
};