import cx from 'classnames'
import React, { PureComponent, FormEvent, ChangeEvent, MouseEvent } from 'react'
import ReactTags from 'react-tag-autocomplete'
import slugify from '@sindresorhus/slugify'
import DatePicker from 'react-datepicker'
import { ReactComponent as SearchIcon } from '../../../img/search.svg'
import Help from './Help'
import Label from './Label'
import Row from './Row'
import InputGroup from './InputGroup'
import styles from './Input.module.scss'

interface InputProps {
    name: string
    label: string
    placeholder?: string
    required?: boolean
    help?: string
    tag?: string
    type?: string
    sort?: boolean
    keys?: string[]
    options?: string[]
    additionalComponent?: any
    value?: string
    onChange?(
        event:
            | FormEvent<HTMLInputElement>
            | ChangeEvent<HTMLInputElement>
            | ChangeEvent<HTMLSelectElement>
            | ChangeEvent<HTMLTextAreaElement>
            | MouseEvent<HTMLButtonElement>
    ): void
    rows?: number
    group?: any
    multiple?: boolean
    pattern?: string
    handleAddition?(tag: any): void
    handleDelete?(i: number): void
    tags?: Array<Tag>
    suggestions?: Array<Tag>
    disabled?: boolean
}

interface InputState {
    isFocused: boolean
    dateCreated?: Date
}

interface Tag {
    id: number,
    name: string,
    disabled?: boolean
}

const KeyCodes = {
  comma: "188",
  enter: "13",
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

export default class Input extends PureComponent<InputProps, InputState> {
    public state: InputState = {
        isFocused: false,
        dateCreated: new Date()
    }

    public inputWrapClasses() {
        if (this.props.type === 'search') {
            return styles.inputWrapSearch
        } else if (this.props.type === 'search' && this.state.isFocused) {
            return cx(styles.inputWrapSearch, styles.isFocused)
        } else if (this.state.isFocused && this.props.type !== 'search') {
            return cx(styles.inputWrap, styles.isFocused)
        } else {
            return styles.inputWrap
        }
    }

    public toggleFocus = () => {
        this.setState({ isFocused: !this.state.isFocused })
    }

    private handleDateChange = (date: Date) => {
        this.setState({ dateCreated: date })

        const event = {
            currentTarget: {
                name: 'dateCreated',
                value: date
            }
        }
        this.props.onChange!(event as any) // eslint-disable-line @typescript-eslint/no-non-null-assertion
    }

    public InputComponent = () => {
        const {
            type,
            sort,
            keys,
            options,
            group,
            name,
            required,
            onChange,
            value,
            disabled
        } = this.props

        const wrapClass = this.inputWrapClasses()

        switch (type) {
            case 'select':
                const keyOpts = keys && sort !== false ? keys.sort((a, b) => a.localeCompare(b)):keys
                const opts = options && sort !== false ? options.sort((a, b) => a.localeCompare(b)):options
                return (
                    <div className={wrapClass}>
                        <select
                            id={name}
                            className={styles.select}
                            name={name}
                            required={required}
                            onFocus={this.toggleFocus}
                            onBlur={this.toggleFocus}
                            onChange={onChange}
                            value={value}
                        >
                            <option value="">---</option>
                            {opts &&
                                opts
                                    .map((option: string, index: number) => (
                                        <option key={index} value={keyOpts ? keyOpts[index]:option}>
                                            {option}
                                        </option>
                                    ))}
                        </select>
                    </div>
                )
            case 'textarea':
                return (
                    <div className={wrapClass}>
                        <textarea
                            id={name}
                            className={styles.input}
                            onFocus={this.toggleFocus}
                            onBlur={this.toggleFocus}
                            {...this.props}
                        />
                    </div>
                )
            case 'radio':
            case 'checkbox':
                return (
                    <div className={styles.radioGroup}>
                        {options &&
                            options.map((option: string, index: number) => (
                                <div className={styles.radioWrap} key={index}>
                                    <input
                                        className={styles.radio}
                                        id={slugify(option)}
                                        type={type}
                                        name={name}
                                        value={slugify(option)}
                                    />
                                    <label
                                        className={styles.radioLabel}
                                        htmlFor={slugify(option)}
                                    >
                                        {option}
                                    </label>
                                </div>
                            ))}
                    </div>
                )
            case 'date':
                return (
                    <div className={wrapClass}>
                        <DatePicker
                            selected={this.state.dateCreated}
                            onChange={this.handleDateChange}
                            className={styles.input}
                            onFocus={this.toggleFocus}
                            onBlur={this.toggleFocus}
                            id={name}
                            name={name}
                        />
                    </div>
                )
            case 'submit':
                return (
                    <input
                        id={name}
                        type="submit"
                        className={styles.input}
                        onFocus={this.toggleFocus}
                        onBlur={this.toggleFocus}
                        value={value}
                        {...this.props}
                    />
                )
            case 'button':
                // return (
                //     <button
                //         className={styles.input}
                //         onClick={this.props.onChange}
                //     >{value}</button>
                // )
                return (
                    <input
                        type="button"
                        className={styles.input}
                        value={value}
                        onClick={this.props.onChange}
                    />
                )
            case 'tags':
                const tagStyles = {
                    root: styles.taginput,
                    selectedTag: styles.selectedTag
                }
                return (
                    <ReactTags
                        id={name}
                        delimiterChars={delimiters}
                        allowNew
                        classNames={tagStyles}
                        {...this.props}
                    />
                )
            default:
                return (
                    <div className={wrapClass}>
                        {group ? (
                            <InputGroup>
                                <input
                                    id={name}
                                    type={type || 'text'}
                                    className={styles.input}
                                    onFocus={this.toggleFocus}
                                    onBlur={this.toggleFocus}
                                    {...this.props}
                                />
                                {group}
                            </InputGroup>
                        ) : (
                            <input
                                id={name}
                                type={type || 'text'}
                                className={styles.input}
                                onFocus={this.toggleFocus}
                                onBlur={this.toggleFocus}
                                {...this.props}
                            />
                        )}

                        {type === 'search' && <SearchIcon />}
                    </div>
                )
        }
    }

    public render() {
        const {
            name,
            label,
            required,
            help,
            additionalComponent,
            multiple
        } = this.props

        return (
            <Row>
                <Label htmlFor={name} required={required}>
                    {label}
                </Label>

                <this.InputComponent />

                {help && <Help>{help}</Help>}

                {multiple && 'hello'}

                {additionalComponent && additionalComponent}
            </Row>
        )
    }
}
