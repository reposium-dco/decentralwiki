var ipfs_wikis;

$(document).ready(function() {
  $.get('/wikis', function(data){
    ipfs_wikis = data;

    for (var i = 0; i < data.length; i++) {
      var single_element = document.createElement("h3");
      single_element.className = "single_element"
      single_element.innerHTML = data[i];
      $(".all_pages").append(single_element);
    }
  });

  $(".search_btn").click(function(){
    var search = $(".search-box").val();

    if (ipfs_wikis.indexOf(search.toLowerCase()) == -1) {
      wiki_extract(search, display_summary);
    }
    else {
      ipfs_extract(search, display_summary);
    }
  });

  $('body').on('click','.single_element',function(event){
     var search = event.target.firstChild.data;
     window.scrollTo(0,0);
     ipfs_extract(search, display_summary);
  });
});

function wiki_extract(word, callback) {
  $.getJSON("http://en.wikipedia.org/w/api.php?callback=?",
  {
    titles: word,
    action: "query",
    prop: "extracts",
    exintro: "",
    format: "json",
    redirects: ""
    //TODO: specify user agent
  }, function(data) {
    $.each(data.query.pages, function(i) {
      $.each(data.query.pages[i], function(j) {
        if (j == "extract") {
          //TODO: Make this more flexible so that users can get suggestions
          if (data.query.pages[i][j].indexOf("may refer to") > -1) {
            $(".results").empty();
            $(".results").append("<span><h1 class='content-title'>No Content</h1></span>");
            $(".results").append("<span class='content-text'><p>Please be a bit more specific with your search query</p></span>");
          }
          else {
            ipfs_wikis.push(data.query.pages[i]['title'].toLowerCase());
            console.log(ipfs_wikis);
            $.ajax({
        	    url : "/add",
        	    type: "POST",
        	    data : JSON.stringify({'wiki':data.query.pages[i]}),
        	    contentType: 'application/json'
          	});
            console.log("This page was served through the Wikipedia API!");
            callback(data.query.pages[i])
          }
        }
      })
    });
    //callback(data);
  }).fail(function() {
    $(".results").empty();
    $(".results").append("<div><h1 style='margin-top: 50px'><center>No content</center></h1></div>");
  });
};

function ipfs_extract(word, callback) {
  $.ajax({
    url : "/get",
    type: "POST",
    data : JSON.stringify({'name':word}),
    contentType: 'application/json'
  }).done(function(data) {
    console.log("This page was served through IPFS!");
    var content = JSON.parse(data['page']);
    callback(content);
  });
}

function display_summary(data) {
  $(".results").empty();
  $(".results").append("<span><h1 class='content-title'>" + data['title'] + "</h1></span>");
  $(".results").append("<span class='content-text'><p>" + data['extract'] + "</p></span>");
};
