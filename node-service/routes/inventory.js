var express = require('express');
var router = express.Router();

//use dapr http proxy (header) to call inventory service with normal /inventory route URL in axios.get call
//const daprSidecar = `http://localhost:${daprPort}/v1.0/invoke/${inventoryService}/method`

/* GET users listing. */
router.get('/', async function(req, res, next) {

  var data = "Inventory in stock"

  res.send(`Inventory status for ${req.query.id}:\n${data}`);
});

module.exports = router;
