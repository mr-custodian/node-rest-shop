const express = require('express');
//require is a built-in Node.js function used to import modules (libraries or your own files) into your project.
// //It allows you to reuse code across files and make your code modular.
//'express' is the name of the module you're importing — specifically, the Express.js web framework.


const app = express();
const morgan = require('morgan');//The HTTP method (GET)  The route accessed (/products) The status code (200) The response time  The size of the response
const bodyParser = require('body-parser');
const productRoutes = require('./api/routes/products');

const ordersRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://mayankspecial26:mayankdb@cluster0.zszlkyl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');


//  mongodb+srv://mayankspecial26:mayankdb@cluster0.zszlkyl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0


app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));//making upload folder public
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//below middleware  is created during header tutorial
app.use((req,res, next)=> {
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers',
        'Origin, X-Requested-With , Content-Type, Accept, Authorization'
    );
    if(req.method==='OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST ,PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/products', productRoutes);

app.use('/orders', ordersRoutes);

app.use('/user',userRoutes);

app.use((req,res,next)=> {
    const error = new Error('Not Found');//The Error class is a built-in JavaScript constructor used to represent runtime errors
    error.status = 404;
    next(error);//it will pass this object 'error' to the next middleware which is using 'error'.
});

app.use((error,req,res,next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    });
});
module.exports = app;