import { expect } from "chai";
import { ethers } from "hardhat";
import { getBigInt } from "ethers";
import { MyAsyncEnabled } from "../src/types/";


describe("AsyncEnabled", function () {
  let chainIdA: bigint;
  let chainIdB: bigint;
  
  let myAsyncContractA: bigInt;

  let myAsyncContractB: MyAsyncEnabled;

  const providerA = new ethers.JsonRpcProvider("HTTP://127.0.0.1:9545");
  const walletA = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", providerA);

  const providerB = new ethers.JsonRpcProvider("HTTP://127.0.0.1:9546");
  const walletB = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", providerB);

  before(async function () {
    chainIdA = (await providerA.getNetwork()).chainId;
    chainIdB = (await providerB.getNetwork()).chainId;
    
    // Deploy the MyAsyncEnabled contract to chain A
    const MyAsyncEnabledFactoryA = await ethers.getContractFactory("MyAsyncEnabled", {
      signer: walletA,
    });

    myAsyncContractA = await MyAsyncEnabledFactoryA.deploy();
    await myAsyncContractA.waitForDeployment();

    // Deploy the MyAsyncEnabled contract to chain B
    const MyAsyncEnabledFactoryB = await ethers.getContractFactory("MyAsyncEnabled", {
      signer: walletB,
    });

    myAsyncContractB = await MyAsyncEnabledFactoryB.deploy();
    await myAsyncContractB.waitForDeployment();

    // ensure addresses are the same on both chains
    expect(await myAsyncContractA.getAddress()).to.equal(await myAsyncContractB.getAddress());
  });

  it("should do a cross-contract call", async function () {
    console.log("here bro")
    console.log(await myAsyncContractA.getAddress());
    console.log(await myAsyncContractB.getAddress());

    await myAsyncContractA.doLoop1(chainIdB);
  });
});
