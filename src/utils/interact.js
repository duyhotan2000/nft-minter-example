import { pinFileToIPFS } from "./pinata.js";
import { ContractFactory } from "ethers";
import { ethers } from "ethers";
require("dotenv").config();

const contractABI = require("../contract-abi.json");
const contractInfo = require("../contract-bytecode.json");
const defaultContractAddress =
  process.env.REACT_APP_CONTRACT_ADDRESS ||
  "0x92648B3b720A539f10e6eaD822E112d3B796903A";

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      // const addressArray = await window.ethereum.request({
      //   method: "eth_requestAccounts",
      // });
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      // Prompt user for account connections
      const addressArray = await provider.send("eth_requestAccounts", []);
      const obj = {
        status: "👆🏽 Write a message in the text-field above.",
        address: addressArray[0],
      };
      return obj;
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      // const addressArray = await window.ethereum.request({
      //   method: "eth_accounts",
      // });
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      const addressArray = await provider.send("eth_accounts", []);
      if (addressArray.length > 0) {
        return {
          address: addressArray[0],
          status: "👆🏽 Write a message in the text-field above.",
        };
      } else {
        return {
          address: "",
          status: "🦊 Connect to Metamask using the top right button.",
        };
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      };
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
};

export const mintNFT = async (
  contractAddress,
  name,
  description,
  mediaIpfsUrl,
  mintedAddress
) => {
  contractAddress = contractAddress || defaultContractAddress;
  //error handling
  if (
    mediaIpfsUrl.trim() == "" ||
    name.trim() == "" ||
    description.trim() == ""
  ) {
    return {
      success: false,
      status: "❗Please make sure all fields are completed before minting.",
    };
  }

  //make metadata
  const metadata = new Object();
  metadata.name = name;
  metadata.image = mediaIpfsUrl;
  metadata.thumbnail = mediaIpfsUrl;
  metadata.description = description;

  //make pinata call
  // const pinataResponse = await pinJSONToIPFS(metadata);
  const file = new File([JSON.stringify(metadata)], "metadata.json");
  const pinataResponse = await pinFileToIPFS(file);
  if (!pinataResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    };
  }
  const tokenURI = `ipfs://${pinataResponse.cid}/metadata.json`;
  // window.contract = await new web3.eth.Contract(contractABI, contractAddress);
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  window.contract = new ethers.Contract(contractAddress, contractABI, signer);

  //set up your Ethereum transaction
  // const transactionParameters = {
  //   to: contractAddress, // Required except during contract publications.
  //   from: window.ethereum.selectedAddress, // must match user's active address.
  //   data: window.contract.methods
  //     .safeMint(mintedAddress || window.ethereum.selectedAddress, tokenURI)
  //     .encodeABI(), //make call to NFT smart contract
  // };
  const transaction = await window.contract.populateTransaction.safeMint(
    mintedAddress || window.ethereum.selectedAddress, tokenURI
  );

  //sign the transaction via Metamask
  try {
    // const txHash = await window.ethereum.request({
    //   method: "eth_sendTransaction",
    //   params: [transactionParameters],
    // });
    const result = await signer.sendTransaction({
      to: contractAddress,
      data: transaction.data,
    });
    const txHash = result.hash;
    return {
      success: true,
      status: <span><p>✅ Check out your transaction on Polygonscan: <a target="_blank" href={`https://mumbai.polygonscan.com/tx/${txHash}`}>https://mumbai.polygonscan.com/tx/${txHash}</a></p></span>,
    };
  } catch (error) {
    return {
      success: false,
      status: "😥 Something went wrong: " + error.message,
    };
  }
};

export const deployContract = async () => {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // There is only ever up to one account in MetaMask exposed
    const signer = provider.getSigner();
    const factory = new ContractFactory(
      contractInfo.abi,
      contractInfo.bytecode,
      signer
    );
  
    // If your contract requires constructor args, you can specify them here
    const contract = await factory.deploy();
    return {
      success: true,
      status: "Contract deployed successfully. Contract address: " + contract.address + ", transaction hash: " + contract.deployTransaction.hash
    }
  } catch(err) {
    return {
      success: false,
      status: "😥 Something went wrong: " + err.message,
    };
  }
};
