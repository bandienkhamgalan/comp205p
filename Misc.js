var epsilon = 0.0000000001;

var equals = function(a, b) {
	return Math.abs(a - b) < epsilon;
	// return a == b;
}

var greaterThan = function(a, b) {
	return a - b >= epsilon;
	// return a > b;
}

var greaterThanOrEqualTo = function(a, b) {
	return greaterThan(a, b) || equals(a, b);
	// return a >= b;
}

var lessThan = function(a, b) {
	return b - a >= epsilon;
	// return a < b;
}

var lessThanOrEqualTo = function(a, b) {
	return lessThan(a, b) || equals(a, b);
	// return a <= b;
}

var DoublyLinkedCycle = function(value) {
	this.value = value;
	this.next = this;
	this.previous = this;
}

DoublyLinkedCycle.prototype.insertAfter = function(value) {
	var node = new DoublyLinkedCycle(value);
	var oldNext = this.next;
	this.next = node;
	node.previous = this;
	node.next = oldNext;
	oldNext.previous = node;
}

DoublyLinkedCycle.prototype.delete = function() {
	this.previous.next = this.next;
	this.next.previous = this.previous;
}

// returns new DoublyLinkedCycle or null on empty/undefined input list
DoublyLinkedCycle.fromArray = function(list) {
	if(typeof list === 'object' && list.length > 0)
	{
		var toReturn = new DoublyLinkedCycle(list[0]);
		var current = toReturn;
		for( var index = 1 ; index < list.length ; index++ )
		{
			current.insertAfter(list[index]);
			current = current.next;
		}
		return toReturn;
	}
	return null;
};

DoublyLinkedCycle.prototype.print = function() {
	var currentNode = this;
	do {
		console.log(currentNode.value);
		currentNode = currentNode.next;
	} while(currentNode != this);
}

var formattedGuards = function(number, guards) {
	var toReturn = ""
	for(var index = 0 ; index < guards.length ; index++)
		toReturn += guards[index].toString() + ", ";
	
	return toReturn.length > 0 ? toReturn.slice(0, -2) : toReturn;
}