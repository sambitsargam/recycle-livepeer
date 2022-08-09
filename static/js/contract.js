const contractAddress = "0x46E9492E532567339F1bF2aFd679b21391ae6a0f";
const expectedBlockTime = 1000;
const url = 'https://rpc-mumbai.maticvigil.com';
const abi = [{
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
},
    {
        "inputs": [],
        "name": "getBalance",
        "outputs": [{
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pay",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{
            "internalType": "address",
            "name": "to",
            "type": "address"
        },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }],
        "name": "transfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }];
var ethaddress, rate;
async function connectWallet() {
    logs.innerHTML += `<p>Trying to connect Wallet...</p>`;
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
    logs.innerHTML += `<p>Wallet Found</p><p>Please Connect Your Wallet by confirming the popup</p><p>Waiting for connection...</p>`;
    }


    conn = await window.ethereum.enable();

    ethconnected = conn.length > 0
    if (ethconnected) {

        logs.innerHTML += `<p>Wallet connected SuccessFully...</p>`;
        ethaddress = conn[0]

        logs.innerHTML += `<p>Transacting using ${ethaddress}</p>`;
    }
    web3.eth.getAccounts().then(console.log);

    return true;
}
/*
window.onload=async function(){
	await connectWallet();
	contract =await new web3.eth.Contract(abi,contractAddress);
	contract.methods.setRate(5000).send({"from":ethaddress});
	rate=await contract.methods.rate().call().then(rate=>console.log(rate));
	contract.methods.owner().call().then(data=>console.log(data));
	contract.methods.pay(time).send({"from":ethaddress,"value":web3.utils.toWei("0.5", "ether")}, async function (error, transactonHash) {
		console.log(transactonHash);
	});
}
*/
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function initiateTxn(amt, e) {

    e.innerHTML = "Initiating Txn...";
	e.setAttribute("disabled",true);
    logs.innerHTML += `<h3>Initiating Transaction</h3>`;
    try {
        await connectWallet();

        logs.innerHTML += `<p>Connecting to Contract...</p>`;
        contract = await new web3.eth.Contract(abi, contractAddress);

        logs.innerHTML += `<p>Connected to contract Successfully...</p><p>Initiating Transaction...</p><p>Please Don't close the window until the process is finished...</p>`;

        logs.innerHTML += `<p>Firing up the Payment Method...</p><p>Please confirm the payment through your wallet...</p>`;
		scrollToBottom("logs");
        contract.methods.pay().send({
            "from": ethaddress,
            "value": web3.utils.toWei(amt, "ether")
        }, async function(error, transactonHash) {
            console.log(transactonHash);

            logs.innerHTML += `<p>Transaction initiated successfully... </p><p><h4>Transaction Hash: </h4>${transactonHash}</p>`;

            let txnReceipt = null;
            let count = 1;
            logs.innerHTML += `<p>Waiting for transaction to be mined...</p><p>this may take a while, please keep calm and wait...</p>`;

		scrollToBottom("logs");
    e.innerHTML = "verifying Txn...";
            try {
                while (txnReceipt == null) {

                    logs.innerHTML += `<p>Attempt ${count}</p>`;
					scrollToBottom("logs");
                    count++;
                    txnReceipt = await web3.eth.getTransactionReceipt(transactonHash);
                    await sleep(expectedBlockTime)
                }
            } catch (err) {
                return txnFailed(err);

    e.innerHTML = "RETRY";
                logs.innerHTML += `<p>Transaction Failed due to unknown reasons. Please reInitiate the payment with higher gas fees.</p>`;
		scrollToBottom("logs");
            }

            logs.innerHTML += `<p>Congratulations, Your transaction is mined Successfully.</p>
            `;
		scrollToBottom("logs");


            console.log('success');
	            console.log(txnReceipt);

    e.innerHTML = "Creating Stream...";
            var name = document.getElementById("name").value;
            sessionStorage.setItem('streamName', name);
            var dur = 0;
            dur = document.getElementById("duration").value;
            await fetch('/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: {
                        name: name,
                        dur: dur,
                        rec: txnReceipt
                    }
                })
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error("HTTP status " + res.status);
                }
                return res.json()
            })
            .then(res => {
                console.log(res);
    e.innerHTML = "Redirecting...";
                sessionStorage.setItem('streamData', JSON.stringify(res));
                location.href = "/show";
            })
            .catch(err => {
                console.log(err)
            })

            return


        });

    } catch (err) {
        logs.innerHTML += `<p>some error occoured...</p><p>please retry</p>`;
		logs.innerHTML+=`<p>Please make sure that  METAMASK is installed.</p>`;
		scrollToBottom("logs");
        console.log(err);
        e.innerHTML = "RETRY"
    }
}

const txnFailed = (error) => {
    console.log('failed');
}

const scrollToBottom = (id) => {
    const element = document.getElementById(id);
    element.scrollTop = element.scrollHeight;
}
