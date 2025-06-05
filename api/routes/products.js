const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const storage = multer.diskStorage({
    destination: function(req, file, cb){//cb means callback
        cb(null, './uploads/');
    },
    filename: function(req,file,cb){
        //Windows doesn't support colons (:) in filenames.
        const safeTimestamp = new Date().toISOString().replace(/:/g, '-');
        cb(null,safeTimestamp + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {//if filters are not satisfied then the request will be accepted but file will not be stored
  // reject a file
  
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});


const Product = require('../models/product'); 
router.get('/',checkAuth, (req,res,next) => {
    Product.find()
    .select("name price _id productImage")
    .exec()
    .then(docs => {
      const response = {//trying to get the response in a format we want 
        count: docs.length,
        products: docs.map(doc => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/products/" + doc._id
            }
          };
        })
      };
      res.status(200).json(response);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.post('/', upload.single('productImage'),checkAuth,(req,res,next) => {
    console.log(req.file);
    //added checkAuth to authenticate client before uploading the data
    //to upload , you have to add Bearer <token> in header sectrion in postman
    /*const product = {  //This data is accessible via req.query in Express, not req.body. thats why get does not use body-parser 
        name: req.body.name,
        price: req.body.price
    };   //replaced by db product*/
    const product = new Product({  
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path 
    }); 

    product.save().
    then(result => {//save the entry in mongodb
        res.status(201).json({ //added in db chapter
        message: 'Created product successfully',
        createdProduct: {//trying to get the response in a format we want 
            name: result.name,
            price: result.price,
            _id: result._id,
            request: {
                type: 'GET',
                url: "http://localhost:3000/products/" + result._id
            }
        }
    });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
    //removed in db chapter and added to the above section
    /*res.status(201).json({
        message: 'Handling POST requests to /products',
        createdProduct: product
    });*/
});

router.get('/:productId',checkAuth, (req,res,next) => {
    const id = req.params.productId;
    Product.findById(id)
    .select('name price _id productImage')
    .exec()
    .then(doc => {
        console.log("from database",doc);//result on terminal
        if (doc){
            res.status(200).json({
            product: doc,
            request: {
                type: 'GET',
                url: 'http://localhost:3000/products'
                }
            });
        }else{
            res.status(404).json({message: 'No valid entry found for provided ID'});//if id is not exist but constraint wise can be okay by mongodb
            //then we are simply displaying msg , otherwise it will print null
        }
        //res.status(200).json(doc);//result on postman
    })
    .catch(err => { // if using invalid id  then 
        console.log(err);//error will be shown on linux
        res.status(500).json({error:err});//error will be shown on postman
    });
    /*
    //commented on database adding chapter
    if (id==='special'){
        res.status(200).json({
            message: "You discovered the special ID",
            id: id
        })

    }else{
         res.status(200).json({
            message: "You passed an  ID"
        })
    }*/
});

router.patch('/:productId',checkAuth, (req,res,next) => {
    const id = req.params.productId;
    const updateOps = {};
     for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;//set propName = field you want to change , value = new value
    }
    Product.updateOne({ _id: id }, { $set: updateOps })//.remove() is depriciated
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json({
          message: 'Product updated',
          request: {
              type: 'GET',
              url: 'http://localhost:3000/products/' + id
          }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

router.delete('/:productId',checkAuth, (req,res,next) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id })//Product.remove() function is depriciated so use deleteOne()
    .exec()
    .then(result => {
      res.status(200).json({
          message: 'Product deleted',
          request: {
              type: 'POST',
              url: 'http://localhost:3000/products',
              body: { name: 'String', price: 'Number' }
          }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
    /* //removed in db chapter
    res.status(200).json({
        message: "Deleted product!"
    });*/
    
});

module.exports = router;