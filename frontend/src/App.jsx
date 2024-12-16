import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import VotingABI from "../../voting-contract/artifacts/contracts/Voting.sol/Voting.json"
import "./App.css"; 
import deployedContract from "../../voting-contract/deployedContract.json"

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [remainingTime, setRemainingTime] = useState(0);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  console.log(deployedContract);

  const contractAddress = deployedContract.address;
  

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
    } else {
      alert("MetaMask is not installed!");
    }
  };

  const loadBlockchainData = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const votingContract = new ethers.Contract(
        contractAddress,
        VotingABI.abi,
        signer
      );

      setProvider(provider);
      setSigner(signer);
      setContract(votingContract);

      const fetchedCandidates = await votingContract.getAllVotesOfCandidates();
      setCandidates(fetchedCandidates);

      const timeRemaining = await votingContract.getRemainingTime();
      setRemainingTime(Number(timeRemaining));

      if (Number(timeRemaining) === 0) calculateWinner(fetchedCandidates);
    }
  };

  const voteForCandidate = async (candidateIndex) => {
    try {
      setLoading(true);
      const tx = await contract.vote(candidateIndex);
      await tx.wait();
      const updatedCandidates = await contract.getAllVotesOfCandidates();
      setCandidates(updatedCandidates);

      const timeRemaining = await contract.getRemainingTime();
      setRemainingTime(Number(timeRemaining));

      if (Number(timeRemaining) === 0) calculateWinner(updatedCandidates);
    } catch (error) {
      console.error("Voting failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWinner = (candidates) => {
    if (candidates.length === 0) return;

    let highestVotes = 0;
    let winnerCandidate = null;

    candidates.forEach((candidate) => {
      const votes = parseInt(candidate.voteCount.toString());
      if (votes > highestVotes) {
        highestVotes = votes;
        winnerCandidate = candidate.name;
      }
    });

    setWinner(winnerCandidate || "No votes cast.");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="navbar-heading">VotingDApp</h1>
        <button className="connect-button" onClick={connectWallet}>
          {walletAddress
            ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(
                walletAddress.length - 4
              )}`
            : "Connect Wallet"}
        </button>
      </nav>

      {/* Content */}
      <div className="main-content">
        <h1 className="main-title">List Of Candidates</h1>
        <div className="status">
          {remainingTime > 0 ? (
            <p>
              <strong>Time Remaining:</strong> {formatTime(remainingTime)}
            </p>
          ) : (
            <p>
              <strong>Voting has ended.</strong>
            </p>
          )}

          {winner && (
            <p>
              <strong>Winner:</strong> {winner}
            </p>
          )}
        </div>

        <div className="candidates-list">
          {candidates.length > 0 ? (
            candidates.map((candidate, index) => (
              <div key={index} className="candidate-card">
                <p>
                  <strong>Name:</strong> {candidate.name}
                </p>
                <p>
                  <strong>Votes:</strong> {candidate.voteCount.toString()}
                </p>
                {remainingTime > 0 && (
                  <button
                    className="vote-button"
                    onClick={() => voteForCandidate(index)}
                    disabled={loading}
                  >
                    {loading ? "Voting..." : `Vote for ${candidate.name}`}
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>Loading candidates...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

