import { date } from 'joi';

interface BasicFridgeContents {
  milk: boolean;
  cookies: boolean;
}

interface SuperFridgeContents {
  algae: boolean;
}

type Expirations = {
  cookies: 'string';
  //iceCream: 'string';
  milk: 'string';
}

type DesertCount = {
  cookies: 'number';
  iceCream: 'number';
 // milk: 'number';
}

type DesertDescriptions = {
  cookies: 'string';
  iceCream: 'string';
}

type DessertExpirations = Pick<DesertCount, 'cookies'>;
type Excluded = Exclude<keyof DesertCount, keyof Expirations>

//TopShelf extends Partial<BasicFridgeContents>,
type BottomShelf = Omit<BasicFridgeContents, keyof SuperFridgeContents>


type ExtraFridgeContents =  SuperFridgeContents & BasicFridgeContents;

type ExcludeKeys<T, K> = Exclude<keyof T, K>;

type Jam = ExcludeKeys<{ milk: 'string', jam: 'string'}, 'jam' >

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export class Fridge<
    ExistingFood extends { [key: string]: string}> {
  constructor(protected readonly existingFood: ExistingFood) {}

  public getIngredients<Ingredients>(extraIngredients: Omit<Ingredients, keyof ExistingFood>): Ingredients {
    return {
      ...extraIngredients,
      ...this.existingFood,
    } as Ingredients;
  };
}

class JamFridge extends Fridge<
  {'jam': string}
> {}

class ButterFridge extends Fridge<
{'butter': string}
> {}

const jamFridge = new JamFridge({'jam': 'yum'});
const Ingredients1 = jamFridge.getIngredients<{'milk': string, 'jam': string}>({'milk': 'yuck'}); // Works

const butterFridge = new ButterFridge({'butter': 'yum'});
const Ingredients2 = butterFridge.getIngredients<{'milk': string, 'jam': string}>({'milk': 'yuck'}); // Fails, butter fridge lacking jam.



const extraFridge: ExtraFridgeContents = {
  algae: true,
  milk: true,
  cookies: true,
}

test(extraFridge);

function test(contents: BasicFridgeContents) {
  //
}

export class MyUnhealthyFridge extends Fridge<{cookies: boolean }, { milk: boolean, beer: true }> {
  constructor() {
    super({ cookies: true }, { milk: true, beer: true });
  }
}

export class MyHealthyFridge extends Fridge<{cookies: boolean, milk: true }, { lettuce: boolean }> {
  constructor() {
    super({ cookies: true, milk: true }, { lettuce: true });
  }
}

export class MyPartialFridge extends Fridge<{meat: boolean }, { lettuce: boolean }> {
  constructor() {
    super({ meat: true }, { lettuce: true });
  }
}




const calendarContainer = new CalendarContainer('1/1/2015');
calendarContainer.addNewEmbeddable(GREETING_EMBEDDABLE_TYPE, { name: 'Stacey', birthday: '1/1/1995' });

class GreetingEmbeddable extends Embeddable<{ name: string, birthMonth: number, birthDay: number, currentMonth: number, currentDay: number }> {

  render() {
    if (this.input.birthMonth === this.input.currentMonth && this.input.birthDay === this.input.currentDay) {
      return <div>Happy birthday {this.input.name}</div>
    } else {
      return <div>Hello, {this.input.name}</div>
    }
  }
}