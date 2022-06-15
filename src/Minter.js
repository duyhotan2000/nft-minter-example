import { useEffect, useState } from "react";
import {
  connectWallet,
  getCurrentWalletConnected,
  mintNFT,
  deployContract
} from "./utils/interact.js";
import { pinFileToIPFS } from "./utils/pinata.js";

const Minter = (props) => {
  //State variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mintedAddress, setMintedAddress] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  // const [url, setURL] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [deployLoading, setDeployLoading] = useState(false);

  useEffect(async () => {
    //TODO: implement
    const { address, status } = await getCurrentWalletConnected();
    setWallet(address);
    setStatus(status);

    addWalletListener();
  }, []);

  const connectWalletPressed = async () => {
    //TODO: implement
    connectWallet();
  };

  const onMintPressed = async () => {
    //TODO: implement
    if (!selectedFile) {
      return;
    }
    setLoading(true);
    const { cid } = await pinFileToIPFS(selectedFile);
    const { status } = await mintNFT(
      contractAddress,
      name,
      description,
      `ipfs://${cid}/${selectedFile.name}`,
      mintedAddress
    );
    setStatus(status);
    setLoading(false);
  };

  const onDeployPressed = async () => {
    setDeployLoading(true);
    const { status } = await deployContract();
    setStatus(status);
    setDeployLoading(false);
  };

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Metamask using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <h1 id="title">🧙‍♂️ ShareRing NFT Minter</h1>
      <p>
        Simply add your asset, name, and description, then press "Mint."
      </p>
      <form>
        {/* <h2>🖼 Link to asset: </h2>
        <input
          type="text"
          placeholder="e.g. https://gateway.pinata.cloud/ipfs/<hash>"
          onChange={(event) => setURL(event.target.value)}
        /> */}
        <h2>🖼 Asset select: </h2>
        <input
          type="file"
          // value={selectedFile}
          onChange={(e) => setSelectedFile(e.target.files[0])}
        />
        <h2>🤔 Name: </h2>
        <input
          type="text"
          placeholder="e.g. My first NFT!"
          onChange={(event) => setName(event.target.value)}
        />
        <h2>✍️ Description: </h2>
        <input
          type="text"
          placeholder="e.g. Even cooler than cryptokitties ;)"
          onChange={(event) => setDescription(event.target.value)}
        />
        <h2>📄 Contract Address: </h2>
        <input
          type="text"
          placeholder="Contract to mint NFT, must support safeMint function"
          onChange={(event) => setContractAddress(event.target.value)}
        />
        <h2>💎 Minted to: </h2>
        <input
          type="text"
          placeholder="Address to receive token"
          onChange={(event) => setMintedAddress(event.target.value)}
        />
      </form>
      <button id="mintButton" onClick={onMintPressed} disabled={loading || deployLoading}>
        {loading ? "Minting..." : "Mint NFT"}
      </button>
      <button id="deployButton" onClick={onDeployPressed} disabled={deployLoading || loading}>
        {deployLoading ? "Deploying..." : "Deploy ERC721 Contract"}
      </button>
      <p id="status">{status}</p>
    </div>
  );
};

export default Minter;
