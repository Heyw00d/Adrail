import { verifyMessage } from 'viem';

/**
 * Generates the message that must be signed for registration
 */
export function getSignatureMessage(name: string): string {
  return `I am registering for AdRail as ${name}`;
}

/**
 * Verifies that a signature is valid for the given wallet address and name
 */
export async function verifyWalletSignature(
  walletAddress: string,
  name: string,
  signature: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const message = getSignatureMessage(name);
    
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`
    });

    if (!isValid) {
      return { valid: false, error: 'Invalid signature - wallet address does not match' };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Signature] Verification failed:', error);
    return { valid: false, error: 'Signature verification failed' };
  }
}
