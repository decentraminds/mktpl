import React, { ChangeEvent, Component, FormEvent } from 'react'
import Button from '../components/atoms/Button'

interface IState {
    value?: string
}

class Publish extends Component<{}, IState> {

    public state = { value: '' }

    public render() {
        return (
            <div>
                <h1>Publish</h1>
                <form onSubmit={this.registerAsset}>
                    <label>
                        Name:
                        <input type="text" name="value" value={this.state.value} onChange={this.inputChange} />
                    </label>
                    <Button>I am a button</Button>
                </form>
            </div>
        )
    }

    private inputChange = (event: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    private registerAsset = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        // console.log("submit", this.state.value)
    }
}

export default Publish
