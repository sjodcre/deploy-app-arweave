"use client"
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import { JWKInterface, WarpFactory } from 'warp-contracts';
import { ArweaveSigner } from 'warp-contracts-plugin-deploy';
import cookbook2 from '../../../.secrets/cookbook2.json'


const CONTRACT_SRC = "X3AqGjDsRb7wXU_fguhCNlxwONxNdZMKYRccllgrATI";  // Replace with your actual contract ID

export default function Home() {
  const [clicks, setClicks] = useState<number | string>();  // Use number for clicks, string for loading state
  const warp = WarpFactory.forMainnet();
  const signer = new ArweaveSigner(cookbook2 as JWKInterface);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <main className="flex flex-col items-center justify-center space-y-4">
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
      </main>
    </div>
  );
}
