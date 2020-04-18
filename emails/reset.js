const keys = require('../keys');

module.exports = function (email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Access recovery',
    html: `
      <center>
        <h1>Reset password.</h1>
        <p>Use link to reset password: <a href="${keys.BASE_URL}/auth/password/${token}">${keys.BASE_URL}/auth/password/${token}</a></p>
        <hr />
        <a href="${keys.BASE_URL}" target="_blank">${keys.BASE_URL}</a>
      </center>
    `,
  };
};
