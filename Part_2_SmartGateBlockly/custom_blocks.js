/**
 * This file defines the CUSTOM BLOCKLY BLOCK used in the Smart Gate
 * Controller assignment.
 */

(function () {
  'use strict';

  // -----------------------------------------------------------------------
  // JSON definition for the "Open Gate with Speed" block.
  // -----------------------------------------------------------------------
  const openGateWithSpeedJson = {
    "type": "open_gate_with_speed",

    "message0": "Open Gate with Speed %1",

    "args0": [
      {
        "type": "field_number",
        "name": "SPEED",     
        "value": 5,          
        "min": 1,            
        "max": 10,           
        "precision": 1       
      }
    ],

    
    "previousStatement": null,
    "nextStatement": null,

    "colour": 210,

    "tooltip": "Opens the Smart Gate and drives the servo at the given speed (1-10).",
    "helpUrl": ""
  };

  // -----------------------------------------------------------------------
  // Register the block definition with Blockly.
  // -----------------------------------------------------------------------
  if (!Blockly.Blocks['open_gate_with_speed']) {
    Blockly.common.defineBlocksWithJsonArray([openGateWithSpeedJson]);
  }
})();
