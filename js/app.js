var map;
var place = {};
var yelpResponse = {};
var filteredYelpResponse = {};
var Category = function(name, yelp) {
  this.categoryName = name;
  this.categoryUsedForYelp = yelp;
};
var Restaurant = function(index, businesses, marker, contentString, infowindow) {
  this.index = index;
  this.businesses = businesses;
  this.marker = marker;
  this.contentString = contentString;
  this.infowindow = infowindow;
} ;
var ViewModel = function() {
    var self = this;
    self.location = ko.observable('San Francisco');
    self.businesses = ko.observableArray();
    self.availableCategories = ko.observableArray();
    self.availableCategories.push(new Category('All', 'all'));
    self.selectedCategory = ko.observable(new Category('All', 'all'));
    self.visibleList = ko.observable(false);
    self.restaurants = ko.observableArray();
    self.toggleList = function() {
      self.visibleList(!self.visibleList());
    };

    self.clickListItem = function(restaurant) {
      var marker = restaurant.marker;
      var infowindow = restaurant.infowindow;

      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
        infowindow.close();
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        infowindow.open(map, restaurant.marker);
      }
    };

   
    self.requestNewPlace = function() {
      yelpRequest(self.location(), self.availableCategories, self.restaurants);
        //console.log('here here %o', self.availableCategories());
    };

    self.categoryChanged = function() {
      if (self.selectedCategory() === 'All') {
        if (yelpResponse !== null) {
          processYelpResults(yelpResponse);
        }
      } else {
        //clean up filterYelpResponse
        filteredYelpResponse = {};
        var currCategory = self.selectedCategory().categoryUsedForYelp;
        console.log('selected category is ' + currCategory);
        filter(self.restaurants(), currCategory);
        
      }
    };
};


var googleError = function() {
  alert('Google Page is not loaded correctly');
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
    });
    var viewModel = new ViewModel();
    ko.applyBindings(viewModel);
    viewModel.requestNewPlace();
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
    text += '<br/>';
    text += r.location.display_address[0] + '<br/>' + r.location.display_address[1] + ', ' + r.location.display_address[2] + '<br/><br/>';
    text += '</div>';
    return text;
}

// Sets the map on all markers in the array.
function setMapOnAll(map, restaurants) {
  for (var i = 0; i < restaurants.length; i++) {
    restaurants[i].marker.setMap(map);
  }
}

//loc is a knockout observable
//categories is a knockout observable array
function yelpRequest(loc, categories, restaurants, categoryFilter='') {
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
        processYelpResults(results, categories, restaurants);
      },
      error: function(error) {
        alert('Yelp API response error ' + error);
      }
    };

    // Send AJAX query via jQuery library.
    $.ajax(settings);
}


// process response from Yelp 
function processYelpResults(results, categories, restaurants) {
    //remove all markers on the map first
    setMapOnAll(null, restaurants);
    restaurants.removeAll();
    $('#list-view').innerHTML = "";
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
      if (currLocation === null || currLocation === undefined) {
        alert("coordinates for " + currBusiness.name + " is not avaiable, this location is not displayed");
      }
      var coordinates = {lat: currLocation.latitude, lng: currLocation.longitude};
      var marker = new google.maps.Marker({
          map: map,
          icon: pinIcon,
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: coordinates
      });
      //create a card in list-view element
      var contentString = createInfoWindow(currBusiness);
      var infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      var restaurant = new Restaurant(i, currBusiness, marker, contentString, infowindow);
      restaurants.push(restaurant);
      //add event listener for markers
      restaurants()[i].marker.addListener('mouseover', (function(x, infowindow) { 
        return function() {
          restaurants()[x].marker.setAnimation(google.maps.Animation.BOUNCE);     
          infowindow.open(map, restaurants()[x].marker);
        };
      })(i, infowindow));
      
      restaurants()[i].marker.addListener('mouseout', (function(x, infowindow) {
        return function() {
          restaurants()[x].marker.setAnimation(null);
          infowindow.close();
        };
      })(i, infowindow));
    }
}

//check if an object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

//filter list view and markers in Google Maps based on user selected category
function filter(restaurants, currCategory) {
  //before each filter, first remove previous filter
  for (var i = 0; i < restaurants.length; i++) {
    $('#list'+i.toString()).show();
    restaurants[i].marker.setMap(map);
  }

  if (currCategory === 'all') {
    return;
  }

  for (var i = 0; i < restaurants.length; i++) {
    var hide = true;
    var restaurant = restaurants[i];
    var categories = restaurant.businesses.categories;
    for (var j = 0; j < categories.length; j++) {
      if (categories[j][1] === currCategory) {
        hide = false;
      }
    }
    if (hide) {
      restaurant.marker.setMap(null);
      $('#list'+i.toString()).hide();
    } else {
      restaurant.marker.setMap(map);
    }
    hide = true;
  }
}









