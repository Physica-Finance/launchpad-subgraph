import {Buy, Launch, Migrated, Sell} from "../generated/PhysicaTokenFactory/PhysicaTokenFactory";
import {META_MANAGER_ADDRESS, ONE_BI, ZERO_BI} from "./utils/constants";
import {MetaManager} from "../generated/PhysicaTokenFactory/MetaManager";
import {Address} from "@graphprotocol/graph-ts";
import {Token, Tx} from "../generated/schema";
import {Tx as txEntity} from "../generated/schema";
import {fetchPlqHolding, fetchTokenHolding, fetchTokenName, fetchTokenSymbol} from "./utils/token";
import {loadTransaction} from "./utils";
import { BigInt } from '@graphprotocol/graph-ts'
import {getMultihashFromContractReponseSingle} from "./utils/multihash";

export function handleLaunch(event: Launch) : void {
    let token = Token.load(event.params.tokenAddress.toHexString())
    if (token === null) {
        token = new Token(event.params.tokenAddress.toHexString())

        let metaManager = MetaManager.bind(Address.fromString(META_MANAGER_ADDRESS))
        let entry = metaManager.getEntry(event.params.tokenAddress)
        let multihash = getMultihashFromContractReponseSingle(entry.getDigest(), entry.getHashfunction(), entry.getSize())
        let tokenSymbol = fetchTokenSymbol(event.params.tokenAddress)
        let tokenName = fetchTokenName(event.params.tokenAddress)
        let launchedToken = new Token(event.params.tokenAddress.toHexString())
        launchedToken.symbol = tokenSymbol
        launchedToken.name = tokenName
        launchedToken.dev = loadTransaction(event).from
        launchedToken.startTime = event.block.timestamp
        launchedToken.migrated = false
        launchedToken.migrationCap = event.params.migrationCap
        launchedToken.initialSupply = event.params.initialSupply
        launchedToken.ipfsHash = multihash!
        launchedToken.txCount = ZERO_BI
        launchedToken.plqAmount = BigInt.fromString(fetchPlqHolding(event.params.tokenAddress))
        launchedToken.tokenAmount = BigInt.fromString(fetchTokenHolding(event.params.tokenAddress))
        launchedToken.save()
    }
}

export function handleTxBuy(event: Buy): void {
    let token = Token.load(event.params.token.toHexString())!
    token.txCount = token.txCount.plus(ONE_BI)
    token.tokenAmount = token.tokenAmount.minus(event.params.tokenAmount)
    token.plqAmount = token.plqAmount.plus(event.params.plqAmount)


    let transaction = loadTransaction(event)
    let tx = new txEntity(transaction.id.toString()+ '#' + token.txCount.toString())
    tx.transaction = transaction.id
    tx.from = transaction.from
    tx.timestamp = transaction.timestamp
    tx.token = token.id
    if(event.params.tokenAmount.equals(ZERO_BI)){
        tx.price = ZERO_BI.toBigDecimal()
    } else {
        tx.price = event.params.plqAmount.toBigDecimal().div(event.params.tokenAmount.toBigDecimal())
    }
    tx.plqAmount = event.params.plqAmount
    tx.tokenAmount = event.params.tokenAmount
    tx.buy = true
    token.save()
    tx.save()
}

export function handleTxSell(event: Sell): void {
    let token = Token.load(event.params.token.toHexString())!
    token.txCount = token.txCount.plus(ONE_BI)
    token.tokenAmount = token.tokenAmount.plus(event.params.tokenAmount)
    token.plqAmount = token.plqAmount.minus(event.params.plqAmount)

    let transaction = loadTransaction(event)
    let tx = new txEntity(transaction.id.toString()+ '#' + token.txCount.toString())
    tx.transaction = transaction.id
    tx.from = transaction.from
    tx.timestamp = transaction.timestamp
    tx.token = token.id
    if(event.params.tokenAmount.equals(ZERO_BI)){
        tx.price = ZERO_BI.toBigDecimal()
    } else {
        tx.price = event.params.plqAmount.toBigDecimal().div(event.params.tokenAmount.toBigDecimal())
    }
    tx.plqAmount = event.params.plqAmount
    tx.tokenAmount = event.params.tokenAmount
    tx.buy = false
    token.save()
    tx.save()
}

export function handleMigrate(event: Migrated) : void {
    let token = Token.load(event.params.token.toHexString())!
    token.migrated = true
    token.save()
}
