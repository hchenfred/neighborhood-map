var map;
var markers = [];
var place = {};
var yelpResponse = {};
var filteredYelpResponse = {};
var Category = function(name, yelp) {
  this.categoryName = name,
  this.categoryUsedForYelp = yelp
};



var initMap = function(categories) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 37.7779436, lng: -122.4152976},  
      zoom: 14
    });


    var input = /** @type {!HTMLInputElement} */(
        document.getElementById('pac-input'));

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function() {
      infowindow.close();
      marker.setVisible(false);
      place = autocomplete.getPlace();
      console.log(self.location);
      
      console.log(place);
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
        map.setCenter(place.geometry.location);
        map.setZoom(15);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(15);  
      }
      marker.setIcon(/** @type {google.maps.Icon} */({
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(35, 35)
      }));
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      /*var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
      infowindow.open(map, marker);
      */
    });
    //yelpRequest('San Francisco', categories);
};


/* create information window for yelp markers 
input r is an element in the yelp response array
*/
 function createInfoWindow(r) {
    var text = '<div class="card card-block card-info">';
    text += '<a href="' + r.url + '" target="_blank" class="card-title card-link">' + r.name + '</a><br/>';
    text += '<img class="ratingsimage" src="' + r.rating_img_url + '"/>';
    text += r.review_count + ' Reviews<br/>';
    for (var i = 0; i < r.categories.length; i++) {
      if (i === r.categories.length - 1) {
        text += '<span id="yelp-category">' + r.categories[i][0] + '  </span>';
      } else {
        text += '<span id="yelp-category">' + r.categories[i][0] + ',  </span>';
      }
    }
    text += '<br/>'
    text += r.location.display_address[0] + '<br/>' + r.location.display_address[1] + ', ' + r.location.display_address[2] + '<br/><br/>';
    text += '</div>';
    return text;
}

// Sets the map on all markers in the array.
function setMapOnAll(map, markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

//loc is a knockout observable
//categories is a knockout observable array
function yelpRequest(loc, categories, categoryFilter='') {
    //console.log("categories in yelpResponse is + " + categories);
    yelpResponse = {};
    function nonce_generate() {
      return (Math.floor(Math.random() * 1e12).toString());
    }
    if (!isEmpty(place)) {
      loc = place.formatted_address;
    }
    var yelp_url = 'https://api.yelp.com/v2/search?';
    var parameters = {
      term: 'restaurants',
      location: loc,
      category_filter: categoryFilter,
      //sort: 2,
      oauth_consumer_key: 'XPzZeqwKT1WcLNLZ-quVHA',
      oauth_token: '_HQnAhO1FXLMlv4c7Ivq231XQKyqais4',
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now()/1000),
      oauth_signature_method: 'HMAC-SHA1',
      callback: 'cb'             // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
    };
    
    var consumer_secret = 'oAAm0z1rqmaFFLQlXrZie7KqOl0',
        token_secret = 'ML0TTxj99Ixci3f1P46lsYlKKTc';
        
    var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, consumer_secret, token_secret);
    parameters.oauth_signature = encodedSignature;
    
    var settings = {
      url: yelp_url,
      data: parameters,
      cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
      dataType: 'jsonp',
      jsonpCallback: 'cb',
      success: function(results) {
        console.log("SUCCCESS! %o", results);
        yelpResponse = results;
        processYelpResults(results, categories);
      },
      error: function(error) {
        alert('Yelp API response error ' + error);
      }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);
};


// process response from Yelp 
function processYelpResults(results, categories) {
    //remove all markers on the map first
    //setMapOnAll(null);
    setMapOnAll(null, markers);
    markers = [];
    //remove all the contents in the list view
    document.getElementById('list-view').innerHTML = "";
    //self.businesses.removeAll();
    //self.businesses = ko.observableArray(results.businesses);
    var pinIcon = new google.maps.MarkerImage(
        "img/food.png",
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        null, /* anchor is bottom center of the scaled image */
        new google.maps.Size(40, 40)
    );  
    for (var i = 0; i < results.businesses.length; i++) {
      var currBusiness = results.businesses[i];
      for (var j = 0; j < currBusiness.categories.length; j++) {
        categories.push(new Category(currBusiness.categories[j][0], currBusiness.categories[j][1]));
      }
      
      var currLocation = currBusiness.location.coordinate;
      if (currLocation == null) {
        alert("the location does not exist, please enter another address");
      }
      var coordinates = {lat: currLocation.latitude, lng: currLocation.longitude};
      var marker = new google.maps.Marker({
          map: map,
          icon: pinIcon,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: coordinates
      });
      markers.push(marker);
      //create a card in list-view element
      var contentString = createInfoWindow(currBusiness);
      var listView = document.getElementById('list-view');
      var node = document.createElement('li');
      node.setAttribute('id', 'list'+i.toString());
      node.innerHTML = contentString;
      listView.appendChild(node);
      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      var cardElement = document.getElementById
      //add event listener for the list item in list-view
      document.getElementById('list' + i.toString()).addEventListener('mouseover', (function(x, infowindow) {
        return function() {
          markers[x].setAnimation(google.maps.Animation.BOUNCE);     
          infowindow.open(map, markers[x]);
        }
      })(i, infowindow));
      document.getElementById('list' + i.toString()).addEventListener('mouseout', (function(x, infowindow) {
        return function() {
          markers[x].setAnimation(null);
          infowindow.close();
        }
      })(i, infowindow));
      //add event listener for markers
      markers[i].addListener('mouseover', (function(x, infowindow) { 
        return function() {
          markers[x].setAnimation(google.maps.Animation.BOUNCE);     
          infowindow.open(map, markers[x]);
        };
      })(i, infowindow));
      
      markers[i].addListener('mouseout', (function(x, infowindow) {
        return function() {
          markers[x].setAnimation(null);
          infowindow.close();
        }
      })(i, infowindow));
    }
    console.log('%o', categories);
}

//check if an object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function filter(yelpResponse, selectedCategory) {
  filteredYelpResponse.businesses = [];
  var businesses = yelpResponse.businesses;
  for (var i = 0; i < businesses.length; i++) {
    var currBusiness = businesses[i];
    for (var j = 0; j < currBusiness.categories.length; j++) {
      if (currBusiness.categories[j][1] === selectedCategory) {
        filteredYelpResponse.businesses.push(currBusiness);
      }
    }
  }

}


var ViewModel = function() {
    var self = this;
    self.location = ko.observable('San Francisco');
    self.businesses = ko.observableArray();
    self.availableCategories = ko.observableArray();
    self.availableCategories.push(new Category('All', 'all'));
    self.selectedCategory = ko.observable('All');
    self.visibleList = ko.observable(false);
    self.toggleList = function() {
      self.visibleList(!self.visibleList());
    };
   
    self.requestNewPlace = function() {
        yelpRequest(self.location(), self.availableCategories());
        console.log('here here %o', self.availableCategories());
        self.availableCategories.push(new Category('pp', 'ppp'));
    };

    self.categoryChanged = function() {
        //console.log('current category is ' + self.selectedCategory());
        if (self.selectedCategory() === 'All') {
          if (yelpResponse !== null) {
            processYelpResults(yelpResponse);
          }
        } else {
          //clean up filterYelpResponse
          filteredYelpResponse = {};
          var formattedCategory = self.selectedCategory().replace(/\s+/g, '').toLowerCase();
          console.log(formattedCategory);
          filter(yelpResponse, formattedCategory);
          console.log("hello %o", filteredYelpResponse);
          processYelpResults(filteredYelpResponse);
        }
    };

};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);