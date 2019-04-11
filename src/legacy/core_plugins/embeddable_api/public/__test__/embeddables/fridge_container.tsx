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
import { EmbeddableFactoryRegistry, EmbeddableOutput, EmbeddableInput } from 'plugins/embeddable_api/embeddables';
import { Container } from 'plugins/embeddable_api/index';
import React from 'react';
import ReactDOM from 'react-dom';
import { PanelState } from 'plugins/embeddable_api/containers';
//import { ListDisplay } from './list_display';

export const FRIDGE_CONTAINER_ID = 'FRIDGE_CONTAINER_ID';

interface FridgePanelState extends PanelState<FoodEmbeddableInput> {
  section: string;
}

interface FridgeContainerInput extends EmbeddableInput {
  currentTemperature: number;
  panels: { [key: string]: FridgePanelState }
}

interface FridgeEmbeddableInput {
  currentTemperature: number;
}

interface FoodEmbeddableInput extends EmbeddableInput {
  item: string;
  expirationDate?: string;
}

interface FoodEmbeddableOutput extends EmbeddableOutput {
  shouldThrowAway: boolean;
  bestAtTemperature: boolean;
}

interface FruitEmbeddableInput extends FoodEmbeddableInput {
  item: string;
  purchaseDate: string;
  currentTemperature?: string;
}

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export class FridgeContainer extends Container<
  FridgeEmbeddableInput,
  FoodEmbeddableOutput,
  FridgeContainerInput
> {
  constructor(embeddableFactories: EmbeddableFactoryRegistry) {
    // Seed the list with one embeddable to ensure it works.
    super(
      FRIDGE_CONTAINER_ID,
      {
        id: '1234',
        panels: {
          myid: {
            initialInput: {},
            customization: {},
            embeddableId: 'myid',
            type: 'food',
          },
        },
      },
      { embeddableLoaded: { myid: false } },
      embeddableFactories
    );
  }


  // getInputForEmbeddable<{ name: string, ({ initialInput: { name: 'hi } }) {
  //  return { ...initialInput, }  
  //}

  public getInputForEmbeddableFromContainer() {
    return {
      currentTemperature: this.input.currentTemperature,
    }
  }

  public getInputForEmbeddable<EEI extends EmbeddableInput>(input: Omit<EEI, { currentTemperature: number }>): EEI {
    return {
      // id: panelState.embeddableId,
      // customization: {
      //   ...panelState.customization,
      // },
      // viewMode: this.input.viewMode,
      ...input,
      currentTemperature: 5,
   //   ...this.getInputForEmbeddableFromContainer(),
    } as EEI;
    // This is tricky to do in typescript without the `as EI` part because it's
    // the container state plus the panelState.initialInput that needs to make up
    // the requested Embeddable Input and since panelState.initialInput is only
    // a partial, typescript cannot be sure that this truly fulfills the contract.
  }

  public render(node: HTMLElement) {
    //ReactDOM.render(<FridgeDisplay container={this} />, node);
  }


}
