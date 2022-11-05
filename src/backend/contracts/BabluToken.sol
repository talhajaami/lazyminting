// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BabluToken is ERC20 {
    uint256 public tokenId = 0;

    event handleMint(uint256 id);

    constructor()
        ERC20("MEHTAB", "BABLU") {
        _mint(msg.sender, 1000000000000*10**18);

        }

    function mint(uint256 _amount)
        external
        returns (uint256)
    {
        tokenId++;
        _mint(msg.sender, _amount);
        emit handleMint(tokenId);
        return (tokenId);
    }
}