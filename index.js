var express = require('express');
var app = express();

var firebase = require("firebase-admin");
var request = require('request');

var API_KEY = "AAAACXq3tkA:APA91bFajZ6ZNPmhqNvz_RsxKl-BOj56XWy_c2waD9IwT8pqCeGP71aG1B7QvSv6frBGEbK5bShQEsHUngb2YcAIkvwQy9UrK-og5qinuKrzMy20Ra0MmqLICt43JWWVz0v87pMlJ84K"

var serviceAccount = require("./serviceAccountKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://my-project-1498757432999.firebaseio.com"
});

ref = firebase.database().ref();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {
  response.send('Hello from Express!')
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function listenForNotificationRequests() {
  var requests = ref.child('notifications');
  requests.on('child_added', function(requestSnapshot) {
    var request = requestSnapshot.val();
    sendNotificationToUser(
      request.recipients,
      request.message,
      function() {
        requestSnapshot.ref.remove();
      }
    );
  }, function(error) {
    console.error(error);
  });
};

function sendNotificationToUser(recipients, message, onSuccess) {
  for(let username of recipients){
    request({
      url: 'https://fcm.googleapis.com/fcm/send',
      method: 'POST',
      headers: {
        'Content-Type' :' application/json',
        'Authorization': 'key='+API_KEY
      },
      body: JSON.stringify({
        data: {
          message
        },
        notification: {
          title: message
        },
        to : '/topics/user_'+username
      })
    }, function(error, response, body) {
      if (error) { console.error(error); }
      else if (response.statusCode >= 400) {
        console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage);
      }
      else {
        onSuccess();
        console.log('Sending message to ' + username + '...');
        console.log(message);
      }
    });
  }
}

// start listening
listenForNotificationRequests();
