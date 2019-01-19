// tslint:disable:max-classes-per-file
import React, {PureComponent, ReactNode} from 'react';
import {omit} from 'lodash';
import mergeClassNames from 'classnames';
import enhanceWithClickOutside from 'react-click-outside';

import { PickDefaultProps } from '../../types';
import ShallowDropDownHeader from './header';
import ShallowDropDownContents from './contents';
import PropTypes from 'prop-types';

export interface DropDownWrapperProps {
    /**
     * An optional `className` to attach to the wrapper.
     */
    readonly className?: string;

    /**
     * An optional style variant (default, darker)
     */
    readonly style?: string;

    /**
     * An optional padding around the contents
     */
    readonly padded?: boolean;

    /**
     * This prop controls the initial visual opened state of the `DropDown`.
     */
    readonly isOpen: boolean;

    /**
     * This callback gets called when the opened state toggles
     */
    readonly onToggle?: (event: MouseEvent) => void;

    /**
     * The contents to be rendered, ideally `DropDown.Header` and `DropDown.Contents`.
     */
    readonly children?: ReactNode;

    /**
     * An optional css theme to be injected.
     */
    readonly theme?: DropDownWrapperTheme;
}

interface DropDownWrapperTheme {
    readonly 'dropDown': string;
    readonly 'dropDown--padded': string;
    readonly 'dropDown__btn': string;
}

export const defaultProps: PickDefaultProps<DropDownWrapperProps, 'isOpen' | 'style'> = {
    isOpen: false,
    style: 'default'
};

interface DropDownWrapperState {
    readonly isOpen: boolean;
}

export interface StatelessDropDownWrapperWithoutClickOutsideBehaviorProps extends DropDownWrapperProps {
    onToggle: (event: MouseEvent) => void;
    onClose: (event?: MouseEvent) => void;
}

export interface ChildContext {
    toggleDropDown: (event: MouseEvent) => void;
    closeDropDown: (event: MouseEvent) => void;
}

class StatelessDropDownWrapperWithoutClickOutsideBehavior extends PureComponent<StatelessDropDownWrapperWithoutClickOutsideBehaviorProps> {
    public static readonly defaultProps = defaultProps;

    public static readonly childContextTypes = {
        toggleDropDown: PropTypes.func.isRequired,
        closeDropDown: PropTypes.func.isRequired,
    };

    public readonly getChildContext = (): ChildContext => ({
        toggleDropDown: this.handleToggle,
        closeDropDown: this.handleClose,
    })

    public readonly handleClickOutside = () => {
        if (this.props.isOpen) {
            this.handleClose();
        }
    }

    public render(): JSX.Element {
        const {children, className, theme, style, padded, ...restProps} = this.props;
        const rest = omit(restProps, ['isOpen', 'onToggle', 'onClose']);
        const styleClassName: string = style ? `dropDown--${style}` : '';
        const finalClassName = mergeClassNames(
            {
                // @ts-ignore
                [theme[styleClassName]]: styleClassName,
                [theme!['dropDown--padded']]: padded
            },
            theme!.dropDown,
            className,
        );

        return (
            <div {...rest} className={finalClassName}>
                {React.Children.map(
                    children,
                    // @ts-ignore
                    child => typeof child.type === 'string' ? child : <child.type {...child.props} isDropdownOpen={this.props.isOpen}/>
                )}
            </div>
        );
    }

    private readonly handleToggle = (event: MouseEvent) => {
        if (event) {
            event.stopPropagation();
        }

        this.props.onToggle(event);
    }

    private readonly handleClose = (event?: MouseEvent) => {
        if (event) {
            event.stopPropagation();
        }
        this.props.onClose(event);
    }
}

//
// Add the click-outside functionality to the StatelessDropDownWrapper component.
//
export const StatelessDropDownWrapper = enhanceWithClickOutside(StatelessDropDownWrapperWithoutClickOutsideBehavior);


export class DropDownWrapper extends PureComponent<DropDownWrapperProps, DropDownWrapperState> {
    public static readonly defaultProps = defaultProps;

    constructor(props: DropDownWrapperProps) {
        super(props);
        this.state = {
            isOpen: props.isOpen
        };
    }

    public render(): JSX.Element {
        return <StatelessDropDownWrapper {...this.props} isOpen={this.state.isOpen} onToggle={this.handleToggle} onClose={this.handleClose}/>;
    }

    private readonly handleToggle = (event: MouseEvent) => {
        if (this.props.onToggle) {
            this.props.onToggle(event);
        }

        this.setState({isOpen: !this.state.isOpen});
    }

    private readonly handleClose = () => {
        this.setState({isOpen: false});
    }
}

export default DropDownWrapper;

export interface ContextDropDownProps extends DropDownWrapperProps {
    isDropdownOpen?: boolean;
}

export class ContextDropDownHeader extends PureComponent<ContextDropDownProps> {
    public static readonly contextTypes = {
        toggleDropDown: PropTypes.func.isRequired
    };

    public render(): JSX.Element {
        const {isDropdownOpen, ...rest} = this.props;

        return <ShallowDropDownHeader isOpen={isDropdownOpen} {...rest} {...this.context}/>;
    }
}

export class ContextDropDownContents extends PureComponent<ContextDropDownProps> {
    public static readonly contextTypes = {
        closeDropDown: PropTypes.func.isRequired
    };

    public render(): JSX.Element {
        const {isDropdownOpen, ...rest} = this.props;

        return <ShallowDropDownContents isOpen={isDropdownOpen} {...rest} {...this.context}/>;
    }
}
