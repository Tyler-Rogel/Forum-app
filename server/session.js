const session = require("express-session");


const setUpSessionStore = function (app) {
  // 8
  app.use(
    session({
      secret: "cat",
      resave: false,
      saveUninitialized: false,
    })
  );
};

module.exports = setUpSessionStore;