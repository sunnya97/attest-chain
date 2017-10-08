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
	console.log(stringify(parsed_data));
	return parsed_data;
}


const sign_attestation = (data, private_key) => {
	let message = stringify(data);
	//console.log(message);
	const sig = web3.eth.accounts.sign(message, private_key);
	const pub = ethJsUtil.bufferToHex(ethJsUtil.privateToPublic(private_key))

	return sig['signature'];
	//Deal with merkle proofing
	//console.log(sig);
	//console.log(pub);
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

	//console.log(leaves);

	//Generate merkle trees
	var tree = merkle('sha256').sync(leaves);
	/*
	for(var i = 0; i < length; i++) {
		//TODO: verify validity of irrevocability
		console.log(web3.utils.sha3(leaves[i]));
	}
	*/
	//console.log(tree.level(tree.levels()-1))

	//TODO: Send tree.root() to smart contract

	var proofs = [];
	//Return a list of merkle proofs
	for(var i = 0; i < length; i++)
	{
		proofs.push(tree.getProofPath(i)); 
	}

	return proofs;
};

const verify_handler = (signed_attestation, attestor_pubkey) => {
	return verify_attestation(JSON.parse(signed_attestation), attestor_pubkey, requester_pubkey);
}

const verify_signature = (data, sig, pubkey) => {
	const data_hash = web3.eth.accounts.hashMessage(data);
	recovered_addr = web3.eth.accounts.recover(data_hash, sig).toLowerCase();
	check_addr = ethJsUtil.bufferToHex(ethJsUtil.pubToAddress(pubkey)).toLowerCase();
	return recovered_addr == check_addr;
}

// const verify_attestation = (signed_attestation, attestor_pubkey, requester_pubkey) => {
// 	//Verify signers
// 	const attestation_data = signed_attestation['data'];
// 	if(!verify_signature(attestation_data, signed_attestation['attestor_signature'], attestor_pubkey))
// 		return false;
// 	if(!verify_signature(attestation_data, signed_attestation['requester_signature'], requester_pubkey))
// 		return false;
// 	//Verify timestamp is not expired

// 	//Get the list of compromised signatures
// 	web3.eth.getStorageAt(/*address for list of compromised pubkeys*/, /*position*/, function(error, result) {
// 		if(error) 
// 			throw(error);
// 		//Examine list in result to see if attestor_pubkey is there
// 		if(/* attestor_pubkey compromised */) {
// 			if(!signed_attestation['data']['isRevocable']) {
// 				var merkle_proof = signed_attestation['merkle-proof'];
// 				var claimed_merkle_root = generate_merkle_root_from_proof(merkle_proof, attestation_data);
// 				var root_hash = //get root hash from chain
// 				if(root_hash == claimed_merkle_root) 
// 					return true;
// 			}
// 			return false;
// 		}
// 		//Examine list of revoked things on chain, see if hash of signed_attestation appears
// 		if(/* hash appears on chain */)
// 		{
// 			if(verify_signature(/*on revoked list*/) && signed_attestation['data']['isRevocable'])
// 				return false;
// 		}
// 		return true;
// 	})
	
// 	return true;
// };

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
