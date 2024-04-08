/** Package imports */
let express = require("express");
let router = express.Router({ mergeParams: true });

/* GET home page. */
router.get("/", function (req, res) {
  res.send("Hello World");
});

module.exports = router;
