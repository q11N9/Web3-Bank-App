import { useState } from "react";
import { ethers } from "ethers";

import BankArtifact from "./abi/Bank.json";
import contractAddress from "./contracts/contract-address.json";

function App() {
  const [account, setAccount] = useState("");
  const [walletBalance, setWalletBalance] = useState("0");
  const [bankBalance, setBankBalance] = useState("0");
  const [contractBalance, setContractBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [status, setStatus] = useState("");

  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    return new ethers.BrowserProvider(window.ethereum);
  }

  async function getContract() {
    const provider = await getProvider();
    const signer = await provider.getSigner();

    return new ethers.Contract(
      contractAddress.Bank,
      BankArtifact.abi,
      signer
    );
  }

  async function connectWallet() {
    try {
      setStatus("Connecting wallet...");

      const provider = await getProvider();

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);
      setStatus("Wallet connected");

      await loadBalances(address);
    } catch (error) {
      console.error(error);
      setStatus(error.message);
    }
  }

  async function loadBalances(address = account) {
    try {
      if (!address) return;

      const provider = await getProvider();
      const contract = await getContract();

      const walletWei = await provider.getBalance(address);
      const bankWei = await contract.getMyBalance();
      const contractWei = await contract.getContractBalance();

      setWalletBalance(ethers.formatEther(walletWei));
      setBankBalance(ethers.formatEther(bankWei));
      setContractBalance(ethers.formatEther(contractWei));
    } catch (error) {
      console.error(error);
      setStatus(error.message);
    }
  }

  async function deposit() {
    try {
      if (!amount || Number(amount) <= 0) {
        setStatus("Please enter a valid amount");
        return;
      }

      setStatus("Waiting for MetaMask confirmation...");

      const contract = await getContract();

      const tx = await contract.deposit({
        value: ethers.parseEther(amount),
      });

      setTxHash(tx.hash);
      setStatus("Transaction sent. Waiting for confirmation...");

      await tx.wait();

      setStatus("Deposit successful");
      setAmount("");

      await loadBalances();
    } catch (error) {
      console.error(error);
      setStatus(error.reason || error.message);
    }
  }

  async function withdraw() {
    try {
      if (!amount || Number(amount) <= 0) {
        setStatus("Please enter a valid amount");
        return;
      }

      setStatus("Waiting for MetaMask confirmation...");

      const contract = await getContract();

      const tx = await contract.withdraw(ethers.parseEther(amount));

      setTxHash(tx.hash);
      setStatus("Transaction sent. Waiting for confirmation...");

      await tx.wait();

      setStatus("Withdraw successful");
      setAmount("");

      await loadBalances();
    } catch (error) {
      console.error(error);
      setStatus(error.reason || error.message);
    }
  }

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Bank dApp</h1>

      <button onClick={connectWallet}>
        {account ? "Wallet Connected" : "Connect Wallet"}
      </button>

      <hr />

      <p>
        <strong>Your account:</strong>{" "}
        {account || "Not connected"}
      </p>

      <p>
        <strong>Wallet ETH balance:</strong> {walletBalance} ETH
      </p>

      <p>
        <strong>Your Bank balance:</strong> {bankBalance} ETH
      </p>

      <p>
        <strong>Contract total balance:</strong> {contractBalance} ETH
      </p>

      <button onClick={() => loadBalances()}>
        Refresh Balances
      </button>

      <hr />

      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ padding: "8px", marginRight: "8px" }}
      />

      <button onClick={deposit}>Deposit</button>
      <button onClick={withdraw} style={{ marginLeft: "8px" }}>
        Withdraw
      </button>

      <hr />

      <p>
        <strong>Status:</strong> {status}
      </p>

      {txHash && (
        <p>
          <strong>Last transaction:</strong> {txHash}
        </p>
      )}
    </div>
  );
}

export default App;