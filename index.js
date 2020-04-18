const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const csrf = require('csurf');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const compression = require('compression');
const helmet = require('helmet');
const handlebars = require('handlebars');
const {
  allowInsecurePrototypeAccess,
} = require('@handlebars/allow-prototype-access');

/* routes */
const homeRoutes = require('./routes/home');
const bikesRoutes = require('./routes/bikes');
const addRoutes = require('./routes/add');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

/* middleware */
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorHandler = require('./middleware/error');
const keys = require('./keys');

/* init express */
const app = express();

/* init hanblebars template engine */

const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
  helpers: require('./utils/hbs-helpers'),
  handlebars: allowInsecurePrototypeAccess(handlebars),
});

/* init sessions */

const store = new MongoStore({
  collection: 'sessions',
  uri: keys.MONGODB_URI,
});

/* init template engine */

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

/* add static folders */
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* urlencoder */
app.use(
  express.urlencoded({
    extended: true,
  })
);

/* create session */
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
  })
);

/* init middlewares */
app.use(csrf());
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

/* add routes */
app.use('/', homeRoutes);
app.use('/bikes', bikesRoutes);
app.use('/auth', authRoutes);
app.use('/add', addRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', ordersRoutes);
app.use('/profile', profileRoutes);

app.use(errorHandler);

/* init server */
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    app.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
}

start();
