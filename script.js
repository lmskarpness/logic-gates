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
    drawGrid();

    // Gate representation (position, dimensions, etc.)
    const gates = [];

    // Signal components (on, off)
    const signals = [];

    // Dragging new gates (type and location)
    let dragged_gate_type = null;
    let mouse_x = 0;
    let mouse_y = 0;

    // Dragging gates already placed.
    let selected_gate = null;
    let offset_x = 0
    let offset_y = 0

    // Default gate configurations
    const gate_configurations = {
        AND: { inputs: 2, outputs: 1 },
        OR: { inputs: 2, outputs: 1 },
        NOT: { inputs: 1, outputs: 1 },
        input: {inputs: 0, outputs: 1},
        output: {inputs: 1, outputs: 0},
    };

    // Dragging gates from toolbar functionality. Adds an event listener to each
    // gate that's available.
    const gates_in_toolbar = document.querySelectorAll('.gate, .signal'); // Array of gate elements
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
            const config = gate_configurations[dragged_gate_type];

            if (config) {
                // OPTIMIZATION: Could width/height be calculated when the component is saved
                // and be part of the configuration?
                let width = 40;
                let height = Math.max(config.inputs, config.outputs) * 40;
                gates.push({
                    type: dragged_gate_type,
                    x: snapToGrid(mouse_x - width / 2),
                    y: snapToGrid(mouse_y - height / 2),
                    width: width,
                    height: height,
                    inputs: config.inputs,
                    outputs: config.outputs
                });
            }
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
        drawGrid();
        gates.forEach(gate => {
            drawGate(gate);
        });
    }

    function drawGate(gate) {
        if (gate.type === 'input') {
            // Draw input as a circle
            ctx.fillStyle = '#323232';
            ctx.beginPath();
            ctx.arc(gate.x + gate.width / 2, gate.y + gate.height / 2, gate.width / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        } else if (gate.type === 'output') {
            // Draw output as a square
            ctx.fillStyle = '#323232';
            ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
            ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);
        } else {
            // Terminal sizes
            const terminal_width = 10;
            const terminal_height = 20;

            // Component
            ctx.fillStyle = '#C94E4E';
            ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
            ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);

            // Text
            ctx.fillStyle = 'black';
            ctx.fillText(gate.type, gate.x + 5, gate.y + 20);

            // Draw input rectangles
            const pitch = grid_size * 2; // spacing between terminals
            for (let i = 0; i < gate.inputs; i++) {
                const input_x = gate.x - terminal_width;
                const input_y = gate.y + 10 + i * pitch;
                ctx.fillStyle = '#888';
                ctx.fillRect(input_x, input_y, terminal_width, terminal_height);
                ctx.strokeRect(input_x, input_y, terminal_width, terminal_height);
            }

            // Draw output rectangles
            for (let i = 0; i < gate.outputs; i++) {
                const output_x = gate.x + gate.width;
                const output_y = gate.y + 10 + i * pitch;
                ctx.fillStyle = '#888';
                ctx.fillRect(output_x, output_y, terminal_width, terminal_height);
                ctx.strokeRect(output_x, output_y, terminal_width, terminal_height);
            }
        }
    }

    function drawGrid() {
        ctx.fillStyle = '#323232'; // Color of the grid dots

        // Draw grid dots
        for (let x = 0; x <= canvas.width; x += grid_size) {
            for (let y = 0; y <= canvas.height; y += grid_size) {
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, 2 * Math.PI); // Draw a dot at each grid intersection
                ctx.fill();
            }
        }
    }
};