import { verifyConnection, suiClient } from './initConnection';
import { handleConnectWallet, initializeWalletUI, getConnectedAddress, getIsWalletConnected } from './walletconnect';
import { PACKAGE_ID, GIFT_CARD_MODULE } from './constants';
import { TransactionBlock } from '@mysten/sui.js/transactions';

// --- Shared State & Types ---
interface UserObject {
    id: string; // The UID of the User object
    name: string;
    owner: string; // The address that owns the object
    img_number: number;
    cards: string[]; // Vector of GiftCard IDs
}

const AVATAR_LINKS = [
    "/images/ape.jpg", "/images/dem.jpg", "/images/gmale.jpg", 
    "/images/high.png", "/images/male.jpg", 
];
const USER_OBJECT_TYPE = `${PACKAGE_ID}::${GIFT_CARD_MODULE}::User`;

let currentUser: UserObject | null = null;
let currentGiftCards: any[] = []; // Simple array to hold fetched GiftCard objects

// --- Handlers for index.html ---

// (window as any).handleConnectWallet is now handled by the event listener in the initialization block

(window as any).handleCreateAccount = async (event: Event) => {
    event.preventDefault(); 
    
    const activeAddress = getConnectedAddress();
    const nameInput = document.getElementById('nameInput') as HTMLInputElement;

    if (!activeAddress || !window.sui || !nameInput) {
        alert("Wallet not connected or missing input.");
        return;
    }

    const userName = nameInput.value;
    const imgNumber = Math.floor(Math.random() * 10);
    
    const tx = new TransactionBlock();

    tx.moveCall({
        target: `${PACKAGE_ID}::${GIFT_CARD_MODULE}::create_user`,
        arguments: [ tx.pure(userName), tx.pure(imgNumber) ],
    });

    try {
        const result = await window.sui.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            options: { showEffects: true, showObjectChanges: true },
        });

        console.log("Transaction Result:", result);
        alert(`Account created successfully! Digest: ${result.digest}`);

        // Get the newly created object ID (assuming only one User object is created)
        const userObjectId = result.objectChanges?.find(
            (o) => o.type === 'created' && o.objectType === USER_OBJECT_TYPE
        )?.objectId;
        
        // Save the ID and redirect
        if (userObjectId) {
            localStorage.setItem('sui_giftcard_user_id', userObjectId);
            window.location.href = 'home.html';
        } else {
            alert("Could not find the created User object ID.");
        }

    } catch (error) {
        console.error("User creation failed:", error);
        alert(`Transaction failed: ${error.message}`);
    }
};

// --- Home Page Logic ---

async function fetchUserObject(userId: string, address: string): Promise<UserObject | null> {
    try {
        const response = await suiClient.getObject({
            id: userId,
            options: { showContent: true },
        });

        if (response.data && response.data.content?.dataType === 'moveObject') {
            const fields = response.data.content.fields as any;
            return {
                id: userId,
                name: fields.name,
                owner: address,
                img_number: Number(fields.img_number),
                cards: fields.cards,
            } as UserObject;
        }
    } catch (e) {
        console.error("Failed to fetch User object:", e);
    }
    return null;
}

async function fetchGiftCards(cardIds: string[]) {
    if (cardIds.length === 0) return [];
    
    const responses = await suiClient.multiGetObjects({
        ids: cardIds,
        options: { showContent: true },
    });

    return responses.map(r => {
        if (r.data && r.data.content?.dataType === 'moveObject') {
            return { id: r.data.objectId, ...r.data.content.fields };
        }
        return null;
    }).filter(card => card !== null);
}

async function renderHomePage() {
    const userId = localStorage.getItem('sui_giftcard_user_id');
    const address = getConnectedAddress();

    if (!address || !userId) {
        alert("User session lost. Redirecting to create account.");
        window.location.href = 'index.html';
        return;
    }

    const user = await fetchUserObject(userId, address);
    if (!user) {
        alert("User object not found. Please create an account.");
        window.location.href = 'index.html';
        return;
    }
    currentUser = user;
    
    // 1. Update User Profile UI
    const userNameEl = document.getElementById('userName');
    const userAddressEl = document.getElementById('userAddress');
    const userImgEl = document.getElementById('userImg') as HTMLImageElement;

    if (userNameEl) userNameEl.textContent = user.name;
    if (userAddressEl) userAddressEl.textContent = user.owner.substring(0, 10) + '...';
    if (userImgEl) userImgEl.src = AVATAR_LINKS[user.img_number % AVATAR_LINKS.length];
    
    // 2. Fetch and Render Gift Cards
    currentGiftCards = await fetchGiftCards(user.cards);
    
    const cardsDiv = document.getElementById('giftCardsDiv');
    if (cardsDiv) {
        cardsDiv.innerHTML = ''; // Clear loading message

        if (currentGiftCards.length === 0) {
            cardsDiv.innerHTML = '<p class="col-span-3 text-center p-8 bg-white/70 rounded-xl">You have no gift cards. Create one!</p>';
        } else {
            currentGiftCards.forEach(card => {
                cardsDiv.innerHTML += `
                    <div class="bg-white p-4 rounded-xl shadow-md flex flex-col gap-2">
                        <p class="font-bold">Card ID: ${card.id.substring(0, 8)}...</p>
                        <p class="text-2xl font-extrabold text-green-600">$${card.amount}</p>
                        <p class="text-sm text-gray-500">Owner: ${card.owner.substring(0, 8)}...</p>
                        <div class="flex justify-between mt-2">
                            <button onclick="window.handleShowTransfer('${card.id}')" class="text-blue-500 hover:underline text-sm">Transfer</button>
                            <button onclick="window.handleRedeemCard('${card.id}')" class="text-red-500 hover:underline text-sm">Redeem</button>
                        </div>
                    </div>
                `;
            });
        }
    }
}

// Global function to show transfer popup
(window as any).handleShowTransfer = (cardId: string) => {
    const popup = document.getElementById('transferPopup') as HTMLElement;
    const cardToTransferId = document.getElementById('cardToTransferId') as HTMLInputElement;
    cardToTransferId.value = cardId;
    popup.style.display = 'block';
}

// Global function to handle transfer transaction
(window as any).handleTransferCard = async (event: Event) => {
    event.preventDefault();
    const activeAddress = getConnectedAddress();
    const recipientAddress = (document.getElementById('recipientAddressInput') as HTMLInputElement).value;
    const cardId = (document.getElementById('cardToTransferId') as HTMLInputElement).value;

    if (!activeAddress || !recipientAddress || !cardId) return;

    const tx = new TransactionBlock();

    // Call the entry function giftcard_project::giftcard::transfer_card(card: GiftCard, new_owner: address)
    tx.moveCall({
        target: `${PACKAGE_ID}::${GIFT_CARD_MODULE}::transfer_card`,
        arguments: [
            tx.object(cardId),
            tx.pure(recipientAddress),
        ],
    });

    try {
        await window.sui.signAndExecuteTransactionBlock({ transactionBlock: tx });
        alert("Card transferred successfully!");
        document.getElementById('transferPopup')!.style.display = 'none';
        await renderHomePage(); // Refresh data
    } catch (e) {
        console.error("Transfer failed:", e);
        alert(`Transfer failed: ${e.message}`);
    }
}

// Global function to handle redeem transaction
(window as any).handleRedeemCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to redeem this card? This action is irreversible.")) return;
    
    const tx = new TransactionBlock();

    // Call the entry function giftcard_project::giftcard::redeem_card(card: GiftCard)
    tx.moveCall({
        target: `${PACKAGE_ID}::${GIFT_CARD_MODULE}::redeem_card`,
        arguments: [
            tx.object(cardId),
        ],
    });

    try {
        const result = await window.sui.signAndExecuteTransactionBlock({ transactionBlock: tx });
        console.log("Redeem Result:", result);
        alert("Card redeemed successfully!");
        await renderHomePage(); // Refresh data
    } catch (e) {
        console.error("Redeem failed:", e);
        alert(`Redeem failed: ${e.message}`);
    }
}

// --- Initialization Block ---
function initializePage() {
    verifyConnection();
    
    // Check if we are on the index page
    if (document.body.classList.contains('index-page')) {
        const connectButton = document.getElementById('connectButton') as HTMLButtonElement;
        const createAccountSubmit = document.getElementById('createAccountSubmit') as HTMLInputElement;

        if (connectButton && createAccountSubmit) {
            initializeWalletUI(connectButton, createAccountSubmit);
            connectButton.addEventListener('click', handleConnectWallet);
        }
    }
    
    // Check if we are on the home page
    if (document.body.classList.contains('home-page')) {
        if (getIsWalletConnected()) {
            renderHomePage();
        } else {
            // Re-connect wallet and then render page
            handleConnectWallet().then(() => {
                if (getIsWalletConnected()) {
                    renderHomePage();
                }
            });
        }
    }

    // Initialize New Card Page logic here (left for user implementation)
}

// Run initialization logic when the DOM is ready
window.addEventListener('load', initializePage);