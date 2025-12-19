import { supabase } from './supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export const authService = {
  async signUpWithEmail(email: string, password: string, fullName: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.code } };
      }

      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        });

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            fullName,
          },
          error: null,
        };
      }

      return { user: null, error: { message: 'Unknown error occurred' } };
    } catch (e: any) {
      return { user: null, error: { message: e.message || 'Sign up failed' } };
    }
  },

  async signInWithEmail(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.code } };
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .single();

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            fullName: profile?.full_name || undefined,
          },
          error: null,
        };
      }

      return { user: null, error: { message: 'Unknown error occurred' } };
    } catch (e: any) {
      return { user: null, error: { message: e.message || 'Sign in failed' } };
    }
  },

  async signInWithApple(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const rawNonce = Math.random().toString(36).substring(2, 15);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        return { user: null, error: { message: 'No identity token returned from Apple' } };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.code } };
      }

      if (data.user) {
        const fullName = credential.fullName
          ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
          : undefined;

        if (fullName) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
          });
        }

        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            fullName,
          },
          error: null,
        };
      }

      return { user: null, error: { message: 'Unknown error occurred' } };
    } catch (e: any) {
      if (e.code === 'ERR_REQUEST_CANCELED') {
        return { user: null, error: { message: 'Sign in cancelled', code: 'cancelled' } };
      }
      return { user: null, error: { message: e.message || 'Apple sign in failed' } };
    }
  },

  async signInWithGoogle(): Promise<{ user: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'tether://auth/callback',
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.code } };
      }

      return { user: null, error: null };
    } catch (e: any) {
      return { user: null, error: { message: e.message || 'Google sign in failed' } };
    }
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: { message: error.message, code: error.code } };
      }
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Sign out failed' } };
    }
  },

  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'tether://auth/reset-password',
      });
      if (error) {
        return { error: { message: error.message, code: error.code } };
      }
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Password reset failed' } };
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email!,
        fullName: profile?.full_name || undefined,
      };
    } catch {
      return null;
    }
  },

  async updateProfile(updates: { fullName?: string; avatarUrl?: string }): Promise<{ error: AuthError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: { message: 'Not authenticated' } };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error: { message: error.message } };
      }
      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Update failed' } };
    }
  },

  async deleteAccount(): Promise<{ error: AuthError | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { error: { message: 'Not authenticated' } };
      }

      await supabase.from('interactions').delete().eq('user_id', user.id);
      await supabase.from('reminders').delete().eq('user_id', user.id);
      await supabase.from('achievements').delete().eq('user_id', user.id);
      await supabase.from('calendar_events').delete().eq('user_id', user.id);
      await supabase.from('push_tokens').delete().eq('user_id', user.id);
      await supabase.from('friends').delete().eq('user_id', user.id);
      await supabase.from('profiles').delete().eq('id', user.id);

      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: { message: error.message } };
      }

      return { error: null };
    } catch (e: any) {
      return { error: { message: e.message || 'Account deletion failed' } };
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        callback({
          id: session.user.id,
          email: session.user.email!,
          fullName: profile?.full_name || undefined,
        });
      } else {
        callback(null);
      }
    });
  },
};
