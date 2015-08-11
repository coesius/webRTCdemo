angular.module('RPS', ['ui.bootstrap']);
var host = window.location.hostname;
var socket = io(host + ":8002");

angular.module('RPS').controller('loginCtrl', ['$scope', '$modalInstance', function($scope, $modalInstance) {
	$scope.create_room = function() {
		socket.emit('create_room', {
			nickname: ($scope.nickname ? $scope.nickname : '匿名玩家')
		});
	}

	$scope.join = function() {
		if ($scope.room_id == '') {
			$scope.create_room();
		} else {
			socket.emit('join_room', {
				room_id: $scope.room_id,
				nickname: ($scope.nickname ? $scope.nickname : '匿名玩家')
			});
		}
		$modalInstance.close();
	}
}]);

angular.module('RPS').controller('gameCtrl', ['$scope', "$modal", function($scope, $modal) {
	var modalInstance = $modal.open({
		templateUrl: 'rock-paper-scissors/login',
		controller: 'loginCtrl',
		size: 'sm',
		backdrop: 'static'
	});
	socket.on('update_player_list', function(data) {
		$scope.playerList = data;
	});
	socket.on('update_room_info', function(data) {
		$scope.room_id = data.room_id;
	});
}]);