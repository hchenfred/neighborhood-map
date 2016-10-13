//** Model **//
var map;

//** ViewModel **//
var initMap = function() {
       // TODO: use a constructor to create a new map JS object. You can use the coordinates
       // we used, 40.7413549, -73.99802439999996 or your own!
          map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 37.7779436, lng: -122.4152976},  
          zoom: 14
        });

          // Create the search box and link it to the UI element.
        var input = document.getElementById('places-search');
        console.log(input);
        var searchBox = new google.maps.places.SearchBox(input);
        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });

        var markers = [];
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
          var places = searchBox.getPlaces();
          console.log(places);

          if (places.length == 0) {
            return;
          }

          // Clear out the old markers.
          markers.forEach(function(marker) {
            marker.setMap(null);
          });
          markers = [];

          // For each place, get the icon, name and location.
          var bounds = new google.maps.LatLngBounds();
          places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
              map: map,
              icon: icon,
              title: place.name,
              position: place.geometry.location
            }));

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
        });	        
};

var yelpRequest = function() {
	/**
	 * Generates a random number and returns it as a string for OAuthentication
	 * @return {string}
	 */

	function nonce_generate() {
	  return (Math.floor(Math.random() * 1e12).toString());
	}

	var yelp_url = 'https://api.yelp.com/v2/search?';

	  var parameters = {
	    term: 'food',
	    location: 'san francisco',
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
	      // Do stuff with results
	      console.log("SUCCCESS! %o", results);
	    },
	    error: function(error) {
	      // Do stuff on fail
	      console.log(error);
	    }
	  };

	// Send AJAX query via jQuery library.
	$.ajax(settings);
};

yelpRequest();

var ViewModel = function() {
    var self = this;
   




};

ko.applyBindings(new ViewModel());