const { signing_handler, verify_handler } = require('./client.js');
const stringify = require('json-stringify-deterministic')

att1 = {
	data: {
		message: "hello",
		timestamp: 124444,
		expiration: 15666,
		isRevocable: false
	},
	attestor_signature: "",
	merkle_proof: {},
	requester_signature: ""
}

att2 = {
	data: {
		message: "asdfsdfasdf",
		timestamp: 124444,
		expiration: 15666,
		isRevocable: false
	},
	attestor_signature: "",
	merkle_proof: {},
	requester_signature: ""
}

att3 = {
	data: {
		message: "hellfffo",
		timestamp: 124444,
		expiration: 15666,
		isRevocable: false
	},
	attestor_signature: "",
	merkle_proof: {},
	requester_signature: ""
}


arr = [att1, att2, att3]

signing_handler(stringify(arr), "0x8016571797ef4363e8ef0831f6a8db218558a703069141401cbe5058b26140fd", false, "attestor")