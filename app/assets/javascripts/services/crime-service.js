app.factory('CrimeService',['$http', 'LocationService', function($http, LocationService){
  
  var CrimeService = {

    getCrimes: function(latitude,longitude){
      return $http.get('https://data.police.uk/api/crimes-street/all-crime?lat='+latitude+'&lng='+longitude);
      $scope.newLocation = false;
      Location.locationForm.$setPristine();
    },

    countCrimes: function(currentLocation,crimes){
      var crimeDistances = [];
      $.each(crimes, function(index,crime){
        var distance = LocationService.getDistance(currentLocation,crime.location)
        crimeDistances.push(distance)
      });
      crimeDistances = _.reject(crimeDistances, function(i){return i>200})
      CrimeService.drawCrimeHistogram(crimeDistances)
    },

    drawCrimeHistogram: function(values){
      d3.select("crimes").clear
      // A formatter for counts.
      var formatCount = d3.format(",.0f");

      var margin = {top: 50, right: 300, bottom: 30, left: 30},
          width = $(window).width() - margin.left - margin.right,
          height = $(window).height()/2 - margin.top - margin.bottom;

      var x = d3.scale.linear()  //defining the xscale
          .domain([0, 200])
          .range([0, width]);

      // Generate a histogram using x uniformly-spaced bins.
      var data = d3.layout.histogram()
          .bins(x.ticks(8))(values);

      var y = d3.scale.linear()
          .domain([0, d3.max(data, function(d) { return d.y; })])
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var svg = d3.select("crimes").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("class","crimes")
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
      
      svg.append("text")
          .attr("y", -20)
          .attr("x", width/2)
          .text(function(d){
            return 'Location Name Will Appear Here'
          })

      svg.append("text")
          .attr("y", height/2)
          .attr("x", width+100)
          .text(function(){
            var numberOfCrimes = values.length;
            return 'Total crimes committed '+numberOfCrimes
          })
    }

  }

  return CrimeService

}]);