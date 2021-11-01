const db = require('../../db/db');

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);

		// reset database:
		//db.Tags.sync({force:true});

		// start db
		db.Tags.sync();
	},
};