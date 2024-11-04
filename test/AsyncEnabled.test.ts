import { expect } from "chai";
import { ethers } from "hardhat";
import { MyAsyncEnabled, AsyncUtils, PublicAsyncUtils } from "../src/types/";

describe("AsyncEnabled", function () {
  let myAsyncContract: MyAsyncEnabled;
  let asyncUtils: AsyncUtils;
  let publicAsyncUtils: PublicAsyncUtils;

  before(async function () {
    // Deploy the AsyncUtils library
    // I have no idea why I have to do this zero address thing, but it works
    const AsyncUtilsFactory = await ethers.getContractFactory("AsyncUtils",{
      libraries: {
        AsyncUtils: "0x0000000000000000000000000000000000000000",
      }
    });
    asyncUtils = await AsyncUtilsFactory.deploy();
    await asyncUtils.waitForDeployment();

    console.log("asyncUtils address", await asyncUtils.getAddress());

    // Deploy the PublicAsyncUtils contract
    const PublicAsyncUtilsFactory = await ethers.getContractFactory("PublicAsyncUtils", {
      libraries: {
        AsyncUtils: await asyncUtils.getAddress(),
      },
    });
    publicAsyncUtils = await PublicAsyncUtilsFactory.deploy();
    await publicAsyncUtils.waitForDeployment();

    // Deploy the MyAsyncEnabled contract
    const MyAsyncEnabledFactory = await ethers.getContractFactory("MyAsyncEnabled", {
      libraries: {
        AsyncUtils: await asyncUtils.getAddress(),
      },
    });
    myAsyncContract = await MyAsyncEnabledFactory.deploy();
    await myAsyncContract.waitForDeployment();
  });

  it("should get the correct AsyncCallRelayer", async function () {
    console.log(asyncUtils)
    const expectedRelayer = await publicAsyncUtils.getAsyncCallRelayer(await myAsyncContract.getAddress());
    const actualRelayer = await myAsyncContract.asyncCallRelayer();
    expect(expectedRelayer).to.equal(actualRelayer);
  });
});