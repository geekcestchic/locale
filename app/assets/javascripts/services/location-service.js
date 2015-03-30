app.factory('LocationService',['$http','$q', function($http, $q){
  
  var LocationService = {
    
    getCrimes: function(latitude,longitude){
      return $http.get('https://data.police.uk/api/crimes-street/all-crime?lat='+latitude+'&lng='+longitude);
      $scope.newLocation = false;
      Location.locationForm.$setPristine();
    },
    
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
    
    countCrimes: function(currentLocation,crimes){
      var crimeDistances = [];
      $.each(crimes, function(index,crime){
        var distance = LocationService.getDistance(currentLocation,crime.location)
        crimeDistances.push(distance)
      });
      crimeDistances = _.reject(crimeDistances, function(i){return i>200})
      LocationService.drawHistogram(crimeDistances)
    },

    drawHistogram: function(values){
      // A formatter for counts.
      var formatCount = d3.format(",.0f");

      var margin = {top: 10, right: 30, bottom: 30, left: 30},
          width = 700 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

      var x = d3.scale.linear()  //defining the xscale
          .domain([0, 200])
          .range([0, width]);

      // Generate a histogram using x uniformly-spaced bins.
      var data = d3.layout.histogram()
          .bins(x.ticks(10))(values);

      var y = d3.scale.linear()
          .domain([0, d3.max(data, function(d) { return d.y; })])
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var svg = d3.select("crimes").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var bar = svg.selectAll(".bar")
          .data(data)
        .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      bar.append("rect")
          .attr("x", 1)
          .attr("width", x(data[0].dx) - 1)
          .attr("height", function(d) { return height - y(d.y); });

      bar.append("text")
          .attr("dy", ".75em")
          .attr("y", 6)
          .attr("x", x(data[0].dx) / 2)
          .attr("text-anchor", "middle")
          .text(function(d) { return formatCount(d.y); });

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
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