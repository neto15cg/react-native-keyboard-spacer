/**
 * Created by andrewhurst on 10/5/15.
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	Keyboard,
	LayoutAnimation,
	View,
	Dimensions,
	ViewPropTypes,
	Platform,
	StyleSheet
} from "react-native";

const styles = StyleSheet.create({
	container: {
		left: 0,
		right: 0,
		bottom: 0
	}
});

// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation = {
	duration: 500,
	create: {
		duration: 300,
		type: LayoutAnimation.Types.easeInEaseOut,
		property: LayoutAnimation.Properties.opacity
	},
	update: {
		type: LayoutAnimation.Types.spring,
		springDamping: 200
	}
};
topExtraSpacing;
export default class KeyboardSpacer extends Component {
	static propTypes = {
		topSpacing: PropTypes.number,
		topExtraSpacing: PropTypes.number,
		onToggle: PropTypes.func,
		style: ViewPropTypes.style
	};

	static defaultProps = {
		topSpacing: 0,
		topExtraSpacing: 0,
		onToggle: () => null
	};

	constructor(props, context) {
		super(props, context);
		this.state = {
			keyboardSpace: 0,
			isKeyboardOpened: false
		};
		this._listeners = null;
		this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
		this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);
	}

	componentDidMount() {
		const updateListener =
			Platform.OS === "android" ? "keyboardDidShow" : "keyboardWillShow";
		const resetListener =
			Platform.OS === "android" ? "keyboardDidHide" : "keyboardWillHide";
		this._listeners = [
			Keyboard.addListener(updateListener, this.updateKeyboardSpace),
			Keyboard.addListener(resetListener, this.resetKeyboardSpace)
		];
	}

	componentWillUnmount() {
		this._listeners.forEach(listener => listener.remove());
	}

	updateKeyboardSpace(event) {
		if (!event.endCoordinates) {
			return;
		}

		let animationConfig = defaultAnimation;
		if (Platform.OS === "ios") {
			animationConfig = LayoutAnimation.create(
				event.duration,
				LayoutAnimation.Types[event.easing],
				LayoutAnimation.Properties.opacity
			);
		}
		LayoutAnimation.configureNext(animationConfig);

		// get updated on rotation
		// when external physical keyboard is connected
		// event.endCoordinates.height still equals virtual keyboard height
		// however only the keyboard toolbar is showing if there should be one
		const keyboardSpace =
			event.endCoordinates.height +
			this.props.topSpacing +
			(!this.state.includeExtraSpacing ? this.props.topExtraSpacing : 0);

		this.setState(
			{
				keyboardSpace,
				isKeyboardOpened: true
			},
			this.props.onToggle(true, keyboardSpace)
		);
	}

	resetKeyboardSpace(event) {
		let animationConfig = defaultAnimation;
		if (Platform.OS === "ios") {
			animationConfig = LayoutAnimation.create(
				event.duration,
				LayoutAnimation.Types[event.easing],
				LayoutAnimation.Properties.opacity
			);
		}
		LayoutAnimation.configureNext(animationConfig);

		this.setState(
			{
				keyboardSpace: 0,
				isKeyboardOpened: false
			},
			this.props.onToggle(false, 0)
		);
	}

	render() {
		return (
			<React.Fragment>
				<View
					ref={ref => {
						this.marker = ref;
					}}
					onLayout={({ nativeEvent }) => {
						if (this.marker) {
							this.marker.measure(pageY => {
								const screenHeight = Dimensions.get("window")
									.height;
								const h = screenHeight - pageY;
								if (
									this.props.topExtraSpacing &&
									this.state.keyboardSpace - h > 10
								) {
									this.setState({
										includeExtraSpacing: false
									});
								} else {
									this.setState({
										includeExtraSpacing: true
									});
								}
							});
						}
					}}
				/>
				<View
					style={[
						styles.container,
						{
							height: this.state.keyboardSpace
						},
						this.props.style
					]}
				/>
			</React.Fragment>
		);
	}
}
