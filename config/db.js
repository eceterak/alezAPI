const mongoose = require('mongoose');

const connect = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.bold);
};

module.exports = connect;
