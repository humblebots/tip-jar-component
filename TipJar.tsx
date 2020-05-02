import React, { useEffect, useState } from 'react';
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Alert,
	SafeAreaView,
	ViewProps,
	Platform,
} from 'react-native';

import {
	Headline,
	Button,
	Caption,
	ActivityIndicator,
	Subheading,
} from 'react-native-paper';
import LottieView from 'lottie-react-native';

import RNIap, { Product } from 'react-native-iap';

export const kHorizontalMargin = 16;

export interface ITipJarProps extends ViewProps {
	description?: string;
	productIds: string[];
}

const TipJar = (props: ITipJarProps) => {
	const { description, productIds } = props;
	const [getProducts, setProducts] = useState<Product[]>([]);

	const descriptionText =
		description !== undefined && description.length !== 0
			? description
			: `This app will always be free without ads, but if you'd like to make a donation to help fund our continued work and server bills, it is immensely appreciated!`;

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
					<View
						style={{
							flex: 1,
							marginRight: kHorizontalMargin,
						}}>
						{Platform.OS === 'ios' ? (
							<Headline>{title}</Headline>
						) : (
							<Subheading>{title}</Subheading>
						)}

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
