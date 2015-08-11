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

var characterData = {
	killer: {
		name: '杀手',
		instruction: '在夜晚使用你的选人界面选择你要杀的人',
		teamname: '坏人'
	},
	police: {
		name: '警察',
		instruction: '在夜晚使用你的选人界面选择你要查身份的人',
		teamname: '好人'
	},
	civilian: {
		name: '平民',
		instruction: '在夜晚你的选人界面并没有什么卵用',
		teamname: '好人'
	},
	doctor: {
		name: '医生',
		instruction: '在夜晚使用你的选人界面选择你要扎针的人',
		teamname: '好人'
	},
	sniper: {
		name: '狙击手',
		instruction: '在夜晚使用你的选人界面选择你要狙击的人',
		teamname: '坏人'
	}
};

var TURNINTERVAL = 240000;

function checkEnd(game) {
	var totalAlived = 0;
	for (var i = 0; i < game.playerNum; i++) {
		if (game.playerList[i].alive) {
			totalAlived++;
		}
	}
	var killerAlived = 0;
	for (var i = 0; i < game.playerNum; i++) {
		if (game.playerList[i].alive && game.playerList[i].charcater === 'killer') {
			killerAlived++;
		}
	}
	if (killerAlived === 0) {
		return {
			reason: '杀手全部死亡',
			winner: '好人方'
		};
	} else if (killerAlived >= totalAlived / 2) {
		return {
			reason: '杀手超过总人数一半',
			winner: '坏人方'
		};
	}
	var civilianAllDead = true;
	for (var i = 0; i < game.playerNum; i++) {
		if (game.playerList[i].alive && game.playerList[i].charcater === 'civilian') {
			civilianAllDead = false;
			break;
		}
	}
	if (civilianAllDead) {
		return {
			reason: '平民全部死亡',
			winner: '坏人方'
		};
	}
	var policeAndDoctorAllDead = true;
	for (var i = 0; i < game.playerNum; i++) {
		if (game.playerList[i].alive && (game.playerList[i].charcater === 'police' || game.playerList[i].charcater === 'doctor')) {
			policeAndDoctorAllDead = false;
			break;
		}
	}
	if (policeAndDoctorAllDead) {
		return {
			reason: '警察医生全部死亡',
			winner: '坏人方'
		};
	}
	return false;
}

function getClientPlayerList(playerList) {
	var clientPlayerList = [];
	for (var i = 0; i < playerList.length; i++) {
		clientPlayerList.push({
			nickname: playerList[i].nickname,
			picked: playerList[i].picked,
			alive: playerList[i].alive
		});
	}
	return clientPlayerList;
}

function init() {
	var io = require('socket.io')();
	var game = {
		state: 'closed',
	};

	game.nightStart = function() {
		io.emit('log', {message: '夜晚开始'});
		for (var i = 0; i < game.playerNum; i++) {
			game.playerList[i].target = -1;
		}
		setTimeout(game.nightEnd, TURNINTERVAL);
	};
	game.nightEnd = function() {
		var policeTarget = -1;
		for (var i = 0; i < game.playerNum; i++) {
			if (game.playerList[i].charcater === 'police' && game.playerList[i].alive) {
				if (game.playerList[i].target === -1) {
					policeTarget = -1;
					break;
				} else if (policeTarget === -1) {
					policeTarget = game.playerList[i].target;
				} else if (policeTarget !== game.playerList[i].target) {
					policeTarget = -1;
					break;
				}
			}
		}
		if (policeTarget === -1) {
			for (var i = 0; i < game.playerNum; i++) {
				if (game.playerList[i].charcater === 'police') {
					game.playerList[i].socket.emit('log', {message: '由于有人没选或者选人不统一，今晚没有查人'});
				}
			}
		} else {
			for (var i = 0; i < game.playerNum; i++) {
				if (game.playerList[i].charcater === 'police') {
					game.playerList[i].socket.emit('log', {message: '今晚被查的人是：' + game.playerList[policeTarget].nickname + '\n他是' + characterData[game.playerList[policeTarget].charcater].teamname});
				}
			}
		}

		var killerTarget = -1;
		for (var i = 0; i < game.playerNum; i++) {
			if (game.playerList[i].charcater === 'killer' && game.playerList[i].alive) {
				if (game.playerList[i].target === -1) {
					killerTarget = -1;
					break;
				} else if (killerTarget === -1) {
					killerTarget = game.playerList[i].target;
				} else if (killerTarget !== game.playerList[i].target) {
					killerTarget = -1;
					break;
				}
			}
		}
		if (policeTarget === -1) {
			for (var i = 0; i < game.playerNum; i++) {
				if (game.playerList[i].charcater === 'killer') {
					game.playerList[i].socket.emit('log', {message: '由于有人没选或者选人不统一，今晚没有杀人'});
				}
			}
		}

		var sniperTarget = -1;
		for (var i = 0; i < game.playerNum; i++) {
			if (game.playerList[i].charcater === 'sniper' && game.playerList[i].alive) {
				sniperTarget = game.playerList[i].target;
			}
		}

		var doctorTarget = -1;
		for (var i = 0; i < game.playerNum; i++) {
			if (game.playerList[i].charcater === 'doctor' && game.playerList[i].alive) {
				doctorTarget = game.playerList[i].target;
			}
		}

		var log = '';
		var deadList = [];
		if (killerTarget !== doctorTarget && killerTarget !== -1) {
			deadList.push(game.playerList[killerTarget]);
		}
		if (sniperTarget !== doctorTarget && sniperTarget !== killerTarget && sniperTarget !== -1) {
			deadList.push(game.playerList[sniperTarget]);
		}
		if (doctorTarget !== killerTarget && doctorTarget !== sniperTarget) {
			game.playerList[doctorTarget].shot++;
			if (game.playerList[doctorTarget].shot == 2) {
				deadList.push(game.playerList[doctorTarget]);
			}
		}
		if (deadList.length === 0) {
			log = '今晚没有人死亡';
		} else {
			log = '今晚 ';
			for (var i = 0; i < deadList.length; i++) {
				deadList[i].alive = false;
				log += deadList[i].nickname + '（' + characterData[deadList[i].charcater].teamname + '）' + ' ';
			}
			log += '死了';
		}
		io.emit('log', {message: log});
		io.emit('update_player_list', getClientPlayerList(game.playerList));



		var result = checkEnd(game);
		if (!result) {
			game.dayStart();
		} else {
			io.emit('alert', {message: '游戏结束，' + result.reason + '，' + result.winner + '胜利。想要再开一局请刷新页面'});
			io.emit('restart', {});
		}
	};

	game.dayStart = function() {
		io.emit('log', {message: '白天开始'});
		for (var i = 0; i < game.playerNum; i++) {
			game.playerList[i].target = -1;
		}
		setTimeout(game.dayEnd, TURNINTERVAL);
	};
	game.dayEnd = function() {
		var voted = [];
		for (var i = 0; i < game.playerNum; i++) {
			voted.push(0);
		}
		for (var i = 0; i < game.playerNum; i++) {
			if (game.playerList[i].target !== -1) {
				voted[game.playerList[i].target]++;
			}
		}
		var highestVote = 0;
		for (var i = 0; i < game.playerNum; i++) {
			if (voted[i] > voted[highestVote]) {
				highestVote = i;
			}
		}
		for (var i = 0; i < game.playerNum; i++) {
			if (voted[i] === voted[highestVote] && i !== highestVote) {
				highestVote = -1;
			}
		}
		var voteInfo = '投票情况：\n';
		for (var i = 0; i < game.playerNum; i++) {
			if (game.playerList[i].target !== -1) {
				voteInfo += game.playerList[i].nickname + '：' + game.playerList[game.playerList[i].target].nickname + '\n';
			} else {
				voteInfo += game.playerList[i].nickname + '：弃权\n';
			}
		}
		io.emit('alert', {message: voteInfo});
		if (highestVote === -1) {
			io.emit('log', {message: '平票，没有人被投死'})
		} else {
			game.playerList[highestVote].alive = false;
			io.emit('log', {message: game.playerList[highestVote].nickname + '被投死了，他是' + characterData[game.playerList[highestVote].charcater].teamname});
		}
		io.emit('update_player_list', getClientPlayerList(game.playerList));

		var result = checkEnd(game);
		if (!result) {
			game.nightStart();
		} else {
			io.emit('alert', {message: '游戏结束，' + result.reason + '，' + result.winner + '胜利。想要再开一局请刷新页面'});
			io.emit('restart', {});
		}
	};

	io.on('connection', function(socket) {
		var playerBinding;
		if (game.state === 'closed') {
			socket.emit('create_room', {});
			game.state = 'setting';
		} else if (game.state === 'waiting') {
			socket.emit('select_player', getClientPlayerList(game.playerList));
		} else if (game.state === 'setting') {
			socket.emit('alert', {message: '有人正在配置游戏，请稍后刷新加入'});
			socket.disconnect();
		} else if (game.state === 'gaming') {
			socket.emit('alert', {message: '游戏正在进行，请稍后刷新加入'});
			socket.disconnect();
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
				game.playerList[i].alive = true;
				game.playerList[i].shot = 0;
				game.playerList[i].socket = socket;
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
			socket.emit('select_player', getClientPlayerList(game.playerList));
		});
		socket.on('pickPlayer', function(data) {
			playerBinding = game.playerList[data.id];
			playerBinding.picked = true;
			var welcomeMessage = '你的身份是：' + characterData[playerBinding.charcater].name + '，' + characterData[playerBinding.charcater].instruction;
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
				io.emit('gaming', getClientPlayerList(game.playerList));
				game.nightStart();
			}
		});
		socket.on('targetPlayer', function(data) {
			playerBinding.target = data.id;
		});
		socket.on('restart', function() {
			io.emit('alert', {message: '有人点击了重新开始，请刷新页面'});
			io.emit('restart', {});
			game.state = 'closed';
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