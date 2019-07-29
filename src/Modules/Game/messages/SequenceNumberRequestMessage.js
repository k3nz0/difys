var sequenceNumber = 1;

export default function SequenceNumberRequestMessage(payload) {
	const { socket } = payload;

	socket.sendMessage("SequenceNumberMessage", {
		number: sequenceNumber
	});
	sequenceNumber++;
}
