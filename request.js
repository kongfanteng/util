import merge from 'lodash/merge'
import ajax from './ajax'
import util from './util'
/**
 * @private
 * @function request
 * @description Make a request to the server and return a promise.
 * @param {string} url
 * @param {object} options
 * @returns {promise}
 */
export default function request(url, options) {


  return new Promise((resolve, reject) => {
     
    if (!url) reject(new Error('URL parameter required'));
    if (!options) reject(new Error('Options parameter required'));
    

    var opt = {
      url: url,
      success: function(data) {

        resolve(data);
      },
      error: function(a, b, errorThrown) {
        reject(new Error("server Error " + errorThrown));
      }
    }

    merge(options, opt);

    options.data=options.data||{};
    options.data.src=util.getsrc();
    ajax.ajax(options);



  });
}


export  function http(options) {
  return new Promise((resolve, reject) => {
    var opt = {
      success: function(data) {

        resolve(data);
      },
      error: function(a, b, errorThrown) {
        reject(new Error("server Error " + errorThrown));
      }
    }
    merge(options, opt);
    options.data=options.data||{};
    options.data.src= options.data.src || util.getsrc();

    ajax.ajax(options);
  });
}

