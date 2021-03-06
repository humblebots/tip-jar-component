import React, { useEffect, useState, useRef } from 'react';
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Alert,
	SafeAreaView,
	ViewProps,
	Platform,
	ViewStyle,
	EmitterSubscription,
} from 'react-native';

import {
	Headline,
	Button,
	Caption,
	ActivityIndicator,
	Subheading,
} from 'react-native-paper';
import LottieView from 'lottie-react-native';

import RNIap, {
	Product,
	purchaseUpdatedListener,
	InAppPurchase,
	Purchase,
} from 'react-native-iap';

export const kHorizontalMargin = 16;

export interface ITipJarProps extends ViewProps {
	description?: string;
	productIds: string[];
	style: ViewStyle;
}

const TipJar = (props: ITipJarProps) => {
	const { description, productIds } = props;
	const [getProducts, setProducts] = useState<Product[]>([]);

	const purchaseListenerRef = useRef<EmitterSubscription>();

	const descriptionText =
		description !== undefined && description.length !== 0
			? description
			: `This app will always be free without ads, but if you'd like to make a donation to help fund our continued work and server bills, it is immensely appreciated!`;

	const removePurchaseListener = () => {
		if (purchaseListenerRef.current) {
			purchaseListenerRef.current.remove();
			purchaseListenerRef.current = undefined;
		}
	};

	const setupPurchaseListener = () => {
		purchaseListenerRef.current = purchaseUpdatedListener(
			(purchase: InAppPurchase | Purchase) => {
				console.log('purchaseUpdatedListener', purchase);
				const receipt = purchase.transactionReceipt;

				if (!receipt) {
					return;
				}

				// Tell the store that you have delivered what has been paid for.
				// Failure to do this will result in the purchase being refunded on Android and
				// the purchase event will reappear on every relaunch of the app until you succeed
				// in doing the below. It will also be impossible for the user to purchase consumables
				// again untill you do this.
				if (Platform.OS === 'ios') {
					RNIap.finishTransactionIOS(purchase.transactionId);
				} else if (Platform.OS === 'android') {
					// If consumable (can be purchased again)
					RNIap.consumePurchaseAndroid(purchase.purchaseToken);
					// If not consumable
					// RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
				}

				// From react-native-iap@4.1.0 you can simplify above `method`. Try to wrap the statement with `try` and `catch` to also grab the `error` message.
				// If consumable (can be purchased again)
				RNIap.finishTransaction(purchase, true);
				// If not consumable
				// RNIap.finishTransaction(purchase, false);
			},
		);
	};

	const loadProducts = async () => {
		try {
			await RNIap.initConnection();

			const products = await RNIap.getProducts(productIds);

			setProducts(products);
		} catch (error) {
			console.error(error);
		}
	};

	const onProductSelected = async (productId: string) => {
		try {
			await RNIap.requestPurchase(productId, false);

			Alert.alert(
				`You're Awesome!`,
				'Thank you so much for your donation!',
			);
		} catch (error) {
			console.error(error);

			Alert.alert(
				'Error',
				'Failed to purchase product. Please try again.',
			);
		}
	};

	useEffect(() => {
		setupPurchaseListener();
		loadProducts();

		return () => {
			removePurchaseListener();
		};
	}, []);

	const renderProducts = () => {
		const products = getProducts;

		if (products.length === 0) {
			return (
				<View>
					<ActivityIndicator size={'large'} />
				</View>
			);
		}

		// Can't have emoji in the product name in App Store Connect.
		const prefixEmojis = ['😊', '😍', '🤩'];

		return products.map((product, index) => {
			const title =
				index < prefixEmojis.length
					? `${prefixEmojis[index]}  ${product.title}`
					: product.title;
			return (
				<TouchableOpacity
					activeOpacity={0.9}
					key={product.productId}
					onPress={() => {
						onProductSelected(product.productId);
					}}
					style={styles.tipRow}>
					<View
						style={{
							flex: 1,
							marginRight: kHorizontalMargin,
						}}>
						{Platform.OS === 'ios' ? (
							<Headline style={{ color: '#202020' }}>
								{title}
							</Headline>
						) : (
							<Subheading style={{ color: '#202020' }}>
								{title}
							</Subheading>
						)}

						<Caption style={{ marginLeft: 2, color: '#787878' }}>
							{product.description}
						</Caption>
					</View>

					<Button mode={'outlined'}>{product.localizedPrice}</Button>
				</TouchableOpacity>
			);
		});
	};

	return (
		<View {...props} style={[styles.container, props.style]}>
			<View style={styles.contentContainer}>
				<LottieView
					source={require('./2837-trophy-animation.json')}
					autoSize={true}
					autoPlay={true}
					resizeMode={'contain'}
					loop={true}
					style={styles.animation}
				/>
			</View>

			<Caption style={styles.descriptionText}>{descriptionText}</Caption>

			<View style={styles.productContainer}>{renderProducts()}</View>
			<SafeAreaView />
		</View>
	);
};

const styles = StyleSheet.create({
	animation: {
		flex: 0,
		width: '66%',
	},
	container: {
		alignItems: 'stretch',
		flex: 1,
	},
	contentContainer: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'flex-start',
	},
	descriptionText: {
		marginHorizontal: kHorizontalMargin * 2,
		marginBottom:
			Platform.OS === 'ios' ? kHorizontalMargin : kHorizontalMargin / 2,
	},
	productContainer: {
		flex: -1,
		paddingBottom: Platform.OS === 'ios' ? 32 : 8,
	},
	tipRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: Platform.OS === 'ios' ? 8 : 4,
		paddingHorizontal: kHorizontalMargin,
	},
});

export default TipJar;
