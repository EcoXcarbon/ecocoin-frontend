// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract EcoFaucet is Ownable {
    IERC20 public ecoToken;
    uint256 public constant FAUCET_AMOUNT = 50 * 1e18;

    mapping(address => bool) public hasClaimed;

    event TokensClaimed(address indexed user, uint256 amount);

    constructor(address _ecoToken) {
        ecoToken = IERC20(_ecoToken);
        transferOwnership(msg.sender);
    }

    function claim() external {
        require(!hasClaimed[msg.sender], "You have already claimed.");
        require(ecoToken.balanceOf(address(this)) >= FAUCET_AMOUNT, "Faucet empty");

        hasClaimed[msg.sender] = true;
        require(ecoToken.transfer(msg.sender, FAUCET_AMOUNT), "Token transfer failed");

        emit TokensClaimed(msg.sender, FAUCET_AMOUNT);
    }

    function faucetBalance() public view returns (uint256) {
        return ecoToken.balanceOf(address(this));
    }

    function refill(uint256 amount) public onlyOwner {
        require(ecoToken.transferFrom(msg.sender, address(this), amount), "Refill failed");
    }
}
