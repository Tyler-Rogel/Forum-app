const mongoose = require("mongoose");
const db = mongoose.connection;

async function connect(user, pass) {
  const connectString = `mongodb+srv://trogel138:mongodb42@cluster0.swyngnk.mongodb.net/?retryWrites=true&w=majority`;
  try {
    await mongoose.connect(connectString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.log("error connecting to mongoose", err);
   
  }
}

function onConnect(callback) {
  db.once("open", () => {
    console.log("mongo connection open");
    callback();
  });
}

module.exports = {
  connect,
  onConnect,
};