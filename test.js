const { signing_handler, verify_handler } = require('./client.js');
const stringify = require('json-stringify-deterministic')

att1 = {
	data: {
		message: "hello",
		timestamp: 124444,
		expiration: 15666,
		isRevocable: true
	},
	signature: "0x077643effce3a6bea5e3071660cdcbdb969b091da1cdd8c54daeb149a4673d9871faef452d2cfbbc7cb86d3780527832a97407c2ec7167d686e7778ec2f0f19f1b",
    pubkey: "0x67c0dd58908b9ed0dd820f8030d2cc0f3c29f87a92bca495ec06bfc307b4946f101d1cee66ae34feca7cdcf06ca613924b4e8e799be4447b9530dbde0d24f1e1", 
	merkle_proof: [{"left":"4E9B809F44913A1637DB47F4BD33BFA7E61D24C35DA0A41CDAFD5AAAD54B3F98","parent":"9B608024DF0C2D6CF3111218D163563CA3FE3D45CC5BFDC396DE72F860AE42D4","right":"0FB6363425CBD4CE9AC559BD87484754BE0520F5509CC0EA69F6A575D5E4C176"},{"left":"9B608024DF0C2D6CF3111218D163563CA3FE3D45CC5BFDC396DE72F860AE42D4","parent":"13A0C9D3CE915BCA632F3CFF6D20781F72F4B6A246D60F7527B66F613300DBEF","right":"85025E969ECDA794A2B0E40E55EFEB0D4E4BF0FEF74C8EC078DD399B7E56262D"}],
    algorithm: "secp256k1"
}

test_attestation = stringify(att1);

verify_handler(test_attestation, "0x67c0dd58908b9ed0dd820f8030d2cc0f3c29f87a92bca495ec06bfc307b4946f101d1cee66ae34feca7cdcf06ca613924b4e8e799be4447b9530dbde0d24f1e1", 
	function(outcome){
	console.log(outcome);
});
