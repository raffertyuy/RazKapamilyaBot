var fetch = require('node-fetch');
require('dotenv-extended').load({
    path: '../.env'
});

var get_restQnA = function (hostname, knowledgeId, authkey, question, callback){

    qnaurl=`${hostname}/knowledgebases/${knowledgeId}/generateAnswer`;
    authorizationKey = `EndpointKey ${authkey}`;

    fetch(qnaurl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": authorizationKey
        },
        body: JSON.stringify({
            "question": question,
            "top": 1
        })
    }).then(response => {
        return response.json();
    }).then(data => {
        if (data && data.answers && data.answers.length != 0)
        {
            var answer = data.answers[0];
            callback(`${answer.answer} (Confidence Score: ${answer.score})`);
        }
    }).catch(err => {console.log(err);});
}

var getQnaSSS = function (question, callback) {
  return get_restQnA(process.env['QnaSSSHostName'], process.env['QnaSSSKnowledgeId'], process.env['QnaSSSKey'], question, callback);
}

var getQnaLTOLicensePermit = function (question, callback) {
    return get_restQnA(process.env['QnaLTOLicensePermitHostName'], process.env['QnaLTOLicensePermitKnowledgeId'], process.env['QnaLTOLicensePermitKey'], question, callback);
}

var getQnaLTOVehicle = function (question, callback) {
    return get_restQnA(process.env['QnaLTOVehicleHostName'], process.env['QnaLTOVehicleKnowledgeId'], process.env['QnaLTOVehicleKey'], question, callback);
}

var getQnaLTOLaw = function (question, callback) {
    return get_restQnA(process.env['QnaLTOLawHostName'], process.env['QnaLTOLawKnowledgeId'], process.env['QnaLTOLawKey'], question, callback);
}

var getQnaLTOSpecialPlates = function (question, callback) {
    return get_restQnA(process.env['QnaLTOSpecialPlatesHostName'], process.env['QnaLTOSpecialPlatesKnowledgeId'], process.env['QnaLTOSpecialPlatesKey'], question, callback);
}

module.exports = {
  getQnaSSS : getQnaSSS,
  getQnaLTOLicensePermit : getQnaLTOLicensePermit,
  getQnaLTOVehicle : getQnaLTOVehicle,
  getQnaLTOLaw : getQnaLTOLaw,
  getQnaLTOSpecialPlates : getQnaLTOSpecialPlates
};