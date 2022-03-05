const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Donation contract", function () {
  // Mocha has four functions that let you hook into the the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let Donation;
  let hardhatDonation;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Donation = await ethers.getContractFactory("Donation");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatDonation = await Donation.deploy();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      // Expect receives a value, and wraps it in an Assertion object. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(await hardhatDonation.owner()).to.equal(owner.address);
    });

    it("Deployment should assign the total balance of tokens to 0", async function () {
      expect(await hardhatDonation.totalBalance()).to.equal(0);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens to contract", async function () {
      // Transfer 1 ether from addr1 to contract
      // We use .connect(signer) to send a transaction from another account
      await hardhatDonation.connect(addr1).gatherDonation({
            value: ethers.utils.parseEther("1.0")
        });
        expect(ethers.utils.formatEther(await hardhatDonation.totalBalance())).to.equal('1.0');

        await hardhatDonation.connect(addr2).gatherDonation({
            value: ethers.utils.parseEther("1.0")
        });
        expect(ethers.utils.formatEther(await hardhatDonation.totalBalance())).to.equal('2.0');
    });

    it("Should return donators addresses with no duplicates", async function () {
        await hardhatDonation.connect(addr1).gatherDonation({
            value: ethers.utils.parseEther("1.0")
        });
        await hardhatDonation.connect(addr2).gatherDonation({
            value: ethers.utils.parseEther("1.0")
        });
        await hardhatDonation.connect(addr1).gatherDonation({
            value: ethers.utils.parseEther("1.0")
        });

        const donators = await hardhatDonation.getDonators();

      expect(donators).to.eql([addr1.address, addr2.address]);
    });

    it("Should show donation sums after transfers", async function () {
        await hardhatDonation.connect(addr1).gatherDonation({
            value: ethers.utils.parseEther("1.0")
        });
        await hardhatDonation.connect(addr2).gatherDonation({
            value: ethers.utils.parseEther("1.0")
        });
        await hardhatDonation.connect(addr1).gatherDonation({
            value: ethers.utils.parseEther("1.0")
        });

      // Check balances.
      const addr1Donation = await hardhatDonation.getDonation(addr1.address);
      expect(ethers.utils.formatEther(addr1Donation)).to.equal('2.0');

      const addr2Donation = await hardhatDonation.getDonation(addr2.address);
      expect(ethers.utils.formatEther(addr2Donation)).to.equal('1.0');
    });
  });

  describe("Withdrawal", function () {
    it("Should let owner withdraw tokens", async function () {
      // Transfer 1 ether from addr1 to contract
      // We use .connect(signer) to send a transaction from another account
      await hardhatDonation.connect(addr1).gatherDonation({
        value: ethers.utils.parseEther("1.0")
        });
        
        await expect(await hardhatDonation.withdraw(owner.address, 50))
            .to.changeEtherBalance(owner, 50);

    });

    it("Should not let owner withdraw more than there are tokens in fund", async function () {
        // Transfer 1 ether from addr1 to contract
        // We use .connect(signer) to send a transaction from another account
        await hardhatDonation.connect(addr1).gatherDonation({
            value: ethers.utils.parseEther("1.0")
            });
        await expect(hardhatDonation.withdraw(owner.address, ethers.utils.parseEther("10"))).to.be.revertedWith("Fund balance not enough");
    });

    it("Should not let others withdraw tokens", async function () {
        // Transfer 1 ether from addr1 to contract
        // We use .connect(signer) to send a transaction from another account
        await hardhatDonation.connect(addr1).gatherDonation({
            value: ethers.utils.parseEther("1.0")
            });
        await expect(hardhatDonation.connect(addr1).withdraw(owner.address, 50)).to.be.revertedWith("Not an owner");
      });
    });
});