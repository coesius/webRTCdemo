angular.module('closeeye', ['ui.bootstrap']);
var host = window.location.hostname;
var socket = io(host + ':8003');
var log = '';
var playerList = [];

function restart() {
	socket.emit('restart', {});
}

angular.module('closeeye').controller('joinCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.playerList = playerList;
	$scope.pickPlayer = function(playerID) {
		socket.emit('pickPlayer', {id: playerID});
		$modalInstance.close();
	};
	$scope.restart = restart;
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
	$scope.restart = restart;
}]);


angular.module('closeeye').controller('gamingCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.playerList = playerList;
	$scope.targetPlayer = function(playerID) {
		socket.emit('targetPlayer', {id: playerID});
	};
	$scope.restart = restart;
	$scope.showLog = function() {
		alert(log);
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
		playerList = data;
		var modalInstance = $modal.open({
			templateUrl: 'closeeye/pick-player',
			controller: 'joinCtrl',
			size: 'sm',
			backdrop: 'static'
		});
	});
	socket.on('gaming', function(data) {
		playerList = data;
		var modalInstance = $modal.open({
			templateUrl: 'closeeye/closeeye-gaming',
			controller: 'gamingCtrl',
			size:'sm',
			backdrop: 'static'
		});
	});
	socket.on('update_player_list', function(data) {
		playerList = data;
	});
	socket.on('alert', function(data) {
		alert(data.message);
	});
	socket.on('log', function(data) {
		log += data.message + '\n';
		alert(data.message);
	});
	socket.on('restart', function(data) {
		socket.disconnect();
	});
}]);