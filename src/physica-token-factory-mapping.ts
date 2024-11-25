import {Buy, Launch, Migrated, Sell} from "../generated/PhysicaTokenFactory/PhysicaTokenFactory";
import {META_MANAGER_ADDRESS, ONE_BI, ZERO_BI} from "./utils/constants";
import {MetaManager} from "../generated/PhysicaTokenFactory/MetaManager";
import {Address} from "@graphprotocol/graph-ts";
import {Token} from "../generated/schema";
import {Buy as buyEntity} from "../generated/schema";
import {Sell as sellEntity} from "../generated/schema";
import {fetchTokenName, fetchTokenSymbol} from "./utils/token";
import {loadTransaction} from "./utils";
import {getMultihashFromContractResponse} from "./utils/multihash";

export function handleLaunch(event: Launch) {
    let token = Token.load(event.params.tokenAddress.toHexString())
    if (token === null) {
        token = new Token(event.params.tokenAddress.toHexString())

        let metaManager = MetaManager.bind(Address.fromString(META_MANAGER_ADDRESS))
        let entry = metaManager.getEntry(event.params.tokenAddress)

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
        launchedToken.ipfsHash = getMultihashFromContractResponse(entry).toString()
        launchedToken.txCount = ZERO_BI
        launchedToken.plqAmount = ZERO_BI
        launchedToken.tokenAmount = ZERO_BI
        launchedToken.save()
    }
}

export function handleBuy(event: Buy) {
    let token = Token.load(event.params.token.toHexString())
    token.txCount = token.txCount.plus(ONE_BI)
    token.tokenAmount = token.tokenAmount.minus(event.params.tokenAmount)
    token.plqAmount = token.plqAmount.plus(event.params.plqAmount)
    let transaction = loadTransaction(event)
    let buy = new buyEntity(transaction.id.toString()+ '#' + token.txCount.toString())
    buy.transaction = transaction.id
    buy.buyer = transaction.from
    buy.timestamp = transaction.timestamp
    buy.token = token.id
    buy.price = event.params.plqAmount.div(event.params.tokenAmount)
    buy.plqAmount = event.params.plqAmount
    buy.tokenAmount = event.params.tokenAmount
    token.save()
    buy.save()
}

export function handleSell(event: Sell) {
    let token = Token.load(event.params.token.toHexString())
    token.txCount = token.txCount.plus(ONE_BI)
    token.tokenAmount = token.tokenAmount.plus(event.params.tokenAmount)
    token.plqAmount = token.plqAmount.minus(event.params.plqAmount)
    let transaction = loadTransaction(event)
    let sell = new sellEntity(transaction.id.toString()+ '#' + token.txCount.toString())
    sell.transaction = transaction.id
    sell.seller = transaction.from
    sell.timestamp = transaction.timestamp
    sell.token = token.id
    sell.plqAmount = event.params.plqAmount
    sell.tokenAmount = event.params.tokenAmount
    sell.price = event.params.plqAmount.div(event.params.tokenAmount)
    token.save()
    sell.save()
}

export function handleMigrate(event: Migrated) {
    let token = Token.load(event.params.token.toHexString())
    token.migrated = true
    token.save()
}
