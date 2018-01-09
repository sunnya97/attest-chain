const assert = require('assert')
const Web3 = require('web3')
const ethJsUtil = require('ethereumjs-util')
const merkle = require('merkle')
var MerkleTools = require('merkle-tools')
const stringify = require('json-stringify-deterministic')
const contractAbi = require('./abi.json')
const sha3_256 = require('js-sha3').sha3_256;

var web3 = new Web3("http://localhost:8545");

const attestchainContract = new web3.eth.Contract(contractAbi, "0xdd73bcaf6cd68884edf2be65afe0bc7241dc9fbb");

var merkleTools = new MerkleTools({hashType: 'SHA3-256'});

/*
Specification
	const signedSchema = {
		data: { type: String },
		pubkey: { type: String },
		signature: { type: String },
		algorithm: { type: String },
		merkleProof: { type: String }
		merkleRoot: { type: String }
	};

	const dataSchema = {
		message: { type: String },
		expiration: { type: Number },
		isRevocable: { type: Boolean }
	};
*/


//When signing message is sent:
//data_list = array of stringified data objects
const signing_handler = (data_list, private_key) => {
	
	let signed_attestations = []
	
	let irrevocable_attestations = []

	for(let i = 0; i < data_list.length; i++) {

		signed_attestations.push(sign_attestation(data_list[i], private_key));

		if(!JSON.parse(data_list[i]['isRevocable']) {
			irrevocable_attestations.push(signed_attestations[i]);
		}
	}

	add_merkle_proofs(irrevocable_attestations);

	return signed_attestations;
}


const sign_attestation = (data, private_key) => {
	let pubkey = ethJsUtil.bufferToHex(ethJsUtil.privateToPublic(private_key)).toString();
	let signature = web3.eth.accounts.sign(data, private_key)['signature'].toString();

	return {
		'data': data,
		'pubkey': pubkey,
		'signature': signature,
		'algorithm': 'secp256k1'
	};
}

const add_merkle_proofs = (irrevocable_attestations) => {

	merkleTools.resetTree()

	if(irrevocable_attestations.length == 0) {
		return [];
	}

	for(var i = 0; irrevocable_attestations < length; i++) {
		merkleTools.addLeaf(data_list[i] + signature, true);
	}

	merkleTools.makeTree();
	merkleroot = merkleTools.getMerkleRoot().toString('hex');

	for(var i = 0; irrevocable_attestations < length; i++) {
		irrevocable_attestations[i]['merkleRoot'] = merkleroot;
		irrevocable_attestations[i]['merkleProof'] = stringify(getProof(i));
	}

	return [merkleroot, irrevocable_attestations];
}



const verify_handler = (signed_attestation, check_pubkey, callback) => {
	verify_attestation(signed_attestation, check_pubkey, callback);
}

const verify_signature = (data, sig, pubkey) => {
	recovered_addr = web3.eth.accounts.recover(stringify(data), sig).toLowerCase();
	check_addr = ethJsUtil.bufferToHex(ethJsUtil.pubToAddress(pubkey)).toLowerCase();
	return recovered_addr == check_addr;
}

const verify_attestation = (signed_attestation, check_pubkey, callback) => {
	//Verify signers
	let attestation = JSON.parse{sign_attestation};
	let data = JSON.parse(attestation['data']);

	if(attestation['algorithm'] != 'secp256k1') {
		throw("algorithm currently not supported")
	}

	if (check_pubkey && check_pubkey != attestation['pubkey']) {
		return false;
	}

	if(!verify_signature(attestation['data'], attestation['signature'], attestation['pubkey'])) {
		callback("attestor signature invalid");
		return false;
	}

	if(Date.now() > data['expiration']) {
		return false;
	}

	//Get the list of compromised private keys
	attestchainContract.methods.get_compromisation_list().call(function(error, response) {
		if(error)
		{
			console.log(error)
			throw(error);
		}
		var compromised_privkeys = response['0'];
		for(let i = 0; i < compromised_privkeys.length; i++) {
			var comp_pubkey = ethJsUtil.bufferToHex(ethJsUtil.privateToPublic(compromised_privkeys[i])).toLowerCase();

			//Attestor pubkey compromised!!!!!
			if(comp_pub_key == attestor_pubkey.toLowerCase()) {
				console.log("compromised");
				if(!signed_attestation['data']['isRevocable']) {
					var merkle_proof = signed_attestation['merkle-proof'];
					var claimed_merkle_root = generate_merkle_root_from_proof(merkle_proof, attestation_data);
					attestchainContract.methods.get_merkleroots_list().call(function(error, response) {
						if(error)
							throw(error);
						var merkleproofs = response['0'];
						var merklesignatures = response['1'];
						for(let i = 0; i < merkleproofs.length; i++) {
							if(claimed_merkle_root == merkleproofs[i]) {
								if (verify_signature(merkleproofs[i], merklesignatures[i], attestor_pubkey) ){
									callback("true");
									return true;
								}
							}
						}
					});
				}
				callback("compromised privkey");
				return false;
			}
		}

		if(signed_attestation['data']['isRevocable']) {

			attestchainContract.methods.get_revocation_list().call(function(error, response) {
				if(error)
					throw(error);
				revokedhashes = response['0'];
				revokedsignatures = response['1'];

				potential_revocation_hash = web3.utils.sha3("revoke ".concat(stringify(signed_attestation)));

				for(let i = 0; i < revokedhashes.length; i++) {
					if (potential_revocation_hash == revokedhashes[i]) {
						if (verify_signature(revokedhashes[i], revokedsignatures[i], attestor_pubkey)) {
							callback("revoked");
							return false;
						}
					}
				}
			});
		}
		callback("true");
		return true;
	});
};

const revoke_attestation = (signed_attestation, private_key) => {
	let hash = signed_attestation['data'];
	//Hash signed_attestation
	//Sign message
	//Publish hash + signed hash to smart contract
};

const claim_compromised = (comp_priv_key, comp_pub_key, new_pub_key) => {
	//Publish pair to smart contract storage
};

module.exports = { signing_handler, verify_handler };
