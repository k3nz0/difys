import PRIVATE from "../PRIVATE";
// Cete objet est utiliser lors du logging par le ModuleLoader.js
// Plusieurs variables sont donc instanciés par l'utilisateurs : username, password, server, charact
// Les deux premiers champs sont requis tandis que les trois autres sont falcultatif
const accountsList = {
	[PRIVATE.username]: {
		username: PRIVATE.username,
		password: PRIVATE.password,
		directLogin: false, // logs you to the last character you were connected to, if true, everything after this will be ignored
		server: PRIVATE.server, // server name: "Dodge", "Oshimo", "Grandapan" etc..
		character: PRIVATE.character // Character name if you have more than one otherwise this is ignored
	}
	// You can add more here
};

export default accountsList;
