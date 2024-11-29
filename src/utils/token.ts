import {PhysicaErc20} from "../../generated/PhysicaTokenFactory/PhysicaErc20";
import {Address} from "@graphprotocol/graph-ts";
import {PhysicaErc20SymbolBytes} from "../../generated/PhysicaTokenFactory/PhysicaErc20SymbolBytes";
import {PhysicaErc20NameBytes} from "../../generated/PhysicaTokenFactory/PhysicaErc20NameBytes";
import {isNullEthValue} from "./index";
import {PhysicaTokenFactory} from "../../generated/PhysicaTokenFactory/PhysicaTokenFactory";
import {PHYSICA_TOKEN_FACTORY_ADDRESS} from "./constants";

export function fetchTokenSymbol(tokenAddress: Address): string {
    let contract = PhysicaErc20.bind(tokenAddress)
    let contractSymbolBytes = PhysicaErc20SymbolBytes.bind(tokenAddress)

    // try types string and bytes32 for symbol
    let symbolValue = 'unknown'
    let symbolResult = contract.try_symbol()
    if (symbolResult.reverted) {
        let symbolResultBytes = contractSymbolBytes.try_symbol()
        if (!symbolResultBytes.reverted) {
            // for broken pairs that have no symbol function exposed
            if (!isNullEthValue(symbolResultBytes.value.toHexString())) {
                symbolValue = symbolResultBytes.value.toString()
            }
        }
    } else {
        symbolValue = symbolResult.value
    }

    return symbolValue
}

export function fetchTokenName(tokenAddress: Address): string {
    let contract = PhysicaErc20.bind(tokenAddress)
    let contractNameBytes = PhysicaErc20NameBytes.bind(tokenAddress)

    // try types string and bytes32 for name
    let nameValue = 'unknown'
    let nameResult = contract.try_name()
    if (nameResult.reverted) {
        let nameResultBytes = contractNameBytes.try_name()
        if (!nameResultBytes.reverted) {
            // for broken exchanges that have no name function exposed
            if (!isNullEthValue(nameResultBytes.value.toHexString())) {
                nameValue = nameResultBytes.value.toString()
            }
        }
    } else {
        nameValue = nameResult.value
    }

    return nameValue
}

export function fetchTokenHolding(tokenAddress: Address): string {
    let contract = PhysicaTokenFactory.bind(Address.fromString(PHYSICA_TOKEN_FACTORY_ADDRESS))
    let tokenState = contract.tokenStates(tokenAddress)

    return tokenState.getTokenHolding().toString()
}

export function fetchPlqHolding(tokenAddress: Address): string {
    let contract = PhysicaTokenFactory.bind(Address.fromString(PHYSICA_TOKEN_FACTORY_ADDRESS))
    let tokenState = contract.tokenStates(tokenAddress)

    return tokenState.getPlqHolding().toString()
}
