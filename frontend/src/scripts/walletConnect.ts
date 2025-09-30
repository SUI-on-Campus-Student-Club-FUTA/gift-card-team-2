let connectedAddress: string | null = null;
let isWalletConnected = false;

// UI elements (These will be queried in main.ts, but handled here)
let connectButton: HTMLButtonElement | null = null;
let createAccountSubmit: HTMLInputElement | null = null;

// Function to update UI elements based on connection status
export function updateUI() {
    if (connectButton) {
        connectButton.textContent = isWalletConnected ? 
            `${connectedAddress?.substring(0, 6)}...` : 
            'Connect Wallet';
        // You might want to disable the create account button if not connected
    }
    if (createAccountSubmit) {
        createAccountSubmit.disabled = !isWalletConnected;
    }

    // Redirect logic: If connected, check if User object exists and redirect
    if (isWalletConnected && window.location.pathname.endsWith('index.html')) {
        // You'd ideally fetch the User object here and redirect to home.html if found
        // For now, we'll just log
        console.log("Wallet connected. Ready to create/view user.");
    }
}

// Handles the wallet connection logic
export async function handleConnectWallet(): Promise<void> {
    if (!window.sui) {
        alert("Sui Wallet not found. Please install a Sui browser extension.");
        return;
    }

    try {
        const accounts = await window.sui.requestAccounts();
        if (accounts.length > 0) {
            connectedAddress = accounts[0];
            isWalletConnected = true;
            console.log("Connected Address:", connectedAddress);
            updateUI();
        }
    } catch (error) {
        console.error("Wallet connection failed:", error);
        isWalletConnected = false;
        connectedAddress = null;
        updateUI();
    }
}

// Getters for external modules
export const getConnectedAddress = () => connectedAddress;
export const getIsWalletConnected = () => isWalletConnected;

// Function to initialize references to UI elements
export function initializeWalletUI(
    connectBtn: HTMLButtonElement, 
    createSubmit: HTMLInputElement
) {
    connectButton = connectBtn;
    createAccountSubmit = createSubmit;
    
    // Check initial connection status on load
    handleConnectWallet(); 
}