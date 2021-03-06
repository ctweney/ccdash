var request = require('request');
var sharedEvents = require('./sharedEventEmitter.js');

var sendEvent = function(scrapeResponse) {
  sharedEvents.emit('scraped.builds', {
    travis: scrapeResponse
  });
};

var getState = function(element) {
  if (element.last_build_result === 0) {
    return 'successful';
  } else if (element.last_build_result === 1) {
    return 'failed';
  }
};

var getIsBuilding = function(element) {
  return (element.last_build_status === null);
};

var parsePlan = function(body) {
  body = JSON.parse(body);

  var key = 'latest';

  var scrapeResponse = {};

  if (!scrapeResponse[key]) {
    scrapeResponse[key] = {};
  }

  scrapeResponse[key].key = key;
  scrapeResponse[key].number = body.last_build_id;
  scrapeResponse[key].state = getState(body); //successful / failed
  scrapeResponse[key].planUrl = 'https://travis-ci.org/ets-berkeley-edu/calcentral';
  scrapeResponse[key].currentBuildUrl = 'https://travis-ci.org/ets-berkeley-edu/calcentral/builds/' + body.last_build_id;
  scrapeResponse[key].isBuilding = getIsBuilding(body);

  sendEvent(scrapeResponse);
};

var scrapePlans = function() {
  request({
    url: 'https://api.travis-ci.org/repositories/ets-berkeley-edu/calcentral.json',
    rejectUnauthorized: false
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      process.nextTick(function() {
        parsePlan(body);
      });
    }
  });
};

var init = function() {
  setInterval(scrapePlans, 4000);
};

module.exports = {
  init: init
};
