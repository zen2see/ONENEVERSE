import { ethers } from "hardhat";

describe("ONENEVERSE", function () {
  it("Should create and execute sales", async function () {
    /* deploy the oneverse */
    const ONENEVERSE = await ethers.getContractFactory("ONENEVERSE");
    const onv = await ONENEVERSE.deploy();
    await onv.deployed();
    // listingPrice received as a BigNumber
    const listingPrice = await onv.getListingPrice();
    // format as unit digits (string if passed as string)
    const listingPriceString = ethers.utils.formatUnits(listingPrice);
    console.log("Listing Price");
    console.log(listingPriceString);
    // auctionPrice as 1 ether BigNumber
    const auctionPrice = ethers.utils.parseUnits("1.0", 18);
    // auctionPrice from BigNumber to String
    const auctionPriceString = ethers.utils.formatUnits(auctionPrice);
    console.log("Auction Price");
    console.log(auctionPriceString);
    // const ap = auctionPrice.toString();
    /* create two tokens */
    await onv.createToken("https://www.onv01.surge.com", auctionPrice, {
      value: listingPrice,
    });
    console.log("after first token Auction Price");
    console.log(auctionPrice);
    await onv.createToken("https://www.onv02.surge.com", auctionPrice, {
      value: listingPrice,
    });
    console.log("after second token Auction Price");
    console.log(auctionPrice);
    // eslint-disable-next-line no-unused-vars
    const [_, buyerAddress] = await ethers.getSigners();
    /* execute sale of token to another user */
    await onv.connect(buyerAddress).createONVSale(1, { value: auctionPrice });
    /* resell a token */
    await onv
      .connect(buyerAddress)
      .resellToken(1, auctionPrice, { value: listingPrice });
    /* query for and return the unsold items */
    let items = await onv.retrieveUnsoldItems();
    items = await Promise.all(
      items.map(async (i: any) => {
        const tokenUri = await onv.tokenURI(i.tokenId);
        const item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri,
        };
        return item;
      })
    );
    console.log("items: ", items);
  });
});
