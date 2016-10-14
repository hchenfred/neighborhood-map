
============================

## Development Steps

* add a search box using Google Place API. [link](https://developers.google.com/maps/documentation/javascript/examples/places-searchbox)
* add Yelp search API. 
* add an input element to allow users to enter a location used for Yelp search. location is a knockout observable.
* enable autocomplete with Google Place Autocomplete API. [link](https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete)
* add markers on Google Map using the results from Yelp search.





## Things Learned

# Google Places API

* To include "libraires=places"
```
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyChkGJbVaG7HZWDAiSsyXe_7mupndlvMyU&libraries=places&callback=initMap"
    async defer></script>
```
* To use a knockout observable, it should be used like a function. For example, instead of this.location, this.location() should be used.

* To assign observable a value, must use ko.observable(valueToBeAssigned)