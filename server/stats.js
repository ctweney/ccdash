var request = require('request');
var sharedEvents = require('./sharedEventEmitter.js');

var sendEvent = function(scrapeResponse) {
  sharedEvents.emit('scraped.stats', scrapeResponse);
};

var parseStats = function(stats) {
  stats = JSON.parse(stats);
  stats.hot_plate.average_time = (stats.hot_plate.total_warmup_time / stats.hot_plate.total_warmups_requested).toFixed(1);
  stats.hot_plate.outstanding_warmups = stats.hot_plate.total_warmups_requested - stats.hot_plate.total_warmups_processed;
  stats.live_updates_warmer.average_time = (stats.live_updates_warmer.total_warmup_time / stats.live_updates_warmer.total_warmups_requested).toFixed(1);
  sendEvent(stats);
};

var scrapeStats = function() {
  request({
    url: process.env.STATS_URL || "http://localhost:3000/api/stats",
    rejectUnauthorized: false
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      process.nextTick(function() {
        parseStats(body);
      });
    }
  });
};

var init = function() {
  setInterval(scrapeStats, 10000);
};

module.exports = {
  init: init
};


