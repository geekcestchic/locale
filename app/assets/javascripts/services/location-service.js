app.factory('LocationService',['$http','$q', function($http, $q){
  //In this service we:
  //-geocode
  //-reverse-geocode the address
  //-Get competitors
  var LocationService = {
    
    codeAddress: function(address){
      var deferred = $q.defer();
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var coordinates = {
            longitude: results[0].geometry.location.F,
            latitude: results[0].geometry.location.A
          };
          deferred.resolve(coordinates);
        } else {
          deferred.reject();
          alert("Geocode was not successful for the following reason: " + status);
        }
      });
      return deferred.promise; 
    },

    reverseGeocode: function(coordinates){
      var deferred = $q.defer();
      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(coordinates.latitude, coordinates.longitude);
      geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            var location = results[1].formatted_address;
            deferred.resolve(location)
          } else {
            alert('No location found');
          }
        } else {
          deferred.reject();
          alert('Geocoder failed due to: ' + status);
        }   
      });
      return deferred.promise;
    },
    
    getDistance: function(p1, p2) {
      var rad = function(x) {return x * Math.PI / 180;};
      var R = 6378137; // Earth’s mean radius in meter
      var dLat = rad(p2.latitude - p1.latitude);
      var dLong = rad(p2.longitude - p1.longitude);
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rad(p1.latitude)) * Math.cos(rad(p2.latitude)) *
        Math.sin(dLong / 2) * Math.sin(dLong / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = Math.round(R * c);
      return d; // returns the distance in meter
    },

    getCompetitors: function(type,map,latitude,longitude){
      var deferred = $q.defer();
      var currentLocation = new google.maps.LatLng(latitude,longitude);
      var competitors = [];
      var request = {
          location: currentLocation,
          rankBy: google.maps.places.RankBy.DISTANCE,
          types: [type]
        }; 
      service = new google.maps.places.PlacesService(map);

      service.nearbySearch(request, callback);

      function callback(results, status) {
        for (var i = 0; i < 10; i++) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            var stationObject = results[i];
            var formattedCurrentLocation = {
              latitude: latitude,
              longitude: longitude
            };
            competitors[i] = { //formatting our own object, so we can then pass it to calculate the distance
              name: stationObject.name,
              latitude: stationObject.geometry.location.A,
              longitude: stationObject.geometry.location.F  
            };
            competitors[i].distance = getDistance(formattedCurrentLocation, competitors[i]);
          } else {
            deferred.reject(status);
            alert("Could not retrieve competitors for the following reason: " + status);
          }
        } // end for loop
        deferred.resolve(competitors);
        // return competitors;
      } // end of callback func
      return deferred.promise;
    } // end getCompetitors
  }

  return LocationService

}]);