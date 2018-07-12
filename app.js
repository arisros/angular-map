// HelpsterApp
(function (angular) {
  'use strict';
  angular.module('helpsterApp', []);
})(angular);

// Controller mainController
(function (angular) {
  'use strict';
  angular
    .module('helpsterApp')
    .controller('MapCtrl', MainController);

  MainController.inject = ['$scope', 'helpsterMapFactory', 'Map'];
  function MainController($scope, helpsterMapFactory, Map) {
    var vm = this;

    vm.locationName = null;
    vm.status = null;
    vm.message = null;

    vm.searchFn = searchFn;
    vm.updateFieldFn = updateFieldFn;
    vm.messageFn = messageFn;

    // listen 'places' , 'found' from helpster-map component
    $scope.$on('places', vm.updateFieldFn);
    $scope.$on('found', vm.messageFn);

    // method search: invoke if need to search
    function searchFn() {
      $scope.$broadcast('searchName', vm.locationName)
    }

    /**
     * 
     * @param {object} e event
     * @param {object} arg status, message(string)
     */
    function updateFieldFn(e, arg) {
      vm.messageFn(e, arg)
      vm.locationName = (arg.status === 200) ? arg.message : vm.locationName
    }

    /**
     * 
     * @param {object} e event
     * @param {object} arg status, message(string)
     */
    function messageFn(e, arg) {
      vm.status = arg.status
      vm.message = arg.message
    }


  }
})(angular);

// Factory helpsterApp
(function (angular) {
  'use strict';
  angular
    .module('helpsterApp')
    .factory('helpsterMapFactory', helpsterMapFactory);

  helpsterMapFactory.$inject = [];
  function helpsterMapFactory() {
    var service = {
      data: {
        apiKey: 'AIzaSyAd1xMYT1bt99qtFWQEzXiRBvORDWHgPtk', // gmaps api key
        options: {
          center: new google.maps.LatLng(-0.789275, 113.92132700000002),
          zoom: 4,
          // disableDefaultUI: true,
          disableDoubleClickZoom: true,
          panControl: false,
          draggableCursor: 'crosshair'
        }
      }
    };

    return service;
  }

})(angular);

(function (angular) {
  'use strict';
  angular
    .module('helpsterApp')
    .directive('helpsterMap', helpsterMap);
  helpsterMap.$inject = ['helpsterMapFactory'];
  function helpsterMap(helpsterMapFactory) {
    return {
      restrict: 'E',
      controller: 'helpsterMapController',
      controllerAs: 'hm',
      template: '<div class="helpster-map" id="helpster-map"><div/>',
      scope: {
        lat: '='
      },
      bindToController: true
    };
  }
})(angular);


(function (angular) {
  'use strict';
  angular
    .module('helpsterApp')
    .controller('helpsterMapController', helpsterMapController);
  helpsterMapController.$inject = ['$scope', 'helpsterMapFactory', 'Map'];
  function helpsterMapController($scope, helpsterMapFactory, Map) {
    var vm = this;
    vm.map = helpsterMapFactory.data.map
    vm.places = helpsterMapFactory.data.places
    vm.options = helpsterMapFactory.data.options

    // init map
    vm.map = new google.maps.Map(
      document.getElementById("helpster-map"), vm.options
    );
    // init places for searchText
    vm.places = new google.maps.places.PlacesService(vm.map);

    // listen map clicked -> addMarker & findLatLng address
    vm.map.addListener('click', function (e) {
      Map.addMarker(vm.map, e.latLng);
      Map.findLatLng(e.latLng)
        .then(res => {
          $scope.$emit('places', { status: 200, message: res.data.results[0].formatted_address});
        })
        .catch(() => {
          $scope.$emit('places', { status: 400, message: 'Data tidak ditemukan'});
        })
    })

    $scope.$on('searchName', function (e, arg) {
      Map.searchText(vm.places, arg)
        .then(e => {
          var latLng = {
            lat: e.geometry.location.lat(),
            lng: e.geometry.location.lng()
          }
          Map.addMarker(vm.map, latLng);
          $scope.$emit('found', { status: 200, message: 'Hasil pencarian: ' + arg });
        })
        .catch(err => {
          console.error(err)
          $scope.$emit('found', {status: 400, message: 'Pencarian tidak ditemukan, coba dengan lokasi lain'});
        })
    })
  }
})(angular);

//  Map Service
(function (angular) {
  'use strict';
  angular
    .module('helpsterApp')
    .service('Map', mapService)

  mapService.$inject = ['$q', '$http', 'helpsterMapFactory']
  function mapService($q, $http, helpsterMapFactory) {
    var vm = this

    return {
      searchText: search,
      findLatLng: find,
      addMarker: addMarker
    }

    /**
     * 
     * @param {object} place 
     * @param {string} str text search
     */
    function search(place, str) {
      var d = $q.defer();
      place.textSearch({ query: str }, function (results, status) {
        if (status == 'OK') {
          d.resolve(results[0]);
        }
        else d.reject(status);
      });
      return d.promise;
    }

    /**
     * 
     * @param {object} latlng by google
     */
    function find(latlng) {
      var d = $q.defer();
      var endpoint = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' + latlng.lat() + ',' + latlng.lng() + '&key=' + helpsterMapFactory.data.apiKey
      $http({
        method: 'GET',
        url: endpoint
      }).then(function successCallback(res) {
        if (res.status === 200) {
          d.resolve(res)
        } else {
          d.reject(status)
        }
      });
      return d.promise
    }

    /**
     * 
     * @param {object} map google
     * @param {object} position : lat,lng
     */
    function addMarker(map, position) {
      if (map.markers) map.markers.setMap(null);
      map.markers = new google.maps.Marker({
        map: map,
        position: position,
        animation: google.maps.Animation.DROP
      });
      map.setCenter(position);
    }
  }


})(angular);
