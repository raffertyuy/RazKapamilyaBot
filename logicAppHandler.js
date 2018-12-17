var request = require('request');

function processLogic(chatmessageValue, intentValue, subintent1Value, subintent2Value, subintent3Value, callback) {
    var logicAppUrl = process.env.LogicAppPOST;

    var options = {
        method: "POST",
        url: logicAppUrl,
        json: {
            chatmessage: chatmessageValue,
            intent: intentValue,
            subintent1: subintent1Value,
            subintent2: subintent2Value,
            subintent3: subintent3Value
        }
    };

    request(options, function(error, response, body) {
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));

        // var text = '';
        // for (var key in body) {
        //     text += 'Index is: ' + key + '\nDescription is:  ' + body[key];
        // }
        // console.log(text);

        callback(body);
    }).on('error', function(e) {
        console.log("HTTP REQUEST ERROR: " + e.message);
    });
}

module.exports = {
    processLogic: function(chatmessage, intent, subintent1, subintent2, subintent3, callback) {
        processLogic(chatmessage, intent, subintent1, subintent2, subintent3, callback);
    },
    getRssFeed: function(chatmessage, rssUrl, callback) {
        processLogic(chatmessage, "RSS", rssUrl, "", "", callback);
    }
};