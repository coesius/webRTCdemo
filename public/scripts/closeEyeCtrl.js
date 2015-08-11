angular.module('closeeye', ['ui.bootstrap']);
var host = window.location.hostname;
var socket = io(host + ":8003");

angular.module('closeeye').controller('joinCtrl', ['$scope', '$modalInstance', 'playerList', function($scope, $modalInstance, playerList) {
	$scope.playerList = playerList;
	$scope.pickPlayer = function(playerID) {
		socket.emit('pickPlayer', {id: playerID});
		$modalInstance.close();
	}
}]);

angular.module('closeeye').controller('createCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.playerList = [];
	$scope.changePlayerNum = function() {
		if ($scope.playerNum > $scope.playerList.length) {
			while($scope.playerList.length < $scope.playerNum) {
				$scope.playerList.push('');
			}
		} else {
			$scope.playerList.splice($scope.playerNum, $scope.playerList.length - $scope.playerNum);
		}
	};
	$scope.create_room = function() {
		socket.emit('create_room', {
			playerNum: $scope.playerNum,
			policeNum: $scope.policeNum,
			killerNum: $scope.killerNum,
			doctor: $scope.doctor,
			sniper: $scope.sniper,
			playerList: $scope.playerList
		});
		$modalInstance.close();
	};
}]);

angular.module('closeeye').controller('gameCtrl', ['$scope', "$modal", function($scope, $modal) {
	socket.on('create_room', function(data) {
		var modalInstance = $modal.open({
			templateUrl: 'closeeye/create-game',
			controller: 'createCtrl',
			size: 'sm',
			backdrop: 'static'
		});
	});
	socket.on('select_player', function(data) {
		var modalInstance = $modal.open({
			templateUrl: 'closeeye/pick-player',
			controller: 'joinCtrl',
			size: 'sm',
			backdrop: 'static',
			resolve: {
				playerList: function() {
					return data;
				}
			}
		});
		console.log(data);
	});
	socket.on('alert', function(data) {
		alert(data.message);
	});
	socket.on('restart', function(data) {
		socket.disconnect();
	});
}]);