
const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(8080).sockets;

mongo.connect('mongodb://127.0.0.1/chat', (err, db) => {
  if(err) {
    throw err;
  }
  client.on('connection', (socket) => {
    console.log(socket.id);
    var col = db.collection('messages');
    console.log("Someone is connected");

    // Emit all the messages
    col.find().limit(100).sort({_id: 1}).toArray((err, result) => {
      if(err) {
        throw err;
      }

      socket.emit('output', result)
    })

    // Wait for input
    socket.on('input', (data) => {
      var name = data.name || 'Default User';
      var message = data.message;

      if(!name || !message) {
        console.log('Invalid');
      }
      else {
        col.insert({name: name, message: message}, () => {
          console.log("Inserted");

          // Emit Latest messages to all Client
          client.emit('output', [data]);
        });
      }
    });
  });
});
