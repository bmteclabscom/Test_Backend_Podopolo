const sgMail = require('@sendgrid/mail');
const { sendGrid } = require('~/config/index');

sgMail.setApiKey(sendGrid.apiKey);

exports.sendMail = async (to, subject, html) =>
  sgMail.send({
    from: sendGrid.from,
    to,
    subject,
    html,
  });
