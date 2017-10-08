const assert = require('assert')
const Web3 = require('web3')
const ethJsUtil = require('ethereumjs-util')
const merkle = require('merkle')
const stringify = require('json-stringify-deterministic')
	
var web3 = new Web3("http://localhost:8545"); 

const attestchainContract = new web3.eth.Contract([{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"compromisations","outputs":[{"name":"comp_priv_key","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"get_merkleroots_list","outputs":[{"name":"","type":"bytes32[]"},{"name":"","type":"bytes1[130][]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"merkleroots","outputs":[{"name":"merkle_root","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"get_revocation_list","outputs":[{"name":"","type":"bytes32[]"},{"name":"","type":"bytes1[130][]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"comp_priv_key","type":"bytes32"},{"name":"new_pub_key","type":"bytes1[64]"}],"name":"compromise","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"root","type":"bytes32"},{"name":"signature","type":"bytes1[130]"}],"name":"submit_root","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"get_compromisation_list","outputs":[{"name":"","type":"bytes32[]"},{"name":"","type":"bytes1[64][]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"hash","type":"bytes32"},{"name":"signature","type":"bytes1[130]"}],"name":"revoke","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"revocations","outputs":[{"name":"hash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}], "0xdd73bcaf6cd68884edf2be65afe0bc7241dc9fbb");

/*
Specification
	const signedSchema = mongoose.Schema({
		data: { type: String },
		attestor_signature: { type: String },
		merkle_proof: { type: String }
		requester_signature: { type: String }
	});

	const dataSchema = mongoose.Schema({
		message: { type: String },
		timestamp: { type: Number },
		expiration: { type: Number },
		isRevocable: { type: Boolean }
	});
*/


//When signing message is sent:
//Data = array of signed objects
const signing_handler = (data, private_key, revocable, signer) => {
	let parsed_data = JSON.parse(data);
	if(signer == 'requester') 
	{
		for(let i = 0; i < parsed_data.length; i++) 
		{
			parsed_data[i]['requester_signature'] = sign_attestation(parsed_data[i]['data'], private_key);
		}
	}
	else if (signer == 'attestor') 
	{
		//sign all the messages
		for(let i = 0; i < parsed_data.length; i++) 
		{
			parsed_data[i]['attestor_signature'] = sign_attestation(parsed_data[i]['data'], private_key);
		}
		if(!revocable)
		{
			proofs = get_merkle_proofs(parsed_data);
			for(let i = 0; i < parsed_data.length; i++) 
			{
				if(parsed_data[i]['data']['isRevocable']) 
					throw("All entries must be irrevocable")
				parsed_data[i]['merkle_proof'] = proofs[i];
			}
		}
	}
	else 
	{
		throw("Signer must be a requester or attestor");
	}
	console.log(parsed_data);
	return parsed_data;
}


const sign_attestation = (data, private_key) => {
	let message = stringify(data);
	//console.log(message);
	const sig = web3.eth.accounts.sign(message, private_key);
	const pub = ethJsUtil.bufferToHex(ethJsUtil.privateToPublic(private_key))

	//Deal with merkle proofing
	//console.log(sig);
	console.log("pub key: ");
	console.log(pub);

	return sig['signature'];
};

const get_merkle_proofs = (data) => {
	const length = data.length;
	var leaves = [];

	console.log("creating merkle tree and proofs")

	for(var i = 0; i < length; i++) {
		//TODO: verify validity of irrevocability
		leaves.push(web3.utils.sha3(stringify(data[i])));
	}

	for(var i = length; i < Math.pow(2, Math.ceil(Math.log2(length))); i++) {
		var rand_seed = Math.random();
		//console.log(rand_seed);
		leaves.push(web3.utils.sha3(rand_seed.toString()));
	}

	console.log(leaves);

	//Generate merkle trees
	var tree = merkle('sha256').sync(leaves);
	
	for(var i = 0; i < length; i++) {
		//TODO: verify validity of irrevocability
		//console.log(web3.utils.sha3(leaves[i]));
	}
	
	console.log(tree.level(tree.levels()-1))

	//TODO: Send tree.root() to smart contract

	var proofs = [];
	//Return a list of merkle proofs
	for(var i = 0; i < length; i++)
	{
		proofs.push(tree.getProofPath(i)); 
	}

	return proofs;
};

const verify_handler = (signed_attestation, attestor_pubkey, requester_pubkey, callback) => {
	verify_attestation(signed_attestation, attestor_pubkey, requester_pubkey, callback);
}

const verify_signature = (data, sig, pubkey) => {
	console.log(data);
	recovered_addr = web3.eth.accounts.recover(stringify(data), sig).toLowerCase();
	//console.log(recovered_addr);
	check_addr = ethJsUtil.bufferToHex(ethJsUtil.pubToAddress(pubkey)).toLowerCase();
	//console.log(check_addr);
	return recovered_addr == check_addr;
}

const generate_merkle_root_from_proof = (merkle_proof, attestation_data) => {
	let node = web3.utils.sha3(stringify(attestation_data));
	let leaf_rehashed = ethJsUtil.bufferToHex(ethJsUtil.sha256(node));
	console.log(leaf_rehashed);
	console.log(merkle_proof);
	return "";
}

const verify_attestation = (signed_attestation, attestor_pubkey, requester_pubkey, callback) => {
	//Verify signers
	const attestation_data = signed_attestation['data'];
	if(!verify_signature(attestation_data, signed_attestation['attestor_signature'], attestor_pubkey)) {
		callback("attestor signature invalid");
		return false;
	}
	if(!verify_signature(attestation_data, signed_attestation['requester_signature'], requester_pubkey)) {	
		callback("requester signature invalid");
		return false;
	}

	//TODO: Verify timestamp is not expired

	//Get the list of compromised signatures
	attestchainContract.methods.get_compromisation_list().call(function(error, response) {
		if(error)
			throw(error);
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
	let hash = signed_attestation['data']
	//Hash signed_attestation
	//Sign message
	//Publish hash + signed hash to smart contract
};

const claim_compromised = (comp_priv_key, comp_pub_key, new_pub_key) => {
	//Publish pair to smart contract storage
};
 
module.exports = { signing_handler, verify_handler };
