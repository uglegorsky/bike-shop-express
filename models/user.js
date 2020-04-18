const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: String,
  password: {
    type: String,
    required: true,
  },
  photoURL: String,
  resetToken: String,
  resetTokenExp: Date,
  cart: {
    items: [
      {
        bikeID: {
          type: Schema.Types.ObjectId,
          ref: 'Bike',
          required: true,
        },
        count: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (bike) {
  const items = [...this.cart.items];
  const index = items.findIndex(b => {
    return b.bikeID.toString() === bike._id.toString();
  });
  if (index >= 0) {
    items[index].count = this.cart.items[index].count + 1;
  } else {
    items.push({
      bikeID: bike._id,
      count: 1,
    });
  }
  this.cart = { items };
  return this.save();
};

userSchema.methods.removeFromCart = function (ID) {
  let items = [...this.cart.items];
  const index = items.findIndex(b => b.bikeID.toString() === ID.toString());
  if (items[index].count === 1) {
    items = items.filter(b => b.bikeID.toString() !== ID.toString());
  } else {
    items[index].count--;
  }
  this.cart = { items };
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = model('User', userSchema);
