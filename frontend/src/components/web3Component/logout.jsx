import { useDisconnect, useActiveWallet, useActiveAccount, ConnectButton } from "thirdweb/react";
import { useAuth } from "../../contexts/AuthContext";
import { client } from "../../lib/client";

function Logout() {
    const { disconnect } = useDisconnect();
    const { isLoggedIn, setIsLoggedIn, userName } = useAuth();
    const wallet = useActiveWallet();
    if (!wallet) {
        return null;
    }
    return (
        <button onClick={() => {
            setIsLoggedIn(false); disconnect(wallet)
        }} className="link pl-8 py-4 pr-14">Logout @{userName || "User"}
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
