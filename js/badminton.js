
var Judge = {
  rule: {
    players: 0,
    serveEachSide: 0,
    style: '',
    winningScore: 0,
  },
  scoreInfo: {
    left: 0,
    right: 0
  },
  serveInfo: {
    side: '',
    position: '',
    serveIndex: -1,
    currentStanding: {
      left: {},
      right: {}
    }
  },
  playerInfo: {
    left: {
      left: 'b',
      right: 'a',
    },
    right: {
      left: '2',
      right: '1'
    }
  },
  playing: false,

  _swapLeftRight: function(side) {
    return (side == 'right' ? 'left' : 'right');
  },
  _swapPlayerStanding: function(playerInfo) {
    return {
      left: playerInfo.right,
      right: playerInfo.left
    };
  },

  setData: function(players, style, winningScore, playerInfo) {
    this.rule.players = players;
    this.rule.style = style;
    this.rule.winningScore = winningScore;
    this.rule.serveEachSide = (style == 'old' ? players : 1);

    this.playerInfo.left.left = playerInfo.left.left;
    this.playerInfo.left.right = playerInfo.left.right;
    this.playerInfo.right.left = playerInfo.right.left;
    this.playerInfo.right.right = playerInfo.right.right;

    this.scoringAlgo = this['scoring_' + style + '_' + players];

    this.reset();
  },
  start: function() {
    this.playing = true;
  },
  reset: function() {
    this.serveInfo.side = '';
    this.serveInfo.position = '';
    ['left', 'right'].forEach(function(side) {
      this.serveInfo.currentStanding[side]['right'] = this.playerInfo[side]['right'];
      this.serveInfo.currentStanding[side]['left'] = this.rule.players > 1 ? this.playerInfo[side]['left'] : '';
    }.bind(this));

    if (this.rule.style == 'old') {
      this.serveInfo.serveIndex = this.rule.players;
    } else {
      this.serveInfo.serveIndex = 1;
    }

    this.playing = false;
    this.scoreInfo.left = this.scoreInfo.right = 0;
    this.updateScore(this.scoreInfo, null, this.playerInfo, null);
  },
  score: function (side) {
    if (!this.playing) {
      return;
    }

    if (this.serveInfo.side == '') {
      this.serveInfo.side = side;
      this.serveInfo.position = 'right';
    } else {
      this.scoringAlgo(side);
    }

    var currentPlayerInfo = this.serveInfo.currentStanding;
    var instruction = 'Side: ' + this.serveInfo.side +
      ', Position: ' + this.serveInfo.position +
      ', Player: ' + currentPlayerInfo[this.serveInfo.side][this.serveInfo.position] +
      ', Serve: ' + this.serveInfo.serveIndex;

    this.updateScore(this.scoreInfo,
                     this.serveInfo,
                     currentPlayerInfo,
                     instruction);
  },

  scoring_old_2: function (side) {
    this.serveInfo.position = this._swapLeftRight(this.serveInfo.position);
    if (side == this.serveInfo.side) {
      this.scoreInfo[side]++;
      this.serveInfo.currentStanding[this.serveInfo.side] =
        this._swapPlayerStanding(this.serveInfo.currentStanding[this.serveInfo.side]);
    } else {
      this.serveInfo.serveIndex++;
      if (this.serveInfo.serveIndex > this.rule.serveEachSide) {
        this.serveInfo.side = this._swapLeftRight(this.serveInfo.side);
        this.serveInfo.position = 'right';
        this.serveInfo.serveIndex = 1;
      }
    }
  },
  scoring_old_1: function (side) {
    if (side == this.serveInfo.side) {
      this.scoreInfo[side]++;
      this.serveInfo.position = this._swapLeftRight(this.serveInfo.position);
    } else {
      this.serveInfo.side = this._swapLeftRight(this.serveInfo.side);
      this.serveInfo.position = (this.scoreInfo[this.serveInfo.side] % 2)?'left':'right';
    }

    ['left', 'right'].forEach(function(side) {
      ['left', 'right'].forEach(function(position) {
        this.serveInfo.currentStanding[side][position] =
          position == this.serveInfo.position?this.playerInfo[side]['right']:'';
      }.bind(this));
    }.bind(this));
  },
  scoring_new_2: function (side) {
    this.scoreInfo[side]++;
    if (side == this.serveInfo.side) {
      this.serveInfo.position = this._swapLeftRight(this.serveInfo.position);
      this.serveInfo.currentStanding[this.serveInfo.side] =
        this._swapPlayerStanding(this.serveInfo.currentStanding[this.serveInfo.side]);
    } else {
      this.serveInfo.side = this._swapLeftRight(this.serveInfo.side);
      this.serveInfo.position = (this.scoreInfo[this.serveInfo.side] % 2)?'left':'right';
    }
  },
  scoring_new_1: function (side) {
    this.scoreInfo[side]++;
    if (side == this.serveInfo.side) {
      this.serveInfo.position = this._swapLeftRight(this.serveInfo.position);
    } else {
      this.serveInfo.side = this._swapLeftRight(this.serveInfo.side);
      this.serveInfo.position = (this.scoreInfo[this.serveInfo.side] % 2)?'left':'right';
    }

    ['left', 'right'].forEach(function(side) {
      ['left', 'right'].forEach(function(position) {
        this.serveInfo.currentStanding[side][position] =
          position == this.serveInfo.position?this.playerInfo[side]['right']:'';
      }.bind(this));
    }.bind(this));
  },

  updateScore: function(score, serveInfo, playerInfo, instruction) {
    alert('should be override');
  },
}

window.addEventListener('load', function() {
  document.getElementById('start').addEventListener('click', start);
  document.getElementById('reset').addEventListener('click', reset);
  document.getElementById('court_left').addEventListener('click', clickLeft);
  document.getElementById('court_right').addEventListener('click', clickRight);
  document.getElementById('player_left_left').addEventListener('change', dataChange);
  document.getElementById('player_left_right').addEventListener('change', dataChange);
  document.getElementById('player_right_left').addEventListener('change', dataChange);
  document.getElementById('player_right_right').addEventListener('change', dataChange);
  document.getElementById('style').addEventListener('change', dataChange);
  document.getElementById('players').addEventListener('change', dataChange);
  document.getElementById('winningScore').addEventListener('change', dataChange);

  Judge.updateScore = function(score, serveInfo, playerInfo, instruction) {
    document.getElementById('score').value = score.left + ':' + score.right;

    var serveCourt = '';
    if (serveInfo) {
      serveCourt = 'court_' + serveInfo.side + '_' + serveInfo.position;
    }
    ['left', 'right'].forEach(function (side){
      ['left', 'right'].forEach(function (position){
        var positionStr = side + '_' + position;

        var courtId = 'court_' + positionStr;
        document.getElementById(courtId).style.backgroundColor =
          courtId == serveCourt ? 'red' : 'white';

        if (playerInfo) {
          document.getElementById('player_' + positionStr).value =
            playerInfo[side][position];
        }
      });
    });

    if (instruction) {
      setInstruction(instruction);
    }
  };
  reset();
});

window.addEventListener('unload', function() {
  document.getElementById('start').removeEventListener('click', start);
  document.getElementById('reset').removeEventListener('click', reset);
  document.getElementById('court_left').removeEventListener('click', clickLeft);
  document.getElementById('court_right').removeEventListener('click', clickRight);
  document.getElementById('player_left_left').removeEventListener('change', dataChange);
  document.getElementById('player_left_right').removeEventListener('change', dataChange);
  document.getElementById('player_right_left').removeEventListener('change', dataChange);
  document.getElementById('player_right_right').removeEventListener('change', dataChange);
  document.getElementById('style').removeEventListener('change', dataChange);
  document.getElementById('players').removeEventListener('change', dataChange);
  document.getElementById('winningScore').removeEventListener('change', dataChange);
});

function setInstruction(instruction) {
  document.getElementById('instruction').value = instruction;
}

function setSettingsEnabled(enabled) {
  document.getElementById('style').disabled =
    document.getElementById('players').disabled =
    document.getElementById('winningScore').disabled =
    document.getElementById('player_left_left').readOnly =
    document.getElementById('player_left_right').readOnly =
    document.getElementById('player_right_left').readOnly =
    document.getElementById('player_right_right').readOnly =
    !enabled;
}

function dataChange() {
  Judge.setData(
    document.getElementById('players').options[
      document.getElementById('players').selectedIndex].value,
    document.getElementById('style').options[
      document.getElementById('style').selectedIndex].value,
    document.getElementById('winningScore').value,
    {
      left: {
        left: document.getElementById('player_left_left').value,
        right: document.getElementById('player_left_right').value
      },
      right: {
        left: document.getElementById('player_right_left').value,
        right: document.getElementById('player_right_right').value
      }
    }
  );
}

function start() {
  setInstruction('Tap left/right court to start.');
  dataChange();
  Judge.start();
  setSettingsEnabled(false);
}

function reset() {
  setInstruction('Change game settings then press start.');
  Judge.reset();
  setSettingsEnabled(true);
}

function clickLeft() {
  score('left');
}

function clickRight() {
  score('right');
}

function score(side) {
  Judge.score(side);
}