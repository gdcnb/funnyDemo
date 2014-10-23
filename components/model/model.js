
var net = require('../net/net.js'),
    model = {};

model.napi= function(url, doneFn, errorFn) {
    net.ajax({
        url:url,
        dataType: 'json',
        timeout: 30,
        success: function(data, status, xhr) {
            if(data.data &&typeof doneFn === 'function') {
                doneFn(data.data);
            } else {
                if(typeof errorFn === 'function') {
                    errorFn();
                }
            }
        },
        error: function(xhr, errorType, status) {
            if(typeof errorFn === 'function') {
                errorFn();
            }
        }
    });
};
module.exports = model;
