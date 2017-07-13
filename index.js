var express = require('express');
var app = express();

var admin = require("firebase-admin");

var serviceAccount = require("serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-project-1498757432999.firebaseio.com"
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {  
  response.send('Hello from Express!')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
