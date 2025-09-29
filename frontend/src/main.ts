let hasConnectedWallet: boolean = false;
let userName: string;

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
    if(!hasConnectedWallet){
        return window.alert("You need to connect a wallet to continue");
    };
    console.log("Account created");
    window.location.href = "/pages/home.html"
}
