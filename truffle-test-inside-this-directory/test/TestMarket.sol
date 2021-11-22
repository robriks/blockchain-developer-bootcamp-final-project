// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/HornMarketplace.sol";
import "../contracts/Helpers.sol";
import "../contracts/Buyer_for_testing_only.sol";

interface aSeller {
    function mintThenListTestHornNFT(address) external returns (uint);
    function mintDontListTestHornNFT(address) external returns (uint);
    function listExisting(address, uint) external returns (uint);
    function markShipped(address, uint, string calldata) external;
}

interface aHelpers {
    function sellerInitiateRefundOrSetStatusToOwnedNotForSale(uint) external returns (uint);
}

contract TestMarket {

    // @param Declare targeted HornMarketplace, Helpers, market, Seller, and Buyer addresses for instantiating and subsequent testing
    HornMarketplace public market = HornMarketplace(DeployedAddresses.HornMarketplace());
    aHelpers helpers;
    aSeller seller;
    Buyer buyer;

    uint public initialBalance = 10 ether;
    uint serialNumberCounter;
    uint defaultListPrice;

    // @param This serialNumberCounter gives a new serialNumber to mint fresh Horn NFTs for every subsequent test without any hash collisions from make and serialNumber via the nonDuplicateMint modifier
    function beforeAll() public {
        seller = aSeller(DeployedAddresses.Seller());
        helpers = aHelpers(DeployedAddresses.Helpers());
        buyer = (new Buyer){value: 1000000}();
        serialNumberCounter = 0;
        defaultListPrice = 420;
    }

    function testMintThenListNewHornNFT() public {
        // Mints a fresh Horn NFT with defaultListPrice, increments serialNumber, returns currentHornId
        uint returnedHornId = seller.mintThenListTestHornNFT(address(market));
        uint expectedHornId = 1; // Expected current hornId should be 0 after minting to a fresh contract instance
        // Check that a fresh hornId was created
        Assert.equal(returnedHornId, expectedHornId, "returnedHornId given by mintAndListFreshTestHorn's Counter.Counter does not match the expectedHornId of 1 for a fresh contract instance's first mint");
    }

    function testBalance() public {
        uint returned = market.balanceOf(address(seller));
        uint expected = 1;

        Assert.equal(returned, expected, "failure");
    }

    function testListPrice() public {
        uint returnedListPrice = market.getListPriceByHornId(1);
        // Check that listPrice was updated properly
        Assert.equal(returnedListPrice, defaultListPrice, "ListPrice error");
    }

    // @param Uint array hornsForSale[] takes the horn struct at index 0
    function testAddedToForSaleArray() public {
        uint addedToForSaleArray = market.hornsForSale(0);
        uint currentHornId = 1;
        // Check that hornsForSale[] uint[] array was updated to include returnedHornId
        Assert.equal(addedToForSaleArray, currentHornId, "NFT hornId returned by hornsForSale[] uint[] array does not match the hornId that should have been pushed. Check index and execution of listExistingHornNFT()");
    }

    function testSerialNumber() public {
        uint returnedSerialNumber = market.getHornById(1).serialNumber;
        uint expectedSerialNumber = 1;
        // Check that serialNumber was properly set
        Assert.equal(returnedSerialNumber, expectedSerialNumber, "SerialNumber error");
    }

    function testMake() public {
        string memory returnedMake = market.getHornById(1).make;
        string memory expectedMake = "Berg";
        // Check that make was properly set
        Assert.equal(returnedMake, expectedMake, "Make error");
    }

    // function testTokenURI() public {
        // tokenURI variables here
    // }

    function testModel() public {
        string memory returnedModel = market.getHornById(1).model;
        string memory expectedModel = "Double";
        // Check that model was properly set
        Assert.equal(returnedModel, expectedModel, "Model error");
    }

    function testStyle() public {
        string memory returnedStyle = market.getHornById(1).style;
        string memory expectedStyle = "Geyer";
        // Check that style was properly set
        Assert.equal(returnedStyle, expectedStyle, "Style error");
    }

    function testCurrentOwner() public {
        address payable returnedCurrentOwner = market.getHornById(1).currentOwner;
        address payable expectedCurrentOwner = payable(address(seller));
        // Check that currentOwner of NFT was set to minter, in this case the seller address
        Assert.equal(returnedCurrentOwner, expectedCurrentOwner, "Horn NFT was minted to a different address than the seller address, check execution of mint and the currentOwner attribute");
    }

    // @dev Test current owner getter function by getting returned address of given hornId
    function testGetCurrentOwnerMappingAgainstStructAttributeByHornId() public returns (bool) {
        address payable mappingOwner = market.getCurrentOwnerByMapping(1);
        address payable structOwner = market.getCurrentOwnerByStructAttribute(1);
        
        Assert.equal(mappingOwner, structOwner, "currentOwner of horn NFT via mapping does not match that of currentOwner via struct attribute");
        return true;
    }

    // @dev Test price getter function of listPrice attribute inside horn struct of given HornId
    function testGetListPriceByHornId() public returns (bool) {
        uint testHornId = 1;
        require(market.getHornById(testHornId).listPrice > 0, "Horn NFT listPrice appears to be 0, check mint execution");
        uint expectedPrice = market.getHornById(testHornId).listPrice;
        uint returnedPrice = market.getListPriceByHornId(testHornId);

        Assert.equal(expectedPrice, returnedPrice, "Expected listPrice attribute of horn NFT struct does not match the one given by marketplace getter function");
        return true;
    }

    function testGetStatusOfHornByHornId() public returns (bool) {
        uint testHornId = 1;
        uint expectedStatus = 0; // 0 = ListedForSale, 1 = PaidFor, 2 = Shipped, 3 = OwnedNotForSale
        uint returnedStatus = uint(market.getStatusOfHornByHornId(testHornId));

        Assert.equal(returnedStatus, expectedStatus, "HornStatus enum uint returned by marketplace contract does not match the expected one given");
        return true;
    }

    // @notice Modifier tests to ensure that access control and other modifier functions work properly
    // @dev Attempts to call transfer ownership function from non-buyer address without paying
    // @dev Ensures only buyer can markHornDeliveredAndOwnershipTransferred
    function testOnlyBuyerWhoPaidOnListedForSale() public returns (bool) {
        uint testHornId = 1;

        try market.markHornDeliveredAndOwnershipTransferred(testHornId) returns (uint256 amt) {
            Assert.isZero(amt, "An account that hasn't paid or been marked as buyer pilfered the NFT!");
        } catch Error(string memory reason) {
            Assert.equal(reason, "This function may only be called by a buyer who has already paid", "Failed with unexpected reason");
        } catch (bytes memory /*lowLevelData*/) {
            return (false);
        }
    }

    // @dev Tests internal enum HornStatus functions to ensure that a currentOwner may change their mind about whether to list an instrument for sale
    // function testSellerInitiateRefundOrSetStatusToOwnedNotForSale() public {
    //    // Identify the test NFT that is ListedForSale
    //    uint testHornId = 1;

    //    uint returnedStatus = uint(helpers.sellerInitiateRefundOrSetStatusToOwnedNotForSale(testHornId));
    //    uint expectedStatus = 3;

    //    Assert.equal(returnedStatus, expectedStatus, "HornStatus returned by sellerInitiateRefundOrSetStatusToOwnedNotForSale() did not match HornStatus.OwnedNotForSale");
    // }

    function testOnlyBuyerWhoPaidOnOwnedNotForSale() public {
        uint testHornId = 1;
        bool r;
        (r,) = address(market).call(abi.encodeWithSignature("markHornDeliveredAndOwnershipTransferred(uint)", testHornId));

        Assert.isFalse(r, "An account that hasn't paid or been marked as buyer pilfered the NFT!");
    }

    // @dev Test minting an instrument for the first time but NOT listing it for sale
    function testMintButDontListNewHornNFT() public {
        // Mints but does not list a new Horn NFT from this contract and returns currentHornId
        uint returnedHornId = seller.mintDontListTestHornNFT(address(market));
        uint expectedHornId = 2; // Expected currentHornId is 2 as this is the second test Horn NFT minted
        
        Assert.equal(returnedHornId, expectedHornId, "returnedHornId given by mintAndListFreshTestHorn's Counter.Counter does not match the expectedHornId of 1 for a fresh contract instance's first mint");
    }

    function testBalanceOfSellerAgain() public {
        uint returnedBalanceHornId = market.getBalanceOf(address(seller)); 
        uint expectedBalance = 2;
        // Check that Horn NFT was _minted properly to the seller address
        Assert.equal(returnedBalanceHornId, expectedBalance, "Balance of sellerAddress as returned by ERC721 method does not match the expected Horn NFT tokenId of 1");
    }

    function testSerialNumberAgain() public {
        uint returnedSerialNumber = market.getHornById(2).serialNumber;
        uint expectedSerialNumber = 2;
        // Check that serialNumber was properly set
        Assert.equal(returnedSerialNumber, expectedSerialNumber, "SerialNumber error");
    }

    function testMakeAgain() public {
        string memory returnedMake = market.getHornById(2).make;
        string memory expectedMake = "Berg";
        // Check that make was properly set
        Assert.equal(returnedMake, expectedMake, "Make error");
    }

    // function testTokenURI() public {
        // tokenURI variables here
    // }

    function testModelAgain() public {
        string memory returnedModel = market.getHornById(2).model;
        string memory expectedModel = "Double";
        // Check that model was properly set
        Assert.equal(returnedModel, expectedModel, "Model error");
    }

    function testStyleAgain() public {
        string memory returnedStyle = market.getHornById(2).style;
        string memory expectedStyle = "Geyer";
        // Check that style was properly set
        Assert.equal(returnedStyle, expectedStyle, "Style error");
    }

    function testCurrentOwnerAgain() public {
        address payable returnedCurrentOwner = market.getHornById(2).currentOwner;
        address payable expectedCurrentOwner = payable(address(seller));
        // Check that currentOwner of NFT was set to minter, in this case the seller address
        Assert.equal(returnedCurrentOwner, expectedCurrentOwner, "Horn NFT was minted to a different address than the seller address, check execution of mint and the currentOwner attribute");
    }

     // @dev Test current owner getter function by getting returned address of given hornId
    function testGetCurrentOwnerMappingAgainstStructAttributeByHornIdAgain() public returns (bool) {
        address payable mappingOwner = market.getCurrentOwnerByMapping(2);
        address payable structOwner = market.getCurrentOwnerByStructAttribute(2);
        
        Assert.equal(mappingOwner, structOwner, "currentOwner of horn NFT via mapping does not match that of currentOwner via struct attribute");
        return true;
    }

    function testGetStatusOfHornByHornIdAgain() public returns (bool) {
        uint testHornId = 2;
        uint expectedStatus = 3; // 0 = ListedForSale, 1 = PaidFor, 2 = Shipped, 3 = OwnedNotForSale
        uint returnedStatus = uint(market.getStatusOfHornByHornId(testHornId));

        Assert.equal(returnedStatus, expectedStatus, "HornStatus enum uint returned by marketplace contract does not match the expected one given");
        return true;
    }

    // @dev Attempts to call listExistingHornNFT() from non-seller address who isn't currentOwner of the horn NFT
    // @dev Impersonator tries to sell someone else's NFT
    // @notice Following function is called by an account that isn't the same one who minted
    function testOnlySellerViaList() public {
        uint testHornId = 2;
        bool r;
        (r,) = address(market).call(abi.encodeWithSignature("listExistingHornNFT(uint, uint)", testHornId, defaultListPrice));

        Assert.isFalse(r, "A rogue account was able to sell a horn NFT that it didn't own");
    }

    // @dev Attempts to call purchaseHornById on a horn that is not currently listed for sale
    function testForSale() public {
        uint testHornId = 2;
        bool a;
        (a,) = address(market).call(abi.encodeWithSignature("purchaseHornByHornId(uint256, string)", testHornId, 'a'));

        Assert.isFalse(a, "Unexpected error");
    }

    function testListingExistingHornNFT() public {
        uint testHornId = 2; // HornId 1 and 2 are both currently not listed for sale

        //tokenURI variables 
        
        seller.listExisting(address(market), testHornId);
        uint addedToForSaleArray = market.hornsForSale(1);
        // Check that hornId was pushed into hornsForSale[] uint[] array
        Assert.equal(addedToForSaleArray, testHornId, "NFT hornId returned by hornsForSale[] uint[] array does not match the hornId that should have been pushed. Check index and execution of listExistingHornNFT()");
    }

    function testListPriceOfListExistingHornNFT() public {
        uint testHornId = 2;
        uint existingListPrice = market.getListPriceByHornId(testHornId);
        Assert.equal(existingListPrice, defaultListPrice, "List price of the new listing of an already existing NFT did not update properly, check execution of listExistingHornNFT()");
    }

    function testGetStatusOfHornOfExisting() public {
        uint testHornId = 2;
        uint returnedStatus = uint(market.getStatusOfHornByHornId(testHornId));
        uint expectedStatus = 0;

        Assert.equal(returnedStatus, expectedStatus, "HornStatus was not successfully changed to ListedForSale");
    }

    // @dev Make both horns listedForSale and return the hornsForSale array
    // @param Uint array hornsForSale[] takes the horn struct at index 0
    function testGetCurrentHornsForSaleExisting() public {
        uint[] memory hornsForSale = market.getCurrentHornsForSale();
        uint[] memory expectedIds = new uint[](2);
        expectedIds[0] = 1;
        expectedIds[1] = 2;
        // Check that hornsForSale[] uint[] array was updated to include returnedHornId
        Assert.equal(hornsForSale, expectedIds, "NFT hornId returned by hornsForSale[] uint[] array does not match the hornId that should have been pushed. Check index and execution of listExistingHornNFT()");
    }

    // @dev Attempts to call purchaseHornById without having paid enough ETH in msg.value
    function testPaidEnough() public payable {
        uint hornId = 1;
        bool r;

        // Function intended to throw on execution via msg.value being more than the listPrice
        (r,) = address(market).call{value: 42069}(abi.encodeWithSignature("purchaseHornByHornId(uint256, string)", hornId, 'a'));

        Assert.isFalse(r, "A  generous soul got ripped off and was able to purchase a horn with msg.value that didn't match listPrice");
    }

    // @dev Attempts to call markHornShipped when horn is not yet paid for in escrow
    function testHornPaidFor() public {
        uint hornId = 1;
        bool r;

        // Function intended to throw on execution because Escrow has not received funds yet
        (r,) = address(market).call(abi.encodeWithSignature("markHornShipped(uint)", hornId));

        Assert.isFalse(r, "A silly seller somehow shipped a horn without receiving payment");
    }

    function testHornPurchase() public {
        uint hornId = 1;
        string memory testAddress = "Ju St. Testing, Purchase Attempt New York, 11111";
        buyer.purchase(address(market), hornId, testAddress);
        uint returnedStatus = uint(market.getStatusOfHornByHornId(hornId));

        Assert.equal(returnedStatus, 1, "HornStatus was not successfully updated to PaidFor, check execution of purchaseHornByHornId()");
    }

    function testEscrowOwner() public {
        address returnedOwner = market.getEscrowOwner();
        
        Assert.equal(returnedOwner, address(market), "Escrow instantiation issue");
    }

    function testshouldHaveDeleted() public {
        uint shouldHaveBeenDeleted = market.hornsForSale(0);
        // Check that hornId was deleted from hornsForSale[] uint[] array
        Assert.isZero(shouldHaveBeenDeleted, "Value returned by hornsForSale[] uint[] array was not 0, meaning it was not properly deleted upon execution of purchase");
    }

    function testEscrowDeposit() public {
        uint returnedDeposits = market.getEscrowDepositValue(address(seller));

        // Check that escrow deposit was executed properly
        Assert.equal(returnedDeposits, defaultListPrice, "Amount of deposited funds to escrow contract does not match the listPrice attribute of the horn NFT, check escrow deposit execution");
    }

    function testReturnedShippingAddress() public {
        string memory testAddress = "Ju St. Testing, Purchase Attempt New York, 11111";
        string memory returnedShippingAddress = market.shippingAddresses(address(buyer));

         // Check that shippingAddresses mapping was updated with 2nd parameter
        Assert.equal(returnedShippingAddress, testAddress, "Shipping address returned by shippingAddresses[] mapping does not match the test address provided to purchaseHornByHornId function");
    }

    function testAddedToBuyersMapping() public {
        uint hornId = 1;
        address returnedBuyerAddress = market.buyers(hornId);
        address expectedBuyerAddress =  address(buyer);
        // Check that buyers mapping was updated to msg.sender, in this case address(this)
        Assert.equal(returnedBuyerAddress, expectedBuyerAddress, "Address returned by market buyers[] mapping does not match the one that purchased the instrument, in this case this contract");
    }

    // @dev Attempts to call markHornDeliveredAndOwnershipTransferred when horn is not yet marked shipped by seller
    function testShipped() public {
        uint hornId = 1;
        bool r;
        (r,) = address(market).call(abi.encodeWithSignature("markHornDeliveredAndOwnershipTransferred(uint)", hornId));
        Assert.isFalse(r, "Horn can not be marked delivered and NFT ownership transferred since it has not yet been marked shipped");
    }
    
    // @dev Ensure only Sellers can mark horn shipped
    function testMarkHornShipped() public {
        uint hornId = 1;
        string memory testAddress = "Ju St. Testing, Purchase Attempt New York, 11111";
        seller.markShipped(address(market), hornId, testAddress);
        // Check that approval for __hornId given to marketplace contract was carried out
        address returnedApprovedAddressForHornId = market.getApprovedToSpend(hornId);
        address expectedApprovedAddressForHornId = address(buyer);

        Assert.equal(returnedApprovedAddressForHornId, expectedApprovedAddressForHornId, "Returned approved address for tokenId doesn't match expected address, check execution of Approve()");
    }

    function testShippedStatus() public {
        uint hornId = 1;
        uint returnedStatus = uint(market.getStatusOfHornByHornId(hornId));

        Assert.equal(returnedStatus, 2, "HornStatus was not successfully updated to Shipped, check execution of markHornShipped()");
    }

    // @notice Modifier tests to ensure that access control and other modifier functions work properly
    // @dev Attempts to call transfer ownership function from non-buyer address without paying
    // @dev Ensures only buyer can markHornDeliveredAndOwnershipTransferred
    function testOnlyBuyerWhoPaid() public {
        uint hornId = 1;
        bool r;
        (r,) = address(market).call(abi.encodeWithSignature("markHornDeliveredAndOwnershipTransferred(uint256)", hornId));
        Assert.isFalse(r, "An account that hasn't paid or been marked as buyer pilfered the NFT!");

    }

    // @dev Attempts to mark shipped with a wrong address
    function testMarkHornShippedWithWrongAddress() public returns (bool) {
        uint hornId = 1;
        // Feed in a wrong address to ensure require() line prevents seller from shipping to the wrong place
        string memory mistakeShipTo = "21 Million Silk Rd. Darknet, Metaverse 66666";
        try market.markHornShipped(hornId, mistakeShipTo) returns (string memory s) {
            Assert.notEqual(s, "21 Million Silk Rd. Darknet, Metaverse 66666", "Against all odds, a seller somehow managed to ship a horn to the wrong address");
        } catch Error(string memory) {
            return (false);
        }
    }

    // @dev Ensure markHornDeliveredAndOwnershipTransferred is working as intended
    function testMarkHornDeliveredAndOwnershipTransferred() public {
        uint hornId = 1;
        buyer.markDelivered(address(market), hornId);
        address currentOwnerViaMapping = market.getCurrentOwnerByMapping(hornId);
        // Check that currentOwner was transferred to buyer
        Assert.equal(currentOwnerViaMapping, address(buyer), "CurrentOwner of Horn NFT as returned by storage mapping does not match expected address");
    }

    function testBuyerDeleted() public {
        uint hornId = 1;
        address returnedBuyerOfHornId = market.buyers(hornId);
        address expectedBuyerOfHornIdShouldBe0 = address(0);
        // Check that buyers[hornId] was set to address(0)
        Assert.equal(returnedBuyerOfHornId, expectedBuyerOfHornIdShouldBe0, "Address returned by buyers[hornId] was not successfully zeroed out");
    }

function testNotForSaleStatus() public {
        uint hornId = 1;
        uint returnedStatus = uint(market.getStatusOfHornByHornId(hornId));

        Assert.equal(returnedStatus, 3, "HornStatus was not successfully updated to OwnedNotForSale");
    }
    // @dev Test the behavior of marketplace contract on receipt of only ETH without data
    // @dev Should revert on receipt of ETH without msg.data via fallback() function
    function testIncomingEther() public {
        bool r;
        (r,) = address(market).call{value: 100}("");
        Assert.isFalse(r, "Warning: a suspiciously generous soul donated funds to the marketplace contract without msg.data, check fallback");
    }
}
