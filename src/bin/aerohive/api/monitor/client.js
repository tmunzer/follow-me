var api = require("./../req");

/**
 * Returns a list of clients
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 * @param {Array} qs - array of query string options. 
 * @param {Object} qs[]
 * @param {String} qs[].key - name of the qs parameter
 * @param {String} qs[].value - value of the qs parameter
 *  */
module.exports.clients = function (xapi, devAccount, qs, callback) {
    let query = "";
    if (qs) {
        qs.forEach(function(param){
            query += "&" + param.key + "=" + param.value;
        })
    }
    var path = '/xapi/v1/monitor/clients?ownerId=' + xapi.ownerId + query;

    // send the API request
    api.GET(xapi, devAccount, path,  callback);
};

/**
 * Returns detail information about a specific client.
 * @param {Object} xapi - API credentials
 * @param {String} xapi.vpcUrl - ACS server to request
 * @param {String} xapi.ownerId - ACS ownerId
 * @param {String} xapi.accessToken - ACS accessToken
 * @param {Object} devAccount - information about the Aerohive developper account to user
 * @param {String} devAccount.clientID - Aerohive Developper Account ClientID
 * @param {String} devAccount.clientSecret - Aerohive Developper Account secret
 * @param {String} devAccount.redirectUrl - Aerohive Developper Account redirectUrl
 * @param {String} clientId - The unique number of the client device.
 * @param {Array} qs - array of query string options. 
 * @param {Object} qs[]
 * @param {String} qs[].key - name of the qs parameter
 * @param {String} qs[].value - value of the qs parameter
 *  */
module.exports.client = function (xapi, devAccount, clientId, qs, callback) {
    let query = "";
    if (qs) {
        qs.forEach(function(param){
            query += "&" + param.key + "=" + param.value;
        })
    }
    var path = '/xapi/v1/monitor/clients/' + clientId + '?ownerId=' + xapi.ownerId + query;

    // send the API request
    api.GET(xapi, devAccount, path,  callback);
};