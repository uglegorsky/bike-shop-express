const { Router } = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');
const upload = require('../middleware/upload');
const router = Router();

router.get('/', auth, async (req, res) => {
  try {
    res.render('profile', {
      title: 'Profile',
      isProfile: true,
      user: req.user.toObject(),
    });
  } catch (err) {
    console.log(err);
  }
});

router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const toChange = {
      name: req.body.name,
    };

    if (req.file) {
      toChange.photoURL = req.file.path;
    }
    Object.assign(user, toChange);
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
