const assert = require('assert')
const Web3 = require('web3')
const ethJsUtil = require('ethereumjs-util')
const merkle = require('merkle')
const stringify = require('json-stringify-deterministic')

var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546");

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
const signing_handler = (data, private_key, revocable, signer) => {
	let parsed_data = JSON.parse(data);
	if(signer == 'requester') 
	{
		const sig = sign_attestation(parsed_data, private_key);
		parsed_data['requester_signature'] = sig;
		return data;
	}
	else if (signer == 'attestor') 
	{
		if(revocable) 
		{
			for(let i = 0; )

		}

	}
	else 
	{
		throw("Signer must be a requester or attestor");
	}

}


const sign_attestation = (data, private_key) => {
	const sig = web3.eth.accounts.sign(data, private_key);
	const pub = ethJsUtil.bufferToHex(ethJsUtil.privateToPublic(private_key))

	//Deal with merkle proofing
	console.log(sig);
	console.log(pub);
};

const string_to_array_then_proof = (data) => {
	get_merkle_proofs(JSON.parse(data))
}

const get_merkle_proofs = (data) => {
	const length = data.length;
	var leaves = [];

	for(var i = 0; i < length; i++) {
		//TODO: verify validity of irrevocability
		leaves.push(web3.utils.sha3(data[i]));
	}

	for(var i = length; i < Math.pow(2, Math.ceil(Math.log2(length))); i++) {
		var rand_seed = Math.random();
		console.log(rand_seed);
		leaves.push(web3.utils.sha3(rand_seed.toString()));
	}

	console.log(leaves);

	//Generate merkle trees
	var tree = merkle('sha3').sync(leaves);
	/*
	for(var i = 0; i < length; i++) {
		//TODO: verify validity of irrevocability
		console.log(web3.utils.sha3(leaves[i]));
	}
	*/
	console.log(tree.level(tree.levels()-1))

	//TODO: Send tree.root() to smart contract

	var proofs = {};
	//Return a list of merkle proofs
	for(var i = 0; i < length; i++)
	{
		proofs[data[i]] = tree.getProofPath(i); 
	}

	return proofs;
};

const verify_attestation = (signed_attestation, attestor_pubkey) => {
	//Verify the signer is the desired attestor
	const attestation_data = signed_attestation['data'];
	const attestation_sig = signed_attestation['signature'];
	const data_hash = web3.eth.accounts.hashMessage(attestation_data);
	recovered_addr = web3.eth.accounts.recover(data_hash, attestation_sig).toLowerCase();
	attestor_addr = ethJsUtil.bufferToHex(ethJsUtil.pubToAddress(attestor_pubkey)).toLowerCase();
	console.log(recovered_addr == attestor_addr);

	//Get the list of compromised signatures
	web3.eth.contract.methods.checkIfCompromised(recovered_addr).call()
	//If verifier signature is compromised
			//If irrevocable:
				var merkle_proof = signed_attestation['merkle-proof'];

				//Use merkle proof to generate root hash
				//Search smart contract storage to find root hash. If present, TRUE
			//If revocable: 
				//FALSE
	//If hash of signed_attestation appears in contract storage
		//If hash is validly signed, and attestation is revocable, then FALSE
		//TRUE

	//TRUE 
};

const revoke_attestation = (signed_attestation, private_key) => {
	//Hash signed_attestation
	//Sign message
	//Publish hash + signed hash to smart contract
};

const claim_compromised = (comp_priv_key, new_pub_key) => {
	//Publish pair to smart contract storage
};
 
module.exports = { sign_attestation, verify_attestation, revoke_attestation, claim_compromised, get_merkle_proofs, string_to_array_then_proof };
