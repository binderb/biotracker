const cli = require('next/dist/cli/next-start');
require('dotenv').config({path:'.env.local'});
cli.nextStart(['-p', process.env.PORT || '3000']);
