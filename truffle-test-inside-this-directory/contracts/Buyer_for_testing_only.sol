// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "truffle/DeployedAddresses.sol";
interface hornMarketPlace {
        function mintThenListNewHornNFT(string calldata _make, string calldata _model, string calldata _style, uint _serialNumber, uint _listPrice) external returns (uint);
        function mintButDontListNewHornNFT(string calldata _make, string calldata _model, string calldata _style, uint _serialNumber) external returns (uint);
        function listExistingHornNFT(uint, uint) external returns (uint);
        function purchaseHornByHornId(uint, string memory) external payable;
        function markHornDeliveredAndOwnershipTransferred(uint) external;
    }

contract Buyer {

    hornMarketPlace _market; // store marketplace contract address for function calls
    uint _defaultListPrice;

    constructor() payable {
        _defaultListPrice = 420;
    }

    // @param Constructor parameter _mkt passed in by the function that calls this one
    function purchase(address _mkt, uint _currentHornId, string memory _shipTo) public payable {
        uint currentHornId = _currentHornId;
        string memory shipTo = _shipTo;
        _market = hornMarketPlace(_mkt);
        _market.purchaseHornByHornId{value: 420}(currentHornId, shipTo);
    }

    function markDelivered(address _mkt, uint _currentHornId) public {
        uint currentHornId = _currentHornId;
        _market = hornMarketPlace(_mkt);
        _market.markHornDeliveredAndOwnershipTransferred(currentHornId);
    }
}
