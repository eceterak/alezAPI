const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

dotenv.config({ path: './config/config.env' });

const Advert = require('./models/Advert.model');
const City = require('./models/City.model');
const User = require('./models/User.model');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const adverts = JSON.parse(fs.readFileSync(`${__dirname}/_data/_adverts.json`));
const cities = JSON.parse(fs.readFileSync(`${__dirname}/_data/_cities.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/_users.json`));

const importData = async () => {
  await deleteData();

  try {
    await User.create(users);
    await City.create(cities);
    await Advert.create(adverts);

    console.log('Data imported...'.green.inverse);
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await City.deleteMany();
    await Advert.deleteMany();

    console.log('Data destroyed...'.red.inverse);
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
