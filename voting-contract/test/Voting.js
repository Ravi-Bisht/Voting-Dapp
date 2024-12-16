const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Voting Contract", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;
  const candidates = ["Alice", "Bob", "Charlie"];
  const duration = 10; // Duration in minutes

  beforeEach(async function () {
    // Deploy the contract
    [owner, addr1, addr2] = await ethers.getSigners();
    Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(candidates, duration);
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should initialize with the correct candidates", async function () {
      for (let i = 0; i < candidates.length; i++) {
        const candidate = await voting.getCandidate(i);
        expect(candidate.name).to.equal(candidates[i]);
        expect(candidate.voteCount).to.equal(0);
      }
    });

   it("Should set the correct voting duration", async function () {
     const votingStart = await voting.votingStart();
     const votingEnd = await voting.votingEnd();

     const votingStartNumber = Number(votingStart.toString());
     const votingEndNumber = Number(votingEnd.toString());

     const expectedEnd = votingStartNumber + duration * 60;
     expect(votingEndNumber).to.equal(expectedEnd);
   });
  });

  describe("Voting", function () {
    it("Should allow a user to vote for a candidate", async function () {
      await voting.connect(addr1).vote(0);
      const candidate = await voting.getCandidate(0);
      expect(candidate.voteCount).to.equal(1);

      const hasVoted = await voting.hasVoted(addr1.address);
      expect(hasVoted).to.be.true;
    });

    it("Should not allow a user to vote twice", async function () {
      await voting.connect(addr1).vote(0);

      await expect(voting.connect(addr1).vote(0)).to.be.revertedWith(
        "You have already voted."
      );
    });

    it("Should not allow voting outside the voting period", async function () {
      // Simulate the passage of time to after the voting period
      await ethers.provider.send("evm_increaseTime", [duration * 60 + 1]);
      await ethers.provider.send("evm_mine");

      await expect(voting.connect(addr1).vote(0)).to.be.revertedWith(
        "Voting is not active."
      );
    });

    it("Should not allow voting for an invalid candidate", async function () {
      await expect(
        voting.connect(addr1).vote(candidates.length)
      ).to.be.revertedWith("Invalid candidate index.");
    });
  });

  describe("View Functions", function () {
    it("Should return the correct remaining time", async function () {
      const remainingTime = await voting.getRemainingTime();
      expect(remainingTime).to.be.gt(0);

      // Simulate the passage of time
      await ethers.provider.send("evm_increaseTime", [duration * 60]);
      await ethers.provider.send("evm_mine");

      const remainingTimeAfter = await voting.getRemainingTime();
      expect(remainingTimeAfter).to.equal(0);
    });

    it("Should return all votes of candidates", async function () {
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(1);

      const allCandidates = await voting.getAllVotesOfCandidates();
      expect(allCandidates[0].voteCount).to.equal(1);
      expect(allCandidates[1].voteCount).to.equal(1);
      expect(allCandidates[2].voteCount).to.equal(0);
    });

    it("Should return the correct candidate details", async function () {
      const candidate = await voting.getCandidate(1);
      expect(candidate.name).to.equal(candidates[1]);
      expect(candidate.voteCount).to.equal(0);
    });
  });
});
