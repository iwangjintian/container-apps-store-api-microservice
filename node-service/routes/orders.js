var express = require('express');
var router = express.Router();
const axios = require('axios').default;
const orderService = process.env.ORDER_SERVICE_NAME || 'python-app';
const CosmosClient = require('@azure/cosmos').CosmosClient
const TaskDao = require('../models/taskDao')
const config = require('../config')
const daprPort = process.env.DAPR_HTTP_PORT || 3500;

//use dapr http proxy (header) to call orders service with normal /order route URL in axios.get call
const daprSidecar = `http://localhost:${daprPort}`
const cosmosClient = new CosmosClient({
  endpoint: config.host,
  key: config.authKey
})
const taskDao = new TaskDao(cosmosClient, config.databaseId, config.containerId)
taskDao
  .init(err => {
    console.error(err)
  })
  .catch(err => {
    console.error(err)
    console.error(
      'Shutting down because there was an error settinig up the database.'
    )
    process.exit(1)
  })
/* GET order by calling order microservice via dapr */
router.get('/', async function(req, res, next) {

  console.log('query id: ' + `${req.query.id}`);
  var query = "select * from c where c.id = \"python-app||" + `${req.query.id}` + "\"";
  console.log('query: ' + query);
  var data = await taskDao.find(query);
  console.log(data)
  res.setHeader('Content-Type', 'application/json');
  res.send(`${JSON.stringify(data)}`);
});

/* POST create order by calling order microservice via dapr */
router.post('/', async function(req, res, next) {
  try{
    var order = req.body;
    order['location'] = 'Seattle';
    order['priority'] = 'Standard';
    order['id'] = 'python-app||' + order['id'];
    console.log('New Item with data: ' +  JSON.stringify(order));
    var data = await taskDao.addItem(order);
  
    res.send(`<p>Order created!</p><br/><code>${JSON.stringify(data)}</code>`);
  }
  catch(err){
    res.send(`<p>Error creating order<br/>Order microservice or dapr may not be running.<br/></p><br/><code>${err}</code>`);
  }
});

module.exports = router;
