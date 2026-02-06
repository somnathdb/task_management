const redis = require('redis');
const configResolve = require("../auth/configResolver");
const redisHost = configResolve.getConfig().redisHost;
module.exports = client = redis.createClient({
    host: redisHost,
    port: 6379
});