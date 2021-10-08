

function ControlPosition(){
	let positionAlongBorehole = getText();
}

function getText(){
	var request = new XMLHttpRequest();
	request.open('GET', 'https://raw.githubusercontent.com/immersivecomputing/EGS_Collab_AR/main/TextFile/Position.txt', true);
	request.send(null);
	request.onreadystatechange = function () {
		if (request.readyState === 4 && request.status === 200) {
			var type = request.getResponseHeader('Content-Type');
			if (type.indexOf("text") !== 1) {
				console.log(request.responseText);
				return request.responseText;
			}
		}
	}
}
	


export { ControlPosition };
