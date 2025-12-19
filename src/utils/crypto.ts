import * as Crypto from 'expo-crypto';

export const hashPhoneNumber = async (phone: string | undefined | null): Promise<string | null> => {
  if (!phone) return null;
  
  const normalized = phone.replace(/[\s\-\(\)\.]/g, '').replace(/^(\+?1)?/, '');
  
  if (normalized.length < 7) return null;
  
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalized
  );
  
  return hash;
};

export const normalizePhoneNumber = (phone: string | undefined | null): string | null => {
  if (!phone) return null;
  return phone.replace(/[\s\-\(\)\.]/g, '').replace(/^(\+?1)?/, '');
};
