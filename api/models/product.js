const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, required: true },//no this entry cannot be epmty 
    price: { type: Number, required: true },
    productImage: {type:String, required:true}
});

module.exports = mongoose.model('Product',productSchema);