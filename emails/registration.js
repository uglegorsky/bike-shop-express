const keys = require('../keys');
module.exports = function (to, name) {
  return {
    to: to,
    from: keys.EMAIL_FROM,
    subject: 'Successful registration',
    html: `
      <center>
        <h1>Successful registration.</h1>
        <p>Welcome to Bike Shop, ${name}!</p>
        <p>You email: ${to}</p>
        <hr />
        <a href="${keys.BASE_URL}" target="_blank">${keys.BASE_URL}</a>
      </center>
    `,
  };
};
