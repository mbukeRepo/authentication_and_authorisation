const nodemailer =  require('nodemailer');
// options: {email,subject,message}
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host:process.env.EMAILING_HOST,
        port:process.env.EMAILING_PORT,
        auth:{
            user:process.env.EMAILING_AUTH_USER,
            pass:process.env.EMAILING_AUTH_PASS
        }
    });
    const emailOptions = {
        from: "ldk elearning <ldk@gmail.com>",
        to: options.email,
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(emailOptions);
}

module.exports = sendEmail;