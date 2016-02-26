importScripts('gpc.js', 'Polygon.js', 'Guards.js', 'Point.js', 'Misc.js', 'visibility.js', 'Line.js');

onmessage = function(event) {
  if(typeof event.data.polygons === 'object' && typeof event.data.targets === 'object')
  	optimalBruteForce(event.data.polygons, event.data.targets);
}

var redundantRemoveLimit = 300;
var greedyAreaLimit = 300;
var probabilisticLimit = 1000;

var solutions = [];

function Solution(polygon, guards, visibilityPolygons, id) {
	this.polygon = polygon;
	this.guards = guards;
	this.visibilityPolygons = visibilityPolygons;
	this.id = typeof id === "string" ? id : "";
}

function statusBase(solutions, targets) {
	var met = 0
	for(var index = 0 ; index < solutions.length ; index++)
		if(solutions[index].met)
			met++;
	
	var toReturn = "Reached " + met + " out of " + targets.length + " targets\n";
	
	for(var index = 0 ; index < solutions.length ; index++)
		toReturn += solutions[index].polygon.id + " (" + solutions[index].guards.length + "/" + targets[index] + ")\t";

	return toReturn + "\n";
}

function optimalBruteForce(originalPolygons, originalTargets) {
	var polygons = [];
	var targets = [];
	for(var index = 0 ; index < originalPolygons.length ; index++) {
		if(originalTargets[index] > 0) {
			var vertices = [];
			for(var j = 0 ; j < originalPolygons[index].vertices.length ; j++ )
				vertices.push(new Point(originalPolygons[index].vertices[j].x, originalPolygons[index].vertices[j].y));
			var polygon = new Polygon(vertices);
			polygon.id = originalPolygons[index].id;
			polygons.push(polygon);
			targets.push(originalTargets[index]);
			solutions.push(new Solution(originalPolygons[index], [], []));
		}
	};

	updateResults(solutions);

	var allBases = [];

	// generate visibility extension midpoints
	
	/* 
	var vertexBase = [];
	var statusPrefix = statusBase(solutions, targets) + "Generating guard candidates (vertices) & visibility polygons ";
	for(var index = 0 ; index < polygons.length ; index++) {
		postMessage({type: 'status', data: statusPrefix + "for Polygon  " + polygons[index].id  + " (" + index + "/" + (polygons.length - 1) + ")..."});
		var guards = polygons[index].vertices;
		var visibilityPolygons = fullVisibilityPolygon(polygons[index], guards);
		vertexBase.push(new Solution(polygons[index], guards, visibilityPolygons, "vertices"));
	}
	allBases.push(vertexBase);  */ 
	
	var rayMidpointBase = [];
	var statusPrefix = statusBase(solutions, targets) + "Generating guard candidates (ray extension midpoints) & visibility polygons ";
	for(var index = 0 ; index < polygons.length ; index++) {
		postMessage({type: 'status', data: statusPrefix + "for Polygon  " + polygons[index].id  + " (" + index + "/" + (polygons.length - 1) + ")..."});
		var guards = polygons[index].visibilityExtensions("midpoint");
		var visibilityPolygons = fullVisibilityPolygon(polygons[index], guards);
		rayMidpointBase.push(new Solution(polygons[index], guards, visibilityPolygons, "extensionMidpoints"));
	}
	allBases.push(rayMidpointBase); 

	
	// generate visibility extension boundaries
	var rayBoundaryBase = [];
	var statusPrefix = statusBase(solutions, targets) + "Generating guard candidates (ray extension boundaries) & visibility polygons ";
	for(var index = 0 ; index < polygons.length ; index++) {
		postMessage({type: 'status', data: statusPrefix + "for Polygon  " + polygons[index].id  + " (" + index + "/" + (polygons.length - 1) + ")..."});
		var guards = polygons[index].visibilityExtensions("boundary");
		var visibilityPolygons = fullVisibilityPolygon(polygons[index], guards);
		rayBoundaryBase.push(new Solution(polygons[index], guards, visibilityPolygons, "extensionBoundaries"));
	}
	allBases.push(rayBoundaryBase); 


	// generate vertex intersections
	var vertexIntersectionBase = [];
	var statusPrefix = statusBase(solutions, targets) + "Generating guard candidates (vertex diagonal intersections) & visibility polygons ";
	for(var index = 0 ; index < polygons.length ; index++) {
		postMessage({type: 'status', data: statusPrefix + "for Polygon  " + polygons[index].id  + " (" + index + "/" + (polygons.length - 1) + ")..."});
		var guards = polygons[index].visibilityExtensions("vertexIntersections");
		var visibilityPolygons = fullVisibilityPolygon(polygons[index], guards);
		vertexIntersectionBase.push(new Solution(polygons[index], guards, visibilityPolygons, "vertexIntersections"));
	}
	allBases.push(vertexIntersectionBase);

	
	// generate extension intersections
	var extensionIntersectionBase = [];
	var statusPrefix = statusBase(solutions, targets) + "Generating guard candidates (visibility extension intersections) & visibility polygons ";
	for(var index = 0 ; index < polygons.length ; index++) {
		postMessage({type: 'status', data: statusPrefix + "for Polygon  " + polygons[index].id  + " (" + index + "/" + (polygons.length - 1) + ")..."});
		var guards = polygons[index].visibilityExtensions("extensionIntersections");
		var visibilityPolygons = fullVisibilityPolygon(polygons[index], guards);
		extensionIntersectionBase.push(new Solution(polygons[index], guards, visibilityPolygons, "extensionIntersections"));
	}
	allBases.push(extensionIntersectionBase); 


	var deterministicSolutions = [];
	// start with greedy guard
	for(var index = 0 ; index < polygons.length ; index++) {
		var solutionSet = [];
		for(var j = 0 ; j < allBases.length ; j++) {
			var currentBase = allBases[j][index];
			console.log(currentBase.guards.length);
			var newSolution = deterministicGreedyGuards(currentBase, statusBase(solutions, targets));
			solutionSet.push(newSolution);
			updateSolutions(solutions, targets, index, newSolution);
			try {
				if(currentBase.guards.length < greedyAreaLimit) {
					newSolution = deterministicGreedyArea(currentBase, statusBase(solutions, targets));
					solutionSet.push(newSolution);
					updateSolutions(solutions, targets, index, newSolution);
				}
			} catch(err) {

			}
		}
		deterministicSolutions.push(solutionSet);
	}

	// infinite loop until target met
	var modes = ["d_r", "pg_pg", "pg_pq", "pq_r", "pq_pq_r", "pq_pq_r", "d_s"];
	var count = 0;
	do {
		var unmet = 0;
		for(var index = 0 ; index < polygons.length ; index++) {
			if(!solutions[index].met) {
				unmet++;
				var baseSolution = allBases[count % allBases.length][index];
				var statusPrefix = statusBase(solutions, targets);

				try {
					switch(modes[count % modes.length]) {
					/*	case "r":
							if(baseSolution.guards.length < redundantRemoveLimit) {
								var newSolution = removeRedundantRandom(baseSolution, statusPrefix);
								updateSolutions(solutions, targets, index, newSolution);
							}
							break; 
						case "s":
							if(baseSolution.guards.length < redundantRemoveLimit) {
								var newSolution = removeRedundantSorted(baseSolution, statusPrefix);
								updateSolutions(solutions, targets, index, newSolution);
							}
							break; */
						case "d_r":
							for(var j = 0 ; j < deterministicSolutions[index].length ; j++ ) {
								var newSolution = deterministicSolutions[index][j];

								if(newSolution.guards.length > 0) {
									if(newSolution.guards.length >= redundantRemoveLimit)
									{
										do {
											var previous = newSolution;
											newSolution = probabilisticGreedyGuards(newSolution, statusBase(solutions, targets));
										} while(newSolution.guards.length != previous.guards.length);
									}

									if(newSolution.guards.length < redundantRemoveLimit) {
										newSolution = removeRedundantRandom(newSolution, statusBase(solutions, targets));
										updateSolutions(solutions, targets, index, newSolution);
									}
								}
							}
							break;
						case "d_s":
							for(var j = 0 ; j < deterministicSolutions[index].length ; j++ ) {
								var newSolution = deterministicSolutions[index][j];

								if(newSolution.guards.length > 0) {
									if(newSolution.guards.length >= redundantRemoveLimit)
									{
										do {
											var previous = newSolution;
											newSolution = probabilisticGreedyGuards(newSolution, statusBase(solutions, targets));
										} while(newSolution.guards.length != previous.guards.length);
									}

									if(newSolution.guards.length < redundantRemoveLimit) {
										newSolution = removeRedundantSorted(newSolution, statusBase(solutions, targets));
										updateSolutions(solutions, targets, index, newSolution);
									}
								}
							}
							break;
						case "pg_r":
							var newSolution = probabilisticGreedyGuards(baseSolution, statusBase(solutions, targets));

							if(newSolution.guards.length > 0 && newSolution.guards.length < redundantRemoveLimit) {
								newSolution = removeRedundantRandom(newSolution, statusBase(solutions, targets));
								updateSolutions(solutions, targets, index, newSolution);
							}
							break;
						case "pg_pg":
							if(baseSolution.guards.length > 0) {
								var newSolution = baseSolution;
								do {
									baseSolution = newSolution; 
									newSolution = probabilisticGreedyGuards(baseSolution, statusBase(solutions, targets));
								} while(newSolution.guards.length != baseSolution.guards.length);
								updateSolutions(solutions, targets, index, newSolution);
							}
							break;
						case "pg_pg_r":
							if(baseSolution.guards.length > 0) {
								var newSolution = baseSolution;
								do {
									baseSolution = newSolution; 
									newSolution = probabilisticGreedyGuards(baseSolution, statusBase(solutions, targets));
								} while(newSolution.guards.length != baseSolution.guards.length);
								if(newSolution.guards.length < redundantRemoveLimit) {
									newSolution = removeRedundantRandom(newSolution, statusBase(solutions, targets));
									updateSolutions(solutions, targets, index, newSolution);
								}
							}
							break;
						case "pa_pa_r":
							if(baseSolution.guards.length > 0) {
								var newSolution = baseSolution;
								do {
									baseSolution = newSolution; 
									newSolution = probabilisticGreedyArea(baseSolution, statusBase(solutions, targets));
								} while(newSolution.guards.length != baseSolution.guards.length);
								if(newSolution.guards.length < redundantRemoveLimit) {
									newSolution = removeRedundantSorted(newSolution, statusBase(solutions, targets));
									updateSolutions(solutions, targets, index, newSolution);
								}
							}
							break;
						/*
						case "pg_s":
							var newSolution = probabilisticGreedyGuards(baseSolution, statusPrefix);
							if(newSolution.guards.length < redundantRemoveLimit) {
								newSolution = removeRedundantSorted(newSolution, statusBase(solutions, targets));
								updateSolutions(solutions, targets, index, newSolution);
							}
							break;
						case "pa_r":
							if(baseSolution.guards.length < greedyAreaLimit) {
								var newSolution = probabilisticGreedyArea(baseSolution, statusPrefix);
								if(newSolution.guards.length < redundantRemoveLimit) {
									newSolution = removeRedundantRandom(newSolution, statusBase(solutions, targets));
									updateSolutions(solutions, targets, index, newSolution);
								}
							}
							break;
						case "pa_s":
							if(baseSolution.guards.length < greedyAreaLimit) {
								var newSolution = probabilisticGreedyArea(baseSolution, statusPrefix);
								if(newSolution.guards.length < redundantRemoveLimit) {
									newSolution = removeRedundantSorted(newSolution, statusBase(solutions, targets));
									updateSolutions(solutions, targets, index, newSolution);
								}
							}
							break;
						case "pg_pa_r":
							var newSolution = probabilisticGreedyGuards(baseSolution, statusPrefix);
							if(newSolution.guards.length < greedyAreaLimit) {
								newSolution = probabilisticGreedyArea(newSolution, statusBase(solutions, targets));
								if(newSolution.guards.length < redundantRemoveLimit) {
									newSolution = removeRedundantRandom(newSolution, statusBase(solutions, targets));
									updateSolutions(solutions, targets, index, newSolution);
								}
							}
							break;
						case "pg_pa_s":
							var newSolution = probabilisticGreedyGuards(baseSolution, statusPrefix);
							if(newSolution.guards.length < greedyAreaLimit) {
								newSolution = probabilisticGreedyArea(newSolution, statusBase(solutions, targets));
								if(newSolution.guards.length < redundantRemoveLimit) {
									newSolution = removeRedundantSorted(newSolution, statusBase(solutions, targets));
									updateSolutions(solutions, targets, index, newSolution);
								}
							}
							break;
						case "ga_r":
							if(baseSolution.guards.length < greedyAreaLimit) {
								var newSolution = deterministicGreedyArea(baseSolution, statusPrefix);
								if(newSolution.guards.length < redundantRemoveLimit) {
									newSolution = removeRedundantRandom(newSolution, statusBase(solutions, targets));
									updateSolutions(solutions, targets, index, newSolution);
								}
							}
							break; */
					}
				} catch(err) { console.log(err); }
			}
		}
		count++;
	} while(unmet > 0);
} 

function updateSolutions(solutions, targets, index, newSolution) {
	if( newSolution.guards.length > 0 && (solutions[index].guards.length == 0 || newSolution.guards.length < solutions[index].guards.length) )
		solutions[index] = newSolution;

	if( solutions[index].guards.length <= targets[index] )
		solutions[index].met = true;

	postMessage({type: 'status', data: statusBase(solutions, targets)});
	updateResults(solutions);
}

function updateResults(solutions) {
	var results = "xerus\ngsfgscj4pdedl7v2jv395a86eh\n";
	for(var i = 0 ; i < solutions.length ; i++ ) {
		if(solutions[i].guards.length > 0) {
			results += solutions[i].polygon.id + ": ";
			for(var j = 0 ; j < solutions[i].guards.length ; j++ ) {
				results += solutions[i].guards[j].toString() + ", ";
			}
			if(solutions[i].guards.length > 0)
				results = results.slice(0, -2);
			results += "\n";
		}
	}
	postMessage({type: 'results', data: results});
}

function deterministicGreedyGuards(solution, statusPrefix) {
	postMessage({type: 'status', data: statusPrefix + "Greedily choosing guards (guards, deterministic) from " + solution.guards.length + " candidates (" + solution.id + ") in Polygon " + solution.polygon.id + " (n = " + solution.polygon.vertices.length + ")"});

	var result = greedilySelectGuards(solution.polygon, solution.guards.slice(), solution.visibilityPolygons.slice(), "guards");

	return new Solution(solution.polygon, result.guards, result.visibilityPolygons, solution.id + " => deterministic(guards)");
}

function deterministicGreedyArea(solution, statusPrefix) {
	postMessage({type: 'status', data: statusPrefix + "Greedily choosing guards (area, deterministic) from " + solution.guards.length + " candidates (" + solution.id + ") in Polygon "+ solution.polygon.id + " (n = " + solution.polygon.vertices.length + ")"});

	var result = greedilySelectGuards(solution.polygon, solution.guards.slice(), solution.visibilityPolygons.slice(), "area");

	return new Solution(solution.polygon, result.guards, result.visibilityPolygons.slice, solution.id + " => deterministic(area)");
}

function probabilisticGreedyGuards(solution, statusPrefix) {
	postMessage({type: 'status', data: statusPrefix + "Greedily choosing guards (guards, probabilistic) from " + solution.guards.length + " candidates (" + solution.id + ") in Polygon " + solution.polygon.id + " (n = " + solution.polygon.vertices.length + ")"});
	
	var result = greedilySelectGuardsProbabilistic(solution.polygon, solution.guards.slice(), solution.visibilityPolygons.slice(), 'guards');

	return new Solution(solution.polygon, result.guards, result.visibilityPolygons, solution.id + " => probabilistic(guards)");
} 


function probabilisticGreedyArea(solution, statusPrefix) {
	postMessage({type: 'status', data: statusPrefix + "Greedily choosing guards (area, probabilistic) from " + solution.guards.length + " candidates (" + solution.id + ") in Polygon " + solution.polygon.id + " (n = " + solution.polygon.vertices.length + ")"});

	var result = greedilySelectGuardsProbabilistic(solution.polygon, solution.guards.slice(), solution.visibilityPolygons.slice(), 'area');

	return new Solution(solution.polygon, result.guards, result.visibilityPolygons, solution.id + " => probabilistic(area)");
}   

function removeRedundantRandom(solution, statusPrefix) {
	postMessage({type: 'status', data: statusPrefix + "Removing redundant guards (random) from " + solution.guards.length + " candidates (" + solution.id + ") in Polygon " + solution.polygon.id + " (n = " + solution.polygon.vertices.length + ")"});

	var guards = solution.guards.slice();
	var visibilityPolygons = solution.visibilityPolygons.slice();

	removeRedundantGuards(solution.polygon, guards, visibilityPolygons, "random");

	return new Solution(solution.polygon, guards, visibilityPolygons, solution.id + " => removeRedundant(random)");
} 

/*
function removeRedundantSorted(solution, statusPrefix) {
	postMessage({type: 'status', data: statusPrefix + "Removing redundant guards (sorted) from " + solution.guards.length + " candidates (" + solution.id + ") in Polygon "+ solution.polygon.id + " (n = " + solution.polygon.vertices.length + ")"});

	var guards = solution.guards.slice();
	var visibilityPolygons = solution.visibilityPolygons.slice();

	removeRedundantGuards(solution.polygon, guards, visibilityPolygons, "sorted");

	return new Solution(solution.polygon, guards, visibilityPolygons, solution.id + " => removeRedundant(sorted)");
}  */