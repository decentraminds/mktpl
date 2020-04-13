import React, { useState, useEffect, PureComponent } from 'react'
import Web3 from 'web3'
import { Ocean, Account } from '@oceanprotocol/squid'
import OPWallet from 'op-web3-wallet'
import { User } from '.'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { setLoading } from '../slices/loadingSlice'
// import { provideOcean, requestFromFaucet, FaucetResponse, airdropOceanTokens } from '../ocean'
// import { requestAccessTo3box } from '../3box'
import { marketplaceId, networkId, nodeUri, aquariusUri, brizoUri, brizoAddress, secretStoreUri, verbose,
        faucetUri, portisAppId, torusEnabled } from '../config'
import MarketProvider from './MarketProvider'
// import { MetamaskProvider } from './MetamaskProvider'
// import { BurnerWalletProvider } from './BurnerWalletProvider'

const POLL_ACCOUNTS = 1000 // every 1s
const POLL_NETWORK = POLL_ACCOUNTS * 60 // every 1 min

interface UserProviderState {
    mkplId: string
    isLogged: boolean
    isBurner: boolean
    isWeb3Capable: boolean
    // isLoading: boolean
    account: string
    balance: {
        eth: number
        ocn: number
    }
    network: string
    wallet: any
    web3: Web3 | undefined
    ocean: Ocean | undefined
    box: any
    openWallet(): Promise<void>
    // requestFromFaucet(account: string): Promise<FaucetResponse>
    requestFromFaucet(account: string): Promise<any>
    airdropOceanTokens(): Promise<any>
    // loginMetamask(): Promise<any>
    // loginBurnerWallet(): Promise<any>
    // logoutBurnerWallet(): Promise<any>
    // message: string
}

// export default class UserProvider extends PureComponent<{}, UserProviderState> {
function UserProvider(props : any) {

    const [ mkplId, setMkplId ] = useState('')
    const [ isLogged, setLogged] = useState(false)
    const [ account, setAccount ] = useState('')
    const [ wallet, setWallet ] = useState()
    const [ network, setNetwork ] = useState('')
    const [ web3, setWeb3 ] = useState()
    const [ ocean, setOcean ] = useState()
    const [ box, setBox ] = useState()

    const dispatch = useDispatch()
    const { isLoading, message } = useSelector(
        (state: RootState) => state.loading
    )

    // private const connectToWeb3Provider = async (web3: Web3) => {
    const connectToWeb3Provider = async (web3: Web3) => {
        // this.setState({
        //     web3
        // })
        setWeb3(web3)
    }

    // private const connectToOceanNetwork = async (ocean: any) => {
    const connectToOceanNetwork = async (ocean: any) => {
        // this.setState({
        //     isLogged: true,
        //     ocean
        // }, () => {
        //     this.hideLoadingMessage()
        //     this.initNetworkPoll()
        //     this.initAccountsPoll()
        //     this.fetchNetwork()
        //     this.fetchAccounts()
        // })
        setLogged(false)
        setOcean(ocean)
        hideLoadingMessage()
        initNetworkPoll()
        initAccountsPoll()
        fetchNetwork()
        fetchAccounts()
    }


    // private loginMetamask = async () => {
    //     const metamaskProvider = new MetamaskProvider()
    //     await metamaskProvider.startLogin()
    //     const web3 = metamaskProvider.getProvider()
    //     this.setState(
    //         {
    //             isLogged: true,
    //             isBurner: false,
    //             web3
    //         },
    //         () => {
    //             this.loadOcean()
    //         }
    //    )
    // }

    // private loginBurnerWallet = async () => {
    //     this.showLoadingMessage('Connecting to a Burner Wallet...')
    //     const burnerwalletProvider = new BurnerWalletProvider()
    //     await burnerwalletProvider.startLogin()
    //     const web3 = burnerwalletProvider.getProvider()
    //     this.hideLoadingMessage()
    //     this.setState(
    //         {
    //             isLogged: true,
    //             isBurner: true,
    //             web3
    //         },
    //         () => {
    //             this.loadOcean()
    //         }
    //    )
    // }

    // private logoutBurnerWallet = async () => {
    //     const burnerwalletProvider = new BurnerWalletProvider()
    //     await burnerwalletProvider.logout()
    // }

    // private airdropOceanTokens = async () => {
    const airdropOceanTokens = async () => {
        // const { ocean } = this.state
        const accounts = await ocean.accounts.list()
        console.log('airdropOceanTokens', ocean, accounts)

        // if (accounts.length > 0) {
        //     await airdropOceanTokens(ocean, accounts[0])
        //     await this.fetchBalance(accounts[0])
        // }
    }

    const state = {
        mkplId: marketplaceId,
        isLogged: false,
        isBurner: true, //TODO: set to true until full migration
        isWeb3Capable: Boolean(window.web3 || window.ethereum),
        // isLoading: false,
        account: '',
        balance: {
            eth: 0,
            ocn: 0
        },
        network: '',
        wallet: {} as any,
        web3: null as any,
        ocean: null as any,
        box: null as any,
        openWallet: () => openWallet(),
        // requestFromFaucet: () => requestFromFaucet(''),
        requestFromFaucet: () => new Promise((resolve, reject) => { console.log('TODO: call faucet request'); resolve({})}),
        airdropOceanTokens: () => airdropOceanTokens(),
        // loginMetamask: () => this.loginMetamask(),
        // loginBurnerWallet: () => this.loginBurnerWallet(),
        // logoutBurnerWallet: () => this.logoutBurnerWallet(),
        // message: 'Loading Marketplace...'
    }

    let accountsInterval: any = null

    let networkInterval: any = null

    const defaultMessage: string = 'Loading Marketplace...'

    // useEffect
    // 0
    // public async componentDidMount() {
    //     await this.bootstrap()
    //     this.mountWallet();
    // }

    useEffect(() => {
        mountWallet();
    }, [wallet]);

    const mountWallet = () => {
        // const { mkplId } = this.state;
        // import('op-web3-wallet').then((OPWallet) => {
        //     const wallet = new OPWallet.default.Core({
        if(!wallet) {
            const wallet = new OPWallet.Core({
                mkplId,
                network: networkId,
                walletOptions: {
                    portisEnabled: portisAppId != null && portisAppId.length > 0,
                    portisAppId,
                    torusEnabled
                },
                oceanOptions: {
                    enabled: true,
                    settings: { nodeUri, aquariusUri, brizoUri, brizoAddress, secretStoreUri, verbose },
                    faucetURI: faucetUri
                }
            })
            wallet.on("web3connected", connectToWeb3Provider)
            wallet.on("oceanconnected", connectToOceanNetwork)
            wallet.on("boxconnected", setBoxInstance)
            wallet.on("disconnect", onDisconnect)
            setWallet(wallet)
        }

        // useEffect
        // wallet.on("web3connected", connectToWeb3Provider.bind(this));
        // wallet.on("oceanconnected", connectToOceanNetwork.bind(this));
        // wallet.on("boxconnected", setBoxInstance.bind(this));
        // wallet.on("disconnect", onDisconnect.bind(this));
        // wallet.on("close", onClose.bind(this));
        // wallet.on("error", onError.bind(this));
        // this.setState({ wallet })
        // })
    }

    const onDisconnect = () => {
        setWeb3(null)
        setOcean(null)
        setLogged(false)
        // this.setState({ web3: null as any, ocean: null as any, isLogged: false })
    }

    // const onClose = () => {
    //     console.log('onClose')
    // }

    // const onError = (error: any) => {
    //     console.log('onError', error)
    // }

    const setBoxInstance = (box: any) => {
        console.log('boxconnected')
        // this.setState({ box })
        setBox(box)
    }

    // private async openWallet = () => {
    const openWallet = async () => {
        // await this.bootstrap()
        //TODO: open wallet widget
        // const { wallet } = this.state;
        wallet.toggleModal()

    }

    const initAccountsPoll = () => {
        if (!accountsInterval) {
            accountsInterval = setInterval(
                fetchAccounts,
                POLL_ACCOUNTS
        )
        }
    }

    const initNetworkPoll = () => {
        if (!networkInterval) {
            networkInterval = setInterval(fetchNetwork, POLL_NETWORK)
        }
    }

    const showLoadingMessage = (message: string) => {
        dispatch(setLoading({ isLoading: true, message }))
        // this.setState({ isLoading: true, message })
    }

    const hideLoadingMessage = () => {
        dispatch(setLoading({ isLoading: false, message: defaultMessage }))
        // this.setState({ isLoading: false, message: this.defaultMessage })
    }

    // private loadDefaultWeb3 = async () => {
    //     this.setState(
    //         {
    //             isLogged: false,
    //             isBurner: false,
    //             web3: DEFAULT_WEB3
    //         },
    //         () => {
    //             this.loadOcean()
    //         }
    //     )
    // }

    // 2
    const loadOcean = () => {
    // private loadOcean = async () => {
        // const { ocean } = await provideOcean() // Loads an ocean client not attached to a wallet
        // this.setState({ ocean }, () => console.log('Loaded ocean client', ocean))
    //     this.showLoadingMessage('Connecting to the Network...')
    //     const { ocean } = await provideOcean(this.state.web3)
    //     this.setState({ ocean }, () => {
    //         this.hideLoadingMessage()
    //         this.initNetworkPoll()
    //         this.initAccountsPoll()
    //         this.fetchNetwork()
    //         this.fetchAccounts()
    //     })
    }

    // after fetchAccounts
    const load3box = () => {
    // private load3box = async () => {
        // this.showLoadingMessage('Getting 3box Profile...')
        // const { account, web3 } = this.state
        // console.log('===ACCOUNT===', account, web3)
        // const box = await requestAccessTo3box(account, web3)
        // console.log('===3box===', box)
        // this.setState({ box })
        // this.hideLoadingMessage()
    }

    // 1
    const bootstrap = async () => {
        loadOcean()

    //     const logType = localStorage.getItem('logType')
    //     const metamaskProvider = new MetamaskProvider()

    //     switch (logType) {
    //         case 'Metamask':
    //             if (
    //                 (await metamaskProvider.isAvailable()) &&
    //                 (await metamaskProvider.isLogged())
    //             ) {
    //                 const web3 = metamaskProvider.getProvider()
    //                 this.setState(
    //                     {
    //                         isLogged: true,
    //                         web3
    //                     },
    //                     () => {
    //                         this.loadOcean()
    //                     }
    //                 )
    //             } else {
    //                 this.loadDefaultWeb3()
    //             }
    //             break
    //         case 'BurnerWallet':
    //             this.loginBurnerWallet()
    //             break
    //         default:
    //             this.loginBurnerWallet()
    //             break
    //     }
    }

    const fetchAccounts = async () => {
        // const { ocean, isLogged } = this.state

        if (isLogged) {
            let accounts

            // Modern dapp browsers
            // if (window.ethereum && !isLogged) {
            //     // simply set to empty, and have user click a button somewhere
            //     // to initiate account unlocking
            //     accounts = []

            //     // alternatively, automatically prompt for account unlocking
            //     // await this.unlockAccounts()
            // }

            accounts = await ocean.accounts.list()

            if (accounts.length > 0) {
                const cur_account = await accounts[0].getId()

                if (cur_account !== account) {
                    // this.setState({
                        // account,
                        // isLogged: true,
                        // requestFromFaucet: () => requestFromFaucet(account) //TODO: call faucet from wallet
                    // }, () => this.load3box()) // TODO: think if 3box needs to be loaded here
                    // })
                    setAccount(account)
                    setLogged(true)

                    await fetchBalance(accounts[0]) //TODO: fetch balance from wallet
                }
            } else {
                // !isLogged && this.setState({ isLogged: false, account: '' })
                if(!isLogged) {
                    setLogged(false)
                    setAccount('')
                }
            }
        }
    }

    const fetchBalance = (account: Account) => {
    // private fetchBalance = async (account: Account) => {
        // const balance = await account.getBalance()
        // const { eth, ocn } = balance
        // if (eth === 0) { //TODO: provisional faucet if account has no ETH
        //     await requestFromFaucet(await account.getId())
        //     const newBalance = await account.getBalance()
        //     console.log('Faucet executed!', newBalance)
        // }
        // if (eth !== this.state.balance.eth || ocn !== this.state.balance.ocn) {
        //     this.setState({ balance: { eth, ocn } })
        // }
    }

    const fetchNetwork = async () => {
        // const { ocean } = this.state
        let cur_network = 'Unknown'
        if (ocean) {
            cur_network = await ocean.keeper.getNetworkName()
        }
        cur_network !== network && setNetwork(cur_network)
    }

    // public render() {
    return (
        <User.Provider value={state}>
            <MarketProvider ocean={ocean}>
                {props.children}
            </MarketProvider>
        </User.Provider>
    )
    // }
}

export default UserProvider
