import { useState } from "react"
import axios from 'axios'
import {NFTStorage} from "nft.storage"

function App()
{
  const [prompt, setPrompt] = useState("")
  const [imageBlob, setImageBlob] = useState(null)
  const [file, setFile] = useState(null)

  console.log(prompt)
  const generateArt = async () => {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5`,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_HUGGING_FACE}}`,
          },
          method: "POST",
          inputs: prompt,
        },
        { responseType: "blob" }
      );
      const file = new File([response.data], 'image.png', {type: "image/png",});
      setFile(file);
      console.log(response);
      const url = URL.createObjectURL(response.data)
      // console.log(url)
      console.log(url)
      // Set state for image
      setImageBlob(url)
    } catch (err) {
      console.log(err);
    }
  };

const uploadArtToIpfs = async () => {
  try{
    const nftstorage = new NFTStorage({
      token: process.env.REACT_APP_NFT_STORAGE,
    })
    const store = await nftstorage.store({
      name:"AI ART",
      description: "AI generated NFT",
      image: file
    })
    return cleanupIPFS(store.data.image.href)
    // console.log(store)
  }
  catch(err)
  {
    console.log(err)
    return null
  }
}

const cleanupIPFS = (url) => {
  if (url.includes("ipfs://")){
    return url.replace("ipfs://", "https://ipfs.io/ipfs/")
  }
}

const mintNft = async () => {
  try{
    const imageURL = await uploadArtToIpfs();
    console.log(imageURL)
    const response = await axios.post(
      `https://api.nftport.xyz/v0/mints/easy/urls`,
      {
        file_url: imageURL,
        chain:"polygon",
        name: "SampleNFT",
        description: "Build with NFTPort!",
        mint_to_address: "My wallet"
      },
      {headers: {Authorization: process.env.REACT_APP_NFT_PORT}}
    );
    const data = await response.data;
    console.log(data);
    
  } catch(err)
  {
    console.log(err)
  }
}

  return (
    <div className="flex flex-col items-center justify-center min-h-center gap-4">
      <h1 className="text-4xl font-extrabold">AI Art Gasless mints</h1>
      {/* Create an input box and button saying next beside it */}
      <div className="flex items-center justify-center gap-4">
        <input 
        className="border-2 border-black rounded-md p-2"
        onChange={(e) => setPrompt(e.target.value)}
        type="text"
        placeholder="Enter a prompt"
        />
        <button onClick={generateArt} className="bg-black text-white rounded-md p-2">Next</button>
      </div>
      {
        imageBlob && (<div className="flex flex-col gap-4 items-center justify-center">
          <img src={imageBlob} alt="AI generated art" />
          <button onClick={mintNft}
                  className="bg-black text-white rounded-md p-2">
                    Mint this NFT
                  </button>
        </div>)
      }
    </div>
  );
}


export default App;