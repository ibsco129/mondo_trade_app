const express = require('express'),
router = express.Router(),
BigCommerce = require('node-bigcommerce');

const bigCommerce = new BigCommerce({
    clientId: '31aetqqjt83pskm6miem2rf0663e22l',
    secret: '5535c9f998b221adb2d4fe3e49a8383f63fca23de9e08436dd0bf61847322353',
    callback: 'https://820d-45-126-3-252.ngrok-free.app/auth',
    responseType: 'json'
});

router.get('/', (req, res, next) => {
bigCommerce.authorize(req.query)
.then(data => console.log(data))
.then(data => res.render('auth', { title: 'App Installed!' }));
});
module.exports = router;