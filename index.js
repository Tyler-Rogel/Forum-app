const app = require("./server/server");
const { connect, onConnect } = require("./persist/connect");

require("dotenv").config();
onConnect(() => {
  app.listen(8080, () => {
    console.log(`serving on port 8080`);
  });
});

try {
  connect(
   process.env.USER, process.env.PASS
  );
} catch (err) {
  console.log(err);
  throw "couldn't start";
}