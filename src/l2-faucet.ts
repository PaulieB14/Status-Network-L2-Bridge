import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  TokensDistributed as TokensDistributedEvent,
  NativeTokensDistributed as NativeTokensDistributedEvent
} from "../generated/L2Faucet/L2Faucet"
import {
  TokensDistributed,
  NativeTokensDistributed,
  DailyFaucetStats,
  HourlyFaucetStats
} from "../generated/schema"

function getDayId(timestamp: BigInt): Bytes {
  let day = timestamp.toI32() / 86400
  return Bytes.fromI32(day)
}

function getHourId(timestamp: BigInt): Bytes {
  let hour = timestamp.toI32() / 3600
  return Bytes.fromI32(hour)
}

function updateDailyFaucetStats(timestamp: BigInt, tokenAmount: BigInt, nativeAmount: BigInt, tokenCount: i32, nativeCount: i32): void {
  let dayId = getDayId(timestamp)
  let dayStartTimestamp = BigInt.fromI32(dayId.toI32() * 86400)
  let dailyStats = DailyFaucetStats.load(dayId)

  if (dailyStats == null) {
    dailyStats = new DailyFaucetStats(dayId)
    dailyStats.date = dayStartTimestamp
    dailyStats.totalTokensDistributed = BigInt.fromI32(0)
    dailyStats.totalNativeTokensDistributed = BigInt.fromI32(0)
    dailyStats.tokensDistributedCount = 0
    dailyStats.nativeTokensDistributedCount = 0
  }

  dailyStats.totalTokensDistributed = dailyStats.totalTokensDistributed.plus(tokenAmount)
  dailyStats.totalNativeTokensDistributed = dailyStats.totalNativeTokensDistributed.plus(nativeAmount)
  dailyStats.tokensDistributedCount = dailyStats.tokensDistributedCount + tokenCount
  dailyStats.nativeTokensDistributedCount = dailyStats.nativeTokensDistributedCount + nativeCount
  dailyStats.save()
}

function updateHourlyFaucetStats(timestamp: BigInt, tokenAmount: BigInt, nativeAmount: BigInt, tokenCount: i32, nativeCount: i32): void {
  let hourId = getHourId(timestamp)
  let hourStartTimestamp = BigInt.fromI32(hourId.toI32() * 3600)
  let hourlyStats = HourlyFaucetStats.load(hourId)

  if (hourlyStats == null) {
    hourlyStats = new HourlyFaucetStats(hourId)
    hourlyStats.hour = hourStartTimestamp
    hourlyStats.totalTokensDistributed = BigInt.fromI32(0)
    hourlyStats.totalNativeTokensDistributed = BigInt.fromI32(0)
    hourlyStats.tokensDistributedCount = 0
    hourlyStats.nativeTokensDistributedCount = 0
  }

  hourlyStats.totalTokensDistributed = hourlyStats.totalTokensDistributed.plus(tokenAmount)
  hourlyStats.totalNativeTokensDistributed = hourlyStats.totalNativeTokensDistributed.plus(nativeAmount)
  hourlyStats.tokensDistributedCount = hourlyStats.tokensDistributedCount + tokenCount
  hourlyStats.nativeTokensDistributedCount = hourlyStats.nativeTokensDistributedCount + nativeCount
  hourlyStats.save()
}

export function handleTokensDistributed(event: TokensDistributedEvent): void {
  let entity = new TokensDistributed(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.recipient = event.params.recipient
  entity.token = event.params.token
  entity.amount = event.params.amount
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()

  updateDailyFaucetStats(event.block.timestamp, event.params.amount, BigInt.fromI32(0), 1, 0)
  updateHourlyFaucetStats(event.block.timestamp, event.params.amount, BigInt.fromI32(0), 1, 0)
}

export function handleNativeTokensDistributed(event: NativeTokensDistributedEvent): void {
  let entity = new NativeTokensDistributed(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.recipient = event.params.recipient
  entity.amount = event.params.amount
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()

  updateDailyFaucetStats(event.block.timestamp, BigInt.fromI32(0), event.params.amount, 0, 1)
  updateHourlyFaucetStats(event.block.timestamp, BigInt.fromI32(0), event.params.amount, 0, 1)
}
