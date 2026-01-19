module ibt::ibt {
    use sui::coin::{Self, Coin, TreasuryCap};

    public struct IBT has drop {}

    #[allow(deprecated_usage)]
    fun init(witness: IBT, ctx: &mut TxContext) {
        let (treasury, metadata) = coin::create_currency(
            witness,
            9,
            b"IBT",
            b"Interchain Bridge Token",
            b"IBT",
            option::none(),
            ctx
        );

        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury, ctx.sender());
    }

    public entry fun mint(
        treasury: &mut TreasuryCap<IBT>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let coin = coin::mint(treasury, amount, ctx);
        transfer::public_transfer(coin, recipient);
    }

    public entry fun burn(
        treasury: &mut TreasuryCap<IBT>,
        coin: Coin<IBT>
    ) {
        coin::burn(treasury, coin);
    }
}