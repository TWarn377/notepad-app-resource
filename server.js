'use-strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Add routes
require('./routes/auth-routes')(app);
require('./routes/note-routes')(app);

// Set up Routes
const server = app.listen(port, () => {
    console.log(server.address());
    console.log(`Notepad App Resource listening at ${server.address().port}`);
    app._router.stack.forEach(function(r){
        if (r.route && r.route.path){
          console.log(r.route.path)
        }
      });
});

