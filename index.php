<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Map Helpster</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open%20Sans">
  <link rel="stylesheet" href="app.css">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div class="container" 
    ng-app="helpsterApp"
    ng-controller="MapCtrl as vm">
    <h1>Helpster > Map</h1>
    <helpster-map lat="vm.locationName"></helpster-map>
    <form ng-submit="vm.searchFn()">
      <input 
        type="text" 
        placeholder="Cari Lokasi" 
        ng-model="vm.locationName">
    </form>
    <div 
      v-if="vm.status" 
      class="message" 
      ng-class="{error: vm.status === 400, success: vm.status === 200 }">
      {{vm.message}}
    </div>
  </div>
  <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAd1xMYT1bt99qtFWQEzXiRBvORDWHgPtk&libraries=places"></script>
  <script src="node_modules/angular/angular.js"></script>
  <script src="app.js"></script>
</body>
</html>