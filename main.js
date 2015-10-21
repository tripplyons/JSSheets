var funcs = {
	"ADD": function (params) {
		if (params.length === 0) return null;
		if (params.indexOf(null) !== -1) {
			return null;
		}
		var val = 0;
		for (var i = 0; i < params.length; i++) {
			val += parseInt(params[i]);
		}
		return val;
	},
	"SUB": function (params) {
		if (params.length === 0) return null;
		if (params.indexOf(null) !== -1) {
			return null;
		}
		var val = parseInt(params[0]) - parseInt(params[1]);
		for (var i = 2; i < params.length; i++) {
			val -= parseInt(params[i]);
		}
		return val;
	},
	"MUL": function (params) {
		if (params.length === 0) return null;
		if (params.indexOf(null) !== -1) {
			return null;
		}
		var val = parseInt(params[0]);
		for (var i = 1; i < params.length; i++) {
			val *= parseInt(params[i]);
		}
		return val;
	},
	"DIV": function (params) {
		if (params.length === 0) return null;
		if (params.indexOf(null) !== -1) {
			return null;
		}

		if (parseInt(params[1]) === 0) return null;
		var val = parseInt(params[0]) / parseInt(params[1]);
		for (var i = 2; i < params.length; i++) {
			if (parseInt(params[i]) === 0) return null;
			val /= parseInt(params[i]);
		}
		return Math.floor(val);
	},
	"MOD": function (params) {
		if (params.length === 0) return null;
		if (params.indexOf(null) !== -1) {
			return null;
		}
		return (parseInt(params[1]) === 0) ? null : parseInt(params[0]) % parseInt(params[1]);
	},
	"IF": function (params) {
		if (params.length !== 1) return null;
		return (parseInt(params[0])) ? 1 : 0;
	},
	"NOT": function (params) {
		if (params.length !== 1) return null;
		return (parseInt(params[0])) ? 0 : 1;
	}
};
funcs["SUM"] = funcs["ADD"];

var shiftDown = false;
var ctrlDown = false;

var c = document.getElementById("canvas");
c.addEventListener("click", click);
document.addEventListener("keydown", keydown);
document.addEventListener("keyup", keyup);
var ctx = c.getContext("2d");

var bg = "#f7f7f7";

var cellWidth = 100;
var cellHeight = 25;
var gridWidth = Math.floor(parseInt(c.getAttribute("width")) / cellWidth) - 1;
var gridHeight = Math.floor(parseInt(c.getAttribute("height")) / cellHeight) - 2;

ctx.strokeStyle = "#000000";
ctx.font = cellHeight - 5 + "px Courier";
var charWidth = ctx.measureText(" ").width;

var selectedCellX = 0;
var selectedCellY = 0;

var cursorX;

var cellEquations = [];
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var digits = "0123456789";

var clipboardCellIndex = null;

init();
draw();

function init() {
	cellEquations = [];
	for (var row = 0; row < gridHeight; row++) {
		for (var col = 0; col < gridWidth; col++) {
			cellEquations.push("0");
		}
	}
	cursorX = cellEquations[0].length;
}

function example() {
	while (cellEquations.length < gridWidth * gridHeight) {
		cellEquations.push("0");
	}
	cellEquations[0 * gridWidth + 0] = "#SHOPPING LIST";
	cellEquations[0 * gridWidth + 1] = "#ITEM";
	cellEquations[0 * gridWidth + 2] = "#PRICE";
	cellEquations[0 * gridWidth + 3] = "#QTY";
	cellEquations[0 * gridWidth + 4] = "#TOTAL";
	cellEquations[0 * gridWidth + 5] = "#G TOTAL";
	for (var i = 1; i < gridHeight; i++) {
		cellEquations[i * gridWidth + 4] = "=MUL(C" + i.toString() + " D" + i.toString() + ")";
	}
	cellEquations[1 * gridWidth + 5] = "=SUM(E1:E13)";
	selectedCellX = 0;
	selectedCellY = 0;
	cursorX = cellEquations[0].length;
	draw();
}

function draw() {
	if (cursorX < 0) {
		cursorX = 0;
	}
	ctx.fillStyle = bg;
	ctx.fillRect(0, 0, (gridWidth + 1) * cellWidth, (gridHeight + 2) * cellHeight);
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "#000000";
	ctx.strokeRect(0, 0, cellWidth, cellHeight);
	ctx.fillText(alphabet.charAt(selectedCellX) + selectedCellY, 5, cellHeight - 5);
	for (var i = 0; i < gridWidth; i++) {
		ctx.strokeRect((i + 1) * cellWidth, cellHeight, cellWidth, cellHeight);
		ctx.fillText(alphabet.charAt(i), (i + 1) * cellWidth + 5, cellHeight * 2 - 5);
	}
	for (i = 0; i < gridHeight; i++) {
		ctx.strokeRect(0, (i + 2) * cellHeight, cellWidth, cellHeight);
		ctx.fillText(i, 5, (i + 3) * cellHeight - 5);
	}

	ctx.fillStyle = "#000000";
	ctx.fillText(alphabet.charAt(selectedCellX) + selectedCellY, 5, cellHeight * (2 - 5));
	ctx.fillText("JSSheets", 5, cellHeight * 2 - 5);
	ctx.fillText(cellEquations[selectedCellY * gridWidth + selectedCellX], cellWidth + 5, (1) * cellHeight - 5);

	for (var row = 0; row < gridHeight; row++) {
		for (var col = 0; col < gridWidth; col++) {
			if (col == selectedCellX && row == selectedCellY) {
				ctx.fillStyle = "#007fff";
				myDrawStrokeRect((col + 1) * cellWidth, (row + 2) * cellHeight, cellWidth, cellHeight, 4);
			} else {
				ctx.strokeStyle = "#000000";
				ctx.strokeRect((col + 1) * cellWidth, (row + 2) * cellHeight, cellWidth, cellHeight);
			}
			ctx.fillStyle = "#000000";
			var cellValue = (solveCell(cellEquations[row * gridWidth + col], row * gridWidth + col, []) !== null) ?
				solveCell(cellEquations[row * gridWidth + col], row * gridWidth + col, []) :
				"ERROR";
			if (cellValue.toString().length > 7) {
				cellValue = cellValue.toString().substring(0, 7) + "_";
			}
			if (cellEquations[row * gridWidth + col].charAt(0) == "#") {	
				ctx.fillStyle = "#2980b9";
				ctx.fillText(cellValue, (col + 1) * cellWidth + 5, (row + 3) * cellHeight - 5);
			} else {
				ctx.fillText(cellValue, (col + 1) * cellWidth + 5, (row + 3) * cellHeight - 5);
			}
		}
	}

	ctx.strokeStyle = "#000000";
	ctx.strokeRect(cellWidth, 0, cellWidth * gridWidth, cellHeight);
	ctx.strokeRect(0, cellHeight, cellWidth, cellHeight);

	ctx.fillStyle = "#000000";
	ctx.fillRect(cellWidth + 5 + charWidth * (cursorX), (0) * cellHeight + 5, 2, cellHeight - 10);
}

function isANumber(testingData) {
	if (testingData.charAt(0) === '-' && testingData.length === 1) {
		return null;
	}
	for (var i = (testingData.charAt(0) === '-') ? 1 : 0; i < testingData.length; i++) {
		if (digits.indexOf(testingData.charAt(i)) === -1) {
			return false;
		}
	}

	return true;
}

function isSemiValidEquation(testingData) {
	if (testingData.length < 4) {
		return false;
	}

	if (testingData.charAt(0) !== "=") {
		return false;
	}

	if (testingData.charAt(1) === "(") {
		return false;
	}

	var i;
	for (i = 2; testingData.charAt(i) !== "(" && i < testingData.length; i++);
	if (i === testingData.length) {
		return false;
	}

	while (testingData.charAt(i) !== ")" && i < testingData.length) { i++; }
	if (i === testingData.length && testingData.charAt(i) !== ")") {
		return false;
	}
	if (i != testingData.length - 1) {
		return false;
	}

	return true;
}

// cellReferences: the cells evaluated before this function was called to prevent an infinite loop
function solveEquation(equation, thisCell, cellReferences) {
	var params = [];
	var eqName = "";
	var i;
	for (i = 1; i < equation.length && equation.charAt(i) !== "("; i++) {
		eqName += equation.charAt(i);
	}

	for (i = 2; i < equation.length && equation.charAt(i) !== "("; i++);
	i++;

	while (i < equation.length && equation.charAt(i) !== ")") {
		var buffer = "";
		while (i < equation.length && equation.charAt(i) !== " " && equation.charAt(i) !== ")") {
			buffer += equation.charAt(i);
			i++;
		}
		params.push(buffer);
		i++;
	}

	var cellArray = /^[A-Z]+\d+\:[A-Z]+\d+$/; // F8:H10
	var cell = /^[A-Z]+\d+$/; // A0, D6
	var num = /^-?\d+$/; // 0, -768
	for (var j = 0; j < params.length; j++) {
		params[j] = params[j].toString();
		if (params[j].match(cellArray)) {
			var startCol = alphabet.indexOf(params[j][0]);
			var startRowStr = "";
			var ii;
			for (ii = 1; ii < params[j].length && params[j][ii] !== ':'; ii++) {
				startRowStr += params[j][ii];
			}
			var startRow = parseInt(startRowStr);
			ii++;
			var endCol = alphabet.indexOf(params[j][ii]);
			var endRowStr = "";
			for (ii++; ii < params[j].length; ii++) {
				endRowStr += params[j][ii];
			}
			var endRow = parseInt(endRowStr);

			params.pop();
			if (startRow == endRow && startCol == endCol) {
				params.push(solveCell(getCell(startRow * gridWidth + startCol), startRow * gridWidth + startCol, cellReferences));
			} else if (startRow == endRow) {
				for (var currentCol = startCol; currentCol <= endCol; currentCol++) {
					params.push(solveCell(getCell(startRow * gridWidth + currentCol), startRow * gridWidth + currentCol, cellReferences));
				}
			} else if (startCol == endCol) {
				for (var currentRow = startRow; currentRow <= endRow; currentRow++) {
					params.push(solveCell(getCell(currentRow * gridWidth + startCol), currentRow * gridWidth + startCol, cellReferences));
				}
			} else {
				for (var currentRow = startRow; currentRow <= endRow; currentRow++) {
					for (var currentCol = startCol; currentCol <= endCol; currentCol++) {
						params.push(solveCell(getCell(currentRow * gridWidth + currentCol), currentRow * gridWidth + currentCol, cellReferences));
					}
				}
			}
		} else if (params[j].match(cell)) {
			var cellIndex = alphabet.indexOf(params[j][0]) + (parseInt(params[j].substring(1, params[j].length))) * gridWidth;
			params[j] = solveCell(getCell(cellIndex), cellIndex, cellReferences);
		} else if (params[j].match(num)) {

		} else {
			return null;
		}
	}

	var func = funcs[eqName];
	var value = (func) ? func(params) : null;

	return (value !== null) ? value : null;
}

function solveCell(equation, thisCell, cellReferences) {
	if (typeof (cellReferences) === 'undefined') cellReferences = [];
	if (cellReferences.indexOf(thisCell) != -1) {
		return null;
	}
	cellReferences.push(thisCell);
	if (isANumber(equation)) {
		return equation;
	} else if (equation.charAt(0) === "#") {
		return equation.substring(1, equation.length);
	} else if (equation.charAt(0) === "=" && equation.substring(1, equation.length).match(/^[A-Z]+\d+$/)) {
		return solveCell(getCell(parseInt(equation.substring(2, equation.length)) * gridWidth + alphabet.indexOf(equation.charAt(1)), parseInt(equation.substring(2, equation.length)) * gridWidth + alphabet.indexOf(equation.charAt(1)), cellReferences));
	} else if (isSemiValidEquation(equation)) {
		return solveEquation(equation, thisCell, cellReferences);
	} else {
		return null;
	}
}

function click(e) {
	var oldCellX = selectedCellX;
	var oldCellY = selectedCellY;
	var x;
	var y;
	if (e.pageX || e.pageY) {
		x = e.pageX;
		y = e.pageY;
	}
	else {
		x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	x -= c.offsetLeft;
	y -= c.offsetTop;
	if (x >= cellWidth && y >= cellHeight * 2 && y <= cellHeight * (gridHeight + 2)) {
		selectedCellX = Math.floor(x / cellWidth) - 1;
		selectedCellY = Math.floor(y / cellHeight) - 2;
	}
	if (oldCellX != selectedCellX || oldCellY != selectedCellY) {
		cursorX = getSelectedCell().length;
	}
	draw();
}

function getCell(cellArrIndex) {
	return (cellArrIndex > cellEquations.length) ? null : cellEquations[cellArrIndex];
}

function setCell(cellArrIndex, value) {
	if (!(cellArrIndex > cellEquations.length)) {
		cellEquations[cellArrIndex] = value;
	}
}

function setSelectedCell(value) {
	cellEquations[selectedCellY * gridWidth + selectedCellX] = value;
}

function getSelectedCell() {
	return cellEquations[selectedCellY * gridWidth + selectedCellX];
}

function getChar(keyCode) {
	if (shiftDown) {
		switch (keyCode) {
			case 51: return "#";
			case 57: return "(";
			case 48: return ")";
			case 186: return ":";
		}
	}
	switch (keyCode) {
		case 187: return "=";
		case 32: return " ";
		case 189: return "-";
	}
	if (keyCode >= 48 && keyCode <= 57) {
		return (keyCode - 48).toString();
	}
	if (keyCode >= 65 && keyCode <= 90) {
		return String.fromCharCode(keyCode);
	}

	return null;
}

function keydown(e) {
	var charCode = (typeof e.which == "undefined") ? e.charCode : e.which;
	if (charCode === 16) {
		shiftDown = true;
	}
	if (charCode === 17) {
		ctrlDown = true;
	}
	if (e.keyCode === 8 || e.keyCode === 46) {
		e.preventDefault();
		if (ctrlDown) {
			setSelectedCell("0");
		} else {
			var selectedCellValue = getSelectedCell();
			setSelectedCell(selectedCellValue.substring(0, cursorX - 1) + selectedCellValue.substring(cursorX, selectedCellValue.length));
			if (getSelectedCell() === "") {
				setSelectedCell("0");
			} else {
				cursorX -= 1;
			}
		}
		draw();
	} else if (ctrlDown && charCode === 67) { // CTRL-C
		clipboardCellIndex = selectedCellX + selectedCellY * gridWidth;
		draw();
	} else if (ctrlDown && charCode === 86) { // CTRL-V
		var params = [];
		var eq = getCell(clipboardCellIndex);
		var eqName = "";
		var i;
		for (i = 1; i < eq.length && eq.charAt(i) !== "("; i++) {
			eqName += eq.charAt(i);
		}

		for (i = 2; i < eq.length && eq.charAt(i) !== "("; i++);
		i++;

		while (i < eq.length && eq.charAt(i) !== ")") {
			var buffer = "";
			while (i < eq.length && eq.charAt(i) !== " " && eq.charAt(i) !== ")") {
				buffer += eq.charAt(i);
				i++;
			}
			params.push(buffer);
			i++;
		}

		var xDistance = selectedCellX - Math.floor(clipboardCellIndex / gridWidth);
		var yDistance = selectedCellY - clipboardCellIndex % gridWidth;

		var newEq = eqName + "(";
		for (var j = 0; j < params.length; j++) {
			if (params[j].match(/^[A-Z]+\d+$/)) {
				newEq += alphabet[alphabet.indexOf(params[j].charAt(0)) + xDistance] + (parseInt(params[j].charAt(1)) + yDistance).toString();
			} else if (params[j].match(/^\d+$/)) {
				newEq += params[j];
			} else if (params[j].match(/^[A-Z]+\d+\:[A-Z]+\d+$/)) {
				alert("CELL ARRAY");
				var startCol = alphabet.indexOf(params[j][0]) + xDistance;
				var startRowStr = "";
				var ii;
				for (ii = 1; ii < params[j].length && params[j][ii] !== ':'; ii++) {
					startRowStr += params[j][ii];
				}
				var startRow = parseInt(startRowStr) + yDistance;
				ii++;
				var endCol = alphabet.indexOf(params[j][ii]) + xDistance;
				var endRowStr = "";
				for (ii++; ii < params[j].length; ii++) {
					endRowStr += params[j][ii];
				}
				var endRow = parseInt(endRowStr) + yDistance;

				newEq += alphabet.charAt(startCol) + startRow.toString() + ":" + alphabet.charAt(endCol) + endRow.toString();
			}

			newEq += " ";
		}
		newEq = "=" + newEq.substring(0, newEq.length - 1) + ")";

		setSelectedCell(newEq);

		cursorX = getSelectedCell().length;
		draw();
	} else if (alphabet.indexOf(String.fromCharCode(charCode)) != -1 || getChar(charCode)) {
		if (getSelectedCell() === "0") {
			setSelectedCell(getChar(charCode));
		} else {
			setSelectedCell(getSelectedCell().substring(0, cursorX) + getChar(charCode) + getSelectedCell().substring(cursorX, getSelectedCell().length));
			cursorX += 1;
		}
		draw();
	} else if (charCode === 37) {
		cursorX -= 1;
		draw();
	} else if (charCode === 39) {
		cursorX += 1;
		if (cursorX > getSelectedCell().length) {
			cursorX = getSelectedCell().length;
		}
		draw();
	}
}

function keyup(e) {
	var charCode = (typeof e.which == "undefined") ? e.charCode : e.which;
	if (charCode === 16) {
		shiftDown = false;
	}
	if (charCode === 18) {
		ctrlDown = false;
	}
}

function myDrawStrokeRect(x, y, width, height, strokeWeight) {
	ctx.fillRect(x - strokeWeight / 2, y - strokeWeight / 2, width + strokeWeight, height + strokeWeight);
	ctx.fillStyle = bg;
	ctx.fillRect(x + strokeWeight / 2, y + strokeWeight / 2, width - strokeWeight / 2, height - strokeWeight / 2);
}