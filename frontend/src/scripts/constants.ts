import { getFullnodeUrl } from '@mysten/sui.js/client';

export const PACKAGE_ID = "0x..."; 
export const GIFT_CARD_MODULE = "giftcard"; 
export const NETWORK = 'testnet'; 

export const SUI_CLIENT_CONFIG = {
    url: getFullnodeUrl(NETWORK),
};