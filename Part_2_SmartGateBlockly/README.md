# Smart Gate Controller — Blockly Project

This project implements **Part 2 (Visual Logic & JS Integration)** of the
Smart Gate robotics assignment: a custom Blockly block,
**"Open Gate with Speed"**, along with its JavaScript code generator, in a
self-contained, ready-to-run Blockly workspace.

It uses the **Blockly Browser Build** (`blockly_compressed.js`,
`blocks_compressed.js`, `javascript_compressed.js`) rather than the npm
module, so it runs directly in the browser with **no build step, no
bundler, and no internet connection required** — just open it with a
static file server like VS Code's Live Server.

---

## 1. Folder Structure

```
SmartGateBlockly/
│
├── index.html          Main page: loads Blockly, injects the workspace,
│                        wires up the "Generate JavaScript" button.
├── custom_blocks.js     Defines the "open_gate_with_speed" block (JSON).
├── generator.js          Defines the JavaScript generator for that block.
├── toolbox.xml           Reference copy of the toolbox definition
│                        (the same XML is also embedded in index.html).
├── style.css             Page styling (no external CSS framework needed).
├── README.md             This file.
│
└── blockly/                          Blockly's browser build files
    ├── blockly_compressed.js         Blockly core engine
    ├── blocks_compressed.js          Blockly's built-in blocks
    ├── javascript_compressed.js      JavaScript code generator core
    ├── media/                        Blockly's icons/sounds/cursors
    └── msg/
        └── en.js                    English UI strings for Blockly
```

---

## 2. How to Run (Step by Step)

1. **Install VS Code** (if you don't already have it) and the
   **"Live Server"** extension by Ritwick Dey (Extensions panel → search
   "Live Server" → Install).
2. **Unzip** this project (if you received it as a ZIP) into any folder,
   keeping the folder structure intact (especially the `blockly/`
   subfolder — do not flatten it).
3. **Open the `SmartGateBlockly` folder** in VS Code
   (`File → Open Folder...`).
4. In the file explorer, **right-click `index.html`** and choose
   **"Open with Live Server"**.
5. Your browser will open automatically (usually at
   `http://127.0.0.1:5500/index.html`), showing the Blockly workspace.
6. In the toolbox on the left, click the **"Smart Gate"** category.
7. **Drag the "Open Gate with Speed" block** into the workspace.
8. Click the number field (default `5`) to **edit the speed** — try any
   value from 1 to 10. Values outside that range are automatically
   clamped by Blockly.
9. Click the blue **"Generate JavaScript"** button below the workspace.
10. The generated code appears in the dark code panel, e.g.:
    ```javascript
    // Smart Gate
    // Speed = 5
    servo.write(5);
    ```
    Changing the speed field to `8` and regenerating produces:
    ```javascript
    // Smart Gate
    // Speed = 8
    servo.write(8);
    ```
    (The `speed` value drives the actual `servo.write(...)` argument, so
    the block's input has a real effect on the generated code, rather than
    only appearing in a comment.)

> **No login, no npm install, no internet connection needed** — everything
> Blockly needs to run is already inside the `blockly/` folder.

---

## 3. How Custom Blocks Work (`custom_blocks.js`)

A Blockly block is defined by:

- **A JSON definition** describing its shape: the label text
  (`message0`), its inputs/fields (`args0`), its connectors
  (`previousStatement`/`nextStatement` for action blocks, or
  `output` for value blocks), and its colour/tooltip.
- **Registration**, which tells Blockly's block factory that this
  definition exists, using
  `Blockly.common.defineBlocksWithJsonArray([...])` — the modern,
  non-deprecated way to register JSON block definitions in Blockly 10.x.

In this project, `open_gate_with_speed` uses a `field_number` input
(`SPEED`) with `min: 1` and `max: 10`, which gives us the free,
automatic 1–10 range validation required by the assignment — Blockly
clamps out-of-range typed values itself.

Once registered, the block becomes available to be referenced by type
name (`open_gate_with_speed`) from the toolbox XML, and it appears as a
draggable block in the "Smart Gate" category.

---

## 4. How JavaScript Generators Work (`generator.js`)

Defining what a block *looks like* is separate from defining what
*code* it produces. The generator step is:

```javascript
Blockly.JavaScript.forBlock['open_gate_with_speed'] = function (block) {
  const speed = block.getFieldValue('SPEED');
  return '// Smart Gate\n// Speed = ' + speed + '\nservo.write(' + speed + ');\n';
};
```

- `Blockly.JavaScript` is the built-in JavaScript generator object,
  created by loading `javascript_compressed.js`.
- `.forBlock['open_gate_with_speed']` registers our function as *the*
  generator to call whenever a block of that type is encountered while
  converting the workspace to code.
- `block.getFieldValue('SPEED')` reads the current value the user set on
  the block's editable number field.
- The function **returns a string** of generated code (statement blocks
  return just a string; value/expression blocks would instead return an
  array of `[code, precedence]`).

When you click **"Generate JavaScript"**, `index.html`'s script calls:

```javascript
Blockly.JavaScript.workspaceToCode(workspace);
```

This walks every top-level block chain in the workspace and, for each
block, calls its registered generator function, concatenating the
results into the final output shown in the code panel.

---

## 5. Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| Blank page / "Blockly is not defined" | Scripts loaded out of order, or `blockly/` folder missing/renamed | Keep the exact folder structure and script order from `index.html` |
| Block doesn't appear in toolbox | `custom_blocks.js` not loaded, or block `type` name typo | Check that `custom_blocks.js` loads **after** `blockly_compressed.js`/`blocks_compressed.js` and **before** `generator.js`; confirm the type name matches in all 3 places (`custom_blocks.js`, `toolbox.xml`/inline XML, `generator.js`) |
| "Generate JavaScript" gives empty output | No block dragged into the workspace yet | Drag the block in before clicking the button |
| Console error about `forBlock` being undefined | `javascript_compressed.js` not loaded before `generator.js` | Check script order in `index.html` |

---

## 6. Deliverable

For this part of the assignment, submit:

- This entire `SmartGateBlockly/` folder as a **ZIP file** (with the
  `blockly/` subfolder intact), **or**
- A link to a GitHub repository containing this folder.

The deliverable satisfies the assignment's Part 2 requirement:
*"A text file containing the JSON block definition and the JavaScript
generator code"* — the JSON definition is in `custom_blocks.js` and the
generator is in `generator.js` — while also being a fully working,
interactive Blockly demo you can show live.
