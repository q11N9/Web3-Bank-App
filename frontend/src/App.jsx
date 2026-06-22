import { useEffect, useState } from "react";
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
  const [bankBalanceWei, setBankBalanceWei] = useState(0n);

  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("MetaMask chưa được cài đặt");
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
      setStatus("Đang kết nối tới ví...");

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
      const signer = await provider.getSigner();

      const currentAddress = address || await signer.getAddress();

      const contract = new ethers.Contract(
        contractAddress.Bank,
        BankArtifact.abi,
        signer
      );

      const walletWei = await provider.getBalance(currentAddress);
      const bankWei = await contract.getMyBalance();
      const contractWei = await contract.getContractBalance();

      setAccount(currentAddress);
      setWalletBalance(ethers.formatEther(walletWei));
      setBankBalance(ethers.formatEther(bankWei));
      setBankBalanceWei(bankWei);
      setContractBalance(ethers.formatEther(contractWei));
    } catch (error) {
      console.error(error);
      setStatus(error.message);
    }
  }

  async function deposit() {
    try {
      if (!amount || Number(amount) <= 0) {
        setStatus("Hãy điền vào số tiền gửi thích hợp");
        return;
      }

      setStatus("Đợi chấp nhận từ Metamask...");

      const contract = await getContract();

      const tx = await contract.deposit({
        value: ethers.parseEther(amount),
      });

      setTxHash(tx.hash);
      setStatus("Giao dịch đã được gửi. Đang chờ chấp thuận...");

      await tx.wait();

      setStatus("Gửi tiền thành công");
      setAmount("");

      await loadBalances();
    } catch (error) {
      console.error(error);
      setStatus(error.reason || error.message);
    }
  }

  async function withdraw() {
    try {
      setStatus("");

      if (!account) {
        setStatus("Vui lòng kết nối ví MetaMask trước.");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        setStatus("Vui lòng nhập số ETH muốn rút lớn hơn 0.");
        return;
      }

      const withdrawWei = ethers.parseEther(amount);

      if (withdrawWei > bankBalanceWei) {
        setStatus(
          `Số dư trong Bank không đủ. Bạn hiện chỉ có ${bankBalance} ETH trong Bank contract.`
        );
        return;
      }

      const contract = await getContract();

      setStatus("Đang chờ xác nhận giao dịch trên MetaMask...");

      const tx = await contract.withdraw(withdrawWei);

      setTxHash(tx.hash);
      setStatus("Giao dịch đã được gửi. Đang chờ xác nhận...");

      await tx.wait();

      setStatus("Rút tiền thành công");
      await loadBalances();
    } catch (error) {
      console.error(error);

      if (error.code === "ACTION_REJECTED") {
        setStatus("Người dùng đã từ chối giao dịch trên MetaMask.");
      } else {
        setStatus("Rút tiền thất bại. Vui lòng kiểm tra lại giao dịch.");
      }
    }
  } 

  async function transferInternal() {
  try {
    setStatus("");

    // Kiểm tra đầu vào cơ bản từ giao diện
    if (!account) {
      setStatus("Vui lòng kết nối ví MetaMask trước.");
      return;
    }
    if (!transferTo || !ethers.isAddress(transferTo)) {
      setStatus("Địa chỉ ví người nhận không hợp lệ.");
      return;
    }
    if (!transferAmount || Number(transferAmount) <= 0) {
      setStatus("Vui lòng nhập số ETH muốn chuyển lớn hơn 0.");
      return;
    }

    const transferWei = ethers.parseEther(transferAmount);

    // Chặn từ giao diện nếu số dư không đủ
    if (transferWei > bankBalanceWei) {
      setStatus(`Số dư không đủ. Bạn chỉ có ${bankBalance} ETH.`);
      return;
    }

    const contract = await getContract();
    setStatus("Đang chờ xác nhận giao dịch chuyển tiền...");

    // Gọi hàm transfer trong Smart Contract
    const tx = await contract.transfer(transferTo, transferWei);
    
    setTxHash(tx.hash);
    setStatus("Giao dịch đã gửi. Đang chờ mạng lưới xác nhận...");

    await tx.wait();

    setStatus("Chuyển tiền nội bộ thành công!");
    setTransferTo("");
    setTransferAmount("");
    
    // Cập nhật lại số dư trên màn hình
    await loadBalances();
    } catch (error) {
      console.error(error);
      if (error.code === "ACTION_REJECTED") {
        setStatus("Người dùng đã hủy giao dịch.");
      } else {
        setStatus("Chuyển tiền thất bại. Vui lòng kiểm tra lại.");
      }
      //Debug line
      // setStatus(
      //   error.reason ||
      //   error.shortMessage ||
      //   error.message ||
      //   JSON.stringify(error)
      // );
    }
  }

  useEffect(() => {
  if (!window.ethereum) return;

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setAccount("");
      setWalletBalance("0");
      setBankBalance("0");
      setContractBalance("0");
      setStatus("Ví MetaMask đã ngắt kết nối.");
      return;
    }

    const newAccount = accounts[0];

    setAccount(newAccount);
    setStatus("Đã chuyển tài khoản MetaMask.");

    await loadBalances(newAccount);
  };

  window.ethereum.on("accountsChanged", handleAccountsChanged);

  return () => {
    window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
  };
}, []);
  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", fontFamily: "Arial" }}>
      <h1>Bank dApp</h1>

      <button onClick={connectWallet}>
        {account ? "Ví đã kết nối" : "Kết nối tới ví"}
      </button>

      <hr />

      <p>
        <strong>Tài khoản của bạn:</strong>{" "}
        {account || "Chưa kết nối"}
      </p>

      <p>
        <strong>Số dư trong ví (ETH):</strong> {walletBalance} ETH
      </p>

      <p>
        <strong>Số dư trong bank:</strong> {bankBalance} ETH
      </p>

      <p>
        <strong>Tổng số dư của smart contract:</strong> {contractBalance} ETH
      </p>

      <button onClick={() => loadBalances()}>
        Refresh Balances
      </button>

      <hr />

      {/* <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ padding: "8px", marginRight: "8px" }}
      />

      <button onClick={deposit}>Deposit</button>
      <button onClick={withdraw} style={{ marginLeft: "8px" }}>
        Withdraw
      </button> */}


      {/* KHU VỰC NẠP / RÚT TIỀN */}
      <h3>Nạp / Rút</h3>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Số lượng (ETH)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: "8px", marginRight: "8px" }}
        />
        <button onClick={deposit}>Nạp tiền</button>
        <button onClick={withdraw} style={{ marginLeft: "8px" }}>
          Rút tiền
        </button>
      </div>

      {/* KHU VỰC CHUYỂN TIỀN NỘI BỘ (MỚI THÊM) */}
      <h3>Chuyển tiền nội bộ</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "350px", width: "100%", margin: "0 auto 20px auto", }}>
        <input
          type="text"
          placeholder="Địa chỉ người nhận (0x...)"
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
          style={{ padding: "8px", width: "100%", boxSizing: "border-box", }}
        />
        <input
          type="text"
          placeholder="Số lượng (ETH)"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          style={{ padding: "8px", width: "100%", boxSizing: "border-box", }}
        />
        <button onClick={transferInternal} style={{ padding: "8px", width: "100%", }}>
          Chuyển tiền
        </button>
      </div>


      <hr />
      
      <p>
        <strong>Trạng thái:</strong> {status}
      </p>

      {txHash && (
        <p>
          <strong>Giao dịch cuối:</strong> {txHash}
        </p>
      )}


    </div>
  );
}

export default App;