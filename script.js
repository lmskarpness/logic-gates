window.onload = function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 856;
    canvas.height = 480;

    // Setting sizing for CSS
    const app = document.getElementById('app');
    app.style.maxWidth = canvas.width + 'px';

    // Grid size for each cell
    const grid_size = 20;

    // Gate representation (position, dimensions, etc.)
    const gates = [];

    // Dragging new gates (type and location)
    let dragged_gate_type = null;
    let mouse_x = 0;
    let mouse_y = 0;

    // Dragging gates already placed.
    let selected_gate = null;
    let offset_x = 0
    let offset_y = 0

    // Dragging gates from toolbar functionality. Adds an event listener to each
    // gate that's available.
    const gates_in_toolbar = document.querySelectorAll('.gate'); // Array of gate elements
    gates_in_toolbar.forEach(gate => {
        gate.addEventListener('dragstart', (event) => {
            dragged_gate_type = gate.getAttribute('data-type'); // Store gate type
        });
    });

    // Give the canvas an event listener for dragover event.
    canvas.addEventListener('dragover', (event) => {
        event.preventDefault();
        const rect = canvas.getBoundingClientRect();
        mouse_x = event.clientX - rect.left;
        mouse_y = event.clientY - rect.top;
    });

    // Event listener for dropping gate onto canvas. Pushes gate type to list of current gates,
    // then redraws the gates.
    canvas.addEventListener('drop', (event) => {
        event.preventDefault();
        if (dragged_gate_type) {
            // Add the gate to the gates array with the drop location
            gates.push({ type: dragged_gate_type, x: snapToGrid(mouse_x - 30), y: snapToGrid(mouse_y - 20), width: 60, height: 40 });
            dragged_gate_type = null; // Reset after drop
            drawGates();
        }
    });

    // Mouse down on a placed gate to drag it
    canvas.addEventListener('mousedown', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse_x = event.clientX - rect.left;
        mouse_y = event.clientY - rect.top;

        // Finds what gate is within the bounds of that which we placed
        selected_gate = gates.find(gate => mouse_x >= gate.x && mouse_x <= gate.x + gate.width && mouse_y >= gate.y && mouse_y <= gate.y + gate.height);
        if (selected_gate) {
            // Calculate offset between gate and current mouse position.
            offset_x = mouse_x - selected_gate.x;
            offset_y = mouse_y - selected_gate.y;
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (selected_gate) {
            const rect = canvas.getBoundingClientRect();
            mouse_x = event.clientX - rect.left;
            mouse_y = event.clientY - rect.top;

            // Snap gates position to grid
            selected_gate.x = snapToGrid(mouse_x - offset_x);
            selected_gate.y = snapToGrid(mouse_y - offset_y);

            drawGates();
        }
    });

    // Mouse up to drop the gate
    canvas.addEventListener('mouseup', () => {
        selected_gate = null; // Clear selection after dragging
    });


    // Snap a value to the nearest grid line
    function snapToGrid(value) {
        return Math.round(value / grid_size) * grid_size;
    }

    // Simple render loop to draw gates on the canvas
    function drawGates() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gates.forEach(gate => {
            drawGate(gate);
        });
    }

    function drawGate(gate) {
        ctx.fillStyle = '#C94E4E';
        ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
        ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);

        ctx.fillStyle = 'black';
        ctx.fillText(gate.type, gate.x + 5, gate.y + 20);
    }
};