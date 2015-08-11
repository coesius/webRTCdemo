function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var characterName = {
	killer: '杀手',
	police: '警察',
	civilian: '平民',
	doctor: '医生',
	sniper: '狙击手'
};

var instruction = {
	killer: '在夜晚使用你的选人界面选择你要杀的人',
	police: '在夜晚使用你的选人界面选择你要查身份的人',
	civilian: '在夜晚你的选人界面并没有什么卵用',
	doctor: '在夜晚使用你的选人界面选择你要扎的人',
	sniper: '在夜晚使用你的选人界面选择你要狙击的人'
};

function init() {
	var io = require('socket.io')();
	var game = {
		state: 'closed',
		nightStart: function() {

		},
		nightEnd: function() {

		},
		dayStart: function() {

		},
		dayEnd: function() {

		}
	};
	io.on('connection', function(socket) {
		var playerBinding;
		if (game.state === 'closed') {
			socket.emit('create_room', {});
		} else if (game.state === 'waiting') {
			socket.emit('select_player', game.playerList);
		}
		socket.on('create_room', function(data) {
			game.playerNum = data.playerNum;
			game.policeNum =  data.policeNum;
			game.killerNum = data.killerNum;
			game.doctor = data.doctor;
			game.sniper = data.sniper;
			game.playerList = data.playerList;
			game.playerPickState = [];
			for (var i = 0; i < game.playerList.length; i++) {
				game.playerList[i].picked = false;
			}
			game.civilianNum = game.playerNum - game.policeNum - game.killerNum;
			if (game.doctor) {
				game.civilianNum--;
			}
			if (game.sniper) {
				game.civilianNum--;
			}
			var characterList = [];
			for (var i = 0; i < game.policeNum; i++) {
				characterList.push('police');
			}
			for (var i = 0; i < game.killerNum; i++) {
				characterList.push('killer');
			}
			for (var i = 0; i < game.civilianNum; i++) {
				characterList.push('civilian');
			}
			if (game.doctor) {
				characterList.push('doctor');
			}
			if (game.sniper) {
				characterList.push('sniper');
			}
			shuffle(characterList);
			for (var i = 0; i < game.playerNum; i++) {
				game.playerList[i].charcater = characterList[i];
			}
			game.state = 'waiting';
			socket.emit('select_player', game.playerList);
		});
		socket.on('pickPlayer', function(data) {
			playerBinding = game.playerList[data.id];
			playerBinding.picked = true;
			var welcomeMessage = '你的身份是：' + characterName[playerBinding.charcater] + '，' + instruction[playerBinding.charcater];
			if (playerBinding.charcater === 'police') {
				var policeList = '';
				for (var i = 0; i < game.playerList.length; i++) {
					if (game.playerList[i].charcater === 'police') {
						policeList += game.playerList[i].nickname + ' ';
					}
				}
				welcomeMessage += '，这场游戏中 ' + policeList + '是警察';
			}
			if (playerBinding.charcater === 'killer') {
				var killerList = '';
				for (var i = 0; i < game.playerList.length; i++) {
					if (game.playerList[i].charcater === 'killer') {
						killerList += game.playerList[i].nickname + ' ';
					}
				}
				welcomeMessage += '，这场游戏中 ' + killerList + '是杀手';
			}
			socket.emit('alert', {message: welcomeMessage})
			var allPicked = true;
			for (var i = 0; i < game.playerList.length; i++) {
				allPicked &= game.playerList[i].picked;
			}
			if (allPicked) {
				game.state = 'gaming';
				game.nightStart();
			}
		});
		socket.on('disconnect', function() {
			if (game.state !== 'closed' && game.state !== 'waiting') {
				io.emit('alert', {message: '有人断开连接，游戏结束，想重新开始请刷新页面'});
				io.emit('restart', {});
				game.state = 'closed';
			} else if (game.state === 'waiting' && playerBinding) {
				playerBinding.picked = false;
			}
		});
	});
	io.listen(8003);
}

module.exports = init;