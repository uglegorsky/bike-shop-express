const { Router } = require('express');
const Order = require('../models/order');
const auth = require('../middleware/auth');
const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({
      'user.userID': req.user._id,
    }).populate('user.userID');

    res.render('orders', {
      title: 'Orders',
      isOrders: true,
      orders: orders.map(order => {
        return {
          ...order._doc,
          price: order.bikes.reduce((total, b) => {
            return (total += b.count * b.bike.price);
          }, 0),
        };
      }),
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await req.user.populate('cart.items.bikeID').execPopulate();

    const bikes = user.cart.items.map(i => ({
      count: i.count,
      bike: { ...i.bikeID._doc },
    }));

    const order = new Order({
      user: {
        name: req.user.name,
        userID: req.user,
      },
      bikes,
    });

    await order.save();
    await req.user.clearCart();
    res.redirect('/orders');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
