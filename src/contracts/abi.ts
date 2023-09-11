const abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "_address",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "_name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "_did",
						"type": "string"
					},
					{
						"internalType": "uint8",
						"name": "_nonce",
						"type": "uint8"
					}
				],
				"indexed": false,
				"internalType": "struct CommercialDAO.ServiceProvider",
				"name": "_serviceProvider",
				"type": "tuple"
			}
		],
		"name": "ServiceProviderJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "_topicId",
				"type": "string"
			}
		],
		"name": "TopicIdSet",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_did",
				"type": "string"
			}
		],
		"name": "getMember",
		"outputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "_address",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "_name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "_did",
						"type": "string"
					},
					{
						"internalType": "uint8",
						"name": "_nonce",
						"type": "uint8"
					}
				],
				"internalType": "struct CommercialDAO.ServiceProvider",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTopicId",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"components": [
					{
						"internalType": "address",
						"name": "_address",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "_name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "_did",
						"type": "string"
					},
					{
						"internalType": "uint8",
						"name": "_nonce",
						"type": "uint8"
					}
				],
				"internalType": "struct CommercialDAO.ServiceProvider",
				"name": "serviceProvider",
				"type": "tuple"
			}
		],
		"name": "grantMembership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_did",
				"type": "string"
			}
		],
		"name": "isMember",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "serviceProviderList",
		"outputs": [
			{
				"internalType": "address",
				"name": "_address",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_did",
				"type": "string"
			},
			{
				"internalType": "uint8",
				"name": "_nonce",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_topicId",
				"type": "string"
			}
		],
		"name": "setTopicId",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "topicId",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

export default abi;
