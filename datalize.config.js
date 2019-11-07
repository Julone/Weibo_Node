global.datalize = require('datalize');
global._field = datalize.field;
global.datalize_query = datalize.query;
global.datalize_params = datalize.params;
datalize.set('autoValidate', true);
datalize.set('autoConvertToArray',true)

import validRule from './utils/datalize_rule';
datalize.Field.prototype['isAes'] = function() {
	return this.add(validRule.password);
};
datalize.Field.prototype['email'] = function() {
	return this.add(validRule.email);
};
datalize.Field.prototype['required'] = function() {
    this.isRequired = true;
	return this.add(validRule.required.bind(this));
};
datalize.Field.prototype['length'] = function(min,max) {
	return this.add(validRule['length'].bind(this,min,max));
};
