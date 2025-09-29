let hasConnectedWallet: boolean = false;
let userName: string;

const imgs = [
    "/images/ape.jpg",
    "/images/dem.jpg",
    "/images/high.jpg",
    "/images/gmale.jpg",
    "/images/male.jpg",
]

const hanldleConnectWallet = async() => {
    //handle the connect wallet logic
    hasConnectedWallet = true;
    console.log("WALLET CONNECTED");
}

const handleSetName = (name: string) => {
    userName = name;
}

const handleCreateAccount = async() => {
    //handle the ccreate account logic
    //check the 5th number in the wallet address 
    //and set it as the img_number, which will be sent to the backend
    if(!hasConnectedWallet){
        return window.alert("You need to connect a wallet to continue");
    };
    console.log("Account created");
    window.location.href = "/pages/home.html"
}

const handleGetPrice = (cardName: string) => {
    const cardData = [
        {name: "Apple Card", price: 50},
        {name: "Visa Card", price: 50},
        {name: "Sui Card", price: 50},
        {name: "Maker Card", price: 50},
        {name: "Master Card", price: 50},
    ];

    const card = cardData.find(card => card.name === cardName);
    return card ? card.price : "Card Is Not Available";
}
