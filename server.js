var express = require('express');
var ipfsAPI = require('ipfs-api');
var fs = require('fs');
var bodyParser = require('body-parser');
var wiki_ipfs;
// connect to ipfs daemon API server
var ipfs = ipfsAPI('localhost', '5001')

var app = express();

app.use( express.static( __dirname + '/client' ));
app.use(bodyParser.json());

app.get('/', function(req,res) {
  res.sendFile('./index.html');
});

app.get('/wikis', function(req,res) {
  fs.readFile('./client/hashes.json', function(error,data) {
    if(error || !data) res.send(console.error(error));

    wiki_ipfs = JSON.parse(data);
    var wiki_pages = [];
    for (var i = 0; i < wiki_ipfs.length; i++) {
      wiki_pages.push(wiki_ipfs[i].name);
    }
    res.send(wiki_pages);
  });
});

app.post('/add', function(req,res) {
  var new_wiki = req.body.wiki;
  var wiki_page = new_wiki['title'];

  ipfs.add(new Buffer(JSON.stringify(new_wiki)), function(err, response) {
    if(err || !response) res.send(console.error(err));
    response.forEach(function(ipfs_obj) {
      fs.readFile('./client/hashes.json', function(error,data) {
        if(error || !data) res.send(console.error(error));

        var stored_wikis = JSON.parse(data);
        stored_wikis.push({'hash':ipfs_obj.Hash, 'name': wiki_page});
        wiki_ipfs = stored_wikis;

        fs.writeFile('./client/hashes.json', JSON.stringify(stored_wikis), function(error2) {
          if(error2) res.send(console.error(error2));
          res.send("success");
        })
      });
    })
  });
});

app.post('/get', function(req,res) {
  var wiki_page = req.body.name;
  var hash;
  if (!wiki_ipfs) {
    fs.readFile('./client/hashes.json', function(nothing,ret_obj) {
      if(nothing || !ret_obj) return console.error(nothing);

      wiki_ipfs = JSON.parse(ret_obj);
    });
  }

  for (var i = 0; i < wiki_ipfs.length; i++) {
    if (wiki_ipfs[i].name == wiki_page) {
      hash = wiki_ipfs[i].hash;
      break;
    }
  }
  ipfs.cat(hash, function(error, data) {
    if(error || !data) res.send(console.error(error));

    if(data.readable) {
      // Returned as a stream
      var wiki_content = '';
      data.on('error', function(err) {throw err});
      data.on('data', function(obj_content) {
        wiki_content += obj_content;
      })
      data.on('end', function() {
        res.send({page:wiki_content.toString()});
      })
      //
    } else {
      // Returned as a string
      res.send(data);
    }
  })
});

app.listen(3000, function () {
  console.log('Example app listening at http://localhost:3000');
});
