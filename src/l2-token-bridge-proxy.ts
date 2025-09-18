import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Upgraded as UpgradedEvent,
  AdminChanged as AdminChangedEvent
} from "../generated/L2TokenBridgeProxy/TransparentUpgradeableProxy"
import {
  ProxyUpgraded,
  AdminChanged
} from "../generated/schema"

// Proxy event handlers
export function handleTokenBridgeUpgraded(event: UpgradedEvent): void {
  let entity = new ProxyUpgraded(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.proxyAddress = event.address
  entity.oldImplementation = Bytes.fromHexString("0x0000000000000000000000000000000000000000") // We don't have old implementation
  entity.newImplementation = event.params.implementation
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()
}

export function handleTokenBridgeAdminChanged(event: AdminChangedEvent): void {
  let entity = new AdminChanged(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.proxyAddress = event.address
  entity.previousAdmin = event.params.previousAdmin
  entity.newAdmin = event.params.newAdmin
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()
}

