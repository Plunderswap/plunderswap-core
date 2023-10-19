import { formatUnits, parseEther } from "ethers/lib/utils";
import { artifacts, contract } from "hardhat";
import { assert, expect } from "chai";
import {
  BN,
  constants,
  expectEvent,
  expectRevert,
  time,
} from "@openzeppelin/test-helpers";

const MockERC20 = artifacts.require("./utils/MockERC20.sol");
const PlunderFactory = artifacts.require("./PlunderFactory.sol");
const PlunderPair = artifacts.require("./PlunderPair.sol");
const PlunderRouter = artifacts.require("./PlunderRouter.sol");
const WZIL = artifacts.require("./WZIL.sol");

contract("PlunderRouter", ([alice, bob, carol, david, erin]) => {
  let pairAB;
  let pairBC;
  let pairAC;
  let plunderRouter;
  let plunderFactory;
  let tokenA;
  let tokenC;
  let wrappedZIL;

  before(async () => {
    // Deploy Factory
    plunderFactory = await PlunderFactory.new(alice, { from: alice });

    // Deploy Wrapped ZIL
    wrappedZIL = await WZIL.new({ from: alice });

    // Deploy Router
    plunderRouter = await PlunderRouter.new(
      plunderFactory.address,
      wrappedZIL.address,
      { from: alice }
    );

    // Deploy ERC20s
    tokenA = await MockERC20.new("Token A", "TA", parseEther("10000000"), {
      from: alice,
    });
    tokenC = await MockERC20.new("Token C", "TC", parseEther("10000000"), {
      from: alice,
    });

    // Create 3 LP tokens
    let result = await plunderFactory.createPair(
      tokenA.address,
      wrappedZIL.address,
      { from: alice }
    );
    pairAB = await PlunderPair.at(result.logs[0].args[2]);

    result = await plunderFactory.createPair(
      wrappedZIL.address,
      tokenC.address,
      { from: alice }
    );
    pairBC = await PlunderPair.at(result.logs[0].args[2]);

    result = await plunderFactory.createPair(tokenA.address, tokenC.address, {
      from: alice,
    });
    pairAC = await PlunderPair.at(result.logs[0].args[2]);

    assert.equal(
      String(await pairAB.totalSupply()),
      parseEther("0").toString()
    );
    assert.equal(
      String(await pairBC.totalSupply()),
      parseEther("0").toString()
    );
    assert.equal(
      String(await pairAC.totalSupply()),
      parseEther("0").toString()
    );

    // Mint and approve all contracts
    for (let thisUser of [alice, bob, carol, david, erin]) {
      await tokenA.mintTokens(parseEther("2000000"), { from: thisUser });
      await tokenC.mintTokens(parseEther("2000000"), { from: thisUser });

      await tokenA.approve(plunderRouter.address, constants.MAX_UINT256, {
        from: thisUser,
      });

      await tokenC.approve(plunderRouter.address, constants.MAX_UINT256, {
        from: thisUser,
      });

      await wrappedZIL.approve(plunderRouter.address, constants.MAX_UINT256, {
        from: thisUser,
      });
    }
  });

  describe("Normal cases for liquidity provision", async () => {
    it("User adds liquidity to LP tokens", async function () {
      const deadline = new BN(await time.latest()).add(new BN("100"));

      /* Add liquidity (Abbika Router)
       * address tokenB,
       * uint256 amountADesired,
       * uint256 amountBDesired,
       * uint256 amountAMin,
       * uint256 amountBMin,
       * address to,
       * uint256 deadline
       */

      // 1 A = 1 C
      let result = await plunderRouter.addLiquidity(
        tokenC.address,
        tokenA.address,
        parseEther("1000000"), // 1M token A
        parseEther("1000000"), // 1M token B
        parseEther("1000000"),
        parseEther("1000000"),
        bob,
        deadline,
        { from: bob }
      );

      expectEvent.inTransaction(
        result.receipt.transactionHash,
        tokenA,
        "Transfer",
        {
          from: bob,
          to: pairAC.address,
          value: parseEther("1000000").toString(),
        }
      );

      expectEvent.inTransaction(
        result.receipt.transactionHash,
        tokenC,
        "Transfer",
        {
          from: bob,
          to: pairAC.address,
          value: parseEther("1000000").toString(),
        }
      );

      assert.equal(
        String(await pairAC.totalSupply()),
        parseEther("1000000").toString()
      );
      assert.equal(
        String(await tokenA.balanceOf(pairAC.address)),
        parseEther("1000000").toString()
      );
      assert.equal(
        String(await tokenC.balanceOf(pairAC.address)),
        parseEther("1000000").toString()
      );

      // 1 ZIL = 100 A
      result = await plunderRouter.addLiquidityETH(
        tokenA.address,
        parseEther("100000"), // 100k token A
        parseEther("100000"), // 100k token A
        parseEther("1000"), // 1,000 ZIL
        bob,
        deadline,
        { from: bob, value: parseEther("1000").toString() }
      );

      expectEvent.inTransaction(
        result.receipt.transactionHash,
        tokenA,
        "Transfer",
        {
          from: bob,
          to: pairAB.address,
          value: parseEther("100000").toString(),
        }
      );

      assert.equal(
        String(await pairAB.totalSupply()),
        parseEther("10000").toString()
      );
      assert.equal(
        String(await wrappedZIL.balanceOf(pairAB.address)),
        parseEther("1000").toString()
      );
      assert.equal(
        String(await tokenA.balanceOf(pairAB.address)),
        parseEther("100000").toString()
      );

      // 1 ZIL = 100 C
      result = await plunderRouter.addLiquidityETH(
        tokenC.address,
        parseEther("100000"), // 100k token C
        parseEther("100000"), // 100k token C
        parseEther("1000"), // 1,000 ZIL
        bob,
        deadline,
        { from: bob, value: parseEther("1000").toString() }
      );

      expectEvent.inTransaction(
        result.receipt.transactionHash,
        tokenC,
        "Transfer",
        {
          from: bob,
          to: pairBC.address,
          value: parseEther("100000").toString(),
        }
      );

      assert.equal(
        String(await pairBC.totalSupply()),
        parseEther("10000").toString()
      );
      assert.equal(
        String(await wrappedZIL.balanceOf(pairBC.address)),
        parseEther("1000").toString()
      );
      assert.equal(
        String(await tokenC.balanceOf(pairBC.address)),
        parseEther("100000").toString()
      );
    });
  });

  describe("Normal cases for setting fee recipient", async () => {
    it("Admin sets feeTo on the factory contract", async function () {
      await plunderFactory.setFeeTo(erin, { from: alice });
      assert.equal(await plunderFactory.feeTo(), erin);
    });

    // it("Swap tokens and check fees", async function () {
    //   await plunderRouter.swapExactTokensForTokens(
    //     parseEther("1"),
    //     parseEther("0.95")
    //   );

    //   await plunderFactory.setFeeTo(erin, { from: alice });
    //   assert.equal(await plunderFactory.feeTo(), erin);
    // });
  });
});
