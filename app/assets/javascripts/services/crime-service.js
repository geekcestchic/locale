app.factory('CrimeService',['$http','LocationService', function($http, LocationService){
  
  var CrimeService = {

    getCrimes: function(latitude,longitude){
      return $http.get('https://data.police.uk/api/crimes-street/all-crime?lat='+latitude+'&lng='+longitude);
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
      //calling the next functions
      CrimeService.drawCrimeHistogram(crimesArray)
      CrimeService.insertYears()
      CrimeService.drawCrimePie(crimesArray)
    },

    insertYears:function(){
      //clearing out the form
      // if ($('crimes').has('.years')?) { $('crimes').removeChild('.years') };
      
      var divElement = '<div class="years">'
      for (var i = 0; i <=5; i++) {
        divElement +='<button id="201'+i+'">201'+i+'</button>'
      }
      divElement += '</div>'
      $(divElement).insertAfter($('crimes').find('.top'))

    },

    drawCrimePie:function(values){
      //formatting data
      var dataset = values;
      var sortedCrimes = _.groupBy(dataset,function(crime){return crime.category})
      var countCrimes = []
      _.each(sortedCrimes,function(crime){
        countCrimes.push({label:crime[0].category,value:crime.length})
      });
      
      var w = $(window).width()/2,                        //width
          h = $(window).height()/2,  
          margin = {
            top:50,
            right:50,
            bottom:50,
            left:100
          },                          //height
          r = h/3,                          //radius
          color = d3.scale.category20c();   //builtin range of colors
          

      var vis = d3.select("crimes")
                .append("svg:svg")              //create the SVG element inside the <body>
                .data([countCrimes])                   //associate our data with the document
                .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
                .attr("height", h)
                .append("svg:g")                //make a group to hold our pie chart
                .attr("transform", "translate(" + (r  + margin.left) + "," + (r  + margin.top) + ")")    //move the center of the pie chart from 0, 0 to radius, radius

      var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
                .outerRadius(r);

      var pie = d3.layout.pie()           //this will create arc data for us given a list of values
                .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array

      var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
                .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
                .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
                .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                .attr("class", "slice")    //allow us to style things in the slices (like text)

        arcs.append("svg:path")
                // .attr("fill","none")
                // .attr("stroke","black")
                // .attr("stroke-dash","black")
                // .attr("stroke-dasharray","3,3")
                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function

        arcs.append("svg:text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = r;
                d.outerRadius = 2 * r;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
                })
                .attr("text-anchor", "middle")                          //center the text on it's origin
                .style("font-size", "12px")
                .style("font-weight","bold")                       //center the text on it's origin
                .text(function(d, i) { 
                  var percentage = Math.round(countCrimes[i].value/values.length * 100);
                  return countCrimes[i].label + ' - '+ percentage + '%'; 
                });        //get the label from our original data array
        console.log(countCrimes.length)
        vis.append("text")
           .attr("y", (h/2))
           .attr("x", -35)
           .text("Types of crime / %")
           // .style("")
        vis.append("text")
           .attr("y", (-h/2)+30)
           .attr("x", -45)
           .text(countCrimes.length + ' different types')
           .style("font-size",20)

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

      var margin = {top: 50, right: 50, bottom: 50, left: 30},
          width = $(window).width()/2 - margin.left - margin.right,
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
          .enter()
          .append("g")
          .attr("class", "bar")
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      bar.append("rect")
          .attr("x", 1)
          .attr("width", x(data[0].dx) - 1)
          .attr("height", function(d) { return height - y(d.y); })
          .attr("fill", function(d){
            var value = height - y(d.y); 
            var scale = value/height;
            return "rgba(224,0,0,"+ scale +")"
          });

      bar.append("text")
          .attr("dy", ".75em")
          .attr("y", 6)
          .attr("x", x(data[0].dx) / 2)
          .attr("text-anchor", "middle")
          .text(function(d) { 
            if (d.y > 0){
              return formatCount(d.y);
            } 
          });

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
      
      svg.append("text")
          .attr("y", -20)
          .attr("x", width/2-margin.right)
          .text(function(d){
            var numberOfCrimes = values.length;
            return numberOfCrimes + ' crimes committed'
          })
          .style("font-size",20)

      svg.append("text")
         .attr("y", height+margin.bottom)
         .attr("x", width / 2 - margin.right)
         .text("Distance from location / m")

    }

  }

  return CrimeService

}]);