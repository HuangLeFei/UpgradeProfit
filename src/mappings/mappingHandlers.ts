import {UpgradeProfitEvent, WithdrawalEvent, UpgradeProfit, Withdraw} from "../types";
import {
    UpgradeProfitTransaction,
    UpgradeProfitEventLog,
    WithdrawalEventLog,
    WithdrawTransaction,
} from "../types/abi-interfaces/UpgradeProfit";
import assert from "assert";
import {EthereumReceipt} from "@subql/types-ethereum/dist/ethereum/interfaces";

export async function handleLog(log: UpgradeProfitEventLog): Promise<void> {
    logger.info(`New UpgradeProfitEvent transaction log at block ${log.blockNumber}`);
    assert(log.args, "No log.args")
    const upgradeProfit = UpgradeProfitEvent.create({
        id: log.transactionHash,
        blockHeight: log.blockNumber.toString(),
        account: log.args.account,
        amount: log.args.amount.toBigInt(),
        fundAmount: log.args.fundAmount.toBigInt(),
        contractAddress: log.address,
    });

    await upgradeProfit.save();
}

export async function handleWithdrawalEvent(log: WithdrawalEventLog): Promise<void> {
    logger.info(`New WithdrawalEvent transaction log at block ${log.blockNumber}`);
    assert(log.args, "No log.args")
    const withdrawalEvent = WithdrawalEvent.create({
        id: log.transactionHash,
        blockHeight: log.blockNumber.toString(),
        txId: log.args.txId.toBigInt(),
        account: log.args.account,
        amount: log.args.amount.toBigInt(),
        contractAddress: log.address,
    });

    await withdrawalEvent.save();
}

export async function handleTransaction(tx: UpgradeProfitTransaction): Promise<void> {
    logger.info(`New upgradeProfit transaction at block ${tx.blockNumber}`);
    assert(tx.args, "No tx.args")
    const upgradeProfit = UpgradeProfit.create({
        id: tx.hash,
        blockHeight: tx.blockNumber.toString(),
        from: tx.from,
        amount: BigInt(await tx.args[0].toString()),
        contractAddress: tx.to,
    });

    await upgradeProfit.save();
}

export async function handleWithdrawTransaction(tx: WithdrawTransaction): Promise<void> {
    logger.info(`New withdraw transaction at block ${tx.blockNumber}`);
    assert(tx.args, "No tx.args")
    let ethereumReceiptPromise = await tx.receipt().catch(e => {
        logger.info(`Error: ${e}`);
        throw  new Error((e))
    });
    logger.info(`withdrawTransaction receipt status ${ethereumReceiptPromise.status}`);
    logger.info(JSON.stringify(ethereumReceiptPromise));

    const withdraw = Withdraw.create({
        id: tx.hash,
        blockHeight: tx.blockNumber.toString(),
        from: tx.from,
        _txId: BigInt(await tx.args[0].toString()),
        _account: await tx.args[1].toString(),
        _amount: BigInt(await tx.args[2].toString()),
        _deadline: BigInt(await tx.args[3].toString()),
        v: await Number(tx.args[4].toString()),
        r: await tx.args[5].toString(),
        s: await tx.args[6].toString(),
        contractAddress: tx.to,
        status: ethereumReceiptPromise.status
    });

    await withdraw.save();
}
