// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.4;

// import "./KwikTrustNFT.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";

// contract KwikTrustFactory is AccessControl {
//     // Roles role new contract deployment
//     bytes32 public constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");

//     // mapping to store contract address against contract name
//     mapping(string => KwikTrustNFT) nftContractAddress;

//     // event to emit contract address after deployment
//     event mintingCreated(address _mintingContract);

//     constructor() {
//         _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
//         grantRole(DEPLOYER_ROLE, msg.sender);
//     }

//     function deployMintingContract(
//         string memory _name,
//         string memory _symbol,
//         address _minterAddress,
//         address _validatorAddress
//     ) public onlyRole(DEPLOYER_ROLE) {
//         KwikTrustNFT nftContract = new KwikTrustNFT(
//             _name,
//             _symbol,
//             _minterAddress,
//             _validatorAddress
//         );
//         nftContractAddress[_name] = nftContract;
//         emit mintingCreated(address(nftContract));
//     }

//     /**
//      * @dev Returns the contract address against the contract name
//      * @param _contractName NAME of contract
//      */

//     function getContractAddress(string memory _contractName)
//         public
//         view
//         returns (address)
//     {
//         return address(nftContractAddress[_contractName]);
//     }
// }
