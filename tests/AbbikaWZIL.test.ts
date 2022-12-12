import { assert } from "chai";
import { parseEther } from "ethers/lib/utils";
import { artifacts, contract } from "hardhat";
import { expectEvent } from "@openzeppelin/test-helpers";

const WZIL = artifacts.require("./WZIL.sol");

contract("WZIL", ([alice]) => {
  let wrappedZIL;

  before(async () => {
    // Deploy Wrapped ZIL
    wrappedZIL = await WZIL.new({ from: alice });
  })

  describe("Basic cases for wrapping native ZIL to ERC20", async () => {
    it("User wraps native ZIL", async function () {
      let result = await wrappedZIL.deposit({from: alice, value: parseEther("1000")});

      expectEvent.inTransaction(result.receipt.transactionHash, wrappedZIL, "Transfer", {
        from: alice,
        to: wrappedZIL.address,
        value: parseEther("1000").toString(),
      })

      assert.equal(String(await wrappedZIL.balanceOf(alice)), parseEther("1000").toString());
    })

    it("User unwraps WZIL", async function () {
      let result = await wrappedZIL.withdraw(parseEther("1000"), {from: alice});

      expectEvent.inTransaction(result.receipt.transactionHash, wrappedZIL, "Deposit", {
        from: wrappedZIL.address,
        to: alice,
        value: parseEther("1000").toString(),
      })

      assert.equal(String(await wrappedZIL.balanceOf(alice)), parseEther("0").toString());
    })
  })
})