import 'aframe';
const System = AFRAME.registerSystem('operator', {
  schema: {
    hands: { type: 'selectorAll' },
    items: { type: 'selectorAll' }
  },
  _grabbedItems: {},
  init() {
    const hands = this.data.hands;
    const items = this.data.items;
    hands.forEach(hand => {
      hand.addEventListener('gripdown', () => {
        const item = this._findNearby(hand, items);
        this._grab(hand, item);
      });
      hand.addEventListener('gripup', () => {
        this._drop(hand);
      });
    });
  },
  _findNearby(hand, items) {
    for (let i = 0, l = items.length; i < l; i++) {
      const item = items[i];
      if (distance(item) < 0.2) {
        return item;
      }
    }
    return null;

    function distance(item) {
      const handPosition = hand.getObject3D('mesh').getWorldPosition();
      const itemPosition = item.getObject3D('mesh').getWorldPosition();
      return handPosition.distanceTo(itemPosition);
    }
  },
  _grab(hand, item) {
    if (item) {
      const grab = this._isTool(item) ? _grabTool : _grabItem;
      if (grab()) {
        this._grabbedItems[hand.id] = item;
      }
    }

    function _grabTool() {
      const tool = item.components.tool;
      if (!tool.isGrabbed()) {
        tool.grab();
        hand.appendChild(item);
        return true;
      }
      return false;
    }

    function _grabItem() {
      const isGrabbed = item.hasAttribute('constraint');
      if (!isGrabbed) {
        item.setAttribute('constraint', `target: #${hand.id}`);
        return true;
      }
      return false;
    }
  },
  _drop(hand) {
    const grabbedItem = this._grabbedItems[hand.id];
    if (grabbedItem) {
      const drop = this._isTool(grabbedItem) ? _dropTool : _dropItem;
      if (drop()) {
        this._grabbedItems[hand.id] = null;
      }
    }

    function _dropTool() {
      const tool = grabbedItem.components.tool;
      tool.drop();
      return true;
    }

    function _dropItem() {
      grabbedItem.removeAttribute('constraint');
      return true;
    }
  },
  _isTool(item) {
    return item.components['tool'];
  }
});

export { System };
