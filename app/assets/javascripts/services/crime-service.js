app.factory('CrimeService',['$http', 'LocationService', function($http, LocationService){
  
  var CrimeService = {

    getCrimes: function(latitude,longitude){
      return $http.get('https://data.police.uk/api/crimes-street/all-crime?lat='+latitude+'&lng='+longitude);
      $scope.newLocation = false;
      Location.locationForm.$setPristine();
    },

    countCrimes: function(currentLocation,crimes){
      var crimesArray = [];
      $.each(crimes, function(index,crime){
        var crimeData = {
          distance: LocationService.getDistance(currentLocation,crime.location),
          category: crime.category
        }
        crimesArray.push(crimeData)
      });
      crimesArray = _.reject(crimesArray, function(i){return i.distance>200})
      CrimeService.drawCrimeHistogram(crimesArray)
      CrimeService.drawCrimePie(crimesArray)
    },

    drawCrimePie:function(values){
      //formatting data
      var dataset = values;
      var sortedCrimes = _.groupBy(values,function(crime){return crime.category})
      var countCrimes = []
      _.each(sortedCrimes,function(key,value){
        countCrimes.push({label:key[0].category,value:value.length})
      });
      
      var w = 300,                        //width
          h = 300,                            //height
          r = 100,                            //radius
          color = d3.scale.category20c();     //builtin range of colors

      var vis = d3.select("crimes")
                .append("svg:svg")              //create the SVG element inside the <body>
                .data([countCrimes])                   //associate our data with the document
                .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
                .attr("height", h)
                .append("svg:g")                //make a group to hold our pie chart
                .attr("transform", "translate(" + r + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius

      var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
                .outerRadius(r);

      var pie = d3.layout.pie()           //this will create arc data for us given a list of values
                .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array

      var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
                .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
                .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
                .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice");    //allow us to style things in the slices (like text)

        arcs.append("svg:path")
                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
                })
                .attr("text-anchor", "middle")                          //center the text on it's origin
                .style("font-size", "8px")                          //center the text on it's origin
                .text(function(d, i) { return countCrimes[i].label; });        //get the label from our original data array
    },

    drawCrimeHistogram: function(values){
      var crimeDistances = []
      //reformatting into an array, which is what this frequency histogram takes as an input
      $.each(values,function(index,crime){
        crimeDistances.push(crime.distance)
      });
      d3.select("crimes").clear //shite, this isn't working
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
          .bins(x.ticks(8))(crimeDistances);

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
            var numberOfCrimes = crimeDistances.length;
            return 'Total crimes committed '+numberOfCrimes
          })

    }

  }

  return CrimeService

}]);