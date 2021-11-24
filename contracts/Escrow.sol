// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title An Escrow contract that safeguard escrowed funds paid by buyer until buyer receives instrument
/// @dev This contract is forked from OpenZeppelin's implementation of an Escrow contract:
/// @dev OpenZeppelin Contracts v4.3.2 (utils/escrow/Escrow.sol)
/// @author Markus Osterlund
/// @notice It accepts ETH from horn buyers which is securely held until the horn is shipped by seller and subsequently received by buyer at which time funds are released to seller

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * Intended usage: This contract (and derived escrow contracts) should be a
 * standalone contract, that only interacts with the contract that instantiated
 * it. That way, it is guaranteed that all Ether will be handled according to
 * the `Escrow` rules, and there is no need to check for payable functions or
 * transfers in the inheritance tree. The contract that uses the escrow as its
 * payment method should be its owner, and provide public methods redirecting
 * to the escrow's deposit and withdraw.
 */

contract Escrow is Ownable {
    using Address for address payable;

    event Deposited(address indexed payee, uint256 weiAmount);
    event Withdrawn(address indexed payee, uint256 weiAmount);

    mapping(address => uint256) private _deposits;

    function depositsOf(address payee) public view returns (uint256) {
        return _deposits[payee];
    }

    ///@dev Stores the sent amount as credit to be withdrawn.
    ///@param payee The destination address of the funds.
    function deposit(address payee) public payable virtual onlyOwner {
        uint256 amount = msg.value;
        _deposits[payee] += amount;
        emit Deposited(payee, amount);
    }

    /// @dev Withdraw an amount, corresponding to a single shipment, from payee balance, forwarding all gas to the recipient.
    /// @param payee The address whose funds will be withdrawn and transferred to.
    /// @param amt The amount to be withdrawn, corresponding to the listPrice of the Horn NFT being shipped
    function withdraw(address payable payee, uint amt) public virtual onlyOwner {
        uint256 payment = amt;
        _deposits[payee] -= payment;
        payee.sendValue(payment);
        emit Withdrawn(payee, payment);
    }
}
