import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  BridgingInitiatedV2 as BridgingInitiatedV2Event,
  BridgingFinalized as BridgingFinalizedEvent,
  NewTokenDeployed as NewTokenDeployedEvent
} from "../generated/L2TokenBridge/L2TokenBridge"
import {
  BridgingInitiatedV2,
  BridgingFinalized,
  NewTokenDeployed,
  DailyBridgeStats,
  HourlyBridgeStats
} from "../generated/schema"

function getDayId(timestamp: BigInt): Bytes {
  let day = timestamp.toI32() / 86400
  return Bytes.fromI32(day)
}

function getHourId(timestamp: BigInt): Bytes {
  let hour = timestamp.toI32() / 3600
  return Bytes.fromI32(hour)
}

function updateDailyBridgeStats(timestamp: BigInt, initiatedAmount: BigInt, finalizedAmount: BigInt): void {
  let dayId = getDayId(timestamp)
  let dayStartTimestamp = BigInt.fromI32(dayId.toI32() * 86400)
  let dailyStats = DailyBridgeStats.load(dayId)

  if (dailyStats == null) {
    dailyStats = new DailyBridgeStats(dayId)
    dailyStats.date = dayStartTimestamp
    dailyStats.totalBridgingInitiated = BigInt.fromI32(0)
    dailyStats.totalBridgingFinalized = BigInt.fromI32(0)
    dailyStats.bridgingInitiatedCount = 0
    dailyStats.bridgingFinalizedCount = 0
  }

  dailyStats.totalBridgingInitiated = dailyStats.totalBridgingInitiated.plus(initiatedAmount)
  dailyStats.totalBridgingFinalized = dailyStats.totalBridgingFinalized.plus(finalizedAmount)
  if (initiatedAmount > BigInt.fromI32(0)) {
    dailyStats.bridgingInitiatedCount = dailyStats.bridgingInitiatedCount + 1
  }
  if (finalizedAmount > BigInt.fromI32(0)) {
    dailyStats.bridgingFinalizedCount = dailyStats.bridgingFinalizedCount + 1
  }
  dailyStats.save()
}

function updateHourlyBridgeStats(timestamp: BigInt, initiatedAmount: BigInt, finalizedAmount: BigInt): void {
  let hourId = getHourId(timestamp)
  let hourStartTimestamp = BigInt.fromI32(hourId.toI32() * 3600)
  let hourlyStats = HourlyBridgeStats.load(hourId)

  if (hourlyStats == null) {
    hourlyStats = new HourlyBridgeStats(hourId)
    hourlyStats.hour = hourStartTimestamp
    hourlyStats.totalBridgingInitiated = BigInt.fromI32(0)
    hourlyStats.totalBridgingFinalized = BigInt.fromI32(0)
    hourlyStats.bridgingInitiatedCount = 0
    hourlyStats.bridgingFinalizedCount = 0
  }

  hourlyStats.totalBridgingInitiated = hourlyStats.totalBridgingInitiated.plus(initiatedAmount)
  hourlyStats.totalBridgingFinalized = hourlyStats.totalBridgingFinalized.plus(finalizedAmount)
  if (initiatedAmount > BigInt.fromI32(0)) {
    hourlyStats.bridgingInitiatedCount = hourlyStats.bridgingInitiatedCount + 1
  }
  if (finalizedAmount > BigInt.fromI32(0)) {
    hourlyStats.bridgingFinalizedCount = hourlyStats.bridgingFinalizedCount + 1
  }
  hourlyStats.save()
}

export function handleBridgingInitiatedV2(event: BridgingInitiatedV2Event): void {
  let entity = new BridgingInitiatedV2(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.sender = event.params.sender
  entity.recipient = event.params.recipient
  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()

  updateDailyBridgeStats(event.block.timestamp, event.params.amount, BigInt.fromI32(0))
  updateHourlyBridgeStats(event.block.timestamp, event.params.amount, BigInt.fromI32(0))
}

export function handleBridgingFinalized(event: BridgingFinalizedEvent): void {
  let entity = new BridgingFinalized(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.nativeToken = event.params.nativeToken
  entity.bridgedToken = event.params.bridgedToken
  entity.amount = event.params.amount
  entity.recipient = event.params.recipient
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()

  updateDailyBridgeStats(event.block.timestamp, BigInt.fromI32(0), event.params.amount)
  updateHourlyBridgeStats(event.block.timestamp, BigInt.fromI32(0), event.params.amount)
}

export function handleNewTokenDeployed(event: NewTokenDeployedEvent): void {
  let entity = new NewTokenDeployed(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.bridgedToken = event.params.bridgedToken
  entity.nativeToken = event.params.nativeToken
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()
}
