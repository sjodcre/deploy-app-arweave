import { WarpFactory, Contract, JWKInterface } from 'warp-contracts';
import { test } from 'uvu';
import * as assert from 'uvu/assert';
import ArLocal from 'arlocal';
import { deploy } from '../contract/deploy';
import { State } from '../contract/types/types';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

// const arlocal = new ArLocal(1820, false);
//CURRENTLY NOT WORKING AS UVU NEEDS SOME CONFIGURATION FOR TS, SKIPPED BECAUSE I CAN USE JEST INSTEAD

test('create contract and test state update', async () => {
//   await arlocal.start();

  const res = await deploy();

  assert.is(res.cachedValue.state.clicks, 0);

  const warp = WarpFactory.forLocal(1820).use(new DeployPlugin());
  const wallet = await warp.generateWallet();
  let contract: Contract<State> = warp.contract<State>(res.contractTxId).connect(wallet.jwk);

  await contract.writeInteraction({
    function: 'click',
  });

  const secondCall = await contract.readState();
  assert.is(secondCall.cachedValue.state.clicks, 1);

//   await arlocal.stop();
});

test.run();
