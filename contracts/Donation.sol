// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "hardhat/console.sol";

contract Donation {

  address public owner;
  address[] public donators;
  mapping(address => uint256) donations;
  uint256 public totalBalance = 0;

  constructor() {
    owner = msg.sender;
  }

  function gatherDonation() public payable {
    if (donations[msg.sender] == 0) {
      donators.push(msg.sender);
    }
    donations[msg.sender] += msg.value;
    totalBalance += msg.value;
  }

  function withdraw(address payable account, uint256 amount) external {
    require(msg.sender == owner, "Not an owner");
    require(amount <= address(this).balance, "Fund balance not enough");
    account.transfer(amount);
    totalBalance -= amount;
  }

  function getDonators() public view returns (address[] memory) {
    return donators;
  }

  function getDonation(address account) external view returns (uint256) {
    return donations[account];
  }
}
