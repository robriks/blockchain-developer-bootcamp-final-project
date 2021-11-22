// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "truffle/DeployedAddresses.sol";
interface hornMarketplace {
        function mintThenListNewHornNFT(string calldata _make, string calldata _model, string calldata _style, uint _serialNumber, uint _listPrice) external returns (uint);
        function mintButDontListNewHornNFT(string calldata _make, string calldata _model, string calldata _style, uint _serialNumber) external returns (uint);
        function listExistingHornNFT(uint, uint) external returns (uint);
        function markHornShipped(uint, string calldata) external;
    }

contract Seller {

    hornMarketplace _market; // store marketplace contract address for low level calls
    uint serialNumberCounter;
    uint _defaultListPrice;

    // @param Constructor parameter _mkt passed in by the HornMarketplace_test contract that instantiates this one
    constructor() { // in morning delete this constructor parameter and use deployed address of market
        serialNumberCounter = 1;
        _defaultListPrice = 420;
    }


    function mintThenListTestHornNFT(address _mkt) public returns (uint) {
        _market = hornMarketplace(_mkt);
        _market.mintThenListNewHornNFT(
            "Berg", 
            "Double", 
            "Geyer", 
            serialNumberCounter, 
            _defaultListPrice
            );

        uint currentHornId = serialNumberCounter;
        serialNumberCounter++;
        return currentHornId;
    }

    function mintDontListTestHornNFT(address _mkt) public returns (uint) {
        _market = hornMarketplace(_mkt);
        _market.mintButDontListNewHornNFT(
            "Berg",
            "Double",
            "Geyer", 
            serialNumberCounter
        );
        uint currentHornId = serialNumberCounter;
        serialNumberCounter++;
        return currentHornId;
    }

    function listExisting(address _mkt, uint _Id) public returns (uint) {
        _market = hornMarketplace(_mkt);
        uint currentHornId = _Id;
        _market.listExistingHornNFT(
            currentHornId,
            _defaultListPrice
        );
        return currentHornId;
    }

    function markShipped(address _mkt, uint _Id, string memory _shipTo) public {
        _market = hornMarketplace(_mkt);
        uint currentHornId = _Id;
        string memory shipTo = _shipTo;
        _market.markHornShipped(currentHornId, shipTo);
    }

    receive() external payable {}
}
