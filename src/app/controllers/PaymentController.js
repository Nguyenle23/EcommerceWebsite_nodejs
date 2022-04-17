const { url } = require('inspector');
const { mongooseToObject } = require('../../config/utility/mongoose');
const { multipleToObject } = require('../../config/utility/mongoose');

const Product = require('../models/Product');
const Order = require('../models/Order');

// [GET] /payment
const showPayment = async(req, res, next) => {
    res.render('TabPayment/payment', { layout: 'mainEmpty.hbs' });
}

// [POST] /payment/payCOD
const payCOD = async(req, res, next) => {
    // const { userId } = req.user;
    const { name, phonenumber, address, note, price, color, sku, size, qty } = req.body;
    // res.json(req.body);
    var regexNumber = new RegExp(/(84|0[3|5|7|8|9])+([0-9]{8})\b/);
    if (regexNumber.test(phonenumber) == false) {
        req.session.message = {
            type: 'danger',
            intro: 'Vui lòng điền chính xác số điện thoại',
        }
        return res.redirect('/payment');
    }

    // let product = await Product.findOne(req.params.id)
    // for (var i = 0; i < product.skus.length; i++) {
    //     if (req.body.sku == product.skus[i].sku) {
    //         req.body.sku.push(product.skus[i].sku);
    //     }
    // }
    const order = new Order({
        name: req.body.name,
        phonenumber: req.body.phonenumber,
        address: req.body.address,
        note: req.body.note,
        items: [{
            $push: {
                sku: req.body.sku,
                qty: req.body.qty,
                price: req.body.price,
            },
        }],
    });
    for (var i in req.body.sku) {
        order.items.push({ sku: req.body.sku[i], qty: req.body.qty[i], price: req.body.price[i] })
    }

    try {
        await order.save();
        console.log(order)
        res.redirect('/payment/' + order.id + '/order');
    } catch (err) {
        res.status(400).send(err);
    }
}

// [GET] /payment/:id/order
const showOrder = async(req, res, next) => {
    const order = await Order.findById(req.params.id);
    res.render('TabOrder/order', { layout: 'mainEmpty.hbs', order: mongooseToObject(order) });
}

// [POST] /payment/:id/payOrder
const payOrder = async(req, res, next) => {
    //parameters
    var partnerCode = "MOMOUW4Y20220414";
    var accessKey = "PxadjEKn577xXABk";
    var secretkey = "U0rXFOEyO6u1DFqpOxN7ua6G806NOqao";
    var requestId = partnerCode + new Date().getTime();
    var orderId = requestId;
    var orderInfo = "pay with MoMo";
    var redirectUrl = "http://localhost:3000/login";
    var ipnUrl = "http://localhost:3000/payment";
    // var ipnUrl = redirectUrl = "https://webhook.site/454e7b77-f177-4ece-8236-ddf1c26ba7f8";
    var amount = "5000";
    var requestType = "captureWallet"
    var extraData = ""; //pass empty value if your merchant does not have stores

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl + "&requestId=" + requestId + "&requestType=" + requestType
        //puts raw signature
    console.log("--------------------RAW SIGNATURE----------------")
    console.log(rawSignature)
        //signature
    const crypto = require('crypto');
    var signature = crypto.createHmac('sha256', secretkey)
        .update(rawSignature)
        .digest('hex');
    console.log("--------------------SIGNATURE----------------")
    console.log(signature)

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: 'en'
    });
    //Create the HTTPS objects
    const https = require('https');
    const options = {
            hostname: 'test-payment.momo.vn',
            port: 443,
            path: '/v2/gateway/api/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(requestBody)
            }
        }
        //Send the request and get the response
    const req1 = https.request(options, res => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        let data = '';
        res.on('data', (body) => {
            data += body;
            console.log('Body: ');
            console.log(body);
            console.log('payUrl: ');
            console.log(JSON.parse(body).payUrl);
        });

        res.on('end', () => {
            try {
                const parsedData = JSON.parse(data);
                // console.log(parsedData);
                next(parsedData.payUrl);
                console.log('No more data in response.');
            } catch (e) {
                console.error(e.message);
            }
        });
    })

    // req1.on('error', (e) => {
    //     console.log(`problem with request: ${e.message}`);
    // });
    // write data to request body
    // console.log("Sending....")
    req1.write(JSON.stringify(requestBody));
    req1.end();

    res.redirect('/payment/' + req.params.id + '/order');
}

module.exports = { showPayment, payCOD, showOrder, payOrder }