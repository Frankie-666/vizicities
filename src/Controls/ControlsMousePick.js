/* globals window, _, VIZI */

/**
 * Mouse picking controls class
 * @author Robin Hawkes - vizicities.com
 */

 // TODO: Prevent click (and hover events?) from triggering while moving camera

(function() {
  "use strict";

  VIZI.ControlsMousePick = function(camera, options) {
    var self = this;

    VIZI.Controls.call(self, camera, options);

    if (!self.options.scene) {
      throw new Error("Required scene option missing");
    }

    self.camera = camera;
    self.pixelBuffer = new Uint8Array(4);

    self.lastPickedIdHover;
    self.validClick = true;

    self.options.scene.options.viewport.addEventListener("mousemove", self.onMouseMove.bind(self), false);
    self.options.scene.options.viewport.addEventListener("mousedown", self.onMouseDown.bind(self), false);
    self.options.scene.options.viewport.addEventListener("mouseup", self.onMouseUp.bind(self), false);
  };

  VIZI.ControlsMousePick.prototype = Object.create( VIZI.Controls.prototype );

  // TODO: Is this called less on mousemove than it would be on each tick?
  // If not, either move to each tick (and be called when not needed), or
  // set a minimum amount of time to pass before re-picking on move (eg. 100ms)
  // Could use _.trottle to cap to a certain threshold
  VIZI.ControlsMousePick.prototype.onMouseMove = function(event) {
    var self = this;

    // Removed until proven necessary as it was interfering with layers UI 
    //event.preventDefault();

    // Invalidate any clicks as the mouse has moved
    self.validClick = false;

    var screenPos = new VIZI.Point(event.clientX, event.clientY);
    var viewportOffset = new VIZI.Point(
      self.options.scene.options.viewport.offsetLeft,
      self.options.scene.options.viewport.offsetTop
    );

    var relativePos = screenPos.clone().subtract(viewportOffset);

    var ref = self.pick(relativePos);

    if (!ref) {
      if (self.lastPickedIdHover) {
        // Emit event with picked id (for other modules to reference from)
        VIZI.Messenger.emit("pick-off:" + self.lastPickedIdHover);
        self.lastPickedIdHover = undefined;
      }
      return;
    }

    if (self.lastPickedIdHover && self.lastPickedIdHover === ref.id) {
      return;
    } else if (self.lastPickedIdHover && self.lastPickedIdHover !== ref.id) {
      // Emit event with picked id (for other modules to reference from)
      VIZI.Messenger.emit("pick-off:" + self.lastPickedIdHover);      
    }

    // Emit event with picked id (for other modules to reference from)
    VIZI.Messenger.emit("pick-hover:" + ref.id);

    self.lastPickedIdHover = ref.id;
  };

  VIZI.ControlsMousePick.prototype.onMouseDown = function(event) {
    var self = this;

    // Skip if right button
    if (event.button === 2) {
      return;
    }

    self.validClick = true;
  };

  VIZI.ControlsMousePick.prototype.onMouseUp = function(event) {
    var self = this;

    // Skip if right button
    if (event.button === 2) {
      return;
    }

    // Skip if click has been invalidated by movement
    if (!self.validClick) {
      return;
    }

    // Removed until proven necessary as it was interfering with layers UI 
    //event.preventDefault();

    var screenPos = new VIZI.Point(event.clientX, event.clientY);
    var viewportOffset = new VIZI.Point(
      self.options.scene.options.viewport.offsetLeft,
      self.options.scene.options.viewport.offsetTop
    );

    var relativePos = screenPos.clone().subtract(viewportOffset);

    var ref = self.pick(relativePos);

    if (!ref) {
      return;
    }

    // Emit event with picked id (for other modules to reference from)
    VIZI.Messenger.emit("pick-click:" + ref.id);
  };

  // TODO: Fix issue where ID is being picked up even when clicking outside of objects within scene
  VIZI.ControlsMousePick.prototype.pick = function(pos) {
    var self = this;

    if (!pos) {
      console.log("No position given for picking");
      return;
    }

    // Render picking scene
    self.options.scene.renderPicking(self.camera);

    // Get the gl buffer
    var gl = self.options.scene.renderer.getContext();

    // Read pixel under the mouse into buffer
    gl.readPixels(pos.x, self.options.scene.pickingTexture.height - pos.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, self.pixelBuffer);

    // Get picked object
    var id = (self.pixelBuffer[0] << 16) | (self.pixelBuffer[1] << 8) | (self.pixelBuffer[2]);

    // Highlight picked object
    // self.options.scene.highlightPickable(id);

    var ref = self.options.scene.getPickable(id);

    if (!ref) {
      return;
    }
    
    return ref;
  };
})();