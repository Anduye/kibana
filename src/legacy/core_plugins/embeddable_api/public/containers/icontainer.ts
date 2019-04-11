/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  Embeddable,
  EmbeddableFactoryRegistry,
  EmbeddableInput,
  EmbeddableOutput,
  ErrorEmbeddable,
  EmbeddableFactory,
} from '../embeddables';
import { ViewMode } from '../types';

import uuid from 'uuid';

export interface PanelState<E> {
  embeddableId: string;
  // The type of embeddable in this panel. Will be used to find the factory in which to
  // load the embeddable.
  type: string;

  // Stores customization state for the embeddable. Perhaps should be part of initialInput.
  customization?: { [key: string]: any };

  // Stores input for this embeddable that is specific to this embeddable. Other parts of embeddable input
  // will be derived from the container's input.
  initialInput: E;
}

export interface ContainerInput<EI extends EmbeddableInput = EmbeddableInput> extends EmbeddableInput {
  hidePanelTitles?: boolean;
  panels: {
    [key: string]: PanelState<EI>;
  };
}

export interface ContainerOutput extends EmbeddableOutput {
  embeddableLoaded: { [key: string]: boolean };
}

type EI<CEI> = Partial<CEI> & EmbeddableInput;
type OptionalEmbeddableInput<CEI> = Partial<CEI> & EmbeddableInput;
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

type ContainerEmbeddableInput<CI> = Omit<CI, 'panels'>

export interface IContainer<
  CEI,
  EO extends EmbeddableOutput = EmbeddableOutput,
  I extends ContainerInput = ContainerInput,
  O extends ContainerOutput = ContainerOutput,
> extends Embeddable<I, O> {
  public readonly isContainer: boolean = true;
  protected readonly embeddables: { [key: string]: Embeddable<EmbeddableInput, EO> };
  private embeddableUnsubscribes: { [key: string]: () => void };

  public getEmbeddableCustomization<C>(embeddableId: string): C;

  public getViewMode(): ViewMode;

  public getHidePanelTitles() {
    return this.input.hidePanelTitles ? this.input.hidePanelTitles : false;
  }

  public updatePanelState(panelState: PanelState) {
    this.setInput({
      ...this.input,
      panels: {
        ...this.input.panels,
        [panelState.embeddableId]: {
          ...this.input.panels[panelState.embeddableId],
          ...panelState,
        },
      },
    }); 
  }

  public async loadEmbeddable<EEI extends EI = EI>(panelState: PanelState<EEI>) {
    const factory = this.embeddableFactories.getFactoryByName<EmbeddableFactory<EEI, EO>>(panelState.type);
    const embeddable = await factory.create(this.getInputForEmbeddable<EEI>(panelState));
    this.subscribeToEmbeddableCustomizations(embeddable);
    embeddable.setContainer(this);
    this.embeddables[embeddable.id] = embeddable;
    this.updatePanelState(panelState);

    this.emitOutputChanged({
      ...this.output,
      embeddableLoaded: {
        [panelState.embeddableId]: true,
      },
    });
  }

  public async addNewEmbeddable<EEI extends EI<CEI> = EI<CEI>>(type: string, initialInput: Partial<EEI>): Promise<Embeddable<EEI> | ErrorEmbeddable> {
    const factory = this.embeddableFactories.getFactoryByName<EmbeddableFactory<EI<CEI>, EO>>(type);
    const panelState = this.createNewPanelState<EEI>({ type, initialInput });
    const embeddable = await factory.create(this.getInputForEmbeddable(panelState));
    panelState.initialInput = embeddable.getInput();
    this.subscribeToEmbeddableCustomizations(embeddable);
    embeddable.setContainer(this);
    this.embeddables[embeddable.id] = embeddable;
    this.updatePanelState(panelState);

    this.emitOutputChanged({
      ...this.output,
      embeddableLoaded: {
        [panelState.embeddableId]: true,
      },
    });
    return embeddable;
  }

  public createNewPanelState<EEI extends EI<CEI> = EI<CEI>>({ type, initialInput} : { type: string, initialInput: Partial<EEI> }): PanelState<EEI> {
    const embeddableId = initialInput.id || uuid.v4();
    return {
      type,
      embeddableId,
      customization: {},
      initialInput: initialInput ? initialInput : {},
    };
  }

  public removeEmbeddable(embeddable: Embeddable) {
    this.embeddables[embeddable.id].destroy();
    delete this.embeddables[embeddable.id];

    this.embeddableUnsubscribes[embeddable.id]();

    const changedInput = _.cloneDeep(this.input);
    delete changedInput.panels[embeddable.id];
    this.setInput(changedInput);
  }

  public getInputForEmbeddableFromContainer(): CEI {
    return {
      viewMode: this.input.viewMode;
    };
  }

  // getInputForEmbeddable<{ item: string, currentTemperature: 'string'}>({ initialInput: { item: 'Milk' } }) {
  //  return { ...initialInput, currentTemperature: 'cold' }  
  //}


  // getInputForEmbeddable<{ item: string }>({ initialInput: { item: 'Milk' } }) {
  //  return { ...initialInput, currentTemperature: 'cold' }  
  //}

  public getInputForEmbeddable<EEI extends EmbeddableInput>(panelState: PanelState<Omit<EEI, CEI>>): EEI {
    return {
      // id: panelState.embeddableId,
      // customization: {
      //   ...panelState.customization,
      // },
      // viewMode: this.input.viewMode,
      ...panelState.initialInput,
      ...this.getInputForEmbeddableFromContainer(),
    } as EEI;
    // This is tricky to do in typescript without the `as EI` part because it's
    // the container state plus the panelState.initialInput that needs to make up
    // the requested Embeddable Input and since panelState.initialInput is only
    // a partial, typescript cannot be sure that this truly fulfills the contract.
  }

  public getEmbeddable<EEI extends EI<CEI> = EI<CEI>>(id: string): Embeddable<EEI, EO> {
    return this.embeddables[id] as Embeddable<EEI, EO>;
  }

  private subscribeToEmbeddableCustomizations(embeddable: Embeddable) {
    this.embeddableUnsubscribes[embeddable.id] = embeddable.subscribeToOutputChanges(
      (output: EmbeddableOutput) => {
        this.setInput({
          ...this.input,
          panels: {
            ...this.input.panels,
            [embeddable.id]: {
              ...this.input.panels[embeddable.id],
              customization: {
                ...this.input.panels[embeddable.id].customization,
                ...output.customization,
              },
            },
          },
        });
      }
    );
  }

  private async initializeEmbeddables() {
    const promises = Object.values(this.input.panels).map(panel => this.loadEmbeddable(panel));
    await Promise.all(promises);

    this.subscribeToInputChanges(() => this.setEmbeddablesInput());
  }

  private setEmbeddablesInput() {
    Object.values(this.embeddables).forEach((embeddable: Embeddable) => {
      embeddable.setInput(this.getInputForEmbeddable(this.input.panels[embeddable.id]));
    });
  }
}
