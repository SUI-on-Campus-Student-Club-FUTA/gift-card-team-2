import { SuiClient } from '@mysten/sui.js/client';
import { SUI_CLIENT_CONFIG } from './constants';

// The SuiClient instance is exported for use in other modules
export const suiClient = new SuiClient(SUI_CLIENT_CONFIG);

// Simple check to confirm the connection is active
export async function verifyConnection(): Promise<void> {
    try {
        const info = await suiClient.getLatestSuiSystemState();
        console.log(`✅ Connected to Sui ${info.network} (Epoch: ${info.epoch})`);
    } catch (error) {
        console.error("❌ Failed to connect to Sui network:", error);
    }
}