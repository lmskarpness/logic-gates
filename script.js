// Preprocessing CSS: makes the toolbar the same width as the container.
window.addEventListener('load', () => {
    const container = document.getElementById('container');
    const toolbar = document.getElementById('toolbar');

    // Set toolbar width to match container width
    toolbar.style.width = container.offsetWidth + 'px';
});

const gridSize = 20;

// Stage setup
const stage = new Konva.Stage({
    container: 'container',
    width: 860,
    height: 480,
});

// Layer for drawing
const layer = new Konva.Layer();
stage.add(layer);

let dragged_gate_type = null;

// Snap a value to the nearest grid point
function snapToGrid(value, type) {
    return Math.round(value / gridSize) * gridSize - (type === "output" ? gridSize / 2 : 0);
}

// Draw grid on the canvas
function drawGrid() {
    for (let x = 0; x <= stage.width(); x += gridSize) {
        for (let y = 0; y <= stage.height(); y += gridSize) {
            const dot = new Konva.Circle({
                x: x,
                y: y,
                radius: 1,
                fill: '#323232',
            });
            layer.add(dot);
        }
    }
}

drawGrid(); // Draw initial grid

// Dragging and dropping gates
document.querySelectorAll('.gate, .signal').forEach(gate => {
    gate.addEventListener('dragstart', (event) => {
        dragged_gate_type = gate.getAttribute('data-type');
    });
});

let con = stage.container();
con.addEventListener('dragover', (event) => {
    event.preventDefault();
});

con.addEventListener('drop', (event) => {
    event.preventDefault();
    stage.setPointersPositions(event);
    
    let mouse_pos = stage.getPointerPosition();

    addGateToCanvas(dragged_gate_type, snapToGrid(mouse_pos.x, dragged_gate_type), snapToGrid(mouse_pos.y, dragged_gate_type));

    dragged_gate_type = null;
});


function addGateToCanvas(type, x, y) {
    let gate;

    // Gate configuration (rect for gates, circle for input)
    if (type === 'input') {
        gate = new Konva.Circle({
            name: type,
            x: x,
            y: y,
            radius: 10,
            fill: '#323232',
            draggable: true,
        });
    } else if (type === 'output') {
        gate = new Konva.Rect({
            x: x,
            y: y,
            width: 20,
            height: 20,
            fill: '#323232',
            draggable: true,
        });
    } else {
        gate = new Konva.Rect({
            x: x,
            y: y,
            width: 60,
            height: 40,
            fill: '#C94E4E',
            draggable: true,
        });
        
        const label = new Konva.Text({
            text: type,
            fontSize: 14,
            fill: 'black',
            x: 105,
            y: 110,
        });
        layer.add(label);
    }

    gate.on('dragmove', () => {
        gate.position({
            x: snapToGrid(gate.x(), type),
            y: snapToGrid(gate.y(), type)
        });
    });

    layer.add(gate);
    layer.draw();
}