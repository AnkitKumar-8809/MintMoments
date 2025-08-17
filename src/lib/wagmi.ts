import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'

// Custom definition for MegaETH testnet
export const megaETHTestnet = {
  id: 6342,
  name: 'MegaETH Testnet',
  network: 'megaeth',
  nativeCurrency: {
    name: 'MegaETH Testnet Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://carrot.megaeth.com/rpc'],
    },
    public: {
      http: ['https://carrot.megaeth.com/rpc'],
    },
  },
  blockExplorers: {
    default: { name: 'MegaExplorer', url: 'https://megaexplorer.xyz' },
  },
  testnet: true,
}

// Your RainbowKit/Wagmi config configured for MegaETH Testnet
export const config = getDefaultConfig({
  appName: 'MintMoments',
  projectId: '19daa670c2ab77d44999f9fc3591682f', // Your WalletConnect project ID
  chains: [megaETHTestnet],
  transports: {
    [megaETHTestnet.id]: http(megaETHTestnet.rpcUrls.default.http[0]),
  },
})
