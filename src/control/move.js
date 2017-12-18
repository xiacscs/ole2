import Control from './control.js';
import movePng from '../../img/move.png';

/**
 * Control for moving geometries.
 * @extends {ole.Control}
 * @alias ole.MoveControl
 */
class MoveControl extends Control {
  /**
   * Control for moving geometries,
   * @param {Object} options Tool options.
   */
  constructor(options) {
    super(
      Object.assign(
        {
          title: 'Move geometries',
          className: 'icon-move',
          image: movePng
        },
        options
      )
    );

    /**
     * @type {ol.Coordinate}
     * @private
     */
    this.coordinate = null;

    /**
     * @type {string}
     * @private
     */
    this.cursor = 'pointer';
    this.previousCursor = null;

    /**
     * @type {ol.Feature}
     * @private
     */
    this.feature = null;

    /**
     * @type {ol.interaction.Pointer}
     * @private
     */
    this.pointerInteraction = new ol.interaction.Pointer({
      handleDownEvent: this.handleDownEvent.bind(this),
      handleDragEvent: this.handleDragEvent.bind(this),
      handleMoveEvent: this.handleMoveEvent.bind(this),
      handleUpEvent: this.handleUpEvent.bind(this)
    });
  }

  /**
   * Handle the down event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleDownEvent(evt) {
    var feature = evt.map.forEachFeatureAtPixel(evt.pixel, f => {
      if (this.source.getFeatures().indexOf(f) > -1) {
        return f;
      }
    });

    if (feature) {
      if (feature.getGeometry() instanceof ol.geom.Point) {
        this.coordinate = ol.extent.getCenter(
          feature.getGeometry().getExtent()
        );
      } else {
        this.coordinate = evt.coordinate;
      }

      this.feature = feature;
      this.editor.setEditFeature(feature);
      return true;
    }
  }

  /**
   * Handle the drag event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleDragEvent(evt) {
    var deltaX = evt.coordinate[0] - this.coordinate[0];
    var deltaY = evt.coordinate[1] - this.coordinate[1];

    this.feature.getGeometry().translate(deltaX, deltaY);

    this.coordinate[0] = evt.coordinate[0];
    this.coordinate[1] = evt.coordinate[1];
  }

  /**
   * Handle the move event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleMoveEvent(evt) {
    if (this.cursor) {
      var element = evt.map.getTargetElement();

      var feature = evt.map.forEachFeatureAtPixel(evt.pixel, function(f) {
        return f;
      });

      if (feature) {
        if (element.style.cursor !== this.cursor) {
          this.previousCursor = element.style.cursor;
          element.style.cursor = this.cursor;
        }
      } else if (this.previousCursor !== null) {
        element.style.cursor = this.previousCursor;
        this.previousCursor = null;
      }
    }
  }

  /**
   * Handle the up event of the pointer interaction.
   * @param {ol.MapBrowserEvent} evt Event.
   * @private
   */
  handleUpEvent() {
    this.coordinate = null;
    this.feature = null;
    this.editor.setEditFeature(null);
    return false;
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.pointerInteraction);
    super.activate();
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    this.map.removeInteraction(this.pointerInteraction);
    super.deactivate();
  }
}

export default MoveControl;
