import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesEntitlementInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { config } from '../config';

export interface PremiumStatus {
  isPremium: boolean;
  expirationDate?: Date;
  willRenew: boolean;
  productIdentifier?: string;
}

export interface AvailablePackage {
  identifier: string;
  product: {
    title: string;
    description: string;
    priceString: string;
    price: number;
    currencyCode: string;
  };
  packageType: string;
}

let isConfigured = false;

export const purchasesService = {
  async configure(userId?: string): Promise<void> {
    if (isConfigured) return;

    try {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      const apiKey = Platform.OS === 'ios'
        ? config.revenueCat.appleApiKey
        : config.revenueCat.googleApiKey;

      if (userId) {
        await Purchases.configure({ apiKey, appUserID: userId });
      } else {
        await Purchases.configure({ apiKey });
      }

      isConfigured = true;
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
    }
  },

  async login(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
    } catch (error) {
      console.error('Failed to login to RevenueCat:', error);
    }
  },

  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('Failed to logout from RevenueCat:', error);
    }
  },

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Failed to get customer info:', error);
      return null;
    }
  },

  async getPremiumStatus(): Promise<PremiumStatus> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const entitlement = customerInfo.entitlements.active[config.app.premiumEntitlementId];

      if (entitlement) {
        return {
          isPremium: true,
          expirationDate: entitlement.expirationDate
            ? new Date(entitlement.expirationDate)
            : undefined,
          willRenew: entitlement.willRenew,
          productIdentifier: entitlement.productIdentifier,
        };
      }

      return {
        isPremium: false,
        willRenew: false,
      };
    } catch (error) {
      console.error('Failed to get premium status:', error);
      return {
        isPremium: false,
        willRenew: false,
      };
    }
  },

  async getOfferings(): Promise<AvailablePackage[]> {
    try {
      const offerings = await Purchases.getOfferings();

      if (!offerings.current?.availablePackages) {
        return [];
      }

      return offerings.current.availablePackages.map((pkg: PurchasesPackage) => ({
        identifier: pkg.identifier,
        product: {
          title: pkg.product.title,
          description: pkg.product.description,
          priceString: pkg.product.priceString,
          price: pkg.product.price,
          currencyCode: pkg.product.currencyCode,
        },
        packageType: pkg.packageType,
      }));
    } catch (error) {
      console.error('Failed to get offerings:', error);
      return [];
    }
  },

  async purchasePackage(packageIdentifier: string): Promise<{
    success: boolean;
    isPremium: boolean;
    error?: string;
  }> {
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        p => p.identifier === packageIdentifier
      );

      if (!pkg) {
        return {
          success: false,
          isPremium: false,
          error: 'Package not found',
        };
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = !!customerInfo.entitlements.active[config.app.premiumEntitlementId];

      return {
        success: true,
        isPremium,
      };
    } catch (error: any) {
      if (error.userCancelled) {
        return {
          success: false,
          isPremium: false,
          error: 'Purchase cancelled',
        };
      }

      console.error('Purchase failed:', error);
      return {
        success: false,
        isPremium: false,
        error: error.message || 'Purchase failed',
      };
    }
  },

  async restorePurchases(): Promise<{
    success: boolean;
    isPremium: boolean;
    error?: string;
  }> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = !!customerInfo.entitlements.active[config.app.premiumEntitlementId];

      return {
        success: true,
        isPremium,
      };
    } catch (error: any) {
      console.error('Restore failed:', error);
      return {
        success: false,
        isPremium: false,
        error: error.message || 'Restore failed',
      };
    }
  },

  addCustomerInfoUpdateListener(
    callback: (info: CustomerInfo) => void
  ): () => void {
    const listener = Purchases.addCustomerInfoUpdateListener(callback);
    return () => listener.remove();
  },

  async checkTrialEligibility(productIdentifiers: string[]): Promise<Record<string, boolean>> {
    try {
      if (Platform.OS !== 'ios') {
        return productIdentifiers.reduce((acc, id) => ({ ...acc, [id]: true }), {});
      }

      const eligibility = await Purchases.checkTrialOrIntroductoryPriceEligibility(
        productIdentifiers
      );

      return Object.entries(eligibility).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value.status === 0,
      }), {});
    } catch (error) {
      console.error('Failed to check trial eligibility:', error);
      return {};
    }
  },

  async syncPurchases(): Promise<void> {
    try {
      await Purchases.syncPurchases();
    } catch (error) {
      console.error('Failed to sync purchases:', error);
    }
  },
};
