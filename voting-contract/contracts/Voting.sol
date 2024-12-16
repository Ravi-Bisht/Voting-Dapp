// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    address public owner;
    
    // mapping(address => bool) public registeredVoters;

    mapping(address => bool) public hasVoted;

    uint256 public votingStart;
    uint256 public votingEnd;

    event VoterRegistered(address indexed voter); 
    event VoteCast(address indexed voter, uint256 candidateIndex);

    constructor(string[] memory _candidateNames, uint256 _durationInMinutes) {
        require(_candidateNames.length > 0, "At least one candidate is required.");

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
        owner = msg.sender;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    // Removing this function cause then we have the register all the users that can vote
    // function registerVoter(address _voter) public onlyOwner {
    //     require(!registeredVoters[_voter], "Voter is already registered.");
    //     registeredVoters[_voter] = true;
    //     emit VoterRegistered(_voter);
    // }

    function vote(uint256 _candidateIndex) public {
        require(block.timestamp >= votingStart && block.timestamp < votingEnd, "Voting is not active.");
        // require(registeredVoters[msg.sender], "You are not a registered voter.");
        require(!hasVoted[msg.sender], "You have already voted.");
        require(_candidateIndex < candidates.length, "Invalid candidate index.");

        candidates[_candidateIndex].voteCount++;
        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, _candidateIndex);
    }

    function getAllVotesOfCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidate(uint256 _index) public view returns (string memory name, uint256 voteCount) {
        require(_index < candidates.length, "Invalid candidate index.");
        Candidate memory candidate = candidates[_index];
        return (candidate.name, candidate.voteCount);
    }

    function getRemainingTime() public view returns (uint256) {
        require(block.timestamp >= votingStart, "Voting has not started yet.");
        if (block.timestamp >= votingEnd) {
            return 0;
        }
        return votingEnd - block.timestamp;
    }
}
