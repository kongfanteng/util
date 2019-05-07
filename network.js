import request from './request';
import merge from 'lodash/merge'


export default {
  ajax: function(options) {
    options = options || {};
    var obj = {
      crossDomain: true
    };

      obj.xhrFields = {
          withCredentials: true
        }

    merge(
      options,
      obj
    )
   
    return request(options.url, options);
  }
};
