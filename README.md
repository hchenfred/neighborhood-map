
============================
### Getting started

####Part 1: Optimize PageSpeed Insights score for index.html

1. Check out the repository
1. To inspect the site on your phone, you can run a local server

  ```bash
  $> cd /path/to/your-project-folder
  $> python -m SimpleHTTPServer 8080
  ```

1. Open a browser and visit localhost:8080
1. Download and install [ngrok](https://ngrok.com/) to the top-level of your project directory to make your local server accessible remotely.

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

### Challenge Faced
* How to organize code (Google Map, Yelp API and knockout should be separated)
* How to decide which variables are in knockout viewMode? Think about whether the variable has interactions with DOM element
* Set eventlistener in a for loop (use JavaScript closure)

### Second Submission
* add favicon



