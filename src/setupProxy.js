const proxy = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        proxy('/.netlify/functions/', {
            target: 'http://localhost:5000/',
            pathRewrite: {
                '^/\\.netlify/functions': ''
            }
        })
    );

    app.use(
        proxy('/assets/', {
            target: 'http://localhost:5000/',
            pathRewrite: {
                '^/assets': ''
            }
        })
    );
};
