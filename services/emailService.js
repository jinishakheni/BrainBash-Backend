// Import modules
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmailOnContactUs = async (senderEmail,senderName, senderMessage) => {
  const emailOptions = {
    from: process.env.APP_EMAIL,
    to: process.env.APP_EMAIL,
    subject: `${senderName} sent a contact request`,
    text: senderMessage + `\n contact him/her with this email: ${senderEmail}`,
  };
  try {
    const info = await transporter.sendMail(emailOptions);
    console.log(
      `Email sent successfully to ${process.env.APP_EMAIL}: ${info.response}`
    );
  } catch (error) {
    console.error(`Error sending email to ${process.env.APP_EMAIL}:`, error);
  }
};

const sendEmailsToAttendeesOnEventDelete = async (event) => {
  // Event details
  const eventName = event.title;
  const eventDateTime = event.startingTime;
  const hostName = event.hostId.fullName;
  const eventLocation = event.address;

  const refundTimeframe = "14 business day";

  // Contact email
  const contactEmail = process.env.APP_EMAIL;

  // Email text template

  event.attendees.forEach(async (attendee) => {
    const userName = attendee.fullName;

    const emailText = `
    Dear ${userName},
    
    We regret to inform you that the event "${eventName}" you registered for has been cancelled by the host.
    
    Event Details:
    - Event Name: ${eventName}
    - Date and Time: ${eventDateTime}
    - Host: ${hostName}
    - Location: ${eventLocation}
    
    
    Next Steps:
    - Your registration for this event has been automatically cancelled.
    - Any fees paid for this event will be refunded to your account within ${refundTimeframe}.
    - We apologize for any inconvenience this may cause and appreciate your understanding.
    
    If you have any questions or need further assistance, please don't hesitate to contact us at ${contactEmail}.
    
    Thank you for your understanding.
    
    Best regards,
    BrainBash Team
    `;

    const emailOptions = {
      from: process.env.APP_EMAIL,
      to: attendee.email,
      subject: `${event.title} Cancelled: Important Information Regarding Your Registration`,
      text: emailText,
    };

    try {
      const info = await transporter.sendMail(emailOptions);
      console.log(
        `Email sent successfully to ${attendee.email}: ${info.response}`
      );
    } catch (error) {
      console.error(`Error sending email to ${attendee.email}:`, error);
    }
  });
};

module.exports = {
  sendEmailsToAttendeesOnEventDelete,
  sendEmailOnContactUs
};