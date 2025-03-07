import React from 'react';
import { ConnectButton } from "thirdweb/react";
import { client } from "../../lib/client";
import { LoginPayload, VerifyLoginPayloadParams } from "thirdweb/auth";
import { get, post } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useConnectModal } from "thirdweb/react";
import { getAvatar } from '../../lib/contractInteraction';
import { useActiveAccount } from 'thirdweb/react';
import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { chain } from '../../lib/chain';

import logo from "../../imgs/logo.webp";

export default function ConnectButtonAuth() {
    // const { connect, isConnecting } = useConnectModal();

    // async function handleConnect() {
    //     const wallet = await connect({ client });
    //     console.log(wallet);
    //     if (wallet) {
    //         const avatarUrl = await getAvatar();
    //         console.error(avatarUrl);
    //         setAvatarUrl(avatarUrl);
    //     }
    // }
    const { isLoggedIn, setIsLoggedIn, avatarUrl, setAvatarUrl } = useAuth();
    
    let JWT: string;
    

    return (
        <div id="connect-button">
            <ConnectButton
                theme="dark"
                client={ client }
                autoConnect={ true }
                
                connectModal={{
                    size: "compact",
                    title: "Sign In to deBlog",
                    titleIcon: logo,
                    showThirdwebBranding: false,
                }}

                accountAbstraction={{
                    chain: chain,
                    sponsorGas: true,
                }}

                appMetadata={{
                    name: "deBlog",
                    logoUrl: "https://thirdweb.com/favicon.ico",
                    description: "Decentralized Blogging Hub",
                    url: ""
                }}
                
                auth={{
                    /**
                     * 	`getLoginPayload` should @return {VerifyLoginPayloadParams} object.
                     * 	This can be generated on the server with the generatePayload method.
                     */
                    getLoginPayload: async (params: {
                        address: string;
                    }): Promise<LoginPayload> => {
                        return get({
                            url: "http://localhost:3000" + "/login",
                            params: {
                                address: params.address,
                                chainId: chain.id.toString(),
                            },
                        });
                    },
                    /**
                     * 	`doLogin` performs any logic necessary to log the user in using the signed payload.
                     * 	In this case, this means sending the payload to the server for it to set a JWT cookie for the user.
                     */
                    doLogin: async (params: VerifyLoginPayloadParams) => {
                        await post({
                            url: "http://localhost:3000" + "/login",
                            params,
                        });
                    },
                    /**
                     * 	`isLoggedIn` returns true or false to signal if the user is logged in.
                     * 	Here, this is done by calling the server to check if the user has a valid JWT cookie set.
                     */
                    isLoggedIn: async () => {
                        const response = await get({
                            url: "http://localhost:3000" + "/isLoggedIn",
                        });
                        setIsLoggedIn(response);
                                                
                        console.log("Is logged in?? ", response)
                        if (response) {
                            JWT = Cookies.get("jwt")??"";
                            console.log("JWT: ", JWT);
                        }
                        return response;

                    },
                    /**
                     * 	`doLogout` performs any logic necessary to log the user out.
                     * 	In this case, this means sending a request to the server to clear the JWT cookie.
                     */
                    doLogout: async () => {
                        await post({
                            url: "http://localhost:3000" + "/logout",
                        });
                    },
                }}
            />
        </div>
    );
}