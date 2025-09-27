[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=20748694&assignment_repo_type=AssignmentRepo)

# Gift Card Sui Move Project
This repository is for students to work and improve their skillset by building a Sui Move project. The following specification is provided as a starting point. You may use a different structure if you wish; this is just to give you an idea of what to build.

## Project Overview
Build a giftcard issuance system that allows users to create, transfer, and redeem digital gift cards on Sui Move. The project covers:
- Locked balance management using gift cards
- Object lifecycle: creation, transfer, and destruction of gift cards
- Mutating object state (redeemed flag)
- Access control for secure operations
- Practical experience with Sui Move modules, objects, and functions


### 🎁 Gift Card

#### Modules Needed
- `giftcard` – Core module for creating & redeeming gift cards.

#### Objects
- **GiftCard**
  - `id: UID`
  - `amount: u64`
  - `owner: address`
  - `redeemed: bool`

#### Functions
- `create_gift_card(amount: u64, owner: address)`
  - Creates a new gift card with locked balance.
- `transfer_card(card: GiftCard, new_owner: address)`
  - Changes ownership.
- `redeem_card(card: GiftCard, user: &mut Balance)`
  - Moves funds into user’s balance.
  - Marks `redeemed = true`.
  - Destroys card after redemption.

#### Constants
- `MAX_CARD_AMOUNT: u64 = 10000;`

#### Concepts Covered
- ✅ Balances
- ✅ Object lifecycle (create → transfer → destroy)
- ✅ Mutating object state (redeemed flag)
- ✅ Access control

---

**Instructions:**
- Each team member should contribute to the project.
- You are encouraged to explore and improve upon the provided structure.
- Focus on understanding and implementing the concepts listed above.

