import type { Abi } from 'viem'

// Replace with your actual contract address deployed on Polygon Amoy
export const CONTRACT_ADDRESS = '0xea8c4eca7b54cae19C215C8fB34684415475463f'

// Update the chain explorer URL to Amoy's explorer
export const CHAIN_EXPLORER = 'https://amoy.polygonscan.com'

// Smart contract ABI (kept same if contract not changed)
export const ABI: Abi = [
  {
    type: "function",
    name: "mintTicket",
    stateMutability: "payable",
    inputs: [
      { name: "eventId", type: "uint256" },
      { name: "tier", type: "uint8" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "tokenOfOwnerByIndex",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" }
    ],
    outputs: [{ name: "", type: "uint256" }]
  }
]
