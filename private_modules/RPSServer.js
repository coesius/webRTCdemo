function init() {
	var io = require('socket.io')();
	var rooms = {};
	var MAXROOM = 1000000;
	function room(id) {
		var result = {
			clients: [],
			gaming: false,
			room_id: id
		};
		result.addPlayer = function(player_info) {
			result.clients.push(player_info);
			result.updatePlayerList();
		};
		result.startGame = function() {
			for (var i = 0; i < result.clients.length; i++) {
				clients[i].client_socket.emit('start_game', {});
			}
			result.gaming = true;
		};
		result.updatePlayerList = function() {
			var list = [];
			for (var i = 0; i < result.clients.length; i++) {
				list.push(result.clients[i].nickname);
			}
			for (var i = 0; i < result.clients.length; i++) {
				result.clients[i].client_socket.emit('update_player_list', list);
			}
		};
		result.removePlayer = function() {

		};
		return result;
	}
	io.on('connection', function(socket) {
		var client_room_id;
		function updateRoomInfo() {
			var roomInfo = {};
			roomInfo.room_id = client_room_id;
			socket.emit('update_room_info', roomInfo);
		};
		socket.on('create_room', function(data) {
			var room_id = Math.floor(Math.random() * MAXROOM) + '';
			rooms[room_id] = room(room_id);
			rooms[room_id].addPlayer({
				client_socket: socket,
				nickname: data.nickname
			});
			client_room_id = room_id;
			updateRoomInfo();
			console.log(rooms);
		});
		socket.on('join_room', function(data) {
			if (typeof(rooms[data.room_id]) == 'undefined') {
				socket.emit('illegal', {error_info: '房间不存在'});
			} else if(rooms[data.room_id].gaming == true) {
				socket.emit('illegal', {error_info: '该房间正在进行游戏'});
			} else {
				rooms[data.room_id].addPlayer({
					client_socket: socket,
					nickname: data.nickname
				});
			}
			client_room_id = data.room_id;
			updateRoomInfo();
		});
		socket.on('disconnect', function() {
			if (!client_room_id) {
				return;
			}
			rooms[client_room_id].clients.splice(client_room_id, 1);
			if (rooms[client_room_id].clients.length === 0) {
				delete rooms[client_room_id];
			}
		});
	});
	io.listen(8002);
}

module.exports = init;