import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  MessageSent as MessageSentEvent,
  MessageClaimed as MessageClaimedEvent,
  RollingHashUpdated as RollingHashUpdatedEvent,
  L1L2MessageHashesAddedToInbox as L1L2MessageHashesAddedToInboxEvent
} from "../generated/L2MessageServiceImplementation/L2MessageService"
import {
  MessageSent,
  MessageClaimed,
  RollingHashUpdated,
  L1L2MessageHashesAddedToInbox,
  DailyMessageStats,
  HourlyMessageStats
} from "../generated/schema"

function getDayId(timestamp: BigInt): Bytes {
  let day = timestamp.toI32() / 86400
  return Bytes.fromI32(day)
}

function getHourId(timestamp: BigInt): Bytes {
  let hour = timestamp.toI32() / 3600
  return Bytes.fromI32(hour)
}

function updateDailyMessageStats(timestamp: BigInt, sentCount: i32, receivedCount: i32, claimedCount: i32, rollingHashCount: i32, inboxAddCount: i32): void {
  let dayId = getDayId(timestamp)
  let dayStartTimestamp = BigInt.fromI32(dayId.toI32() * 86400)
  let dailyStats = DailyMessageStats.load(dayId)

  if (dailyStats == null) {
    dailyStats = new DailyMessageStats(dayId)
    dailyStats.date = dayStartTimestamp
    dailyStats.totalMessagesSent = BigInt.fromI32(0)
    dailyStats.totalMessagesReceived = BigInt.fromI32(0)
    dailyStats.totalMessagesClaimed = BigInt.fromI32(0)
    dailyStats.totalRollingHashUpdates = BigInt.fromI32(0)
    dailyStats.totalL1L2MessageHashesAddedToInbox = BigInt.fromI32(0)
    dailyStats.messagesSentCount = 0
    dailyStats.messagesReceivedCount = 0
    dailyStats.messagesClaimedCount = 0
    dailyStats.rollingHashUpdatesCount = 0
    dailyStats.l1L2MessageHashesAddedToInboxCount = 0
  }

  dailyStats.totalMessagesSent = dailyStats.totalMessagesSent.plus(BigInt.fromI32(sentCount))
  dailyStats.totalMessagesReceived = dailyStats.totalMessagesReceived.plus(BigInt.fromI32(receivedCount))
  dailyStats.totalMessagesClaimed = dailyStats.totalMessagesClaimed.plus(BigInt.fromI32(claimedCount))
  dailyStats.totalRollingHashUpdates = dailyStats.totalRollingHashUpdates.plus(BigInt.fromI32(rollingHashCount))
  dailyStats.totalL1L2MessageHashesAddedToInbox = dailyStats.totalL1L2MessageHashesAddedToInbox.plus(BigInt.fromI32(inboxAddCount))
  dailyStats.messagesSentCount = dailyStats.messagesSentCount + sentCount
  dailyStats.messagesReceivedCount = dailyStats.messagesReceivedCount + receivedCount
  dailyStats.messagesClaimedCount = dailyStats.messagesClaimedCount + claimedCount
  dailyStats.rollingHashUpdatesCount = dailyStats.rollingHashUpdatesCount + rollingHashCount
  dailyStats.l1L2MessageHashesAddedToInboxCount = dailyStats.l1L2MessageHashesAddedToInboxCount + inboxAddCount
  dailyStats.save()
}

function updateHourlyMessageStats(timestamp: BigInt, sentCount: i32, receivedCount: i32, claimedCount: i32, rollingHashCount: i32, inboxAddCount: i32): void {
  let hourId = getHourId(timestamp)
  let hourStartTimestamp = BigInt.fromI32(hourId.toI32() * 3600)
  let hourlyStats = HourlyMessageStats.load(hourId)

  if (hourlyStats == null) {
    hourlyStats = new HourlyMessageStats(hourId)
    hourlyStats.hour = hourStartTimestamp
    hourlyStats.totalMessagesSent = BigInt.fromI32(0)
    hourlyStats.totalMessagesReceived = BigInt.fromI32(0)
    hourlyStats.totalMessagesClaimed = BigInt.fromI32(0)
    hourlyStats.totalRollingHashUpdates = BigInt.fromI32(0)
    hourlyStats.totalL1L2MessageHashesAddedToInbox = BigInt.fromI32(0)
    hourlyStats.messagesSentCount = 0
    hourlyStats.messagesReceivedCount = 0
    hourlyStats.messagesClaimedCount = 0
    hourlyStats.rollingHashUpdatesCount = 0
    hourlyStats.l1L2MessageHashesAddedToInboxCount = 0
  }

  hourlyStats.totalMessagesSent = hourlyStats.totalMessagesSent.plus(BigInt.fromI32(sentCount))
  hourlyStats.totalMessagesReceived = hourlyStats.totalMessagesReceived.plus(BigInt.fromI32(receivedCount))
  hourlyStats.totalMessagesClaimed = hourlyStats.totalMessagesClaimed.plus(BigInt.fromI32(claimedCount))
  hourlyStats.totalRollingHashUpdates = hourlyStats.totalRollingHashUpdates.plus(BigInt.fromI32(rollingHashCount))
  hourlyStats.totalL1L2MessageHashesAddedToInbox = hourlyStats.totalL1L2MessageHashesAddedToInbox.plus(BigInt.fromI32(inboxAddCount))
  hourlyStats.messagesSentCount = hourlyStats.messagesSentCount + sentCount
  hourlyStats.messagesReceivedCount = hourlyStats.messagesReceivedCount + receivedCount
  hourlyStats.messagesClaimedCount = hourlyStats.messagesClaimedCount + claimedCount
  hourlyStats.rollingHashUpdatesCount = hourlyStats.rollingHashUpdatesCount + rollingHashCount
  hourlyStats.l1L2MessageHashesAddedToInboxCount = hourlyStats.l1L2MessageHashesAddedToInboxCount + inboxAddCount
  hourlyStats.save()
}

export function handleMessageSent(event: MessageSentEvent): void {
  let entity = new MessageSent(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.from = event.params._from
  entity.to = event.params._to
  entity.fee = event.params._fee
  entity.value = event.params._value
  entity.nonce = event.params._nonce
  entity.calldata = event.params._calldata
  entity.messageHash = event.params._messageHash
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()

  updateDailyMessageStats(event.block.timestamp, 1, 0, 0, 0, 0)
  updateHourlyMessageStats(event.block.timestamp, 1, 0, 0, 0, 0)
}

export function handleMessageClaimed(event: MessageClaimedEvent): void {
  let entity = new MessageClaimed(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.messageHash = event.params._messageHash
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()

  updateDailyMessageStats(event.block.timestamp, 0, 0, 1, 0, 0)
  updateHourlyMessageStats(event.block.timestamp, 0, 0, 1, 0, 0)
}

export function handleRollingHashUpdated(event: RollingHashUpdatedEvent): void {
  let entity = new RollingHashUpdated(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.messageNumber = event.params.messageNumber
  entity.rollingHash = event.params.rollingHash
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()

  updateDailyMessageStats(event.block.timestamp, 0, 0, 0, 1, 0)
  updateHourlyMessageStats(event.block.timestamp, 0, 0, 0, 1, 0)
}

export function handleL1L2MessageHashesAddedToInbox(event: L1L2MessageHashesAddedToInboxEvent): void {
  let entity = new L1L2MessageHashesAddedToInbox(
    event.transaction.hash.concat(Bytes.fromI32(event.logIndex.toI32()))
  )
  entity.messageHashes = event.params.messageHashes
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash
  entity.save()

  updateDailyMessageStats(event.block.timestamp, 0, 0, 0, 0, event.params.messageHashes.length)
  updateHourlyMessageStats(event.block.timestamp, 0, 0, 0, 0, event.params.messageHashes.length)
}