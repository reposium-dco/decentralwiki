# Decentralized Wikipedia

This is a Decentralized version of Wikipedia built on IPFS that offers users a search through Wikipedia. The way the application works is that it stores the JSON formatted Wikipedia extracts on IPFS and stores the object's hash in a local file called `hashes.json`.

Upon a search request, if the searched for page is not backed up on IPFS already, the application will first make a request to the Wikipedia API for the page's content and then back it up on IPFS. That means that on a second search query with the same search term, the application will utilize IPFS to serve the page.

![alt tag](http://i.imgur.com/N9MD9uK.png)

## Prerequisites

The obvious prerequisite is a fully operational IPFS daemon. I am utilizing Express for this application, the IPFS Node API and body-parser, so if you haven't gotten that yet, run
```
$ npm install express --save
$ npm install ipfs-api --save
$ npm install body-parser
```

Once you have that running, run an IPFS daemon
```
$ ipfs daemon
```

And after that, you can simple run server.js
```
$ node server.js
```

And that should be it. You should be ready to go.
