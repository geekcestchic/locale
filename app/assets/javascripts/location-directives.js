app.directive('crimes',function(){
  return{
    restrict:'E',
    templateUrl: 'assets/crime-graph.html',
    transclude:true,
    controller:function(){
    }
  }
})

app.directive('stations',function(){
  return{
    restrict:'E',
    templateUrl: 'assets/closest-stations.html'
  }
})

app.directive('propertyPrices',function(){
  return{
    restrict:'E',
    templateUrl: 'assets/property-prices.html'
  }
})

