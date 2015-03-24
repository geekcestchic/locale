app.factory('LocationService', function($http, $q){
  
  var LocationService = {
    
    getCrimes: function(latitude,longitude){
      return $http.get('http://data.police.uk/api/crimes-street/all-crime?lat='+latitude+'&lng='+longitude);
    },
    
    codeAddress: function(address){
      var deferred = $q.defer();
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {

          // map.setCenter(results[0].geometry.location);

          // var marker = new google.maps.Marker({
          //   map: map,
          //   position: results[0].geometry.location
          // });

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
      return deferred.promise; //returns the coordinates???
    },
    
    countCrimes: function(currentLocation,crimes){
      var firstRadius = 0;
      var secondRadius = 0;
      var thirdRadius = 0;
      $.each(crimes, function(index,crime){
        var distance = LocationService.getDistance(currentLocation,crime.location)
        if (distance <= 50) firstRadius += 1;
        if (distance > 50 && distance <= 100) secondRadius += 1;
        if (distance > 100 && distance <=200) thirdRadius += 1;
      });
      console.log(firstRadius)
      console.log(secondRadius)
      console.log(thirdRadius)
      LocationService.drawCrimeGraph(firstRadius,secondRadius,thirdRadius)
    },
    
    drawCrimeGraph: function(first,second,third){

      console.log(second*10)
      $('.radius-one').css('height', first*10)
      $('.radius-two').css('height', second*10)
      $('.radius-three').css('height', third*10)

      $('.radius-one').append('<p>'+first+'</p>')
      $('.radius-two').append('<p>'+second+'</p>')
      $('.radius-three').append('<p>'+third+'</p>')

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

});