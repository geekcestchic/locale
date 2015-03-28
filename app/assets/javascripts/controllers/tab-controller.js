app.controller('TabController', function(){
  this.tab = 1;
  this.isSet = function(checkTab){
    this.tab === checkTab;
  };
  this.setTab = function(setTab){
    this.tab = setTab;
    console.log('set to tab '+ setTab)
  };
});