const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const AdvertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tytuł jest obowiazkowy'],
    trim: true,
    maxlength: [50, 'Tytuł nie moze byc dluzszy niz 50 znakow']
  },
  slug: { type: String, unique: true },
  description: {
    type: String,
    required: [true, 'Opis jest obowiazkowy'],
    trim: true,
    maxlength: [500, 'Opis nie moze byc dluzszy niz 50 znakow']
  },
  address: {
    type: String,
    required: [true, 'Prosze podac adres']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: false
    },
    coordinates: {
      type: [Number],
      required: false,
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String
  },
  city: {
    type: mongoose.Schema.ObjectId,
    ref: 'City',
    required: true
  },
  size: {
    type: String,
    required: [true, 'Prosze podac wielkosc pokoju'],
    enum: ['jednoosobowy', 'dwuosobowy', 'trzyosobowy lub wiekszy']
  },
  cost: Number,
  billsIncluded: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  photo: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// create slug
AdvertSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// get location
AdvertSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.address);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName
  };

  // do not save address into db
  this.address = undefined;

  next();
});

AdvertSchema.statics.getAverageCost = async function (city) {
  const obj = await this.aggregate([
    {
      $match: { city: city }
    },
    {
      $group: {
        _id: '$city',
        averageCost: { $avg: '$cost' }
      }
    }
  ]);

  try {
    const fcity = await this.model('City').findByIdAndUpdate(
      city,
      {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10
      },
      {
        new: true
      }
    );
  } catch (err) {
    console.log(err);
  }
};

// call getAverageCost after save
AdvertSchema.post('save', function () {
  this.constructor.getAverageCost(this.city);
});

// call getAverageCost after delete
AdvertSchema.pre('remove', function () {
  this.constructor.getAverageCost(this.city);
});

module.exports = mongoose.model('Advert', AdvertSchema);
