// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "./HornMarketplace.sol";

contract Helpers is HornMarketplace {

// @dev Function that sets status of existing horn NFT to OwnedNotForSale, 
    // @notice Used in case minter only wants verifiable historical record or owner decides not to sell the instrument after listing or wishes to refund a buyer
    // @notice Must be set to internal after testing is done, only temporarily set to public for testing purposes
    function sellerInitiateRefundOrSetStatusToOwnedNotForSale(uint __hornId) public /* internal onlySeller() */ returns (HornStatus) {
        if (horns[__hornId].status == HornStatus.ListedForSale) {
          // Delete hornId from hornsForSale uint[] array so it is no longer displayed
          for (uint i = 0; i < hornsForSale.length; i++) {
            if (hornsForSale[i] == __hornId) {
                delete hornsForSale[i];
            }
        }
            horns[__hornId].status = HornStatus.OwnedNotForSale;
        } else if (horns[__hornId].status == HornStatus.PaidFor) {
            revert("Horn has already been purchased and paid for by a buyer and on-chain refunds are not currently supported");
        } else if (horns[__hornId].status == HornStatus.Shipped) {
            revert("Horn has already been shipped and no longer qualifies for a refund, please complete the exchange and redo the exchange in reverse if you wish to switch back ownership");
        } else if (horns[__hornId].status == HornStatus.OwnedNotForSale) {
            revert("Horn is already marked as owned and not for sale");
        }

        return(HornStatus.OwnedNotForSale);
    }
}
