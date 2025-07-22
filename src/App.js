import { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import faucetContract from "./ethereum/faucet";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [signer, setSigner] = useState();
  const [fcContract, setFcContract] = useState();
  const [withdrawalError, setWithdrawalError] = useState("");
  const [withdrawalSuccess, setWithdrawalSuccess] = useState("");
  const [transactionData, setTransactionData] = useState("");
  const [upliftAction, setUpliftAction] = useState("");
  const [upliftDate, setUpliftDate] = useState("");
  const [upliftInfo, setUpliftInfo] = useState(null);

  useEffect(() => {
    getCurrentWalletConnected();
    addWalletListener();
  }, [walletAddress]);

  const connectWallet = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        /* get accounts */
        const accounts = await provider.send("eth_requestAccounts", []);

        /* get signer */
        setSigner(provider.getSigner());

        /* local contract instance */
        setFcContract(faucetContract(provider));

        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const getCurrentWalletConnected = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      try {
        /* get provider */
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        /* get accounts */
        const accounts = await provider.send("eth_accounts", []);

        if (accounts.length > 0) {
          /* get signer */
          setSigner(provider.getSigner());

          /* local contract instance */
          setFcContract(faucetContract(provider));

          setWalletAddress(accounts[0]);
          console.log(accounts[0]);
        } else {
          console.log("Connect to MetaMask using the Connect button");
        }
      } catch (err) {
        console.error(err.message);
      }
    } else {
      /* MetaMask is not installed */
      console.log("Please install MetaMask");
    }
  };

  const addWalletListener = async () => {
    if (typeof window != "undefined" && typeof window.ethereum != "undefined") {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0]);
        console.log(accounts[0]);
      });
    } else {
      /* MetaMask is not installed */
      setWalletAddress("");
      console.log("Please install MetaMask");
    }
  };

  const getUPLCHandler = async () => {
    setWithdrawalError("");
    setWithdrawalSuccess("");
    setUpliftInfo(null);
    try {
      const fcContractWithSigner = fcContract.connect(signer);
      // Pass walletAddress to the contract if needed, otherwise just use for display
      const response = await fcContractWithSigner.requestTokens();
      console.log(response);

      setWithdrawalSuccess("Uplifting completed!");
      setTransactionData(response.hash);
      setUpliftInfo({
        walletAddress,
        upliftAction,
        upliftDate,
      });
    } catch (err) {
      console.error(err.message);
      setWithdrawalError(err.message);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <h1 className="navbar-item is-size-4">Uplift Coin (UPLC)</h1>
          </div>
          <div id="navbarMenu" className="navbar-menu">
            <div className="navbar-end is-align-items-center">
              <button
                className="button is-white connect-wallet"
                onClick={connectWallet}
              >
                <span className="is-link has-text-weight-bold">
                  {walletAddress && walletAddress.length > 0
                    ? `Connected: ${walletAddress.substring(
                        0,
                        6
                      )}...${walletAddress.substring(38)}`
                    : "Connect Wallet"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <section className="hero is-fullheight">
        <div className="faucet-hero-body">
          <div className="container has-text-centered main-content">
            <h1 className="title is-1">Uplift Coin Faucet</h1>
            <p>10 UPLC</p>
            <div className="mt-5">
              {withdrawalError && (
                <div className="withdraw-error">{withdrawalError}</div>
              )}
              {withdrawalSuccess && (
                <div className="withdraw-success">{withdrawalSuccess}</div>
              )}{" "}
            </div>
            <div className="box address-box">
              <div className="columns mt-2">
                <div className="column">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="Your wallet address (0x...)"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
                <div className="column">
                  <input
                    className="input is-medium"
                    type="text"
                    placeholder="Describe your uplifting action"
                    value={upliftAction}
                    onChange={(e) => setUpliftAction(e.target.value)}
                  />
                </div>
                <div className="column">
                  <input
                    className="input is-medium"
                    type="date"
                    placeholder="Date of uplifting"
                    value={upliftDate}
                    onChange={(e) => setUpliftDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="columns">
                <div className="column">
                  <button
                    className="button is-link is-medium"
                    onClick={getUPLCHandler}
                    disabled={!walletAddress}
                  >
                    GET TOKENS
                  </button>
                </div>
              </div>
              <article className="panel is-grey-darker">
                <p className="panel-heading">Transaction Data</p>
                <div className="panel-block">
                  <p>
                    {transactionData
                      ? `Transaction hash: ${transactionData}`
                      : "--"}
                  </p>
                </div>
                {upliftInfo && (
                  <div className="panel-block">
                    <p>
                      Wallet: {upliftInfo.walletAddress || "--"} <br />
                      Uplifting Action: {upliftInfo.upliftAction || "--"} <br />
                      Date: {upliftInfo.upliftDate || "--"}
                    </p>
                  </div>
                )}
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
