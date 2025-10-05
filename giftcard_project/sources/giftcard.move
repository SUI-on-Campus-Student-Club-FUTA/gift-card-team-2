module giftcard_project::giftcard {

    use std::string::String;
    use sui::transfer::{public_transfer};

    const E_NOT_OWNER: u64 = 100;
    const E_ALREADY_REDEEMED: u64 = 101;
    const E_AMOUNT_TOO_HIGH: u64 = 102;

    const MAX_CARD_AMOUNT: u64 = 10000;

    public struct GiftCard has key, store {
        id: UID,
        amount: u64,
        owner: address,
        redeemed: bool,
    }

    public struct User has key, store {
        id: UID,
        owner: address,
        name: String,
        img_number: u64,
        cards: vector<ID>,
    }

    public fun create_user(
        name: String,
        img_number: u64,
        ctx: &mut TxContext
    ): User {
        User {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            name,
            img_number,
            cards: vector::empty<ID>()
        }
    }

    public fun create_gift_card_for_user(
        user: &mut User,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(amount <= MAX_CARD_AMOUNT, E_AMOUNT_TOO_HIGH);
        assert!(tx_context::sender(ctx) == user.owner, E_NOT_OWNER);

        let card = GiftCard {
            id: object::new(ctx),
            amount,
            owner: user.owner,
            redeemed: false
        };

        let card_id = object::id(&card);
        vector::push_back(&mut user.cards, card_id);

        public_transfer(card, user.owner)
    }

    #[allow(lint(custom_state_change))] 
    public fun transfer_card(
        card: GiftCard,
        new_owner: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == card.owner, E_NOT_OWNER);
        transfer::public_transfer(card, new_owner);
    }

    public fun redeem_card(
        card: GiftCard,
        ctx: &mut TxContext
    ): u64 {
        assert!(tx_context::sender(ctx) == card.owner, E_NOT_OWNER);
        assert!(!card.redeemed, E_ALREADY_REDEEMED);

        let amount = card.amount;
        let GiftCard { id, .. } = card;
        object::delete(id);
        amount
    }

    public fun get_user_giftcards(user: &User): &vector<ID> {
        &user.cards
    }

}