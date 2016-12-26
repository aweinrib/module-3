(function () {
'use strict';

angular.module('NarrowItDownApp', [])
.controller('MenuCategoriesController', MenuCategoriesController)
.service('MenuCategoriesService', MenuCategoriesService)
.constant('ApiBasePath', "http://davids-restaurant.herokuapp.com")
.directive('foundItems', FoundItemsDirective);

var deletedItem;
var noHits = false;

function FoundItemsDirective() {
  var ddo = {
    templateUrl: 'foundItems.html',
	restrict: 'AE', 		//E = element, A = attribute, C = class, M = comment
    scope: {
	  items: '<',
      onRemove: '&'
    },
    controller: FoundItemsDirectiveController,
    controllerAs: 'list',
    bindToController: true,
    link: FoundItemsDirectiveLink,
    transclude: true
  };

  return ddo;
}


function FoundItemsDirectiveController() {
	var menu = this;
	// console.log("DirectiveController = ", menu);


	menu.onRemove = function(itemIdex) {
	  // console.log("Remove item ", itemIdex, " from menu");
	  menu.items.splice(itemIdex, 1);
	  deletedItem = true;
	};
	
	
	menu.checkFoundItems = function() {
		// if (menu.items === undefined) {
			// console.log(">>> Undefined menu items")
		// } else {
			// console.log(">>> #Items = ", menu.items.length);
		// };
			
		if (noHits) return true;
		if (menu.items === undefined || deletedItem) 
			return false
		else
			return !(menu.items.length > 0);
	};
};


function FoundItemsDirectiveLink(scope, element, attr, controller) {
	// console.log("Link scope is: ", scope);
	// console.log("Controller instance is: ", controller);
	// console.log("Element is: ", element);
	
	// console.log("Items = ", scope.items);
	// console.log("OnRemove = ", scope.onRemove);
	
	  scope.$watch('list.checkFoundItems()', function (newValue, oldValue) {
		// console.log("Old value: ", oldValue);
		// console.log("New value: ", newValue);

		if (newValue === true) {
		  displayWarning();
		}
		else {
		  removeWarning();
		}

	  });

		
	function displayWarning() {
		var warningElem = element.find("div.error");
		warningElem.slideDown(900);		
	};
	
	function removeWarning() {
		var warningElem = element.find("div.error");
		warningElem.slideUp(900);		
	};	
};



MenuCategoriesController.$inject = ['$scope', 'MenuCategoriesService'];
function MenuCategoriesController($scope, MenuCategoriesService) {
  var menu = this;
  
  menu.search = function() {
	var promise = MenuCategoriesService.getMenuCategories();
	promise.then(function (response) {
		
		if ($scope.searchItem === undefined || $scope.searchItem == "") {
			// console.log(">>>> nothing found");
			noHits = true;
			return;
		}
		
		var filteredCategories = [];
		var upperSearch = $scope.searchItem.toUpperCase();			// Convert to uppercase to do search
		var entireMenu  = response.data;
		
		
		for (var i=0; i < entireMenu.length; i++) {
			var item = entireMenu[i];
			// console.log("Checking item ", item);
			if ( item.name.toUpperCase().indexOf(upperSearch) > -1 ) {
				filteredCategories.push(item);
			};
		};
		menu.categories = filteredCategories;
		deletedItem = false;
		noHits = (menu.categories,length > 0);
		
		// console.log("Entire menu #items = ", entireMenu.length);
		// console.log("Search Term = ", $scope.searchItem);
		// console.log("Original Array contains ", response.data.length, " items.");
		// console.log("Filtered Array contains ", menu.categories.length, " items.");
		// console.log("Menu.categories = ", filteredCategories);
	})
		.catch(function (error) {
		console.log("Something went terribly wrong.");
	});	
  };
  
  menu.removeItem = function(itemIdex) {
	  console.log("Remove item ", itemIdex, " from menu");
	  menu.categories.splice(itemIdex, 1);
  };

  menu.logMenuItems = function (shortName) {
    var promise = MenuCategoriesService.getMenuForCategory(shortName);

    promise.then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    })
  };

}


MenuCategoriesService.$inject = ['$http', 'ApiBasePath'];
function MenuCategoriesService($http, ApiBasePath) {
  var service = this;

  service.getMenuCategories = function () {
    var response = $http({
      method: "GET",
      url: (ApiBasePath + "/categories.json")
    });

    return response;
  };


  service.getMenuForCategory = function (shortName) {
    var response = $http({
      method: "GET",
      url: (ApiBasePath + "/menu_items.json"),
      params: {
        category: shortName
      }
    });

    return response;
  };

}

})();
