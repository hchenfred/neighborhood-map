//** Model **//
var map;
var place = {};

//** ViewModel **//
var initMap = function() {
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

          var address = '';
          if (place.address_components) {
            address = [
              (place.address_components[0] && place.address_components[0].short_name || ''),
              (place.address_components[1] && place.address_components[1].short_name || ''),
              (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
          }

          infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
          infowindow.open(map, marker);
        });
};

// Sets the map on all markers in the array.
function setMapOnAll(map, markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}


var ViewModel = function() {
    var self = this;
    self.location = ko.observable('San Francisco');
    self.markers = ko.observableArray();
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    self.yelpRequest = function() {
      function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
      }
      //console.log(place);
      if (!isEmpty(place)) {
        console.log("place is not empty");
        self.location = ko.observable(place.formatted_address);
      }
      var yelp_url = 'https://api.yelp.com/v2/search?';
      var parameters = {
        term: 'food',
        location: self.location(),
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
      var pinIcon = new google.maps.MarkerImage(
          "img/food.png",
          null, /* size is determined at runtime */
          null, /* origin is 0,0 */
          null, /* anchor is bottom center of the scaled image */
          new google.maps.Size(40, 40)
      );  


      function createInfoWindow(r) {
        var text = '<div>';
        text += '<a href="' + r.url + '" target="_blank" class="name">' + r.name + '</a><br/>';
        text += '<img class="ratingsimage" src="' + r.rating_img_url + '"/>';
        text += r.review_count + ' Reviews<br/><br/>';
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

      function processYelpResults(results) {
        //remove all markers on the map first
        //setMapOnAll(null);

        setMapOnAll(null, self.markers());
        self.markers.removeAll();
        var businesses = results.businesses;
        for (var i = 0; i < businesses.length; i++) {
          var currBusiness = businesses[i];
          var currLocation = currBusiness.location.coordinate;
          var coordinates = {lat: currLocation.latitude, lng: currLocation.longitude};
          
          var marker = new google.maps.Marker({
              map: map,
              icon: pinIcon,
              draggable: true,
              animation: google.maps.Animation.DROP,
              position: coordinates
          });
          self.markers().push(marker);
          var contentString = createInfoWindow(currBusiness);
          var infowindow = new google.maps.InfoWindow({
            content: contentString
          });
          self.markers()[i].addListener('mouseover', (function(x, infowindow) {          
            return function() {
              infowindow.open(map, self.markers()[x]);
            };
          })(i, infowindow));
          
          self.markers()[i].addListener('mouseout', (function(x, infowindow) {
            return function() {
              infowindow.close();
            }
          })(i, infowindow));
        }
      }

      var settings = {
        url: yelp_url,
        data: parameters,
        cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
        dataType: 'jsonp',
        jsonpCallback: 'cb',
        success: function(results) {
          console.log("SUCCCESS! %o", results);
          processYelpResults(results);
          
        },
        error: function(error) {
          alert('Yelp API response error ' + error);
        }
      };

      // Send AJAX query via jQuery library.
      $.ajax(settings);
    };
};

ko.applyBindings(new ViewModel());