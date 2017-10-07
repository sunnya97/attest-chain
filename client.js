const mongoose = require('mongoose')
const assert = require('assert')
const Web3 = require('web3')
const ethJsUtil = require('ethereumjs-util')

mongoose.Promise = global.Promise;
var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");

//const db = mongoose.connect('mongodb://localhost:27017/attest-chain');

//Addl tasks:
	//Peer to peer messaging (request attestation, send attestation)
	//Store things in Mongo -- 


const signedSchema = mongoose.Schema({
	data: { type: String },
	signature: { type: String },
	merkle_proof: { type: String }
});

const dataSchema = mongoose.Schema({
	message: { type: String },
	expiration: { type: Number },
	isRevocable: { type: Boolean }
});

const sign_attestation = ({data, private_key}) => {
	const sig = web3.eth.accounts.sign(data, private_key);
	const pub = ethJsUtil.bufferToHex(ethJsUtil.privateToPublic(private_key))

	//Deal with merkle proofing
	console.log(sig);
	console.log(pub);
};

const get_merkle_proofs = ({}) => {
	
};

const verify_attestation = ( {signed_attestation, attestor_pubkey} ) => {
	//Verify the signer is the desired attestor
	const attestation_data = signed_attestation['data'];
	const attestation_sig = signed_attestation['signature'];
	const data_hash = web3.eth.accounts.hashMessage(attestation_data);
	recovered_addr = web3.eth.accounts.recover(data_hash, attestation_sig).toLowerCase();
	attestor_addr = ethJsUtil.bufferToHex(ethJsUtil.pubToAddress(attestor_pubkey)).toLowerCase();
	console.log(recovered_addr == attestor_addr);

	//If verifier signature is compromised
			//If irrevocable:
				//Use merkle proof to generate root hash
				//Search smart contract storage to find root hash. If present, TRUE
			//If revocable: 
				//FALSE
	//If hash of signed_attestation appears in contract storage
		//If hash is validly signed, and attestation is revocable, then FALSE
		//TRUE

	//TRUE 
};

const revoke_attestation = ( {signed_attestation, private_key} ) => {
	//Hash signed_attestation
	//Sign message
	//Publish hash + signed hash to smart contract
};

const claim_compromised = ( {comp_priv_key, new_priv_key} ) => {
	//Publish pair to smart contract storage
};
 
module.exports = { sign_attestation, verify_attestation, revoke_attestation, claim_compromised };
