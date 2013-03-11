DragGhost
=========

This jQuery plugin enables to modfiy the HTML5 Drag-and-Drop ghost by using any DOM element.

## Usage

```javascript
function handleDragstart(event) {
  event.attachGhost({
  	style: {
    	'background-color': 'black'
    }
  });
}


function handleDragstart(event) {
	event.attachGhost({
		elem: $('#myghost').get(0),
  	style: {
    	'background-color': 'black'
    }
  });
}



function handleDragstart(event) {
	event.attachGhost({
		elem: $('#myghost').get(0),
  	style: {
    	'background-color': 'black'
    },
		pos: {
			x: 10,
			y: 20
		}
  });
}
```



http://damien.antipa.at/2013/03/11/a-proper-ghost-overlay-for-native-html5-drag-and-drop-based-on-dom-elements/)
