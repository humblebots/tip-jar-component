import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { SafeAreaView } from 'react-navigation';
import {
	Text,
	IconButton,
	Headline,
	Button,
	Caption,
	ActivityIndicator,
} from 'react-native-paper';
import LottieView from 'lottie-react-native';
import {
	NavigationStackScreenProps,
	NavigationStackScreenComponent,
} from 'react-navigation-stack';

import RNIap, { Product } from 'react-native-iap';

export const kHorizontalMargin = 16;

export interface ITipJarParams {
	productIds: string[];
}

export interface ITipJarScreenProps {}
export interface ITipJarProps
	extends NavigationStackScreenProps<ITipJarParams, ITipJarScreenProps> {}

const TipJar: NavigationStackScreenComponent<
	ITipJarParams,
	ITipJarScreenProps
> = (props: ITipJarProps) => {
	const [getProducts, setProducts] = useState<Product[]>([]);

	const { navigation } = props;

	const loadProducts = async () => {
		try {
			const productIds = navigation.getParam('productIds');
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
		} catch {
			Alert.alert(
				'Error',
				'Failed to purchase product. Please try again.',
			);
		}
	};

	useEffect(() => {
		loadProducts();
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
					<View style={{ flex: 1, marginRight: kHorizontalMargin }}>
						<Headline>{title}</Headline>

						<Caption style={{ marginLeft: 2 }}>
							{product.description}
						</Caption>
					</View>

					<Button mode={'outlined'}>{product.localizedPrice}</Button>
				</TouchableOpacity>
			);
		});
	};

	return (
		<View style={styles.container}>
			<SafeAreaView>
				<View style={styles.titleContainer}>
					<View style={styles.titleButtonContainer}>
						<IconButton
							icon='arrow-left'
							size={30}
							onPress={() => {
								navigation.goBack(null);
							}}
						/>
					</View>

					<Text style={styles.titleLabel}>{'Tip Jar'}</Text>
				</View>
			</SafeAreaView>

			<View style={styles.contentContainer}>
				<LottieView
					source={require('../../assets/lottie/2837-trophy-animation.json')}
					autoSize={true}
					resizeMode={'contain'}
					loop={true}
					style={styles.animation}
				/>
			</View>

			<Caption
				style={
					styles.descriptionText
				}>{`Shortlist will always be free, but if you'd like to make a donation to help fund our continued work on Shortlist it is immensely appreciated!`}</Caption>

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
		marginBottom: kHorizontalMargin,
	},
	productContainer: {
		flex: -1,
		paddingBottom: 32,
	},
	tipRow: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
		paddingHorizontal: kHorizontalMargin,
	},
	titleButtonContainer: {
		flexDirection: 'row',
	},
	titleContainer: {
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 44,
		marginBottom: 4,
		marginHorizontal: kHorizontalMargin,
	},
	titleLabel: {
		color: '#2E2E2E',
		fontSize: 36,
		fontWeight: '700',
		paddingRight: kHorizontalMargin,
	},
});

export default TipJar;
