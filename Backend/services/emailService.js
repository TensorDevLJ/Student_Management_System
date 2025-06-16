// backend/services/emailService.js
const nodemailer = require('nodemailer');
const { Student } = require('../models');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
    // Make sure EMAIL_USER and EMAIL_PASS are set in .env
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        logger.error('Email credentials (EMAIL_USER or EMAIL_PASS) are not configured in .env. Emails cannot be sent.');
        return null;
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'outlook', etc.
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Optional: If you encounter issues with self-signed certs or specific network setups
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Email templates
const getInactivityEmailTemplate = (studentName, codeforcesHandle, days, reminderCount) => {
    const subject = `🚀 Coding Practice Reminder - Day ${days} Inactivity`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; padding: 10px; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .stats { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚀 Time to Code, ${studentName}!</h2>
          </div>
          <div class="content">
            <p>Hi ${studentName},</p>
            
            <p>We noticed you haven't submitted any solutions on Codeforces (handle: <strong>${codeforcesHandle}</strong>) in the last <strong>${days} days</strong>. 
            This is reminder #${reminderCount} to get back into your coding practice!</p>
            
            <div class="stats">
              <h3>💡 Why Daily Practice Matters:</h3>
              <ul>
                <li>Keeps your problem-solving skills sharp</li>
                <li>Helps maintain and improve your rating</li>
                <li>Builds consistency in competitive programming</li>
                <li>Prepares you for contests and interviews</li>
              </ul>
            </div>
            
            <p>Ready to get back on track?</p>
            <a href="https://codeforces.com/problemset" class="button">Start Solving Problems</a>
            
            <p><strong>Quick Tips for Getting Back:</strong></p>
            <ul>
              <li>Start with problems slightly below your comfort zone</li>
              <li>Set a goal of solving at least 1 problem daily</li>
              <li>Focus on understanding rather than speed initially</li>
              <li>Review editorial solutions for problems you can't solve</li>
            </ul>
            
            <p>Remember, consistency beats intensity. Even 30 minutes of daily practice can make a huge difference!</p>
            
            <p>Happy Coding! 🎯</p>
            <p><em>Your Progress Tracking System</em></p>
          </div>
          <div class="footer">
            <p>This is an automated reminder. If you want to stop receiving these emails, please contact your administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
};

const getWelcomeEmailTemplate = (student) => {
    const subject = 'Welcome to Student Progress Tracking System!';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .info-box { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #4CAF50; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Welcome ${student.name}!</h2>
          </div>
          <div class="content">
            <p>Congratulations! You've been successfully added to our Student Progress Tracking System.</p>
            
            <div class="info-box">
              <h3>📊 Your Profile Details:</h3>
              <p><strong>Name:</strong> ${student.name}</p>
              <p><strong>Email:</strong> ${student.email}</p>
              <p><strong>Codeforces Handle:</strong> ${student.codeforcesHandle}</p>
              <p><strong>Current Rating:</strong> ${student.currentRating || 'Not rated yet'}</p>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>We'll sync your Codeforces data daily</li>
              <li>Track your contest participation and problem solving progress</li>
              <li>Send friendly reminders if you're inactive for more than 7 days</li>
              <li>Generate detailed progress reports</li>
            </ul>
            
            <a href="https://codeforces.com/profile/${student.codeforcesHandle}" class="button">View Your Codeforces Profile</a>
            
            <p>Keep coding and best of luck with your competitive programming journey! 🚀</p>
            
            <p><em>Happy Coding!</em><br>Student Progress Tracking Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
};

const getSyncReportEmailTemplate = (syncStats) => {
    const subject = `Daily Sync Report - Student Progress System (${new Date().toLocaleDateString()})`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .stat-box { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; display: inline-block; width: 45%; box-sizing: border-box; margin-right: 10px; }
          .success { border-left: 4px solid #4CAF50; }
          .error { border-left: 4px solid #f44336; }
          .summary { margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📊 Daily Sync Report</h2>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          <div class="content">
            <p>Dear Admin,</p>
            <p>Here is the daily synchronization and email notification report for the Student Progress System:</p>
            
            <div style="display: flex; justify-content: space-between;">
              <div class="stat-box success">
                <h3>✅ Successful Syncs</h3>
                <h2>${syncStats.successCount}</h2>
              </div>
              <div class="stat-box error" style="margin-right: 0;">
                <h3>❌ Failed Syncs</h3>
                <h2>${syncStats.errorCount}</h2>
              </div>
            </div>
            
            <div class="summary">
              <h3>📧 Email Notifications Summary:</h3>
              <p>Total inactive students identified: <strong>${syncStats.totalInactive || 0}</strong></p>
              <p>Inactivity reminder emails sent: <strong>${syncStats.emailsSent || 0}</strong></p>
              <p>Inactivity email failures: <strong>${syncStats.emailsFailed || 0}</strong></p>
            </div>

            ${syncStats.errors && syncStats.errors.length > 0 ? `
              <div style="margin-top: 20px; padding: 15px; background: #ffe0b2; border-left: 4px solid #ff9800; border-radius: 5px;">
                <h3>⚠️ Details of Sync Failures:</h3>
                <ul style="list-style-type: none; padding: 0;">
                  ${syncStats.errors.map(err => `<li><strong>${err.student}</strong>: ${err.error}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            <p><em>This is an automated report from your Student Progress Tracking System.</em></p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
};


// Send email
async function sendEmail(to, subject, html) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
        return false; // Transporter creation failed due to missing credentials
    }

    const mailOptions = {
      from: {
        name: 'Student Progress Tracker',
        address: process.env.EMAIL_USER
      },
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${result.messageId}`);
    return true;

  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

// Check for inactive students and send reminders
async function checkInactiveStudents() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find students who haven't submitted in last 7 days and have email notifications enabled
    const inactiveStudents = await Student.find({
      disableEmail: false,
      $or: [
        { lastSubmissionTime: { $lt: sevenDaysAgo } },
        { lastSubmissionTime: null } // Student never had a submission or it's old
      ]
    });

    logger.info(`Found ${inactiveStudents.length} inactive students`);

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const student of inactiveStudents) {
      try {
        // Calculate days since last submission
        const daysSinceLastSubmission = student.lastSubmissionTime
          ? Math.floor((Date.now() - student.lastSubmissionTime.getTime()) / (1000 * 60 * 60 * 24))
          : 'many'; // If lastSubmissionTime is null, they've been inactive for 'many' days

        // Increment reminder count
        student.reminderCount += 1;
        await student.save();

        // Generate and send email
        const { subject, html } = getInactivityEmailTemplate(
          student.name,
          student.codeforcesHandle,
          daysSinceLastSubmission,
          student.reminderCount
        );

        const emailSent = await sendEmail(student.email, subject, html);

        if (emailSent) {
          emailsSent++;
        } else {
          emailsFailed++;
        }

        // Add a small delay between emails to avoid being flagged as spam
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        logger.error(`Error processing inactive student ${student.codeforcesHandle}:`, error);
        emailsFailed++;
      }
    }

    logger.info(`Inactivity check completed. Emails sent: ${emailsSent}, Failed: ${emailsFailed}`);
    return { emailsSent, emailsFailed, totalInactive: inactiveStudents.length };

  } catch (error) {
    logger.error('Error in checkInactiveStudents:', error);
    throw error;
  }
}

// Send welcome email to new student
async function sendWelcomeEmail(student) {
    if (student.disableEmail) {
        logger.info(`Welcome email skipped for ${student.email} as notifications are disabled.`);
        return false;
    }
    const { subject, html } = getWelcomeEmailTemplate(student);
    return await sendEmail(student.email, subject, html);
}

// Send sync report to admin
async function sendSyncReport(syncStats) {
    if (!process.env.ADMIN_EMAIL) {
        logger.warn('ADMIN_EMAIL not configured in .env. Sync report not sent.');
        return false;
    }
    const { subject, html } = getSyncReportEmailTemplate(syncStats);
    return await sendEmail(process.env.ADMIN_EMAIL, subject, html);
}

module.exports = {
  sendEmail,
  checkInactiveStudents,
  sendWelcomeEmail,
  sendSyncReport
};