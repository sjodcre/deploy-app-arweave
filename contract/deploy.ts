import fs from 'fs';
import { WarpFactory, JWKInterface } from 'warp-contracts';
import * as dotenv from 'dotenv';
import { ArweaveSigner, DeployPlugin, InjectedArweaveSigner } from 'warp-contracts-plugin-deploy';
import Arweave from 'arweave';
import cookbook2 from '../.secrets/cookbook2.json'
dotenv.config();

export async function deploy(): Promise<{ contractTxId: string; cachedValue: any }> {
  const isLocal = process.env.WARP === "local";
  const warp = isLocal ? WarpFactory.forLocal().use(new DeployPlugin()) : WarpFactory.forMainnet().use(new DeployPlugin());
  
  let wallet: JWKInterface | ArweaveSigner;

  const initState = {
    clicks: 0
  };

  if (isLocal) {
    const testWallet = await warp.generateWallet();
    wallet = testWallet.jwk;
  } else {
    // const arweave = Arweave.init({});
    wallet= new ArweaveSigner(cookbook2 as JWKInterface);
    // wallet = JSON.parse(fs.readFileSync('wallet.json', 'utf-8')) as JWKInterface;
  }

  const contractSource = fs.readFileSync('./contract.ts', 'utf-8');

  const { contractTxId } = await warp.deploy({
    wallet,
    initState: JSON.stringify(initState),
    src: contractSource
  });

  const contract = warp.contract(contractTxId).connect(wallet);

  const { cachedValue } = await contract.readState();
  console.log("STATE: ", cachedValue);
  console.log("CONTRACT ID: ", contractTxId);
  
  return { contractTxId, cachedValue };
}

deploy().catch(console.error);
