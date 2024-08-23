"use client"
import { useEffect, useState, ChangeEvent } from 'react';
import Image from 'next/image';
import Arweave from 'arweave';
import { useRouter } from 'next/navigation'; // Adjusting for Next.js App Router
// import styles from './page.module.css'; // Adjust your CSS import path

// Define types for the state variables
interface Message {
  message: string;
  color: string;
}

interface Gif {
  node: {
    id: string;
    tags: { name: string; value: string }[];
    data: { size: number; type: string };
  };
}

// export default function WarpPage() {
const Home: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<Buffer | undefined>();
  const [img, setImg] = useState<string | undefined>();
  const [message, setMessage] = useState<Message | undefined>();
  const [currentWallet, setCurrentWallet] = useState<string | undefined>();
  const [gifs, setGifs] = useState<Gif[] | undefined>();

  const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
    timeout: 3000000,
  });

  const getGifs = async (wallet?: string) => {
    const queryWallet = wallet ?? currentWallet;
    if (!queryWallet) return;
    
    const gifs = await arweave.api.post('graphql', {
      query: `query {
        transactions(
          owners: ["${queryWallet}"]
          tags: [{
              name: "App-Name",
              values: ["PbillingsbyGifs"]
            },
            {
              name: "Content-Type",
              values: ["image/gif"]
            }]
        ) {
          edges {
            node {
              id
              tags {
                name
                value
              }
              data {
                size
                type
              }
            }
          }
        }
      }`,
    });
    setGifs(gifs.data.data.transactions.edges);
  };

  const fetchWallet = async () => {
    const permissions = await window.arweaveWallet.getPermissions();
    if (permissions.length) {
      const wallet = await window.arweaveWallet.getActiveAddress();
      setCurrentWallet(wallet);
    }
  };

  useEffect(() => {
    fetchWallet().catch(console.error);

    if (currentWallet) {
      getGifs(currentWallet);
    }
  }, [currentWallet]);

  const connect = async () => {
    // await window.arweaveWallet.connect('ACCESS_ADDRESS');
    await window.arweaveWallet.connect(['ACCESS_ADDRESS']);

    setMessage({
      message: '...connecting',
      color: 'yellow',
    });

    const wallet = await window.arweaveWallet.getActiveAddress();
    setCurrentWallet(wallet);
    getGifs(wallet);
    setMessage(undefined);
  };

  const disconnect = async () => {
    await window.arweaveWallet.disconnect();
    window.location.reload();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    const file = e.target.files?.[0];

    if (file && file.type !== 'image/gif') {
      setMessage({ message: 'File must be a gif', color: 'red' });
      return;
    }

    if (file) {
      setMessage(undefined);
      reader.onloadend = () => {
        if (reader.result) {
          setSelectedFile(Buffer.from(reader.result as ArrayBuffer));
        }
      };
      reader.readAsArrayBuffer(file);
      const objectUrl = URL.createObjectURL(file);
      setImg(objectUrl);
    }
  };

  const uploadGif = async () => {
    if (!selectedFile) return;

    try {
      const tx = await arweave.createTransaction(
        {
          data: selectedFile,
        },
        'use_wallet'
      );

      tx.addTag('Content-Type', 'image/gif');
      tx.addTag('App-Name', 'PbillingsbyGifs');

      await arweave.transactions.sign(tx, 'use_wallet');
      setMessage({
        message: 'Uploading to Arweave.',
        color: 'yellow',
      });

      const res = await arweave.transactions.post(tx);

      setMessage({
        message: 'Upload successful. Gif available after confirmation.',
        color: 'green',
      });
      getGifs();
    } catch (error) {
      console.error('Error with upload:', error);
      // setMessage({
      //   message: `Error: ${error.message}`,
      //   color: 'red',
      // });
      if (error instanceof Error) {
        setMessage({
          message: `Error: ${error.message}`,
          color: 'red',
        });
      } else {
        setMessage({
          message: 'An unknown error occurred',
          color: 'red',
        });
      }
    }
  };

  return (
    <div >
      <div>
        {currentWallet ? (
          <div>
            <p>Owner: {currentWallet}</p>
            <button onClick={disconnect}>Disconnect</button>
          </div>
        ) : (
          <button onClick={connect}>Connect to view uploaded gifs</button>
        )}
        <div
          style={{
            textAlign: 'center',
            maxWidth: '25rem',
            margin: '0 auto',
            height: '25rem',
          }}
          className="main"
        >
          <input type="file" onChange={handleFileChange} />
          {message && <p style={{ color: message.color }}>{message.message}</p>}
          {img && (
            <div>
              {selectedFile && (
                <div>
                  <Image
                    src={img}
                    width={250}
                    height={250}
                    alt="local preview"
                  />
                  <br />
                  <p>
                    <button onClick={() => uploadGif()}>Upload GIF</button>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          {gifs && <p style={{ textAlign: 'center' }}>Gifs: {gifs.length}</p>}
          <div
            style={{
              display: 'flex',
              overflow: 'scroll',
              maxWidth: '40vw',
              margin: '0 auto',
              border: '1px solid #eee',
            }}
          >
            {gifs &&
              gifs.map((gif) => (
                <div key={gif.node.id} style={{ margin: '2rem' }}>
                  <a
                    href={`https://arweave.net/${gif.node.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`https://arweave.net/${gif.node.id}`}
                      style={{ maxWidth: '10rem' }}
                      alt={`Gif ${gif.node.id}`}
                    />
                  </a>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default Home;
