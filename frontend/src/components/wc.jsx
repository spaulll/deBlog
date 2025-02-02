import { createAppKit } from "@reown/appkit/react"
import { EthersAdapter } from "@reown/appkit-adapter-ethers"
import { baseSepolia } from "@reown/appkit/networks"

// 1. Get projectId
const projectId = 'YOUR_PROJECT_ID'

// 2. Set the networks
const networks = [baseSepolia]

// 3. Create a metadata object - optional
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  features: {
    email: true,
    emailShowWallets: false,
    socials: ['google', 'x', 'facebook'],
  },
  allWallets: 'HIDE',
})

export default function WalletConnect() {
  return (
    <div className="flex-none items-center justify-start p-[2px] rounded-[5px] transition-all duration-300 ease-in-out">
      <appkit-button
        label="Connect Wallet"
        balance="hide"
        className="wallet-button"
      />
    </div>
  );
}
