import serverDisconnecting from "./messages/serverDisconnecting";
import CharactersListMessage from "./messages/CharactersListMessage";
import HelloGameMessage from "./messages/HelloGameMessage";
import TrustStatusMessage from "./messages/TrustStatusMessage";
import BasicLatencyStatsRequestMessage from "./messages/BasicLatencyStatsRequestMessage";
import SequenceNumberRequestMessage from "./messages/SequenceNumberRequestMessage";

const Game = [
	serverDisconnecting,
	CharactersListMessage,
	HelloGameMessage,
	TrustStatusMessage,
	BasicLatencyStatsRequestMessage,
	SequenceNumberRequestMessage
];

export default Game;
