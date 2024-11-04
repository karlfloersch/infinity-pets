import { expect } from "chai";
import { ethers } from "hardhat";
import { MyAsyncEnabled, AsyncUtils, PublicAsyncUtils } from "../src/types/";
// import { JsonRpcProvider } from "@ethersproject/providers";
// import { Wallet } from "@ethersproject/wallet";

// takes result of new ethers.Wallet()
async function deployAsyncUtils(wallet: any): Promise<string> {
  const AsyncUtilsFactory = await ethers.getContractFactory("AsyncUtils", {
    libraries: {
      AsyncUtils: "0x0000000000000000000000000000000000000000",
    },
    signer: wallet,
  });

  const deployment = await AsyncUtilsFactory.deploy();
  await deployment.waitForDeployment();
  const libraryAddress = await deployment.getAddress();

  return libraryAddress;
}

describe("AsyncEnabled", function () {
  let chainIdA: number;
  let chainIdB: number;
  
  let myAsyncContractA: MyAsyncEnabled;
  let publicAsyncUtilsA: PublicAsyncUtils;

  let myAsyncContractB: MyAsyncEnabled;

  const providerA = new ethers.JsonRpcProvider("HTTP://127.0.0.1:9545");
  const walletA = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", providerA);

  const providerB = new ethers.JsonRpcProvider("HTTP://127.0.0.1:9546");
  const walletB = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", providerB);

  before(async function () {
    chainIdA = (await providerA.getNetwork()).chainId;
    chainIdB = (await providerB.getNetwork()).chainId;
  
    const asyncUtilsLibraryAddressA = await deployAsyncUtils(walletA);
    const asyncUtilsLibraryAddressB = await deployAsyncUtils(walletB);
    
    // Deploy the MyAsyncEnabled contract to chain A
    const MyAsyncEnabledFactory = await ethers.getContractFactory("MyAsyncEnabled", {
      libraries: {
        AsyncUtils: asyncUtilsLibraryAddressA,
      },
      signer: walletA,
    });

    myAsyncContractA = await MyAsyncEnabledFactory.deploy();
    await myAsyncContractA.waitForDeployment();

    // Deploy the MyAsyncEnabled contract to chain B
    const MyAsyncEnabledFactoryB = await ethers.getContractFactory("MyAsyncEnabled", {
      libraries: {
        AsyncUtils: asyncUtilsLibraryAddressB,
      },
      signer: walletB,
    });

    myAsyncContractB = await MyAsyncEnabledFactoryB.deploy();
    await myAsyncContractB.waitForDeployment();

    // ensure addresses are the same on both chains
    expect(await myAsyncContractA.getAddress()).to.equal(await myAsyncContractB.getAddress());
    
    // Deploy the PublicAsyncUtils contract to chain A
    const PublicAsyncUtilsFactory = await ethers.getContractFactory("PublicAsyncUtils", {
      libraries: {
        AsyncUtils: asyncUtilsLibraryAddressA,
      },
      signer: walletA,
    });

    publicAsyncUtilsA = await PublicAsyncUtilsFactory.deploy();
    await publicAsyncUtilsA.waitForDeployment();
    
  });

  it("should get the correct AsyncCallRelayer", async function () {
    const expectedRelayer = await publicAsyncUtilsA.getAsyncCallRelayer(await myAsyncContractA.getAddress());
    const actualRelayer = await myAsyncContractA.asyncCallRelayer();
    expect(expectedRelayer).to.equal(actualRelayer);
  });

  it("should do a cross-contract call", async function () {
    console.log("here bro")
    console.log(await myAsyncContractA.getAddress());
    console.log(await myAsyncContractB.getAddress());

    await myAsyncContractA.doLoop1(chainIdB);
  });
});
