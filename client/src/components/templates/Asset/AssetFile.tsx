import React, { PureComponent } from 'react'
import { Logger, DDO, File } from '@oceanprotocol/squid'
import filesize from 'filesize'
import Button from '../../atoms/Button'
import Spinner from '../../atoms/Spinner'
import { User, Market } from '../../../context'
import styles from './AssetFile.module.scss'
// import ReactGA from 'react-ga'
import cleanupContentType from '../../../utils/cleanupContentType'

export const messages: any = {
    99: 'Decrypting file URL...',
    0: '1/3<br />Asking for agreement signature...',
    1: '1/3<br />Agreement initialized.',
    2: '2/3<br />Asking for two payment confirmations...',
    3: '2/3<br />Payment confirmed. Requesting access...',
    4: '3/3<br /> Access granted. Consuming file...'
}

interface AssetFileProps {
    file: File
    ddo: DDO
}

interface AssetFileState {
    isLoading: boolean
    error: string
    step: number
}

export default class AssetFile extends PureComponent<
    AssetFileProps,
    AssetFileState
> {
    public static contextType = User

    public state = {
        isLoading: false,
        error: '',
        step: 99
    }

    private resetState = () =>
        this.setState({
            isLoading: true,
            error: '',
            step: 99
        })

    private purchaseAsset = async (ddo: DDO, index: number) => {
        this.resetState()

        // ReactGA.event({
        //     category: 'Purchase',
        //     action: 'purchaseAsset-start ' + ddo.id
        // })

        const { wallet } = this.context

        try {
            wallet.toggleModal()
            // console.log('To be consumed', ddo, index)
            const path = await wallet.consumeAsset(ddo, index)
            Logger.log('path', path)
            wallet.toggleModal()
            // ReactGA.event({
            //     category: 'Purchase',
            //     action: 'purchaseAsset-end ' + ddo.id
            // })
            this.setState({ isLoading: false })
        } catch (error) {
            wallet.toggleModal()
            Logger.error('error', error.message)
            this.setState({
                isLoading: false,
                error: `${error.message}. Sorry about that, can you try again?`
            })
            // ReactGA.event({
            //     category: 'Purchase',
            //     action: 'purchaseAsset-error ' + error.message
            // })
        }
    }

    public render() {
        const { ddo, file } = this.props
        const { isLoading, error, step } = this.state
        const { isLogged } = this.context
        const { index, contentType, contentLength } = file

        return (
            <div className={styles.fileWrap}>
                <ul key={index} className={styles.file}>
                    {contentType || contentLength ? (
                        <>
                            <li>{cleanupContentType(contentType)}</li>
                            <li>
                                {contentLength && contentLength !== '0'
                                    ? filesize(contentLength)
                                    : ''}
                            </li>
                            {/* <li>{encoding}</li> */}
                            {/* <li>{compression}</li> */}
                        </>
                    ) : (
                        <li className={styles.empty}>No file info available</li>
                    )}
                </ul>

                {isLoading ? (
                    <Spinner message={messages[step]} />
                ) : (
                    <Market.Consumer>
                        {market => (
                            <Button
                                primary
                                className={styles.buttonMain}
                                // weird 0 hack so TypeScript is happy
                                onClick={() =>
                                    this.purchaseAsset(ddo, index || 0)
                                }
                                disabled={!isLogged || !market.networkMatch}
                                name="Download"
                            >
                                Get file
                            </Button>
                        )}
                    </Market.Consumer>
                )}

                {error !== '' && <div className={styles.error}>{error}</div>}
            </div>
        )
    }
}
