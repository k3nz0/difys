import Plugin from "../../Modules/PluginAPI";
import config from "./config";
import store from "../../Modules/Store";
import got from "got";
import HttpsProxyAgent from "https-proxy-agent";
import pathfinder from "./pathfinder";
import { accounts } from "../../Modules/Store/reducers/slices";
// import { logger } from "../../Libs";

const {
	setStatus,
	setMapId,
	setSubAreaId,
	addHouse,
	addInteractiveElement,
	addStatedElement,
	addActor,
	setActorCellId,
	setCells
} = accounts.actions;

const info = {
	name: "Map",
	description: "Handles map features",
	author: "Zirpoo",
	version: "0.0.1",
	config
};

/* ============== M A P ============== */

export default class Map extends Plugin {
	constructor() {
		super(info);
		this.config = info.config;
		this.pathfinder = pathfinder;
		this.listeners = [
			this.CurrentMapMessage,
			this.MapComplementaryInformationsDataMessage,
			this.GameMapMovementMessage
		];
		this.exports = [];
	}

	/**
	 * Hook every accounts into this plugin
	 *
	 * @param {Object} connections
	 */
	mount(connections) {
		this.log("Map plugin on");

		for (let username in this.config.accounts) {
			if (connections.hasOwnProperty(username)) {
				this.connections[username] = connections[username];
				this.log(`${username} hooked`);
			} else {
				this.log(
					`Couldnt find ${username}, are you sure you added it in /config/accounts?`,
					"error"
				);
			}
		}
	}

	/**
	 * Get the compressed path taken by the player
	 * __
	 * The pathfinder has the same code the real game uses
	 *
	 * @param {String} username
	 * @param {Number} startCellId
	 * @param {Number} targetCellId
	 * @param {Boolean} allowDiagonals
	 * @param {Boolean} stopNextToTarget
	 */
	getPath(
		username,
		startCellId,
		targetCellId,
		allowDiagonals = true,
		stopNextToTarget = false
	) {
		const account = store.getState().accounts[username];
		let occupiedCells = Object.values(account.gameData.map.actors).map(
			actor => actor.disposition.cellId
		);
		let path = this.pathfinder.getPath(
			startCellId,
			targetCellId,
			occupiedCells,
			allowDiagonals,
			stopNextToTarget
		);
		return path.length > 1 ? this.pathfinder.compressPath(path) : false;
	}

	/**
	 * Get map informations like: cell list, neighbours map id and more
	 *
	 * Extra info
	 * __
	 * Key s and l=[3,11,75,83] doesn't show any pattern purposes other than graphics
	 * Key l=[7,71] are black cells in fights
	 * Key l=195 are pnjs cell location that can be here (Including pnj's not visible yet)
	 * Key c is a cell to move to another map
	 *
	 * @param {Number} mapId
	 *
	 * @returns {Promise}
	 */
	async getMapData(username, mapId) {
		const state = store.getState();
		const assetsUrl = state.metadata.assetsUrl;
		const account = state.accounts[username];
		const proxy = account.auth.proxy;
		const request = await got.get(`${assetsUrl}/maps/${mapId}.json`, {
			agent: proxy ? new HttpsProxyAgent(proxy) : null,
			headers: {
				"User-Agent": account.auth.userAgent
			},
			json: true
		});
		return request.body;
	}

	GameMapMovementRequestMessage(username, targetCellId) {
		const account = store.getState().accounts[username];
		const actor = account.gameData.map.actors[account.auth.accountID];
		const actorCellId = actor.disposition.cellId;

		if (account.status === "IDLE") {
			store.dispatch(
				setStatus({
					username,
					status: "MOVING"
				})
			);
			let path = this.getPath(username, actorCellId, targetCellId);
			let pathDuration = this.pathfinder.getPathDuration(
				path,
				account.gameData.map.cells,
				actor.disposition.direction,
				actor.isMounted,
				account.status === "FIGHTING"
			);
			this.connections[username].sendMessage(
				"GameMapMovementRequestMessage",
				{
					keyMovements: path,
					mapId: account.gameData.map.mapId
				}
			);
			let noOperation = false;
			let pathDelayFinished = false;
			this.connections[username].once("BasicAckMessage", () => {
				noOperation = true;
				if (pathDelayFinished) {
					this.GameMapMovementConfirmMessage(username);
				}
			});
			setTimeout(() => {
				pathDelayFinished = true;
				if (noOperation) {
					this.GameMapMovementConfirmMessage(username);
				}
			}, pathDuration);
		}
	}

	GameMapMovementConfirmMessage(username) {
		this.connections[username].sendMessage("GameMapMovementConfirmMessage");
		store.dispatch(
			setStatus({
				username,
				status: "IDLE"
			})
		);
	}

	async CurrentMapMessage(payload) {
		const { socket, data } = payload;
		const username = socket.account.username;
		const mapId = data.mapId;
		const mapData = await this.getMapData(username, mapId);

		store.dispatch(
			setMapId({
				username,
				mapId
			})
		);
		store.dispatch(
			setCells({
				username,
				cells: mapData.cells
			})
		);
		this.pathfinder.fillPathGrid(mapData);
		this.connections[username].sendMessage(
			"MapInformationsRequestMessage",
			{ mapId }
		);
	}

	MapComplementaryInformationsDataMessage(payload) {
		const { socket, data } = payload;
		const username = socket.account.username;
		store.dispatch(
			setStatus({
				username,
				status: "IDLE"
			})
		);
		store.dispatch(
			setSubAreaId({
				username,
				subAreaId: data.subAreaId
			})
		);
		for (let actor of data.actors) {
			store.dispatch(
				addActor({
					username,
					actor
				})
			);
		}
		for (let interactiveElement of data.interactiveElements) {
			store.dispatch(
				addInteractiveElement({
					username,
					interactiveElement
				})
			);
		}
		for (let statedElement of data.statedElements) {
			store.dispatch(
				addStatedElement({
					username,
					statedElement
				})
			);
		}
		for (let house of data.houses) {
			store.dispatch(
				addHouse({
					username,
					house
				})
			);
		}
	}

	GameMapMovementMessage(payload) {
		const { socket, data } = payload;
		const username = socket.account.username;
		const actorCurrentCellId =
			data.keyMovements[data.keyMovements.length - 1];

		store.dispatch(
			setActorCellId({
				username,
				actorId: data.actorId,
				cellId: actorCurrentCellId
			})
		);
	}
}
