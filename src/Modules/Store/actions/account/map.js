const setMapId = (state, action) => {
	const username = action.payload.username;
	const mapId = action.payload.mapId;
	state[username].gameData.map.mapId = mapId;
	// Init object data holders
	state[username].gameData.map.interactiveElements = {};
	state[username].gameData.map.statedElements = {};
	state[username].gameData.map.actors = {};
	state[username].gameData.map.houses = {};
};

const setCells = (state, action) => {
	const username = action.payload.username;
	const cells = action.payload.cells;
	state[username].gameData.map.cells = cells;
};

const setSubAreaId = (state, action) => {
	const username = action.payload.username;
	const subAreaId = action.payload.subAreaId;
	state[username].gameData.map.subAreaId = subAreaId;
};

const addHouse = (state, action) => {
	const username = action.payload.username;
	const houses = state[username].gameData.map.houses;
	const house = action.payload.house;
	houses[house.houseId] = house;
};

const addInteractiveElement = (state, action) => {
	const username = action.payload.username;
	const interactiveElements =
		state[username].gameData.map.interactiveElements;

	const element = action.payload.interactiveElement;
	interactiveElements[element.elementId] = element;
};

const removeInteractiveElement = (state, action) => {
	const username = action.payload.username;
	const interactiveElements =
		state[username].gameData.map.interactiveElements;

	const id = action.payload.id;
	delete interactiveElements[id];
};

const addStatedElement = (state, action) => {
	const username = action.payload.username;
	const statedElements = state[username].gameData.map.statedElements;
	const element = action.payload.statedElement;
	statedElements[element.elementId] = element; // not sure of element.elementId
};

const removeStatedElement = (state, action) => {
	const username = action.payload.username;
	const statedElements = state[username].gameData.map.statedElements;
	const id = action.payload.id;
	delete statedElements[id];
};

const addActor = (state, action) => {
	const username = action.payload.username;
	const actors = state[username].gameData.map.actors;
	const actor = action.payload.actor;
	actors[actor.id] = actor;
};

const removeActor = (state, action) => {
	const username = action.payload.username;
	const actors = state[username].gameData.map.actors;
	const id = action.payload.id;
	delete actors[id];
};

const setActorCellId = (state, action) => {
	const username = action.payload.username;
	const actorId = action.payload.actorId;
	const mapData = state[username].gameData.map;
	const cellId = action.payload.cellId;
	mapData.actors[actorId] = {
		...mapData.actors,
		disposition: {
			...mapData.actors.disposition,
			cellId
		}
	};
};

export {
	setMapId,
	setSubAreaId,
	addHouse,
	addInteractiveElement,
	removeInteractiveElement,
	removeStatedElement,
	addStatedElement,
	addActor,
	removeActor,
	setActorCellId,
	setCells
};
