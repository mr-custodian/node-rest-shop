const Order = require("../models/order");

exports.orders_get_all = (req,res,next) => {
  Order.find()
  //since order table id is in reference with product table , populate() function
  //does shows the info regarding product table also , .populate('referring table or schema name','fields you want to display')
  //the  .populate() will not contribute anything
  // .populate('schema name') will display all the fields
  // .populate('schema name', 'field names') will display the desired feilds only
    .populate('product')
    .select("product quantity _id")
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {//map() is used to transform each element of an array and return a new array with the transformed values.
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};