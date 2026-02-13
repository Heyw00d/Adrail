import { createPublicClient, createWalletClient, http, parseUnits, formatUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia, base } from 'viem/chains';

// Config
const isTestnet = process.env.X402_TESTNET !== 'false';
const chain = isTestnet ? baseSepolia : base;

// USDC addresses
const USDC_ADDRESS = isTestnet 
  ? '0x036CbD53842c5426634e7929541eC2318f3dCF7e' // Base Sepolia
  : '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base Mainnet

// AdRail escrow wallet - receives escrow funds, sends publisher payments
const ESCROW_WALLET = process.env.ESCROW_WALLET || '0x180560b13249d326e6dC6aa3b2D5900994e2aaBe';

// ERC20 ABI for USDC
const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ type: 'uint8' }]
  }
] as const;

// Create public client for reading
const publicClient = createPublicClient({
  chain,
  transport: http()
});

// Create wallet client for writing (if private key provided)
function getWalletClient() {
  const privateKey = process.env.ESCROW_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('ESCROW_PRIVATE_KEY not set');
  }
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return createWalletClient({
    account,
    chain,
    transport: http()
  });
}

/**
 * Get USDC balance for an address
 */
export async function getUsdcBalance(address: string): Promise<number> {
  const balance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`]
  }) as bigint;
  
  // USDC has 6 decimals
  return Number(formatUnits(balance, 6));
}

/**
 * Verify a USDC transfer transaction
 * Returns the amount transferred if valid, null if invalid
 */
export async function verifyUsdcTransfer(
  txHash: string,
  expectedTo: string,
  minAmount: number
): Promise<{ valid: boolean; amount?: number; from?: string; error?: string }> {
  try {
    const receipt = await publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`
    });
    
    if (!receipt || receipt.status !== 'success') {
      return { valid: false, error: 'Transaction failed or not found' };
    }
    
    // Look for USDC Transfer event
    // Transfer(address indexed from, address indexed to, uint256 value)
    const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    
    for (const log of receipt.logs) {
      if (
        log.address.toLowerCase() === USDC_ADDRESS.toLowerCase() &&
        log.topics[0] === transferTopic
      ) {
        const to = `0x${log.topics[2]?.slice(26)}`;
        if (to.toLowerCase() === expectedTo.toLowerCase()) {
          // Parse the amount from log data (USDC has 6 decimals)
          const dataHex = String(log.data);
          const amount = Number(formatUnits(BigInt(dataHex), 6));
          if (amount >= minAmount) {
            const from = `0x${log.topics[1]?.slice(26)}`;
            return { valid: true, amount, from };
          } else {
            return { valid: false, error: `Amount ${amount} less than required ${minAmount}` };
          }
        }
      }
    }
    
    return { valid: false, error: 'No matching USDC transfer found' };
  } catch (error: any) {
    return { valid: false, error: error.message };
  }
}

/**
 * Send USDC to an address (for publisher payouts)
 */
export async function sendUsdc(
  to: string,
  amountUsdc: number
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const walletClient = getWalletClient();
    const amount = parseUnits(amountUsdc.toString(), 6);
    
    const hash = await walletClient.writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, amount]
    });
    
    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    if (receipt.status === 'success') {
      console.log(`[x402] Sent ${amountUsdc} USDC to ${to} (${hash})`);
      return { success: true, txHash: hash };
    } else {
      return { success: false, error: 'Transaction reverted' };
    }
  } catch (error: any) {
    console.error('[x402] Send failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get escrow wallet info
 */
export async function getEscrowWalletInfo() {
  const balance = await getUsdcBalance(ESCROW_WALLET);
  return {
    address: ESCROW_WALLET,
    balance_usdc: balance,
    chain: isTestnet ? 'base-sepolia' : 'base',
    usdc_contract: USDC_ADDRESS
  };
}

// Export config
export const x402Config = {
  isTestnet,
  chain: isTestnet ? 'eip155:84532' : 'eip155:8453',
  chainName: isTestnet ? 'Base Sepolia' : 'Base',
  usdcAddress: USDC_ADDRESS,
  escrowWallet: ESCROW_WALLET,
  facilitator: isTestnet 
    ? 'https://www.x402.org/facilitator'
    : 'https://api.cdp.coinbase.com/x402/facilitator'
};
