import React, { useEffect } from 'react';
import { ConnectButton } from "thirdweb/react";
import { client } from "../../lib/client";
import { get, post } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import Cookies from 'js-cookie';
import { chain } from '../../lib/chain';

import logo from "../../imgs/logo.webp";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export default function ConnectButtonAuth() {

    const { setIsLoggedIn } = useAuth();

    return (
        <div id="connect-button">
            <ConnectButton
                theme="dark"
                client={client}
                autoConnect={true}
                connectModal={{
                    size: "compact",
                    title: "Sign In to deBlog",
                    titleIcon: logo,
                    showThirdwebBranding: false,
                    requireApproval: true,
                    termsOfServiceUrl: "https://generator.lorem-ipsum.info/terms-and-conditions",
                    privacyPolicyUrl: "https://generator.lorem-ipsum.info/terms-and-conditions",
                }}
                accountAbstraction={{
                    chain: chain,
                    sponsorGas: true,
                }}
                appMetadata={{
                    name: "deBlog",
                    logoUrl: "https://thirdweb.com/favicon.ico",
                    description: "Decentralized Blogging Hub",
                    url: "https://deblog.xyz",
                }}
                auth={{
                    getLoginPayload: async (params) => {
                        return get({
                            url: `${SERVER_URL}/login`,
                            params: {
                                address: params.address,
                                chainId: chain.id.toString(),
                            },
                        });
                    },
                    doLogin: async (params) => {
                        await post({
                            url: `${SERVER_URL}/login`,
                            params,
                        });
                    },
                    isLoggedIn: async () => {
                        const response = await get({
                            url: `${SERVER_URL}/isLoggedIn`,
                        });
                        setIsLoggedIn(response);

                        return response;
                    },
                    doLogout: async () => {
                        await post({
                            url: `${SERVER_URL}/logout`,
                        });
                    },
                }}
            />
        </div>
    );
}
