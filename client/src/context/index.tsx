import React from 'react'

export const User = React.createContext({
    isLogged: false,
    isBurner: false,
    isWeb3Capable: false,
    isLoading: false,
    account: '',
    wallet: null,
    web3: {},
    ocean: {},
    box: {},
    balance: {
        eth: 0,
        ocn: 0
    },
    network: '',
    openWallet: () => {
        /* empty */
    },
    requestFromFaucet: () => {
        /* empty */
    },
    airdropOceanTokens: () => {
        /* empty */
    },
    message: ''
})

export const Market = React.createContext({
    totalAssets: 0,
    categories: [''],
    network: '',
    networkMatch: false
})
