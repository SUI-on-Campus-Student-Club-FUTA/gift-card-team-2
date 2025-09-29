module giftcard_project::giftcard{

    use sui::error;
    use std::vector;
    use sui::object::{transfer};
    use sui::coin::{Self, Coin};
    use sui::sui:SUI;
    use std::String;

    const EGiftCardDoesntExist = 100;
    const EGifCardIsNotForYou = 101;
    const EMaxCardsReached = 102;
    const EYouDontHaveAnyCards = 103;
   
    let MAX_CARD_AMOUNT: u64 = 10000;

    public struct User has key{
        id: UID,
        owner: address,
        name: String,
        img_number: u8,
        balance: Balance,
        cards: vector::<GiftCard>,
    }

    public struct GiftCard has key{
        id: UID,
        name: String,
        price: u64,
        owner: address,
        redeemed: bool,
    }

    public struct Balance has key{
        id: UID,
        amount: u64,
    }

    let users: vector<User> = vector::empty<User>;
    let num_users: u64 = vector::length(&users);
    let gift_cards: vector<GiftCard> = vector::empty<GiftCard>;

    public fun create_user_account(
        ctx: &mut TxContext,
        name: String,
        img_number
    ): User{
        //check if user exists
        //return an error if user already exists
        let new_user = User{
            id: ctx(new),
            owner: ctx.sender,
            name,
            img_number,
            balance: Balance{
                id: ctx(new),
                amount: 0,
            },
            cards: vector::empty<Giftcard>
        }
        vector::push_back(users, new_user);
    }

    public fun get_user_giftcards(
        ctx: &mut TxContext,
        user: address
    ){
        let user: vector<GiftCard> = users[address].cards;
        if(vector::length(user_gift_cards) == 0){
            abort EYouDontHaveAnyCards;
        }
        return user_gift_cards;
    }

    public fun create_gift_card(
        ctx: &mut TxContext,
        name: String,
        _price: u64,
        _owner: User
    ): GiftCard{
        let user: User = vector::borrow(users, owner);
        let num_giftcards: u64 = vector::length(user.cards);
        if(num_giftcards >= MAX_CARD_AMOUNT){
            abort EMaxCardsReached;
        }
        let new_giftcard = GiftCard{
            id: new(ctx),
            name,
            price: _price,
            owner: user.owner,
            bool: false,
        };
        vector::push_back(gift_cards, new_giftcard);
    }

    public fun transfer_card(
        ctx: &mut TxContext,
        card: &mut GiftCard,
        new_owner: address
    ){
        //also confirm if the new owner has an account
        let gift_card: GiftCard = vector::borrow(&object, card);
        if(!gift_card){
            abort EGiftCardDoesntExist;
        }
        //acces control check
        if(gift_card.owner !== ctx.sender){
            abort EGifCardIsNotForYou;
        }
        let updated_card = GiftCard{
            id: gift_card.id,
            amount: gift_card.amount,
            owner: new_owner,
        }
        transfer(updated_card, new_owner, ctx);
    }

    public fun redeem_card(
        ctx: &mut TxContext,
        card: GiftCard,
        user: &mut User,
    ){
        let gift_card: GiftCard = vector::borrow(&object, card);
        if(!gift_card){
            abort EGiftCardDoesntExist;
        }
        if(gift_card.owner !== ctx.sender){
            abort EGifCardIsNotForYou;
        }
        let updated_card = {
            id: ctx(new),
            price: card.price,
            owner: card.owner,
            redeemed: true,
        }
        let card_price: u64 = gift_card.price;
        let new_balance: Balance = Balance{
            id: ctx(new),
            amount: card_price
        }
        //update the user
        let updated_user = {
            id: ctx(new),
            owner: user.owner,
            name: user.name,
            balance: user.balance + new_balance,
            cards: user.cards,
        }
        //trash the gift card 
        for(&mut u64 i = 0; i < num_giftcards; i++){
            if(vector::borrow(gift_cards, gift_cards[i]) === gift_card){
                vector::remove(gift_cards, gift_cards[i]);
            }
        }
    }
}