/**
 * generator.js
 * -----------------------------------------------------------------------
 * This file defines the JAVASCRIPT CODE GENERATOR for the custom
 * "open_gate_with_speed" block that was defined in custom_blocks.js.
 * -----------------------------------------------------------------------
 */

(function () {
  'use strict';

  if (typeof Blockly === 'undefined' || !Blockly.JavaScript) {
    throw new Error(
      'generator.js loaded before Blockly.JavaScript was ready. ' +
      'Check the <script> order in index.html.'
    );
  }

  /**
   * Generator function for the "open_gate_with_speed" block.
   *
   * @param {Blockly.Block} block The block instance being converted to code.
   * @return {string} The generated JavaScript code for this block.
   */
  Blockly.JavaScript.forBlock['open_gate_with_speed'] = function (block) {
    
    const speed = block.getFieldValue('SPEED');

    const code =
      '// Smart Gate\n' +
      '// Speed = ' + speed + '\n' +
      'servo.write(' + speed + ');\n';

    return code;
  };
})();
