const { Schema, model } = require('mongoose');

const bikeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  img: String,
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

bikeSchema.method('toClient', function () {
  const bike = this.toObject();

  bike.id = bike._id;
  delete bike._id;
  return bike;
});
module.exports = model('Bike', bikeSchema);
