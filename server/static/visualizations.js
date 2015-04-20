var Visualization = {};

(function() {
    "use strict";

	Visualization.flameChart = function($element, height, node, $scope,
                                        $location, cutoff, path_so_far) {

		function draw(x, y, width, height, node, path) {
            if (node.total < cutoff) {
                return;
            }
			var rect = paper.rect(x, y, width, height, 5);
			var text = paper.text(x + width / 2,
								  y + height / 2,
								  node.name.split(':')[1]);
            var st = paper.set();
            st.push(rect, text);
            
			if (text.getBBox().width > rect.getBBox().width) {
				text.remove();
			}

			var color = colors[(parseInt(node.addr.slice(node.addr.length - 6)) / 4) % colors.length];
			rect.attr({fill: color});
			st.data('color', color);
			st.data('node', node);
            st.data('rect', rect);
            var cur_path = path.toString();

			st.hover(
				function(e) {
					var node = this.data('node');
                    var rect = this.data('rect');
					rect.attr({'fill': '#99CCFF'});
                    var name = split_name(node.name);
                    $("#visualization-data").text("Function: " + name.funcname + " file: " + name.file + " line: " + name.line);
				},
				function(e) {
                    var rect = this.data('rect');
					rect.attr({'fill': this.data('color'),
                               "title": ""});
				}
			);

			st.click(function () {
				$location.search({
					id: cur_path,
					view: 'flames'
				});
                $scope.$apply();
			});

			if (_.keys(node.children).length == 1) {
				if (node.self == node.total) {
					var scale = 1;
				} else {
					var scale = 1 - (node.self / node.total);
				}
				var child = node.children[Object.keys(node.children)[0]];
                path.push(0);
				draw(x, y + height + 2, width * scale, height, child, path);
			} else if (_.keys(node.children).length > 1) {
				var y = y + height + 2;
				for (var child in node.children) {
                    var c_path = path.slice();
                    c_path.push(child);
					var child = node.children[child];
					var _width = child.total / node.total * width;
					draw(x,  y, _width, height, child, c_path)
					x = x + _width;
				}
			}
		}

		$element.empty();
		var colors = ["rgb(228, 137, 9)",
					  "rgb(231, 227, 3)",
					  "rgb(214, 73, 15)",
					  "rgb(236, 164, 11)",
					  "rgb(231, 173, 15)"];

		var width = $element.width();
		var paper = Raphael($element[0], width, height);

		draw(0, 0, width, 25, node, path_so_far);

	}

	Visualization.squareChart = function($element, height, node,
										 $scope, $location) {

		$element.empty();
		var width = $element.width();
		var paper = Raphael($element[0], width, height);

		function draw(x, y, width, height, node, scale) {
			var scale = scale || scale;

			var rect = paper.rect(x, y, width, height);
			rect.attr({fill: '#9cf', stroke: '#888', 'stroke-width': 2});
			rect.data('name', node.name);

			rect.hover(
				function(e) {
					var name = this.data('name');
					//$scope.$apply(function () {
					//	$scope.address = address;
					//});
					this.attr({'fill': 'red'});
				},
				function(e) {
					this.attr({'fill': '#9cf'});
					//$scope.$apply(function () {
					//	$scope.address = null;
					//});
				}
			);

			//rect.click(function () {
			//	$location.search({
			//		id: this.data('address'),
			//		view: 'squares'
			//	});
			//});

			if (node.total == node.self) {
				var scale = 1;
			} else {
				var scale = 1 - (node.self / node.total);
			}

			if (_.keys(node.children).length == 1) {
				var node = node.children[Object.keys(node.children)[0]];
				var box = rect.getBBox();

				//draw(box.x, box.y, box.width, box.height, node);

			} else if (_.keys(node.children).length > 1) {
				var times = [];
				var names = [];
				var addresses = [];
				var children = [];

				for (var child in node.children) {
					var child = node.children[child];
					times.push(child.self);
					addresses.push(child.addr);
					names.push(child.name);
					children.push(child);
				}

				var xd = (width - (width * scale)) / 2;
				var yd = (height - (height * scale)) / 2;


				var width = width * scale;
				var height = height * scale;

				var boxes = Treemap.generate(
					addresses, names, times,
					width,
					height, x+xd, y+yd
				);


				for (var i = 0; i < boxes.length; i++) {
					var box = boxes[i];
					var x1=box.square[0],
						y1=box.square[1],
						x2=box.square[2],
						y2=box.square[3];

					//draw(x1, y1, x2-x1, y2-y1, children[i]);
				}
			}
		}
		draw(0, 0, width, height, node);

	}

})();
