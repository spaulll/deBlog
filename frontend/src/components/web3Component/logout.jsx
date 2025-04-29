import { useDisconnect, useActiveWallet, useActiveAccount, ConnectButton } from "thirdweb/react";
import { useAuth } from "../../contexts/AuthContext";
import { client } from "../../lib/client";
import { post } from "../../lib/api";

function Logout() {
    const { disconnect } = useDisconnect();
    const { isLoggedIn, setIsLoggedIn, userName } = useAuth();
    const wallet = useActiveWallet();
  
    if (!wallet) {
      return null;
    }
  
    const handleLogout = async () => {
      try {
        const response = await post({
            url: `${import.meta.env.VITE_SERVER_URL}/logout`
        });
        console.log('Logout response:', response);
        if (response) {
          setIsLoggedIn(false);
          disconnect(wallet);
        } else {
          console.error('Logout failed');
          throw new Error('Logout failed');
        }
      } catch (error) {
        console.error('An error occurred during logout:', error);
      }
    };
  
    return (
      <button onClick={handleLogout} className="link pl-8 py-4 pr-10">
        Logout @{userName || 'User'}
      </button>
    );
  }
function WalletInfo() {
    const wallet = useActiveAccount();
    if (!wallet) {
        return null;
    }
    return (
        <ConnectButton client={client} theme={"light"} connectButton={{ style: { border: "none" } }} detailsButton={{ style: { border: "none" } }} />
    );
}

export { Logout, WalletInfo };
