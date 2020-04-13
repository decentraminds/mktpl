import React from 'react'
import ReactDOM from 'react-dom'
import UserProvider from './context/UserProvider'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux'
import store from "./store";
require('react-hot-loader/patch')

const root = document.getElementById('root')

ReactDOM.render(
    <AppContainer>
        <Provider store={store}>
            <UserProvider>
                <App />
            </UserProvider>
        </Provider>
    </AppContainer>,
    root
)
// See last lines
// serviceWorker.register()
// function renderToDOM() {
//     const root = document.getElementById('root')
//
//     if (root !== null) {
//         ReactDOM.render(
//             <UserProvider>
//                 <App />
//             </UserProvider>,
//             root
//         )
//     }
// }

// export { renderToDOM }

// renderToDOM()

if ((module as any).hot) {
    (module as any).hot.accept('./App', () => {
        const NextApp = require('./App').default;
        ReactDOM.render(
            <AppContainer>
                <Provider store={store}>
                    <UserProvider>
                        <NextApp />
                    </UserProvider>
                </Provider>
            </AppContainer>,
            root
        )
    })
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
