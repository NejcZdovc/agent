import { assertUInt8 } from '../../assert';
import { UhkBuffer } from '../../UhkBuffer';
import { KeyAction, KeyActionId, keyActionType } from './KeyAction';

export class SwitchKeymapAction extends KeyAction {

    keymapId: string;

    constructor(other?: SwitchKeymapAction) {
        super();
        if (!other) {
            return;
        }
        this.keymapId = other.keymapId;
    }

    _fromJsObject(jsObject: any): SwitchKeymapAction {
        this.assertKeyActionType(jsObject);
        this.keymapId = jsObject.keymapId;
        return this;
    }

    _fromBinary(buffer: UhkBuffer): SwitchKeymapAction {
        this.readAndAssertKeyActionId(buffer);
        this.keymapId = buffer.readString();
        return this;
    }

    _toJsObject(): any {
        return {
            keyActionType: keyActionType.SwitchKeymapAction,
            keymapId: this.keymapId
        };
    }

    _toBinary(buffer: UhkBuffer) {
        buffer.writeUInt8(KeyActionId.SwitchKeymapAction);
        buffer.writeString(this.keymapId);
    }

    toString(): string {
        return `<SwitchKeymapAction keymapId="${this.keymapId}">`;
    }
}
