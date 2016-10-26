
============================
### Getting started

1. Check out the repository
1. To inspect the site on your phone or desktop browser, you can run a local server

  ```bash
  $> cd /path/to/your-project-folder
  $> python -m SimpleHTTPServer 8080
  ```

1. Open a browser and visit localhost:8080

### Instructions
* Enter the address where you would like to search your lunch places.
The app lists 20 places to eat around the address that your entered.
* When your mouse hovers over a place on Google Map, an informaiton window will pop up showing the information of the place. 
* When you click a list item from the list view on the left, the information window from the corresponding marker on Google Map will pop up.
* You could choose a category from the pull down list.


### Development Steps

* add a search box using Google Place API. [link](https://developers.google.com/maps/documentation/javascript/examples/places-searchbox)
* add Yelp search API. 
* add an input element to allow users to enter a location used for Yelp search. location is a knockout observable.
* enable autocomplete with Google Place Autocomplete API. [link](https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete)
* add markers on Google Map using the results from Yelp search.
* show info window on markers with "mouseover" and "mouseout" event listener


### Things Learned
* To include "libraires=places"
```
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyChkGJbVaG7HZWDAiSsyXe_7mupndlvMyU&libraries=places&callback=initMap"
    async defer></script>
```
* To use a knockout observable, it should be used like a function. For example, instead of this.location, this.location() should be used.
* To assign observable a value, must use ko.observable(valueToBeAssigned)
* Use closure to handle markers event listener
* knockout framework does not need event listener, it uses data binding instead
* create a toggle menu using knockout "data-bind="visiable: "
* You can declare one instance of the InfoWindow object in the outer scope instead, initialize it inside map initialization function and:
Use infowindow.setContent method to assign location specific details to infowindow when a marker is activated
Use infowindow.open method to open infowindow for the active marker.
Note that with this solution, app will also be able to avoid multiple infowindows from being opened, which is not a very good UX feature.
* To make sure there is only one animated marker and one information window on a marker showing up at the same time, we can define a global variable called currMarker and one called infoWindow. Add an event listener to the infoWindow, when it is clickClosed, stop the animation of current marker. 

### Challenge Faced
* How to organize code (Google Map, Yelp API and knockout should be separated)
* How to decide which variables are in knockout viewMode? Think about whether the variable has interactions with DOM element
* Set eventlistener in a for loop (use JavaScript closure)

### Second Submission
* add favicon



