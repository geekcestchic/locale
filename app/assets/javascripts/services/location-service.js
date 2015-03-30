app.factory('LocationService',['$http','$q', function($http, $q){
  
  var LocationService = {
    
    codeAddress: function(address){
      var deferred = $q.defer();
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          var coordinates = {
            longitude: results[0].geometry.location.D,
            latitude: results[0].geometry.location.k
          };
          deferred.resolve(coordinates);
        } else {
          deferred.reject();
          alert("Geocode was not successful for the following reason: " + status);
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
    }

  }

  return LocationService

}]);