app.controller('TabController', ['$scope', function($scope){
  //initial tab will be one
  $scope.tab = 1;
  //boolean which checks which is the current tab
  this.isSet = function(checkTab){
    return $scope.tab === checkTab;
  };
  //function that sets the current tab
  this.setTab = function(setTab){
    $scope.tab = setTab;

    $scope.description = function(){ //not working
      var description;
      if (setTab === 1) {description = "closest competitors in the area";}
      else if (setTab ===2) {description = "within a 200m radius of your location";}
      else if (Tab.isSet(3)) {description = "tube and rail stations ranked by distance";}
      else if (Tab.isSet(4)) {description = "average prices in streets in the area now compared to 7 years ago";}
      return description
    }

  }; 

}]);