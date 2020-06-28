const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'Nazwa jest obowiązkowa']
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
      }
    },
    averageCost: {
      type: Number,
      default: 0
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// cascade delete adverts when city gets deleted
CitySchema.pre('remove', async function(next) {
  await this.model('Advert').deleteMany({ city: this._id });

  next();
});

// reverse populate with virtuals
CitySchema.virtual('adverts', {
  ref: 'Advert',
  localField: '_id',
  foreignField: 'city',
  justOne: false
});

module.exports = mongoose.model('City', CitySchema);
