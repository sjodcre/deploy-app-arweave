"use client"

import { useState, useEffect } from 'react';
import { ArweaveSigner, DeployPlugin } from 'warp-contracts-plugin-deploy';
import cookbook2 from '../../../.secrets/cookbook2.json'
import dynamic from 'next/dynamic';
// @ts-ignore
import { defaultCacheOptions, JWKInterface, WarpFactory } from 'warp-contracts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const warp = WarpFactory.forMainnet({ ...defaultCacheOptions, inMemory: true }).use(new DeployPlugin());

const CONTRACT_SRC = "X3AqGjDsRb7wXU_fguhCNlxwONxNdZMKYRccllgrATI";  // Replace with your actual contract ID

export default function Warp() {
  const [clicks, setClicks] = useState<number | string>();  // Use number for clicks, string for loading state
  const signer = new ArweaveSigner(cookbook2 as JWKInterface);
  const router = useRouter();

  const contract = warp.contract(CONTRACT_SRC).connect(signer);

  const getClicks = async () => {
    try {
      const { cachedValue } = await contract.readState();
      const state = cachedValue.state as { clicks: number };  // Type casting here
      setClicks(state.clicks);
      // setClicks(cachedValue.state.clicks);
    } catch (error) {
      console.error('Failed to get clicks:', error);
    }
  };

  const addClick = async () => {
    try {
      setClicks('updating...');
      await contract.writeInteraction({
        function: "click",
      });
      await getClicks();  // Ensure clicks are updated after the interaction
    } catch (error) {
      console.error('Failed to add click:', error);
      setClicks('Error updating clicks');
    }
  };

  const handleGoBack = () => {
    router.push('/'); // Navigates back to the main page
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex space-x-4">
            <button onClick={getClicks} className="px-4 py-2 bg-blue-500 text-white rounded">
              Get clicks
            </button>
            <button onClick={addClick} className="px-4 py-2 bg-green-500 text-white rounded">
              Add Click
            </button>
          </div>
          <div>
            {clicks !== undefined && <p className="text-lg font-semibold">{clicks} clicks</p>}
          </div>
        </div>
      </div>
      {/* <Link href="/">
        <button className="px-4 py-2 bg-green-500 text-white rounded">
          Back to Main Page
        </button>
      </Link> */}
      <div>
      <h1 className="text-3xl font-bold mb-4">Warp Page</h1>
      <button onClick={handleGoBack} className="px-4 py-2 bg-green-500 text-white rounded">
        Back to Main Page
      </button>
    </div>

    </>
  );
}

// export default dynamic(() => Promise.resolve(Warp), { ssr: false });

