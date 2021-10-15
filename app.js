var express = require('express');
var exphbs  = require('express-handlebars');
var port = process.env.PORT || 3000
const mercadopago = require('mercadopago');
const BodyParse = require('body-parser');

var app = express();
 
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(BodyParse.urlencoded({ extended: false }));
app.use(BodyParse.json());
var id = '';

app.use(express.static('assets'));
 
app.use('/assets', express.static(__dirname + '/assets'));

// Configuracion de mercadopago
mercadopago.configure({
    access_token:
        'APP_USR-1159009372558727-072921-8d0b9980c7494985a5abd19fbe921a3d-617633181',
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
});

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/detail', function (req, res) {

    let preference = {
        items: [
            {
                id: '1234',
                title: req.query.title,
                description: 'Dispositivo móvil de Tienda e-commerce',
                picture_url:
                    'https://frankode-shop.herokuapp.com/' +
                    req.query.img.substring(1),
                category_id: '1234',
                quantity: Number(req.query.unit),
                currency_id: 'MXN',
                unit_price: Number(req.query.price),
                external_reference: 'franciscomagana.contact@gmail.com',
            },
        ],
        external_reference: 'franciscomagana.contact@gmail.com',
        payer: {
            name: 'Lalo',
            surname: 'Landa',
            email: 'test_user_81131286@testuser.com',
            phone: {
                area_code: '11',
                number: Number(22223333),
            },
            address: {
                street_name: 'Falsa',
                street_number: Number(123),
                zip_code: '1111',
            },
        },
        payment_methods: {
            excluded_payment_methods: [{ id: 'amex' }],
            excluded_payment_types: [{ id: 'atm' }],
            installments: 6,
            default_installments: 6,
        },
        back_urls: {
            success:
                'https://frankode-shop.herokuapp.com/success',
            pending:
                'https://frankode-shop.herokuapp.com/pending',
            failure:
                'https://frankode-shop.herokuapp.com/failed',
        },
        notification_url:
            'https://frankode-shop.herokuapp.com/webhook',
        auto_return: 'approved',
    };

    mercadopago.preferences
        .create(preference)
        .then(function (response) {
            console.log(response);
            id = response.body.id;
            // Este valor reemplazará el string "<%= global.id %>" en tu HTML
            req.query.globalID = response.body.id;
            req.query.id = response.body.id;
            req.query.init_point = response.body.init_point;
            res.render('detail', req.query);
        })
        .catch(function (error) {
            console.log(error);
            res.render('failed', req.query);
        });  

});

app.get('/failed', function (req, res) {
    console.log(req.query);
    res.render('failed', req.query);
});

app.get('/pending', function (req, res) {
    console.log(req.query);
    res.render('pending', req.query);
});

app.post('/webhook', function (req, res) {
    console.log('BODY : ', JSON.stringify(req.body));
    console.log(req.query);
    res.status(200).send();
});

app.get('/success', function (req, res) {
    console.log(req.query);
    let success = {
        payment_id: req.query.collection_id,
        payment_method_id: req.query.payment_type,
        external_reference: req.query.external_reference,
    };
    res.render('success', success);
});

app.listen(port);