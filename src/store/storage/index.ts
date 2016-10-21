import { Injectable } from '@angular/core';

import { Action } from '@ngrx/store';

import { Keymap } from '../../config-serializer/config-items/Keymap';
import { Macro } from '../../config-serializer/config-items/Macro';
import { UhkConfiguration } from '../../config-serializer/config-items/UhkConfiguration';

import { KeymapActions, MacroActions } from '../actions';
import { AppState } from '../index';
import { Electron } from './electron';
import { Local } from './local';

@Injectable()
export class DataStorage {

    private _environment: Local | Electron;
    private uhkConfiguration: UhkConfiguration;
    private uhkPresets: Keymap[];

    constructor() {
        this.initUHKJson();
        this.detectEnvironment();
    }

    initialState(): AppState {
        let config: UhkConfiguration = this._environment.getConfig() || this.uhkConfiguration;
        return {
            keymaps: {
                entities: config.keymaps
            },
            macros: {
                entities: config.macros
            },
            presetKeymaps: this.uhkPresets
        };
    }

    detectEnvironment(): void {
        // Electron
        // TODO check if we can remove <any> when electron will be implemented (maybe use process.versions['electron'])
        if (typeof window !== 'undefined' && (<any>window).process && (<any>window).process.type === 'renderer') {
            this._environment = new Electron();
        }
        // Local storage
        else {
            this._environment = new Local();
        }
    }

    // TODO: Add type for state
    saveState(reducer: any): (state: any, action: Action) => AppState {
        return (state: any, action: Action) => {
            let nextState = reducer(state, action);
            let config: UhkConfiguration;

            // Save elements to the UhkConfiguration
            if (
                action.type.startsWith(KeymapActions.PREFIX) &&
                (
                    (nextState.entities && nextState.entities.length && nextState.entities[0] instanceof Keymap) ||
                    (state.entities && state.entities.length && state.entities[0] instanceof Keymap)
                )
            ) {
                config = this._environment.getConfig() || this.uhkConfiguration;
                config.keymaps = Object.values(nextState.entities);
                this._environment.saveConfig(config);
            } else if (
                action.type.startsWith(MacroActions.PREFIX) &&
                (
                    (nextState.entities && nextState.entities.length && nextState.entities[0] instanceof Macro) ||
                    (state.entities && state.entities.length && state.entities[0] instanceof Macro)
                )
            ) {
                config = this._environment.getConfig() || this.uhkConfiguration;
                config.macros = Object.values(nextState.entities);
                this._environment.saveConfig(config);
            }
            return nextState;
        };
    }

    initUHKJson() {
        this.uhkConfiguration = new UhkConfiguration().fromJsObject(require('json!../../config-serializer/uhk-config.json'));
        this.uhkPresets = (<any[]>require('json!../../config-serializer/preset-keymaps.json'))
                            .map(keymap => new Keymap().fromJsObject(keymap));
    }
}
