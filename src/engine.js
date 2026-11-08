// Node entry point; browsers load legacy-engine.js followed by engine-v2.js.
if(typeof module==='object')module.exports=require('./engine-v2.js');
