const { Router } = require('express');
const Bike = require('../models/bike');
const auth = require('../middleware/auth');
const router = Router();

function mapCartItems(cart) {
  return cart.items.map(c => ({
    ...c.bikeID._doc,
    id: c.bikeID.id,
    count: c.count,
  }));
}

function computePrice(bikes) {
  return bikes.reduce((total, bike) => {
    return (total += bike.price * bike.count);
  }, 0);
}

router.post('/add', auth, async (req, res) => {
  try {
    const bike = await Bike.findById(req.body.id);
    await req.user.addToCart(bike);
    res.redirect('/cart');
  } catch {
    err => console.log(err);
  }
});

router.delete('/remove/:id', auth, async (req, res) => {
  try {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user.populate('cart.items.bikeID').execPopulate();

    const bikes = mapCartItems(user.cart);
    const cart = {
      bikes,
      price: computePrice(bikes),
    };
    res.status(200).json(cart);
  } catch {
    err => console.log(err);
  }
});

router.get('/', auth, async (req, res) => {
  const user = await req.user.populate('cart.items.bikeID').execPopulate();

  const bikes = mapCartItems(user.cart);

  res.render('cart', {
    title: 'Cart',
    isCart: true,
    bikes: bikes,
    price: computePrice(bikes),
  });
});

module.exports = router;
